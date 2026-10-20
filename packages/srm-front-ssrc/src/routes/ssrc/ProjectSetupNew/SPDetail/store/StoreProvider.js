import React, { createContext, useMemo, useEffect, useCallback, useState } from 'react';
import { useDataSet } from 'choerodon-ui/pro';
import { getCurrentOrganizationId } from 'utils/utils';
import { isArray, noop } from 'lodash';
import querystring from 'querystring';

import { getCustomizeUnitCode } from '../utils';

import {
  headerDS,
  itemLineDS,
  sectionOrPacketInfoDS,
  supplierLineTableDS,
  planLineTableDS,
} from './storeDS';

const StoreContext = createContext({});

function StoreProvider(props = {}) {
  const {
    match: { params } = {},
    location,
    children,
    doubleUnitFlag,
    pageSourceCategory, // 页面来源类型[明细、发布审批、版本查看]
    queryTemplateConfig = noop,
    queryUnitConfig = noop,
    onFormLoaded = noop,
  } = props;

  const { sourceProjectId, sourceProjectHistoryId } = params || {};

  const organizationId = useMemo(() => getCurrentOrganizationId(), []);

  const [pageLoading, setPageLoading] = useState(false); // 页面加载loading

  const routerParams = useMemo(() => querystring.parse(location?.search?.substr(1)), [
    location?.search,
  ]);
  // templateCode=NEW&templateVersion=1&stageCode=INQUIRY_CHECK&pageCode=DEFAULT 审批表单路由上带的信息
  const templateInfo = useMemo(() => {
    return {
      cuszTplTemplateCode: routerParams?.templateCode,
      cuszTplVersion: routerParams?.templateVersion,
      cuszTplStageCode: routerParams?.stageCode,
      cuszTplPageCode: routerParams?.pageCode,
    };
  }, [routerParams]);

  // 获取个性化编码
  const getCustomizeUnitCodeByPageFrom = useCallback((codeName, otherPayload = {}) => {
    return getCustomizeUnitCode(codeName, {
      pageSourceCategory,
      ...(otherPayload || {}),
    });
  }, []);

  // 初始化ds
  const headerDs = useDataSet(
    () =>
      headerDS({
        sourceProjectId,
        sourceProjectHistoryId,
        dataVersion: routerParams?.dataVersion,
        pageSourceCategory,
        customizeUnitCode: getCustomizeUnitCodeByPageFrom([
          'baseInfoForm',
          'purOrgDemandForm',
          'purOrgExecutorForm',
          'sourceDemandForm',
          'sourceMethodForm',
          'attachmentForm',
          'headerAfCard',
        ]),
      }),
    [sourceProjectId, sourceProjectHistoryId, routerParams, pageSourceCategory]
  );
  const itemLineDs = useDataSet(
    () =>
      itemLineDS({
        sourceProjectId,
        sourceProjectHistoryId,
        dataVersion: routerParams?.dataVersion,
        pageSourceCategory,
        customizeUnitCode: getCustomizeUnitCodeByPageFrom('itemLineTable'),
        headerDs,
      }),
    [sourceProjectId, sourceProjectHistoryId, routerParams, pageSourceCategory]
  );
  const sectionOrPacketInfoDs = useDataSet(
    () =>
      sectionOrPacketInfoDS({
        sourceProjectId,
        sourceProjectHistoryId,
        dataVersion: routerParams?.dataVersion,
        pageSourceCategory,
        customizeUnitCode: getCustomizeUnitCodeByPageFrom('secAndPacketTable'),
      }),
    [sourceProjectId, sourceProjectHistoryId, routerParams, pageSourceCategory]
  );
  const viewMaterialDs = useDataSet(
    () =>
      itemLineDS({
        sourceProjectId,
        sourceProjectHistoryId,
        dataVersion: routerParams?.dataVersion,
        pageSourceCategory,
        customizeUnitCode: getCustomizeUnitCodeByPageFrom('viewItemLineTable'),
      }),
    [sourceProjectId, sourceProjectHistoryId, routerParams, pageSourceCategory]
  );
  const supplierLineTableDs = useDataSet(
    () =>
      supplierLineTableDS({
        sourceProjectId,
        sourceProjectHistoryId,
        dataVersion: routerParams?.dataVersion,
        pageSourceCategory,
        customizeUnitCode: getCustomizeUnitCodeByPageFrom('supplierTable'),
        headerDs,
      }),
    [sourceProjectId, sourceProjectHistoryId, routerParams, pageSourceCategory]
  );
  const planLineTableDs = useDataSet(
    () =>
      planLineTableDS({
        sourceProjectId,
        sourceProjectHistoryId,
        dataVersion: routerParams?.dataVersion,
        pageSourceCategory,
        customizeUnitCode: getCustomizeUnitCodeByPageFrom('projectPlanTable'),
      }),
    [sourceProjectId, sourceProjectHistoryId, routerParams, pageSourceCategory]
  );

  useEffect(() => {
    if (pageSourceCategory === 'approval') {
      // 发布审批
      initFetchService();
      return;
    }
    fetchPageData();
  }, [pageSourceCategory, sourceProjectId, sourceProjectHistoryId]);

  useEffect(() => {
    setDsStateOrParameter({
      ds: [itemLineDs, viewMaterialDs, sectionOrPacketInfoDs],
      name: 'doubleUnitFlag',
      value: doubleUnitFlag,
      type: 'state',
    });
  }, [itemLineDs, setDsStateOrParameter, doubleUnitFlag]);

  // 设置ds参数
  const setDsStateOrParameter = ({ ds, name, value, type }) => {
    if (ds && isArray(ds)) {
      ds.forEach((_ds) => {
        if (type === 'state') {
          _ds.setState(name, value);
        }
        _ds.setQueryParameter(name, value);
      });
    } else if (ds) {
      if (type === 'state') {
        ds.setState(name, value);
      }
      ds.setQueryParameter(name, value);
    }
  };

  // 查询页面数据
  const fetchPageData = useCallback(async () => {
    try {
      setPageLoading(true);
      const res = await headerDs?.query();

      const list = [
        itemLineDs?.query(),
        res?.subjectMatterRule === 'PACK' ? sectionOrPacketInfoDs?.query() : false,
        res?.sourceMethod === 'INVITE' ? supplierLineTableDs?.query() : false,
        planLineTableDs?.query(),
      ];
      await Promise.all(list);
      if (pageSourceCategory === 'approval') {
        onFormLoaded(true); // 审批按钮可点击
      }
      setPageLoading(false);
    } catch (e) {
      setPageLoading(false);
      throw e;
    }
  }, [headerDs, sectionOrPacketInfoDs, supplierLineTableDs, planLineTableDs, setPageLoading]);

  // 定制样式发布审批初始化查询
  const initFetchService = async () => {
    setDsStateOrParameter({
      ds: [
        headerDs,
        itemLineDs,
        sectionOrPacketInfoDs,
        supplierLineTableDs,
        planLineTableDs,
        viewMaterialDs,
      ],
      name: 'templateInfo',
      value: templateInfo,
      type: 'query',
    });
    const queryParams = new Promise((resolve) => {
      resolve({
        templateCode: templateInfo?.cuszTplTemplateCode,
        templateVersion: templateInfo?.cuszTplVersion,
      });
    });
    if (
      templateInfo?.cuszTplTemplateCode &&
      templateInfo?.cuszTplVersion &&
      templateInfo?.cuszTplStageCode &&
      templateInfo?.cuszTplPageCode
    ) {
      try {
        await queryTemplateConfig(queryParams, {
          // 阶段编码，页面编码
          stageCode: templateInfo?.cuszTplStageCode,
          pageCode: templateInfo?.cuszTplPageCode,
        });
      } catch (e) {
        throw e;
      }
    } else {
      const unitCode = getCustomizeUnitCodeByPageFrom([
        'headerInfoCard',
        'baseInfoCard',
        'purAndOrgCard',
        'itemInfoCard',
        'reqOnSupplierCard',
        'sourceDemandCard',
        'projectPlanCard',
        'attachmentCard',
        'headerAfCard',
        'headerAfCardButtons',
        'baseInfoForm',
        'purOrgDemandForm',
        'purOrgExecutorForm',
        'sourceDemandForm',
        'sourceMethodForm',
        'attachmentForm',
        'itemLineTable',
        'secAndPacketTable',
        'supplierTable',
        'projectPlanTable',
        'viewItemLineTable',
      ]).split(',');
      try {
        await queryUnitConfig(undefined, undefined, unitCode);
      } catch (e) {
        throw e;
      }
    }
    fetchPageData();
  };

  // 公共数据存储
  const storeData = useMemo(
    () => ({
      commonDs: {
        headerDs,
        itemLineDs,
        sectionOrPacketInfoDs,
        supplierLineTableDs,
        planLineTableDs,
        viewMaterialDs,
      },
      organizationId,
      sourceProjectId,
      sourceProjectHistoryId,
      routerParams,
      pageLoading,
      pageSourceCategory,
      getCustomizeUnitCode: getCustomizeUnitCodeByPageFrom,
    }),
    [
      headerDs,
      itemLineDs,
      sectionOrPacketInfoDs,
      supplierLineTableDs,
      planLineTableDs,
      viewMaterialDs,
      organizationId,
      sourceProjectId,
      sourceProjectHistoryId,
      routerParams,
      pageLoading,
      pageSourceCategory,
      getCustomizeUnitCodeByPageFrom,
    ]
  );

  const value = {
    ...(props || {}),
    ...storeData,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export default StoreProvider;

export { StoreContext };

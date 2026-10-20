import React, { createContext, useMemo, useEffect, useCallback, useState } from 'react';
import { useDataSet } from 'choerodon-ui/pro';
import { getCurrentOrganizationId } from 'utils/utils';
import { isArray } from 'lodash';
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
    children,
    doubleUnitFlag,
    queryTemplateConfig,
    queryUnitConfig,
    onFormLoaded,
    location,
  } = props;

  const { sourceProjectId } = params || {};

  const routerParams = useMemo(() => querystring.parse(location?.search?.substr(1)), [
    location?.search,
  ]);

  const [pageLoading, setPageLoading] = useState(false);

  const organizationId = useMemo(() => getCurrentOrganizationId(), []);

  // templateCode=NEW&templateVersion=1&stageCode=INQUIRY_CHECK&pageCode=DEFAULT&sourceHistoryDataVersion=1&sourceHistoryId=21 审批表单路由上带的信息
  const templateInfo = useMemo(() => {
    const {
      templateCode,
      templateVersion,
      stageCode,
      pageCode,
      sourceHistoryDataVersion,
      sourceHistoryId,
    } = routerParams || {};
    return {
      cuszTplTemplateCode: templateCode,
      cuszTplVersion: templateVersion,
      cuszTplStageCode: stageCode,
      cuszTplPageCode: pageCode,
      dataVersion: sourceHistoryDataVersion,
      sourceProjectHistoryId: sourceHistoryId,
    };
  }, [routerParams]);

  // 初始化展示变更全页面的ds -------------------------------- start -------------------------------
  const headerDs = useDataSet(
    () =>
      headerDS({
        sourceProjectId,
        customizeUnitCode: getCustomizeUnitCode([
          'baseInfoForm',
          'purOrgDemandForm',
          'purOrgExecutorForm',
          'sourceDemandForm',
          'sourceMethodForm',
          'attachmentForm',
        ]),
      }),
    [sourceProjectId]
  );
  const itemLineDs = useDataSet(
    () =>
      itemLineDS({
        sourceProjectId,
        customizeUnitCode: getCustomizeUnitCode('itemLineTable'),
        headerDs,
      }),
    [sourceProjectId]
  );
  const sectionOrPacketInfoDs = useDataSet(
    () =>
      sectionOrPacketInfoDS({
        sourceProjectId,
        customizeUnitCode: getCustomizeUnitCode('secAndPacketTable'),
      }),
    [sourceProjectId]
  );
  const viewMaterialDs = useDataSet(
    () =>
      itemLineDS({
        sourceProjectId,
        customizeUnitCode: getCustomizeUnitCode('viewItemLineTable'),
      }),
    [sourceProjectId]
  );
  const supplierLineTableDs = useDataSet(
    () =>
      supplierLineTableDS({
        sourceProjectId,
        customizeUnitCode: getCustomizeUnitCode('supplierTable'),
        headerDs,
      }),
    [sourceProjectId]
  );
  const planLineTableDs = useDataSet(
    () =>
      planLineTableDS({
        sourceProjectId,
        customizeUnitCode: getCustomizeUnitCode('projectPlanTable'),
      }),
    [sourceProjectId]
  );
  // 初始化展示变更全页面的ds -------------------------------- end -------------------------------

  // 初始化仅变更页面ds -------------------------------- start -------------------------------
  const onlyChangeHeaderDs = useDataSet(
    () => headerDS({ sourceProjectId, changeType: 'onlyChange' }),
    [sourceProjectId]
  );
  const onlyChangeItemLineDs = useDataSet(
    () =>
      itemLineDS({
        sourceProjectId,
        headerDs,
        changeType: 'onlyChange',
      }),
    [sourceProjectId]
  );
  const onlyChangeSectionOrPacketInfoDs = useDataSet(
    () => sectionOrPacketInfoDS({ sourceProjectId, changeType: 'onlyChange' }),
    [sourceProjectId]
  );
  const onlyChangeViewMaterialDs = useDataSet(
    () => itemLineDS({ sourceProjectId, changeType: 'onlyChange', pageType: 'viewDetail' }),
    [sourceProjectId]
  );
  const onlyChangeSupplierLineTableDs = useDataSet(
    () =>
      supplierLineTableDS({
        sourceProjectId,
        headerDs,
        changeType: 'onlyChange',
      }),
    [sourceProjectId]
  );
  const onlyChangePlanLineTableDs = useDataSet(
    () => planLineTableDS({ sourceProjectId, changeType: 'onlyChange' }),
    [sourceProjectId]
  );
  // 初始化仅变更页面ds ------------------------------------ end -------------------------------

  useEffect(() => {
    initFetchService();
  }, [sourceProjectId, templateInfo, initFetchService]);

  useEffect(() => {
    setDSQueryParameter({
      ds: [
        itemLineDs,
        viewMaterialDs,
        sectionOrPacketInfoDs,
        onlyChangeItemLineDs,
        onlyChangeSectionOrPacketInfoDs,
        onlyChangeViewMaterialDs,
      ],
      name: 'doubleUnitFlag',
      value: doubleUnitFlag,
    });
  }, [
    itemLineDs,
    viewMaterialDs,
    sectionOrPacketInfoDs,
    onlyChangeItemLineDs,
    onlyChangeSectionOrPacketInfoDs,
    onlyChangeViewMaterialDs,
    setDSQueryParameter,
    doubleUnitFlag,
  ]);

  // 查询页面数据
  const fetchPageData = async (payload) => {
    const { changeType } = payload || {};
    try {
      setPageLoading(true);
      if (changeType === 'onlyChange') {
        const list = [
          onlyChangeHeaderDs?.query(),
          onlyChangeItemLineDs?.query(),
          onlyChangeSectionOrPacketInfoDs?.query(),
          onlyChangeSupplierLineTableDs?.query(),
          onlyChangePlanLineTableDs?.query(),
        ];
        await Promise.all(list);
      } else {
        const res = await headerDs?.query();

        const list = [
          itemLineDs?.query(),
          res?.subjectMatterRule === 'PACK' ? sectionOrPacketInfoDs?.query() : false,
          res?.sourceMethod === 'INVITE' ? supplierLineTableDs?.query() : false,
          planLineTableDs?.query(),
        ];
        await Promise.all(list);
      }
      setPageLoading(false);
    } catch (e) {
      setPageLoading(false);
      throw e;
    }
  };

  const initFetchService = useCallback(async () => {
    setDSQueryParameter({
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
    });
    setDSQueryParameter({
      ds: [
        onlyChangeHeaderDs,
        onlyChangeItemLineDs,
        onlyChangeSectionOrPacketInfoDs,
        onlyChangeViewMaterialDs,
        onlyChangeSupplierLineTableDs,
        onlyChangePlanLineTableDs,
      ],
      name: 'templateInfo',
      value: {
        dataVersion: templateInfo?.dataVersion,
        sourceProjectHistoryId: templateInfo?.sourceProjectHistoryId,
      },
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
      const unitCode = [
        getCustomizeUnitCode('headerInfoCard'),
        getCustomizeUnitCode('baseInfoCard'),
        getCustomizeUnitCode('purAndOrgCard'),
        getCustomizeUnitCode('itemInfoCard'),
        getCustomizeUnitCode('reqOnSupplierCard'),
        getCustomizeUnitCode('sourceDemandCard'),
        getCustomizeUnitCode('projectPlanCard'),
        getCustomizeUnitCode('attachmentCard'),
        getCustomizeUnitCode('headerAfCard'),
        getCustomizeUnitCode('headerAfCardButtons'),
        getCustomizeUnitCode('baseInfoForm'),
        getCustomizeUnitCode('purOrgDemandForm'),
        getCustomizeUnitCode('purOrgExecutorForm'),
        getCustomizeUnitCode('sourceDemandForm'),
        getCustomizeUnitCode('sourceMethodForm'),
        getCustomizeUnitCode('attachmentForm'),
        getCustomizeUnitCode('itemLineTable'),
        getCustomizeUnitCode('secAndPacketTable'),
        getCustomizeUnitCode('supplierTable'),
        getCustomizeUnitCode('projectPlanTable'),
        getCustomizeUnitCode('viewItemLineTable'),
      ];
      try {
        await queryUnitConfig(undefined, undefined, unitCode);
      } catch (e) {
        throw e;
      }
    }
    fetchPageData().finally(() => {
      if (onFormLoaded && typeof onFormLoaded === 'function') {
        onFormLoaded(true);
      }
    });
  }, [sourceProjectId, templateInfo, headerDs, itemLineDs, sectionOrPacketInfoDs]);

  // 设置ds参数
  const setDSQueryParameter = ({ ds, name, value }) => {
    if (ds && isArray(ds)) {
      ds.forEach((_ds) => {
        _ds.setQueryParameter(name, value);
      });
    } else if (ds) {
      ds.setQueryParameter(name, value);
    }
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
      onlyChangeCommonDs: {
        headerDs: onlyChangeHeaderDs,
        itemLineDs: onlyChangeItemLineDs,
        sectionOrPacketInfoDs: onlyChangeSectionOrPacketInfoDs,
        viewMaterialDs: onlyChangeViewMaterialDs,
        supplierLineTableDs: onlyChangeSupplierLineTableDs,
        planLineTableDs: onlyChangePlanLineTableDs,
      },
      organizationId,
      sourceProjectId,
      getCustomizeUnitCode,
      fetchPageData,
      pageLoading,
    }),
    [
      headerDs,
      itemLineDs,
      sectionOrPacketInfoDs,
      supplierLineTableDs,
      planLineTableDs,
      viewMaterialDs,
      onlyChangeHeaderDs,
      onlyChangeItemLineDs,
      onlyChangeSectionOrPacketInfoDs,
      onlyChangeViewMaterialDs,
      onlyChangeSupplierLineTableDs,
      onlyChangePlanLineTableDs,
      organizationId,
      sourceProjectId,
      getCustomizeUnitCode,
      fetchPageData,
      pageLoading,
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

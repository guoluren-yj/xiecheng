import React, { createContext, useMemo, useEffect, useCallback, useState } from 'react';
import { useDataSet } from 'choerodon-ui/pro';
import { getCurrentOrganizationId } from 'utils/utils';
import querystring from 'querystring';
import { useLocalStore } from 'mobx-react-lite';
import { isEmpty, isArray } from 'lodash';

import { filterCustomizeCodes } from '@/utils/utils';

import {
  headerDS,
  relatedBillDS,
  sectionOrPacketInfoDS,
  itemLineDetailDS,
  supplierLineTableDS,
  planLineTableDS,
} from './storeDS';

const StoreContext = createContext({});

function StoreProvider(props = {}) {
  const {
    match: { params } = {},
    children,
    onFormLoaded,
    doubleUnitFlag,
    queryTemplateConfig,
    queryUnitConfig,
    location,
  } = props;

  const routerParams = useMemo(() => querystring.parse(location?.search?.substr(1)), [
    location?.search,
  ]);

  const { sourceProjectId } = params || {};

  const organizationId = useMemo(() => getCurrentOrganizationId(), []);

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
  const getCustomizeUnitCode = (codeName) => {
    if (!codeName || isEmpty(codeName)) return null;

    // 个性化编码集合
    const codeMap = new Map([
      ['pageCard', 'SSRC.SORUCE_PROJECT_APPROVAL.CLOSE.HEAHEADER_CARD'], // 页面头信息标题卡片
      ['closeReasonCard', 'SSRC.SORUCE_PROJECT_APPROVAL.CLOSE.CLOSE.CLOSE_REASON_CARD'], // 关闭原因标题卡片
      ['relatedBillCard', 'SSRC.SORUCE_PROJECT_APPROVAL.CLOSE.RELATED_BILL_CARD'], // 关联单据标题卡片
      ['basicInfoCard', 'SSRC.SORUCE_PROJECT_APPROVAL.CLOSE.BASIC_INFO_CARD'], // 基础信息标题卡片
      ['purAndOrgCard', 'SSRC.SORUCE_PROJECT_APPROVAL.CLOSE.PUR_AND_ORG_CARD'], // 采购组织及人员标题卡片
      ['itemCard', 'SSRC.SORUCE_PROJECT_APPROVAL.CLOSE.CLOSE.ITEM_CARD'], // 标的物标题卡片
      ['secPacketCard', 'SSRC.SORUCE_PROJECT_APPROVAL.CLOSE.SEC_PACKET_CARD'], // 标段/包信息标题卡片
      ['reqOnSupplierCard', 'SSRC.SORUCE_PROJECT_APPROVAL.CLOSE.REQ_ON_SUPPLIER_CARD'], // 对供应商要求标题卡片
      ['projectPlanCard', 'SSRC.SORUCE_PROJECT_APPROVAL.CLOSE.PROJECT_PLAN_CARD'], // 项目计划标题卡片
      ['attachmentCard', 'SSRC.SORUCE_PROJECT_APPROVAL.CLOSE.ATTACHMENT_CARD'], // 附件标题卡片
      ['headerInfoAFBasic', 'SSRC.SORUCE_PROJECT_APPROVAL.CLOSE.HEADER_AF_BASIC'], // 头信息基础卡片
      ['headerBtn', 'SSRC.SORUCE_PROJECT_APPROVAL.CLOSE.HEADER_BTN'], // 头信息操作按钮button
      ['closeReasonForm', 'SSRC.SORUCE_PROJECT_APPROVAL.CLOSE.CLOSE_REASON_FORM'], // 关闭原因form
      ['basicInfoForm', 'SSRC.SORUCE_PROJECT_APPROVAL.CLOSE.BASIC_INFO_FORM'], // 基础信息form
      ['purOrgDemandForm', 'SSRC.SORUCE_PROJECT_APPROVAL.CLOSE.PUR_ORG_DEMAND_FORM'], // 采购组织及人员-需求方form
      ['purOrgExecutorForm', 'SSRC.SORUCE_PROJECT_APPROVAL.CLOSE.PUR_ORG_EXECUTOR_FORM'], // 采购组织及人员-执行人form
      ['sourceMethodForm', 'SSRC.SORUCE_PROJECT_APPROVAL.CLOSE.SOURCE_DEMAND_FORM'], // 对供应商要求-寻源方式form
      ['attachmentForm', 'SSRC.SORUCE_PROJECT_APPROVAL.CLOSE.ATTACHMENT_FORM'], // 附件form
      ['secAndPacketTable', 'SSRC.SORUCE_PROJECT_APPROVAL.CLOSE.SEC_PAC_TABLE'], // 标段/包信息table
      ['itemDetailTable', 'SSRC.SORUCE_PROJECT_APPROVAL.CLOSE.VIEW_ITEM_DETAIL_TABLE'], // 物料详情table
      ['supplierTable', 'SSRC.SORUCE_PROJECT_APPROVAL.CLOSE.SUPPLIER_TABLE'], // 供应商table
      ['projectPlanTable', 'SSRC.SORUCE_PROJECT_APPROVAL.CLOSE.PROJECT_PLAN_TABLE'], // 项目计划table
    ]);
    return filterCustomizeCodes(codeMap, codeName);
  };

  // 初始化ds
  const headerDs = useDataSet(
    () =>
      headerDS({
        sourceProjectId,
        customizeUnitCode: getCustomizeUnitCode([
          'headerInfoAFBasic',
          'closeReasonForm',
          'basicInfoForm',
          'purOrgDemandForm',
          'purOrgExecutorForm',
          'sourceMethodForm',
          'attachmentForm',
        ]),
      }),
    []
  );
  const relatedBillDs = useDataSet(() => relatedBillDS({ sourceProjectId }), []);
  const sectionOrPacketInfoDs = useDataSet(
    () =>
      sectionOrPacketInfoDS({
        sourceProjectId,
        customizeUnitCode: getCustomizeUnitCode('secAndPacketTable'),
      }),
    []
  );
  const itemLineDs = useDataSet(
    () =>
      itemLineDetailDS({
        sourceProjectId,
        customizeUnitCode: getCustomizeUnitCode('itemDetailTable'),
      }),
    []
  );
  const itemLineDetailDs = useDataSet(
    () =>
      itemLineDetailDS({
        sourceProjectId,
        customizeUnitCode: getCustomizeUnitCode('itemDetailTable'),
      }),
    []
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

  // 全局loading
  const [pageLoading, setPageLoading] = useState(false);

  useEffect(() => {
    initFetchService();
  }, [sourceProjectId, templateInfo]);

  useEffect(() => {
    setDSQueryParameter({
      ds: [itemLineDs, itemLineDetailDs],
      name: 'doubleUnitFlag',
      value: doubleUnitFlag,
    });
  }, [itemLineDs, itemLineDetailDs, setDSQueryParameter, doubleUnitFlag]);

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

  const initFetchService = useCallback(async () => {
    setPageLoading(true);
    setDSQueryParameter({
      ds: [
        headerDs,
        relatedBillDs,
        itemLineDs,
        itemLineDetailDs,
        sectionOrPacketInfoDs,
        supplierLineTableDs,
        planLineTableDs,
      ],
      name: 'templateInfo',
      value: templateInfo,
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
        setPageLoading(false);
        throw e;
      }
    } else {
      const unitCode = [
        getCustomizeUnitCode('pageCard'),
        getCustomizeUnitCode('closeReasonCard'),
        getCustomizeUnitCode('relatedBillCard'),
        getCustomizeUnitCode('basicInfoCard'),
        getCustomizeUnitCode('purAndOrgCard'),
        getCustomizeUnitCode('itemCard'),
        getCustomizeUnitCode('secPacketCard'),
        getCustomizeUnitCode('reqOnSupplierCard'),
        getCustomizeUnitCode('projectPlanCard'),
        getCustomizeUnitCode('attachmentCard'),
        getCustomizeUnitCode('headerInfoAFBasic'),
        getCustomizeUnitCode('headerBtn'),
        getCustomizeUnitCode('closeReasonForm'),
        getCustomizeUnitCode('basicInfoForm'),
        getCustomizeUnitCode('purOrgDemandForm'),
        getCustomizeUnitCode('purOrgExecutorForm'),
        getCustomizeUnitCode('sourceMethodForm'),
        getCustomizeUnitCode('attachmentForm'),
        getCustomizeUnitCode('secAndPacketTable'),
        getCustomizeUnitCode('itemDetailTable'),
        getCustomizeUnitCode('supplierTable'),
        getCustomizeUnitCode('projectPlanTable'),
      ];
      try {
        await queryUnitConfig(undefined, undefined, unitCode);
      } catch (e) {
        setPageLoading(false);
        throw e;
      }
    }
    headerDs.query().finally(() => {
      if (onFormLoaded && typeof onFormLoaded === 'function') {
        onFormLoaded(true);
      }
      setPageLoading(false);
    });
    relatedBillDs.query();
    itemLineDs.query();
    sectionOrPacketInfoDs.query();
    supplierLineTableDs.query();
    planLineTableDs.query();
  }, [
    sourceProjectId,
    templateInfo,
    headerDs,
    relatedBillDs,
    itemLineDs,
    itemLineDetailDs,
    sectionOrPacketInfoDs,
    supplierLineTableDs,
    planLineTableDs,
  ]);

  // 公共数据存储
  const storeData = useLocalStore(() => ({
    commonDs: {
      headerDs,
      relatedBillDs,
      sectionOrPacketInfoDs,
      itemLineDetailDs,
      itemLineDs,
      supplierLineTableDs,
      planLineTableDs,
    },
    organizationId,
    templateInfo,
    sourceProjectId,
    getCustomizeUnitCode,
    pageLoading,
  }));

  const value = {
    ...(props || {}),
    ...storeData,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export default StoreProvider;

export { StoreContext };

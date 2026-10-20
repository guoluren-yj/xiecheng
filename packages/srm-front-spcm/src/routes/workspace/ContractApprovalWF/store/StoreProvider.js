import React, { createContext, useMemo, useEffect, useState, useCallback } from 'react';
import { useDataSet } from 'choerodon-ui/pro';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import { flow } from 'lodash';
import { observer } from 'mobx-react';
import querystring from 'querystring';
import WithCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';
import { fetchHeader } from '@/services/contractCommonService';
import {
  headerFormDS,
  basicDS,
  attachmentDS,
} from './storeDS';
import {
  subjectDS as pcSubjectDS,
  stageDS as pcStageDS,
  rebateDS,
  partnerDS,
  businessTermsDS,
  replenishDS,
} from '../../Detail/components/DataSet';

export const StoreContext = createContext({});
const organizationId = getCurrentOrganizationId();
const headerCode = [
  'SPCM.WORKSPACE.APPROVAL.HEADER_INFO_AF_BASIC', // 协议头-基础信息
  'SPCM.WORKSPACE.APPROVAL.HEADER_INFO_AF_EXTRA', // 协议头汇总数据
  'SPCM.WORKSPACE.APPROVAL.ATTACHMENT_FORM', // 协议附件
];

const StoreProvider = flow(
  observer,
  WithCustomize({
    isTemplate: true,
  }),
  formatterCollections({ code: [
    'spcm.workspace',
    'spcm.contractChange',
    'spcm.common',
    'entity.company',
    'entity.business',
    'entity.organization',
    'entity.supplier',
    'entity.roles',
    'component.docFlow',
    'hzero.common',
    'spcm.contractSubject',
    'spcm.purchaseRequisitionCreation',
    'spcm.contractControl',
    'sodr.sendOrder',
    'ssta.purchaseSettle',
    'sodr.workspace',
    'entity.item',
    'entity.attachment',
    'ssrc.inquiryHall',
    'spcm.workspace',
    'spcm.purchaseContractView',
    'spcm.contractSign',
    'sodr.common',
    'spcm.contractChapter',
    'mallf.common',
    'hzero.c7nProUI',
    'sodr.quotePurchase',
    'spfp.ruleMaintenance',
    'spfp.common',
  ] })
)(props => {
  const {
    history,
    children,
    location = {},
    customizeBtnGroup,
    customizeForm,
    customizeTable,
    getHocInstance,
    match: { params: { pcHeaderId } = {}, path = '' },
    queryTemplateConfig,
    customizeCommon,
  } = props;

  const routerParams = useMemo(() => querystring.parse(location?.search?.substr(1)), [
    location?.search,
  ]);
  // 是否是审批表单
  const pubFlag = useMemo(() => path?.indexOf('/pub') > -1, []);
  const [headerInfo, setHeaderInfo] = useState({});
  const [contentLoading, setContentLoading] = useState(true);
  const headerFormDs = useDataSet(() => headerFormDS(), []);
  const basicDs = useDataSet(() => basicDS(), []);
  const attachmentDs = useDataSet(() => attachmentDS(), []);

  const partnerDs = useDataSet(() => partnerDS({ pcHeaderId }), []);
  const pcSubjectDs = useDataSet(() => pcSubjectDS({ pcHeaderId }), []);
  const pcStageDs = useDataSet(() => pcStageDS({ pcHeaderId }), [pcHeaderId]);
  const rebateDs = useDataSet(() => rebateDS({ pcHeaderId }), [pcHeaderId]);
  const businessTermsDs = useDataSet(() => businessTermsDS({ pcHeaderId }), [pcHeaderId]);
  const replenishDs = useDataSet(() => replenishDS({ pcHeaderId }), [pcHeaderId]);

  const templateInfo = useMemo(() => {
    return {
      cuszTplTemplateCode: routerParams?.templateCode,
      cuszTplVersion: routerParams?.templateVersion,
      cuszTplStageCode: routerParams?.stageCode || 'CONTRACT_APPROVED', // 默认CONTRACT_APPROVED
      cuszTplPageCode: routerParams?.pageCode || 'CONTRACT_APPROVED_GROUP', // 默认CONTRACT_APPROVED_GROUP
    };
  }, [routerParams]);

  useEffect(() => {
    initFetchService();
  }, [pcHeaderId, templateInfo]);

  const initFetchService = useCallback(async () => {
    setContentLoading(true);
    const queryParams = new Promise((resolve) => {
      resolve({
        templateCode: templateInfo?.cuszTplTemplateCode,
        templateVersion: templateInfo?.cuszTplVersion,
      });
    });
    await queryTemplateConfig(queryParams, {
      // 阶段编码，页面编码
      stageCode: templateInfo?.cuszTplStageCode,
      pageCode: templateInfo?.cuszTplPageCode,
    });
    queryHeaderInfo();
  }, [pcHeaderId, templateInfo]);

  const queryHeaderInfo = useCallback(() => {
    setContentLoading(true);
    const headerParams = {
      pcHeaderId,
      customizeUnitCode: headerCode.toString(),
    };
    fetchHeader(headerParams)
      .then(res => {
        if (getResponse(res)) {
          setHeaderInfo(res);
          headerFormDs.loadData([res]);
          attachmentDs.loadData([res]);
          basicDs.loadData([res]);
          basicDs.setState('headerInfo', res);
        }
      })
      .finally(() => {
        setContentLoading(false);
      });
  }, [pcHeaderId]);

  const value = useMemo(
    () => ({
      organizationId,
      customizeBtnGroup,
      customizeForm,
      customizeTable,
      getHocInstance,
      templateInfo,
      commonDs: {
        headerFormDs,
        basicDs,
        partnerDs,
        pcSubjectDs,
        pcStageDs,
        rebateDs,
        businessTermsDs,
        replenishDs,
        attachmentDs,
      },
      pcHeaderId,
      pubFlag,
      customizeCommon,
      headerInfo,
      queryHeaderInfo,
      contentLoading,
    }),
    [
      history,
      location,
      templateInfo,
      customizeBtnGroup,
      customizeForm,
      customizeTable,
      getHocInstance,
      headerFormDs,
      basicDs,
      attachmentDs,
      partnerDs,
      pcSubjectDs,
      pcStageDs,
      rebateDs,
      businessTermsDs,
      replenishDs,
      pcHeaderId,
      pubFlag,
      customizeCommon,
      headerInfo,
      contentLoading,
    ]
  );
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
});

export default StoreProvider;

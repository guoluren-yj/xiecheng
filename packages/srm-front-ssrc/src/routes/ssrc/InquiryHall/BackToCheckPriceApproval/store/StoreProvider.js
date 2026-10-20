import React, { createContext, useMemo, useEffect, useState } from 'react';
import { useDataSet } from 'choerodon-ui/pro';
import { isEmpty } from 'lodash';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import querystring from 'querystring';
import { fetchInquiryHeaderDetail } from '@/services/inquiryHallService';
import { queryBidFileTemplateConfig, filterCustomizeCodes } from '@/utils/utils';
import { queryCheckPriceUiDisplayConfig } from '@/services/commonService';
import { fetchNewQuotationConfigSheet } from '@/services/supplierQutationService';
import { BID, INQUIRY } from '@/utils/globalVariable';
import {
  headerDS,
  basicDS,
  tableAttachmentDS,
  itemTableDS,
  basicInfoDataSet,
  attachmentDS,
} from './storeDS';

const StoreContext = createContext({});
const organizationId = getCurrentOrganizationId();

function StoreProvider(props = {}) {
  const {
    history,
    children,
    location = {},
    sourceKey = INQUIRY,
    customizeBtnGroup,
    customizeForm,
    customizeTable,
    getHocInstance,
    match: { params = {} },
    customizeCommon,
    doubleUnitFlag = false,
    queryUnitConfig,
    queryTemplateConfig,
  } = props;
  const rfxHeaderId = useMemo(() => params?.rfxId, [params?.rfxId]);

  const routerParams = useMemo(() => querystring.parse(location?.search?.substr(1)), [
    location?.search,
  ]);
  // sourceKey不同入口的值不同，INQUIRY询价   BID招标
  const bidFlag = useMemo(() => sourceKey === BID, [sourceKey]); // 是否新招标
  const [headerInfo, setHeaderInfo] = useState({});
  const [contentLoading, setContentLoading] = useState(true);
  const [checkPriceUiIsNew, setCheckPriceUiIsNew] = useState(false); // 是否使用新核价
  const [newQuotationFlag, setNewQuotationFlag] = useState(false); // 是否使用新报价
  const [fileTemplateManageFlag, setFileTemplateManageFlag] = useState(0); // 查询招标文件模板管理配置
  const headerDs = useDataSet(() => headerDS(bidFlag), [bidFlag]);
  const basicDs = useDataSet(() => basicDS(bidFlag), [bidFlag]);
  const basicInfoDs = useDataSet(() => basicInfoDataSet({ bidFlag }), [bidFlag]);
  const tableAttachmentDs = useDataSet(() => tableAttachmentDS(), []);
  const itemTableDs = useDataSet(() => itemTableDS({ doubleUnitFlag, bidFlag, rfxHeaderId }), [
    doubleUnitFlag,
    bidFlag,
    rfxHeaderId,
  ]);
  const attachmentDs = useDataSet(() => attachmentDS(), []);

  useEffect(() => {
    initPage();
  }, [templateInfo]);

  // // 查询是否开启了新核价
  const fetchCheckPriceUiDisplayConfig = () => {
    queryCheckPriceUiDisplayConfig().then((res) => {
      if (getResponse(res)) {
        setCheckPriceUiIsNew(Boolean(res?.length));
      }
    });
  };

  // 查询是否是新报价
  const newQuotationConfigSheet = async () => {
    const param = {
      organizationId,
      rfxHeaderId,
    };

    let result = null;
    try {
      result = await fetchNewQuotationConfigSheet(param);
      result = getResponse(result);

      if (result === 1) {
        setNewQuotationFlag(true);
      }
    } catch (e) {
      throw e;
    }
  };

  // 查询招标文件模板管理配置
  const queryFileTemplateManageSheetConfig = async () => {
    const flag = await queryBidFileTemplateConfig();
    setFileTemplateManageFlag(flag);
    if (flag) {
      fetchTableAttachment();
    }
  };

  // 获取个性化编码
  const getCustomizeUnitCode = (codeName) => {
    if (!codeName || isEmpty(codeName)) return null;

    // 个性化编码集合
    const codeMap = new Map([
      ['headerInfo', 'SSRC.INQUIRY_HALL_BACK_TO_CHECK_PRICE_OVERVIEW.HEADER_INFO_AF_BASIC'], // 页面头信息标题
      ['basicInfo', 'SSRC.INQUIRY_HALL_BACK_TO_CHECK_PRICE_OVERVIEW.HEADER_INFO_AF_EXTRA'], // 数据信息
      ['buttons', 'SSRC.INQUIRY_HALL_BACK_TO_CHECK_PRICE_OVERVIEW.HEADER_BUTTONS'], // 头部按钮
      ['tableFilter', 'SSRC.INQUIRY_HALL_BACK_TO_CHECK_PRICE_OVERVIEW.ALL_QUOTATION_FILTER'], // 全部报价明细筛选器
      ['table', 'SSRC.INQUIRY_HALL_BACK_TO_CHECK_PRICE_OVERVIEW.ALL_QUOTATION_TABLE'], // 全部报价明细表格
      ['checkPriceBasic', 'SSRC.INQUIRY_HALL_BACK_TO_CHECK_PRICE_OVERVIEW.BASIC_FORM'], // 基础信息
      ['costRemark', 'SSRC.INQUIRY_HALL_BACK_TO_CHECK_PRICE_OVERVIEW.COST_REMARK'], // 成本备注
      ['attachmentForm', 'SSRC.INQUIRY_HALL_BACK_TO_CHECK_PRICE_OVERVIEW.ATTACHMENT_FORM'], // 附件表单
      [
        'attachmentTable',
        'SSRC.INQUIRY_HALL_BACK_TO_CHECK_PRICE_OVERVIEW.ATTACHMENT_TABLE_COLUMNS',
      ], // 附件表格列
      ['tableCard', 'SSRC.INQUIRY_HALL_BACK_TO_CHECK_PRICE_OVERVIEW.TABLE_CARD'], // 全部报价明细卡片
      ['basicInfoCard', 'SSRC.INQUIRY_HALL_BACK_TO_CHECK_PRICE_OVERVIEW.BASIC_INFO_CARD'], // 基本信息和成本备注卡片
      ['attachmentCard', 'SSRC.INQUIRY_HALL_BACK_TO_CHECK_PRICE_OVERVIEW.ATTACHMENT_CARD'], // 附件卡片
      ['ladderLevel', 'SSRC.INQUIRY_HALL_BACK_TO_CHECK_PRICE_OVERVIEW.LADDER_INQUIRY_TABLE'], // 附件卡片
    ]);

    const BidCodeMap = new Map([
      ['headerInfo', 'SSRC.BID_HALL_BACK_TO_CHECK_PRICE_OVERVIEW.HEADER_INFO_AF_BASIC'], // 页面头信息标题
      ['basicInfo', 'SSRC.BID_HALL_BACK_TO_CHECK_PRICE_OVERVIEW.HEADER_INFO_AF_EXTRA'], // 数据信息
      ['buttons', 'SSRC.BID_HALL_BACK_TO_CHECK_PRICE_OVERVIEW.HEADER_BUTTONS'], // 头部按钮
      ['tableFilter', 'SSRC.BID_HALL_BACK_TO_CHECK_PRICE_OVERVIEW.ALL_QUOTATION_FILTER'], // 全部报价明细筛选器
      ['table', 'SSRC.BID_HALL_BACK_TO_CHECK_PRICE_OVERVIEW.ALL_QUOTATION_TABLE'], // 全部报价明细表格
      ['checkPriceBasic', 'SSRC.BID_HALL_BACK_TO_CHECK_PRICE_OVERVIEW.BASIC_FORM'], // 基础信息
      ['costRemark', 'SSRC.BID_HALL_BACK_TO_CHECK_PRICE_OVERVIEW.COST_REMARK'], // 成本备注
      ['attachmentForm', 'SSRC.BID_HALL_BACK_TO_CHECK_PRICE_OVERVIEW.ATTACHMENT_FORM'], // 附件表单
      ['attachmentTable', 'SSRC.BID_HALL_BACK_TO_CHECK_PRICE_OVERVIEW.ATTACHMENT_TABLE_COLUMNS'], // 附件表格列
      ['tableCard', 'SSRC.BID_HALL_BACK_TO_CHECK_PRICE_OVERVIEW.TABLE_CARD'], // 全部报价明细卡片
      ['basicInfoCard', 'SSRC.BID_HALL_BACK_TO_CHECK_PRICE_OVERVIEW.BASIC_INFO_CARD'], // 基本信息和成本备注卡片
      ['attachmentCard', 'SSRC.BID_HALL_BACK_TO_CHECK_PRICE_OVERVIEW.ATTACHMENT_CARD'], // 附件卡片
      ['ladderLevel', 'SSRC.BID_HALL_BACK_TO_CHECK_PRICE_OVERVIEW.LADDER_INQUIRY_TABLE'], // 附件卡片
    ]);

    const CodeDataMap = !bidFlag ? codeMap : BidCodeMap;
    return filterCustomizeCodes(CodeDataMap, codeName);
  };

  const templateInfo = useMemo(() => {
    return {
      cuszTplTemplateCode: routerParams?.templateCode,
      cuszTplVersion: routerParams?.templateVersion,
      cuszTplStageCode: routerParams?.stageCode,
      cuszTplPageCode: routerParams?.pageCode,
    };
  }, [routerParams]);

  // 初始化个性化/单据样式
  const initFetchService = async () => {
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
        getCustomizeUnitCode('headerInfo'),
        getCustomizeUnitCode('basicInfo'),
        getCustomizeUnitCode('buttons'),
        getCustomizeUnitCode('table'),
        getCustomizeUnitCode('checkPriceBasic'),
        getCustomizeUnitCode('costRemark'),
        getCustomizeUnitCode('attachmentForm'),
        getCustomizeUnitCode('attachmentTable'),
        getCustomizeUnitCode('tableCard'),
        getCustomizeUnitCode('basicInfoCard'),
        getCustomizeUnitCode('attachmentCard'),
        getCustomizeUnitCode('ladderLevel'),
      ];
      try {
        await queryUnitConfig(undefined, undefined, unitCode);
      } catch (e) {
        throw e;
      }
    }
  };

  // 页面初始化
  const initPage = () => {
    setContentLoading(true);
    Promise.all([
      fetchCheckPriceUiDisplayConfig(),
      newQuotationConfigSheet(),
      queryFileTemplateManageSheetConfig(),
    ]).finally(() => {
      Promise.all([initFetchService(), fetchBasicInfo()]).finally(() => {
        setContentLoading(false);
      });
    });
  };

  // 查询基本信息
  const fetchBasicInfo = async () => {
    try {
      let res = await fetchInquiryHeaderDetail({
        organizationId,
        rfxHeaderId,
        customizeUnitCode: getCustomizeUnitCode([
          'headerInfo',
          'basicInfo',
          'checkPriceBasic',
          'costRemark',
          'attachmentForm',
        ]),
        ...templateInfo,
      });
      res = getResponse(res);
      if (!res) {
        return;
      }
      setHeaderInfo(res);

      headerDs.loadData([res]);
      basicDs.loadData([res]);
      basicInfoDs.loadData([res]);
      attachmentDs.loadData([res]);
    } catch (e) {
      throw e;
    }
  };

  // 参数设置
  const getSourceNode = () => {
    const node = 'CHECK';
    return node;
  };

  // 查询附件表格
  const fetchTableAttachment = () => {
    tableAttachmentDs.setQueryParameter('commons', {
      sourceId: rfxHeaderId,
      templateInfo,
      organizationId,
      sourceNode: getSourceNode(),
      sourceCategory: 'RFX',
      customizeUnitCode: getCustomizeUnitCode('attachmentTable'),
    });
    tableAttachmentDs.query();
  };

  const value = useMemo(
    () => ({
      organizationId,
      customizeBtnGroup,
      customizeForm,
      customizeTable,
      customizeCommon,
      getHocInstance,
      doubleUnitFlag,
      commonDs: {
        headerDs,
        basicDs,
        tableAttachmentDs,
        itemTableDs,
        basicInfoDs,
        attachmentDs,
      },
      templateInfo,
      rfxHeaderId,
      headerInfo,
      contentLoading,
      checkPriceUiIsNew,
      bidFlag,
      newQuotationFlag,
      fileTemplateManageFlag,
      getCustomizeUnitCode,
    }),
    [
      history,
      location,
      customizeBtnGroup,
      customizeForm,
      customizeTable,
      customizeCommon,
      getHocInstance,
      headerDs,
      basicDs,
      tableAttachmentDs,
      itemTableDs,
      basicInfoDs,
      attachmentDs,
      doubleUnitFlag,
      headerInfo,
      rfxHeaderId,
      contentLoading,
      checkPriceUiIsNew,
      bidFlag,
      newQuotationFlag,
      fileTemplateManageFlag,
      templateInfo,
      getCustomizeUnitCode,
    ]
  );
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export default StoreProvider;
export { StoreContext };

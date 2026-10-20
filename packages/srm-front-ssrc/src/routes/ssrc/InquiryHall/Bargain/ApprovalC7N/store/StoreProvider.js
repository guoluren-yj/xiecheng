import React, { createContext, useMemo, useEffect, useState } from 'react';
import { useDataSet } from 'choerodon-ui/pro';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import { useLocalStore } from 'mobx-react-lite';
import { isEmpty } from 'lodash';
import querystring from 'querystring';

import { fetchSupplierApprovalBargainPrice } from '@/services/bargainService';
import { filterCustomizeCodes } from '@/utils/utils';
import { INQUIRY, getQuotationName, BID } from '@/utils/globalVariable';

import { basicFormDS, SupplierQuotationTableDS } from './storeDS';

const StoreContext = createContext({});

function StoreProvider(props = {}) {
  const {
    match: { params } = {},
    children,
    location,
    sourceFrom = 'RFX',
    sourceKey = INQUIRY,
    queryUnitConfig,
    queryTemplateConfig,
  } = props;

  const [supplierList, setSupplierList] = useState([]); // 供应商列表数据
  const [pageLoading, setPageLoading] = useState(false); // 页面loading

  const { rfxHeaderSnapId } = params || {};

  const organizationId = useMemo(() => getCurrentOrganizationId(), []);

  const bidFlag = useMemo(() => {
    return sourceKey === BID;
  }, [sourceKey]);

  const routerParams = useMemo(() => querystring.parse(location?.search?.substr(1)), [
    location?.search,
  ]);

  // 获取个性化编码
  const getCustomizeUnitCode = (codeName) => {
    if (!codeName || isEmpty(codeName)) return null;

    // 个性化编码集合
    const codeMap = new Map([
      ['headerInfo', 'SSRC.INQUIRY_BARGAIN_APPROVAL_OVERVIEW.HEADER_INFO_AF_BASIC'], // 页面头信息标题
      ['basicInfo', 'SSRC.INQUIRY_BARGAIN_APPROVAL_OVERVIEW.BASIC_INFO'], // 基本信息
      ['supplierList', 'SSRC.INQUIRY_BARGAIN_APPROVAL_OVERVIEW.SUPPLIER_QUOTATION_TABLE'], // 供应商列表
      ['headerInfoCard', 'SSRC.INQUIRY_BARGAIN_APPROVAL_OVERVIEW.HEADER_CARD'], // 头信息标题卡片
      ['basicInfoCard', 'SSRC.INQUIRY_BARGAIN_APPROVAL_OVERVIEW.BASIC_INFO_CARD'], // 基础信息标题卡片
      ['supplierListCard', 'SSRC.INQUIRY_BARGAIN_APPROVAL_OVERVIEW.SUPPLIER_LIST_CARD'], // 供应商列表标题卡片
      ['buttons', 'SSRC.INQUIRY_BARGAIN_APPROVAL_OVERVIEW.HEADER_BUTTONS'], // 头部按钮
      ['ladderLevel', 'SSRC.INQUIRY_BARGAIN_APPROVAL_OVERVIEW.LADDER_LEVER_DETAIL'], // 阶梯报价
    ]);

    const BidCodeMap = new Map([
      ['headerInfo', 'SSRC.BID_BARGAIN_APPROVAL_OVERVIEW.HEADER_INFO_AF_BASIC'], // 页面头信息标题
      ['basicInfo', 'SSRC.BID_BARGAIN_APPROVAL_OVERVIEW.BASIC_INFO'], // 基本信息
      ['supplierList', 'SSRC.BID_BARGAIN_APPROVAL_OVERVIEW.SUPPLIER_QUOTATION_TABLE'], // 供应商列表
      ['headerInfoCard', 'SSRC.BID_BARGAIN_APPROVAL_OVERVIEW.HEADER_CARD'], // 头信息标题卡片
      ['basicInfoCard', 'SSRC.BID_BARGAIN_APPROVAL_OVERVIEW.BASIC_INFO_CARD'], // 基础信息标题卡片
      ['supplierListCard', 'SSRC.BID_BARGAIN_APPROVAL_OVERVIEW.SUPPLIER_LIST_CARD'], // 供应商列表标题卡片
      ['buttons', 'SSRC.BID_BARGAIN_APPROVAL_OVERVIEW.HEADER_BUTTONS'], // 头部按钮
      ['ladderLevel', 'SSRC.BID_BARGAIN_APPROVAL_OVERVIEW.LADDER_LEVER_DETAIL'], // 阶梯报价
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

  // 初始化ds
  const basicFormDs = useDataSet(
    () =>
      basicFormDS({
        organizationId,
        rfxHeaderSnapId,
        sourceFrom,
      }),
    [rfxHeaderSnapId, sourceFrom]
  );

  const supplierQuotationTableDs = useDataSet(
    () =>
      SupplierQuotationTableDS({
        organizationId,
        quotationName: getQuotationName(bidFlag),
      }),
    [bidFlag]
  );

  useEffect(() => {
    initPage();
  }, [templateInfo]);

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
        getCustomizeUnitCode('supplierList'),
        getCustomizeUnitCode('headerInfoCard'),
        getCustomizeUnitCode('basicInfoCard'),
        getCustomizeUnitCode('supplierListCard'),
        getCustomizeUnitCode('buttons'),
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
  const initPage = async () => {
    setPageLoading(true);
    await initFetchService();
    basicFormDs.setQueryParameter('commonProps', {
      templateInfo,
      customizeUnitCode: getCustomizeUnitCode(['basicInfo', 'headerInfo']),
    });
    await basicFormDs.query();
    await fetchSupplierList();
    setPageLoading(false);
  };

  // 查询供应商列表
  const fetchSupplierList = async () => {
    const res = await fetchSupplierApprovalBargainPrice({
      rfxHeaderId: basicFormDs?.current?.get('rfxHeaderId'),
      organizationId,
      rfxHeaderSnapId,
      isBargainApprovalFlag: 1,
    });
    if (getResponse(res)) {
      if (!res) {
        return;
      }
      setSupplierList(res);
    }
  };

  // 公共数据存储
  const storeData = useLocalStore(() => ({
    commonDs: {
      basicFormDs,
      supplierQuotationTableDs,
    },
  }));

  const value = {
    ...(props || {}),
    ...storeData,
    bidFlag,
    sourceFrom,
    templateInfo,
    pageLoading,
    supplierList,
    organizationId,
    rfxHeaderSnapId,
    getCustomizeUnitCode,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export default StoreProvider;

export { StoreContext };

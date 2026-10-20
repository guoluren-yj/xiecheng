import React, { createContext, useMemo, useRef } from 'react';

import querystring from 'querystring';
import { DataSet } from 'choerodon-ui/pro';
import { useLocalStore } from 'mobx-react-lite';
import { set } from 'lodash';
import { toJS } from 'mobx';

import { getActiveTabKey } from 'utils/menuTab';

import {
  rfFormDS,
  basicFormDS,
  rfItemLineDS,
  attachementDS,
  purchaseConcatDS,
  ItemLineDetailDS,
  ladderQuotationTableDS,
  supplierQuotationFormDS,
} from './storeDS';

// 创建context用于上下文传值
export const Store = createContext({});

// 定义路由访问的根组件 用于context传值
export function StoreProvider(props) {
  const {
    children,
    match: {
      params: { rfHeaderId },
    },
    doubleUnitFlag,
    location: { search, pathname },
  } = props;

  const sourceCategory = useMemo(() => (pathname.indexOf('RFI') > -1 ? 'RFI' : 'RFP'), [pathname]);

  const queryParams = useMemo(() => querystring.parse(search.substr(1)), [search]);

  const detailFlag = useMemo(() => pathname.indexOf('detail') > -1, [pathname]);

  const noBackFlag = useMemo(
    () =>
      pathname.indexOf('/ssrc/supplier-reply/rf/detail') > -1 ||
      pathname.indexOf('/ssrc/new-inquiry-hall/rf/detail') > -1 ||
      pathname.indexOf('/ssrc/expert-scoring/rf/detail') > -1,
    [pathname]
  );

  // 判断来自专家评分
  const fromExpertFlag = useMemo(
    () =>
      pathname.indexOf('/ssrc/expert-scoring/reply-detail/') > -1 ||
      pathname.indexOf('/ssrc/expert-scoring/rf/detail') > -1,
    [pathname]
  );

  const participateFlag = useMemo(() => pathname.indexOf('participate') > -1, [pathname]);

  const customizeUnitCode = useMemo(
    // 给保存发布专用
    () =>
      `SSRC.SUPPLIER_REPLY_${sourceCategory}.BASE_HEADER,SSRC.SUPPLIER_REPLY_${sourceCategory}.BASE_FORM,SSRC.SUPPLIER_REPLY_${sourceCategory}.QUOTATION_FORM,SSRC.SUPPLIER_REPLY_${sourceCategory}.QUOTATION_LINE,SSRC.SUPPLIER_REPLY_${sourceCategory}.ATTACHMENT,SSRC.SUPPLIER_REPLY_${sourceCategory}.REPLY_HEADER`,
    [sourceCategory]
  );

  const basicFormDs = useMemo(
    () =>
      new DataSet(
        basicFormDS({
          rfHeaderId,
          sourceCategory,
          noBackFlag,
          participateFlag,
          quotationHeaderId: queryParams?.quotationHeaderId,
          quotationHeaderVersionId: queryParams?.quotationHeaderVersionId,
          supplierCompanyId: queryParams?.supplierCompanyId,
          fromExpertFlag,
        })
      ),
    []
  );
  const rfItemLineDs = useMemo(
    () =>
      new DataSet(
        rfItemLineDS({
          noBackFlag,
          detailFlag,
          doubleUnitFlag,
          sourceCategory,
          quotationHeaderId: queryParams.quotationHeaderId,
          quotationHeaderVersionId: queryParams.quotationHeaderVersionId,
        })
      ),
    [doubleUnitFlag]
  );
  const ItemLineDetailDs = useMemo(
    () => new DataSet(ItemLineDetailDS({ rfHeaderId, sourceCategory, noBackFlag, detailFlag })),
    []
  );
  const ladderQuotationTableDs = useMemo(
    () => new DataSet(ladderQuotationTableDS({ participateFlag, detailFlag, noBackFlag })),
    []
  );
  const supplierQuotationFormDs = useMemo(
    () =>
      new DataSet(
        supplierQuotationFormDS({
          quotationHeaderId: queryParams.quotationHeaderId,
          sourceCategory,
          rfQuotationFormVersionId: queryParams.rfQuotationFormVersionId,
          detailFlag,
          noBackFlag,
        })
      ),
    []
  );
  const rfFormDs = useMemo(
    () => new DataSet(rfFormDS({ rfHeaderId, sourceCategory, noBackFlag })),
    []
  );

  /**
   * 报价单头和附件公用一个数据源
   * 历史遗留问题
   */
  const attachementDs = useMemo(
    () =>
      new DataSet(
        attachementDS({
          noBackFlag,
          participateFlag,
          detailFlag,
          quotationHeaderId: queryParams.quotationHeaderId,
          quotationHeaderVersionId: queryParams.quotationHeaderVersionId,
          sourceCategory,
          supplierCompanyId: queryParams?.supplierCompanyId,
        })
      ),
    []
  );

  const purchaseConcatDs = useMemo(() => new DataSet(purchaseConcatDS({ rfHeaderId })));

  const activeTabKey = useMemo(() => getActiveTabKey());

  const ref = {
    attachementRef: useRef({}),
  };

  const store = useLocalStore(() => ({
    // 公共ds
    commonDs: {
      basicFormDs,
      rfItemLineDs,
      ItemLineDetailDs,
      ladderQuotationTableDs,
      supplierQuotationFormDs,
      rfFormDs,
      attachementDs,
      purchaseConcatDs,
    },
    // 路径参数
    routerParams: {
      rfHeaderId,
      sourceCategory,
      activeTabKey,
    },
    commonCode: {
      customizeUnitCode,
    },
    storeData: {
      queryParams,
      detailFlag,
      participateFlag,
      noBackFlag,
      doubleUnitFlag,
    },
    // 设置状态值
    setStoreData(key, data, hasStoreData = true) {
      if (hasStoreData) {
        set(this.storeData, key, data);
      } else {
        this[key] = data;
      }
    },

    // 获取状态值
    getStoreData(key) {
      return toJS(this.storeData[key]);
    },
    ref,
  }));

  const value = {
    ...props,
    ...store,
  };

  return <Store.Provider value={value}>{children}</Store.Provider>;
}

export { Store as default };

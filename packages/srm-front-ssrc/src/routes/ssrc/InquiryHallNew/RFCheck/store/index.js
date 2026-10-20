import React, { createContext, useRef, useMemo } from 'react';
import { DataSet } from 'choerodon-ui/pro';
import { useLocalStore } from 'mobx-react-lite';
import { set } from 'lodash';
import { toJS } from 'mobx';

import { getCurrentOrganizationId } from 'utils/utils';

import {
  basicFormDS,
  supplierDS,
  ItemLineDetailDS,
  ladderQuotationTableDS,
  rfpTemplateDS,
  rfqTemplateDS,
  exchangeRateDS,
} from './storeDS';

// 创建context用于上下文传值
export const Store = createContext({});
const organizationId = getCurrentOrganizationId();

// 定义路由访问的根组件 用于context传值
export function StoreProvider(props) {
  const {
    children,
    match: {
      params: { rfHeaderId },
    },
    location: { pathname },
  } = props;

  const sourceCategory = useMemo(() => (pathname.indexOf('RFI') > -1 ? 'RFI' : 'RFP'), [pathname]);

  const basicFormDs = useMemo(() => new DataSet(basicFormDS({ rfHeaderId, sourceCategory })), []);
  const supplierDs = useMemo(
    () => new DataSet(supplierDS({ rfHeaderId, sourceCategory, basicFormDs })),
    [basicFormDs]
  );
  const ItemLineDetailDs = useMemo(
    () => new DataSet(ItemLineDetailDS({ rfHeaderId, sourceCategory })),
    []
  );
  const ladderQuotationTableDs = useMemo(() => new DataSet(ladderQuotationTableDS()), []);

  const rfqTemplateDs = useMemo(() => new DataSet(rfqTemplateDS()), []);

  const rfpTemplateDs = useMemo(() => new DataSet(rfpTemplateDS()), []);

  const exchangeRateDs = useMemo(
    () => new DataSet(exchangeRateDS({ rfHeaderId, sourceCategory })),
    []
  );

  let _ref;

  const customizeUnitCode = useRef(
    `SSRC.INQUIRY_HALL.RF_CHECK.HEADER_INFO_${sourceCategory},SSRC.INQUIRY_HALL.RF_CHECK.SUPPLIER_QUO_${sourceCategory}`
  );

  const store = useLocalStore(() => ({
    // 公共ds
    commonDs: {
      basicFormDs,
      supplierDs,
      ItemLineDetailDs,
      ladderQuotationTableDs,
      rfqTemplateDs,
      rfpTemplateDs,
      exchangeRateDs,
    },
    organizationId,
    // 路径参数
    routerParams: {
      rfHeaderId,
      sourceCategory,
    },
    commonCode: {
      customizeUnitCode,
    },
    storeData: {},
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
    _ref,
  }));

  const value = {
    ...props,
    ...store,
  };

  return <Store.Provider value={value}>{children}</Store.Provider>;
}

export default Store;

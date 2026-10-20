import React, { createContext, useContext, useMemo, useEffect } from 'react';
import { DataSet } from 'choerodon-ui/pro';
import { useLocalStore } from 'mobx-react-lite';
import { set } from 'lodash';
import { toJS } from 'mobx';

import { baseFormDS } from './baseFormDS';
import { itemLineDS } from './itemLineDS';
import { supplierTableDS } from './supplierLineDS';

// 创建context用于上下文传值
const Store = createContext({});
export default Store;

// 定义路由访问的根组件 用于context传值
function StoreProvider(props) {
  const {
    children,
    match: {
      params: { rfqHeaderId = '' },
    },
    location: { pathname },
    doubleUnitFlag,
  } = props;

  const isNewInquiry = useMemo(() => pathname.indexOf('create') > -1, [pathname]);

  const basicFormDs = useMemo(() => new DataSet(baseFormDS({ rfqHeaderId, isNewInquiry })), [
    rfqHeaderId,
    isNewInquiry,
  ]);
  const itemLineDs = useMemo(
    () => new DataSet(itemLineDS({ basicFormDs, rfqHeaderId, isNewInquiry })),
    [rfqHeaderId, isNewInquiry, basicFormDs]
  );
  const supplierTableDs = useMemo(
    () => new DataSet(supplierTableDS({ rfqHeaderId, isNewInquiry })),
    [rfqHeaderId, isNewInquiry]
  );

  useEffect(() => {
    itemLineDs.setState('doubleUnitFlag', doubleUnitFlag);
    supplierTableDs.setState('doubleUnitFlag', doubleUnitFlag);
  }, [doubleUnitFlag]);

  const ref = {};

  const store = useLocalStore(() => ({
    // 公共ds
    commonDs: {
      basicFormDs,
      itemLineDs,
      supplierTableDs,
    },
    // 路径参数
    routerParams: {
      rfqHeaderId,
    },
    isNewInquiry,
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
    ref,
  }));

  const value = {
    ...props,
    ...store,
  };

  return <Store.Provider value={value}>{children}</Store.Provider>;
}

const useStore = () => {
  const store = useContext(Store);
  if (!store) {
    throw new Error('You have forgot to use StoreProvider.');
  }
  return store;
};

export { useStore, StoreProvider };

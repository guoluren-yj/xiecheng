import React, { createContext } from 'react';
import { useDataSet } from 'choerodon-ui/pro';
import { useLocalStore } from 'mobx-react-lite';
import { set } from 'lodash';
import { toJS } from 'mobx';

import { headerDS, otherParameterDS, priceLibTableDS } from './storeDS';

// 创建context用于上下文传值
const Store = createContext({});
export default Store;

// 定义路由访问的根组件 用于context传值
export function StoreProvider(props) {
  const {
    children,
    match,
    match: {
      params: { modelId },
    },
  } = props;

  const headerDs = useDataSet(() => headerDS({ modelId }), []);
  const otherParameterDs = useDataSet(() => otherParameterDS({ modelId }), []);
  const priceLibTableDs = useDataSet(() => priceLibTableDS({ modelId }), []);

  const store = useLocalStore(() => ({
    // 公共ds
    commonDs: {
      headerDs,
      otherParameterDs,
      priceLibTableDs,
    },
    // 路径参数
    routerParams: {
      modelId,
    },
    match,
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
  }));

  const value = {
    ...props,
    ...store,
  };

  return <Store.Provider value={value}>{children}</Store.Provider>;
}

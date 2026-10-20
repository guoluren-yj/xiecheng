/*
 * @Descripttion: 申请转RF--Store
 * @version:
 * @Author: yiping.liu<yiping.liu@going-link.com>
 * @Date: 2021-08-06 10:39:49
 * @LastEditors: yiping.liu
 */
import React, { createContext, useMemo } from 'react';
import { DataSet } from 'choerodon-ui/pro';
import { useLocalStore } from 'mobx-react-lite';
import { set } from 'lodash';
import { toJS } from 'mobx';

import { RFApplyDS } from './storeDS';

// 创建context
const Store = createContext({});
export default Store;

// 定义路由访问的根组件 用于context传值
export function StoreProvider(props) {
  const { children } = props;

  const RFApplyDs = useMemo(() => new DataSet(RFApplyDS()), []);

  const ref = {};

  const store = useLocalStore(() => ({
    // 公共ds
    commonDs: {
      RFApplyDs,
    },
    // 路径参数
    routerParams: {},
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

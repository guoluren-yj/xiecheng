/*
 * @Descripttion: 寻源过程审批--Store
 * @version:
 * @Author: yiping.liu<yiping.liu@going-link.com>
 * @Date: 2021-07-26 15:27:16
 * @LastEditors: yiping.liu
 */
import React, { createContext, useMemo } from 'react';
import { DataSet } from 'choerodon-ui/pro';
import { useLocalStore } from 'mobx-react-lite';
import { set } from 'lodash';
import { toJS } from 'mobx';

import {
  basicFormDS,
  inquiryScopeDS,
  consultationDS,
  buyerDS,
  sourcingTeamDS,
  expertDS,
  scoreDS,
  // evaluationDS,
} from './storeDS';
// 创建context
const Store = createContext({});
export default Store;

// 定义路由访问的根组件 用于context传值
export function StoreProvider(props) {
  const {
    children,
    match: {
      params: { rfHeaderId, sourceCategory },
    },
  } = props;

  const basicFormDs = useMemo(() => new DataSet(basicFormDS()), []);

  const inquiryScopeDs = useMemo(() => new DataSet(inquiryScopeDS()), []);

  const consultationDs = useMemo(() => new DataSet(consultationDS()), []);

  const buyerDs = useMemo(() => new DataSet(buyerDS()), []);

  const sourcingTeamDs = useMemo(() => new DataSet(sourcingTeamDS()), []);

  const expertDs = useMemo(() => new DataSet(expertDS()), []);

  const scoreDs = useMemo(() => new DataSet(scoreDS()), []);

  // const evaluationDs = useMemo(()=>new DataSet(evaluationDS()), []);

  const ref = {};

  const store = useLocalStore(() => ({
    // 公共ds
    commonDs: {
      basicFormDs,
      inquiryScopeDs,
      consultationDs,
      buyerDs,
      sourcingTeamDs,
      expertDs,
      scoreDs,
      // evaluationDs,
    },
    // 路径参数
    routerParams: {
      rfHeaderId,
      sourceCategory,
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
    ref,
  }));

  const value = {
    ...props,
    ...store,
  };

  return <Store.Provider value={value}>{children}</Store.Provider>;
}

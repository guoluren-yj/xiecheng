import React, { createContext, useRef, useMemo } from 'react';
import { DataSet } from 'choerodon-ui/pro';
import { useLocalStore } from 'mobx-react-lite';
import { set } from 'lodash';
import { toJS } from 'mobx';
import querystring from 'querystring';

import { basicFormDS, ruleFormDS } from './storeDS';

// 创建context用于上下文传值
export const Store = createContext({});

// 定义路由访问的根组件 用于context传值
export function StoreProvider(props) {
  const {
    children,
    match: {
      params: { templateId },
    },
    location: { pathname, search },
  } = props;

  const isCreate = useMemo(() => pathname.indexOf('create') > -1, [pathname]);
  const queryParams = useMemo(() => querystring.parse(search.substr(1)), [search]);

  const basicFormDs = useMemo(
    () =>
      new DataSet(basicFormDS({ templateId, isCreate, useRFContent: queryParams?.useRFContent })),
    []
  );
  const ruleFormDs = useMemo(() => new DataSet(ruleFormDS({ templateId, isCreate })), []);

  let _ref;

  const customizeUnitCode = useRef(
    `SSRC.SOURCE_TEMPLATE.RF_TEMPLATE.BASIC_INFO,SSRC.SOURCE_TEMPLATE.RF_TEMPLATE.PROCESS_NODE,SSRC.SOURCE_TEMPLATE.RF_TEMPLATE.RF_STAGE,SSRC.SOURCE_TEMPLATE.RF_TEMPLATE.RF_SCORE_STAGE,SSRC.SOURCE_TEMPLATE.RF_TEMPLATE.BUSINESS_DEFAULT_SETTING`
  );

  const store = useLocalStore(() => ({
    // 公共ds
    commonDs: {
      basicFormDs,
      ruleFormDs,
    },
    // 路径参数
    routerParams: {
      templateId,
      ...queryParams,
    },
    commonCode: {
      customizeUnitCode,
    },
    storeData: {
      isCreate,
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
    _ref,
  }));

  const value = {
    ...props,
    ...store,
  };

  return <Store.Provider value={value}>{children}</Store.Provider>;
}

export default Store;

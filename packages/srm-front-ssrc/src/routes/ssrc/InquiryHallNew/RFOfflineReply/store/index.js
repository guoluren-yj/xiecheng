import React, { createContext, useMemo } from 'react';
import { DataSet } from 'choerodon-ui/pro';
import { useLocalStore } from 'mobx-react-lite';
import { set } from 'lodash';
import { toJS } from 'mobx';
import { getCurrentOrganizationId } from 'utils/utils';

import { basicFormDS, supplierReplyDS, supplierInfoDS } from './storeDS';

// 创建context用于上下文传值
const Store = createContext({});
export default Store;

// 定义路由访问的根组件 用于context传值
export function StoreProvider(props) {
  const {
    children,
    match: {
      path,
      params: { rfHeaderId },
    },
    location: { pathname },
  } = props;

  // 如果是include形式审批流，路由形式需要转换
  const setPath = useMemo(() => {
    let pathName = '';
    // eslint-disable-next-line no-template-curly-in-string
    pathName = path.replace('${rfHeaderId}', ':rfHeaderId');
    return pathName || path;
  }, [path]);

  const sourceCategory = useMemo(() => (pathname.indexOf('RFI') > -1 ? 'RFI' : 'RFP'), [pathname]);

  const basicFormDs = useMemo(() => new DataSet(basicFormDS({ rfHeaderId, sourceCategory })), [
    rfHeaderId,
    sourceCategory,
  ]);

  const supplierReplyDs = useMemo(
    () => new DataSet(supplierReplyDS({ rfHeaderId, sourceCategory, ds: basicFormDs })),
    [rfHeaderId, sourceCategory]
  );

  const supplierInfoDs = useMemo(
    () => new DataSet(supplierInfoDS({ rfHeaderId, sourceCategory })),
    [rfHeaderId, sourceCategory]
  );

  const ref = {};

  const store = useLocalStore(() => ({
    organizationId: getCurrentOrganizationId(),
    // 公共ds
    commonDs: {
      basicFormDs,
      supplierReplyDs,
      supplierInfoDs,
    },
    // 路径参数
    routerParams: {
      setPath,
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

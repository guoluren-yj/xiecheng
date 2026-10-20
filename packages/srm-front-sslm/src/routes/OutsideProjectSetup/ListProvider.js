/*
 * @Description: 外部寻源-Store
 * @Date: 2025-05-21 16:12:54
 * @Author: zuoxiangyu <xiangyu.zuo@gong-link.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2025, Hand
 */
import { compose } from 'lodash';
import { DataSet, Spin } from 'choerodon-ui/pro';
import React, { createContext, useMemo, useState } from 'react';

import remotes from 'utils/remote';
import withProps from 'utils/withProps';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';

import { indexDS } from './stores/getIndexDS';
import { getListTab, customizeConfig, lineColumns } from './utils';

// 创建 Context 对象
export const StoreContext = createContext();

const StoreProvider = props => {
  const {
    mixObj,
    dispatch,
    children,
    lineDataSet,
    customizeTable,
    customizeTabPane,
    customizeBtnGroup,
  } = props;

  const [loading, setLoading] = useState(false);

  const [tabKey, onTabChange] = useState(mixObj.activeKey);

  const columns = useMemo(() => lineColumns(dispatch, tabKey, setLoading), [tabKey]);
  const listTab = useMemo(() => getListTab(), []);

  const storeValue = {
    mixObj,
    tabKey,
    loading,
    dispatch,
    listTab,
    columns,
    lineDataSet,
    setLoading,
    onTabChange,
    customizeTable,
    customizeTabPane,
    customizeBtnGroup,
  };

  return (
    <StoreContext.Provider value={storeValue}>
      <Spin spinning={loading}>{children}</Spin>
    </StoreContext.Provider>
  );
};

export const ListProvider = compose(
  formatterCollections({
    code: ['sslm.common', 'sslm.outsideProjectSetup'],
  }),
  withCustomize(customizeConfig),
  remotes({ code: 'SSLM_OUTSIED_PROJECT_LIST' }),
  withProps(
    () => {
      const mixObj = {
        activeKey: 'waitPublish',
        agreementFlag: false, // 是否已阅读协议
      };
      const lineDataSet = getListTab().reduce((acc, tab) => {
        const ds = new DataSet(indexDS());
        ds.setQueryParameter('tabStatus', tab.key);
        ds.setQueryParameter('customizeUnitCode', [tab.searchCode, tab.customizeUnitCode].join());
        acc[tab.key] = ds;
        return acc;
      }, {});
      return { mixObj, lineDataSet };
    },
    { cacheState: true }
  )
)(StoreProvider);

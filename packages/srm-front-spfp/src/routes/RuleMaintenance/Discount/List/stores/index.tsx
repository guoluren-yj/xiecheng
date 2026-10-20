/*
 * @Description: 折扣列表 store
 * @Date: 2023-03-22 10:50:25
 * @Author: MYT<yitian.mao@going-link.com>
 * @Version: 1.0.0
 * @Copyright: Copyright (c) 2021, ZhenYun
 */
import React, { createContext, useMemo, useCallback } from 'react';
import type { ReactElement } from 'react';
import { ModalProvider, DataSet } from 'choerodon-ui/pro';
import { flow } from 'lodash';
import { observer } from 'mobx-react';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { stringify } from 'querystring';
// @ts-ignore
import remote from 'utils/remote';

import formatterCollections from 'utils/intl/formatterCollections';
import withProps from 'utils/withProps';
import { filterNullValueObject } from 'utils/utils';

import { tableDS } from './indexDS';

export interface StoreValueType {
  discountDs: DataSet,
  history,
  handleToDetail,
  customizeTable: any,
  discountRemote: any,
};

export const Store = createContext<any>({});

const StoreProvider = flow(
  withCustomize({
    unitCode: ['SPFP.RULE_DISCOUNT_LIST.SEARCH_BAR2, SPFP.RULE_DISCOUNT_LIST.GRID'],
  }),
  observer,
  withProps(
    (() => {
      const discountDs = new DataSet(tableDS()); // 折扣
      return {
        discountDs,
      };
    }) as any,
    { cacheState: true },
  ) as any,
  formatterCollections({ code: ['spfp.ruleMaintenance', 'spfp.common', 'hzero.common'] }),
  remote({
    code: 'SPFP_DISCOUNT_LIST',
    name: 'discountRemote',
  }, {
    events: {
      // 二开编辑功能
      handleCuxEdit() {},
    },
  })
)(props => {
  const { children, discountDs, history, customizeTable, discountRemote } = props;

  const handleToDetail = useCallback(
    (data, operate) => {
      const { ruleId, ruleStatus, versionNumber } = data || {};
      const step = ['view', 'history'].includes(operate) ? 'END' : undefined;
      let detailName = 'detail';
      if (versionNumber > 1 && ruleStatus === 'UN_PUBLISHED' && operate === 'update') {
        detailName = 'change-detail';
      }
      const url = ruleId
        ? `/spfp/rule-maintenance/discount/${detailName}/${ruleId}/${operate}`
        : `/spfp/rule-maintenance/discount/detail/add`;
      history.push({
        pathname: url,
        search: stringify(filterNullValueObject({ step })),
      });
    },
    [history]
  );

  const value = useMemo<StoreValueType>(
    () => {
      return {
        discountDs,
        history,
        handleToDetail,
        customizeTable,
        discountRemote,
      };
    },
    [
      discountDs,
      history,
      handleToDetail,
      customizeTable,
      discountRemote,
    ]);

  return (
    <Store.Provider value={value}>
      <ModalProvider>
        {children}
      </ModalProvider>
    </Store.Provider>
  );
}) as (props: any) => ReactElement;

export default StoreProvider;

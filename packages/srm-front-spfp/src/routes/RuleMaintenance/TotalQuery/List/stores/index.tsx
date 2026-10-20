import React, { createContext, useMemo, useCallback } from 'react';
import type { ReactElement } from 'react';
import type { DataSet } from 'choerodon-ui/pro';
import { useDataSet } from 'choerodon-ui/pro';
import { ModalProvider } from 'choerodon-ui/pro';
import { flow } from 'lodash';
import { observer } from 'mobx-react';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { filterNullValueObject } from 'utils/utils';
import { stringify } from 'querystring';

import formatterCollections from 'utils/intl/formatterCollections';

import { tableDS } from './indexDS';

export interface StoreValueType
{
  tableDs: DataSet,
  history,
  handleToDetail,
  customizeTable: any,
};

export const Store = createContext<any>({});

const StoreProvider = flow(
  withCustomize({
    unitCode: ['SPFP.RULE_QUERY_ALL_LIST.SEARCH_BAR', 'SPFP.RULE_QUERY_ALL_LIST.GRID'],
  }),
  observer,
  formatterCollections({ code: ['spfp.ruleMaintenance', 'spfp.common', 'hzero.common', 'spfp.rebateOrderCaculate'] }),

)(props =>
{

  const { children, history, customizeTable } = props;
  const tableDs = useDataSet(() => tableDS(), []);

  const handleToDetail = useCallback(
    (record) =>
    {
      const { ruleType, ruleId } = record.get(['ruleType', 'ruleId']);
      if (ruleType && ruleId)
      {
        history.push({
          // 折扣使用view, 返利使用readOnly
          pathname: `/spfp/rule-maintenance/${ruleType.toLocaleLowerCase()}/detail/${ruleId}/readOnly`,
          search: stringify(filterNullValueObject({
            step: 'END',
          })),
        });
      }
    },
    [history]
  );
  const value = useMemo<StoreValueType>(
    () =>
    {
      return {
        tableDs,
        history,
        handleToDetail,
        customizeTable,
      };
    },
    [
      tableDs,
      history,
      handleToDetail,
      customizeTable,
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




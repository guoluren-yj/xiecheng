import React, { createContext, useMemo, useCallback } from 'react';
import type { ReactElement } from 'react';
import { ModalProvider, DataSet } from 'choerodon-ui/pro';
import { flow } from 'lodash';
import { observer } from 'mobx-react';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { stringify } from 'querystring';
import remote from 'hzero-front/lib/utils/remote';

import formatterCollections from 'utils/intl/formatterCollections';
import withProps from 'utils/withProps';
import { filterNullValueObject } from 'utils/utils';

import { tableDS } from './indexDS';

export interface StoreValueType
{
  rebateDs: DataSet,
  history,
  handleToDetail,
  customizeTable: any,
  remoteProps: any,
};

export const Store = createContext<any>({});

const StoreProvider = flow(
  withCustomize({
    unitCode: ['SPFP.RULE_REBATE_LIST.SEARCH_BAR', 'SPFP.RULE_REBATE_LIST.GRID'],
  }),
  remote({
    code: 'SPFP_RULE_MAINTENANCE_REBATE_LIST_CUX',
    name: 'remote',
  }),
  observer,
  withProps(
    (() =>
    {
      const rebateDs = new DataSet(tableDS()); // 返利
      return {
        rebateDs,
      };
    }) as any,
    { cacheState: true },
  ) as any,
  formatterCollections({ code: ['spfp.ruleMaintenance', 'spfp.common', 'hzero.common'] }),

)(props =>
{

  const { children, rebateDs, history, customizeTable, remote: remoteProps } = props;

  const handleToDetail = useCallback(
    (data, operate) =>
    {
      const { ruleId } = data || {};
      const step = ['view', 'history'].includes(operate) ? 'END' : undefined;

      const url = ruleId
        ? `/spfp/rule-maintenance/rebate/detail/${ruleId}/${operate}`
        : `/spfp/rule-maintenance/rebate/detail/add`;
      history.push({
        pathname: url,
        search: stringify(filterNullValueObject({ step })),
      });
    },
    [history]
  );

  const value = useMemo<StoreValueType>(
    () =>
    {
      return {
        rebateDs,
        history,
        handleToDetail,
        customizeTable,
        remoteProps,
      };
    },
    [
      rebateDs,
      history,
      handleToDetail,
      customizeTable,
      remoteProps,
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




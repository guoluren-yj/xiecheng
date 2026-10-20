import React, { createContext, useMemo } from 'react';
import type { ReactElement } from 'react';
import { flow } from 'lodash';
import { observer } from 'mobx-react';
import { ModalProvider, DataSet } from 'choerodon-ui/pro';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { parse } from 'querystring';
import remotes from 'hzero-front/lib/utils/remote';


import formatterCollections from 'utils/intl/formatterCollections';

import { tableDS } from './indexDS';
import { TableCustomizeCodes, TableCustomizeCodesBTNS } from '../../utils/type';

export interface StoreValueType
{
  tableDs: DataSet;
  history,
  customizeTable: Function,
  defaultVersionNumber: any,
  defaultRebatesRuleNum: any,
  defaultCalculateBeginDate: any,
  remote: any,
  customizeBtnGroup: Function,
}

export const Store = createContext<any>({});

const StoreProvider = flow(
  withCustomize({
    unitCode: [
      ...Object.values(TableCustomizeCodes),
      TableCustomizeCodesBTNS,
    ],
  }),
  remotes({
    code: 'SPFP.REBATE_ORDER_CALCULATE_LIST_CUX',
    name: 'remote',
  }),
  observer,
  formatterCollections({ code: ['spfp.rebateOrderCaculate', 'spfp.common', 'hzero.common', 'spfp.ruleMaintenance'] }),
)(props =>
{
  const { children, history, customizeTable, location, remote, customizeBtnGroup } = props;

  const {
    versionNumber: defaultVersionNumber,
    rebatesRuleNum: defaultRebatesRuleNum,
    calculateBeginDate: defaultCalculateBeginDate,
  } = parse(location.search.substring(1)) || {};

  const tableDs = useMemo(() => new DataSet(tableDS()), []);


  const value = useMemo<StoreValueType>(() =>
  {
    return {
      tableDs,
      history,
      customizeTable,
      defaultVersionNumber,
      defaultRebatesRuleNum,
      defaultCalculateBeginDate,
      remote,
      customizeBtnGroup,
    };
  }, [tableDs, history, customizeTable, defaultVersionNumber, defaultRebatesRuleNum, defaultCalculateBeginDate, remote, customizeBtnGroup]);

  return (
    <Store.Provider value={value}>
      <ModalProvider>
        {children}
      </ModalProvider>

    </Store.Provider>
  );

}) as (props: any) => ReactElement;

export default StoreProvider;


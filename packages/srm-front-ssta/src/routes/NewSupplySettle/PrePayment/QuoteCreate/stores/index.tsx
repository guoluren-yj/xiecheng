import type { ReactElement } from 'react';
import React, { createContext, useMemo } from 'react';
import { DataSet } from 'choerodon-ui/pro';
import { ModalProvider } from 'choerodon-ui/pro';
import { flow } from 'lodash';
import { observer } from 'mobx-react';

import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';

import {
  ActiveKey,
  GridCustCode,
  ListTabsCustCode,
} from '../utils/type';
import {
  quoteOrderDS,
  quotePoLineDS,
  quoteContractDS,
  quotePcStageDS,
  quotePcSubjectDS,
} from './listDS';


export const Store = createContext<any>({});



export interface StoreValueType {
  modal: any,
  history: any,
  listDsMap: Record<ActiveKey, DataSet>,
  permissionMap: Map<string, boolean> | undefined,
  customizeTable: Function,
  customizeTabPane: Function,
  defaultActiveKey: ActiveKey,
};

const StoreProvider = flow(
  observer,
  withCustomize({
    unitCode: [
      ListTabsCustCode,
      ...Object.values(GridCustCode),
    ],
  }),
  formatterCollections({ code: ['ssta.common', 'ssta.prePayment'] }),
)((props) => {
  const {
    modal,
    history,
    children,
    custConfig,
    permissionMap,
    customizeTable,
    customizeTabPane,
  } = props;

  const { fields = [] } = custConfig?.[ListTabsCustCode] || {};
  const { fieldCode } = fields.find(item => item?.defaultActive === 1) || {};
  const defaultActiveKey = fieldCode || ActiveKey.Order;

  const quoteOrderDs = useMemo<DataSet>(() => new DataSet(quoteOrderDS()), []);
  const quotePoLineDs = useMemo<DataSet>(() => new DataSet(quotePoLineDS()), []);
  const quoteContractDs = useMemo<DataSet>(() => new DataSet(quoteContractDS()), []);
  const quotePcStageDs = useMemo<DataSet>(() => new DataSet(quotePcStageDS()), []);
  const quotePcSubjectDs = useMemo<DataSet>(() => new DataSet(quotePcSubjectDS()), []);
  const listDsMap = useMemo(() => ({
    [ActiveKey.Order]: quoteOrderDs,
    [ActiveKey.PoLine]: quotePoLineDs,
    [ActiveKey.Contract]: quoteContractDs,
    [ActiveKey.PcStage]: quotePcStageDs,
    [ActiveKey.PcSubject]: quotePcSubjectDs,
  }), [quoteOrderDs, quotePoLineDs, quoteContractDs, quotePcStageDs, quotePcSubjectDs]);


  const value = useMemo<StoreValueType>(() => ({
    modal,
    history,
    listDsMap,
    permissionMap,
    customizeTable,
    customizeTabPane,
    defaultActiveKey,
  }), [
    modal,
    history,
    listDsMap,
    permissionMap,
    customizeTable,
    customizeTabPane,
    defaultActiveKey,
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
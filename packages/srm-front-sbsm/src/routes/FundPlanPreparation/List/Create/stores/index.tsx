import type { ReactElement } from 'react';
import React, { createContext, useMemo } from 'react';
import { DataSet, ModalProvider } from 'choerodon-ui/pro';
import { flow } from 'lodash';
import { observer } from 'mobx-react';

import withRemote from 'utils/remote';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';

import { CreateSourceCode, CreateStageCode, CreateTabsCode, CreateFooterCode } from '../../../utils/type';
import { sourceTableDS, stageTableDS } from './indexDS';


export const Store = createContext<any>({});


export interface StoreValueType {
  modal: any,
  remote: any,
  history: any,
  customizeTable: Function,
  customizeTabPane: Function,
  customizeBtnGroup: Function,
  sourceTableDs: DataSet,
  stageTableDs: DataSet,
  custConfig: any,
  ds: DataSet,
};

const StoreProvider = flow(
  observer,
  withCustomize({
    unitCode: [
        CreateTabsCode,
        CreateFooterCode,
      ...Object.values(CreateSourceCode),
      ...Object.values(CreateStageCode),
    ],
  }),
  withRemote({
    code: 'SBSM.FUND_PLAN_PREPARATION_CREATE_CUX',
    name: 'remote',
  }),
  formatterCollections({ code: ['sbsm.common', 'sbsm.fundPlan', 'sbsm.payTermsCtrl', 'sbsm.fundPlanForecast'] }),
)((props) => {
  const {
    modal,
    remote,
    history,
    children,
    custConfig,
    customizeTable,
    customizeTabPane,
    customizeBtnGroup,
    ds,
  } = props;

  const sourceTableDs = useMemo<DataSet>(() => new DataSet(sourceTableDS()), []);
  const stageTableDs = useMemo<DataSet>(() => new DataSet(stageTableDS()), []);

  const value = useMemo<StoreValueType>(() => ({
    modal,
    remote,
    history,
    sourceTableDs,
    stageTableDs,
    customizeTable,
    customizeTabPane,
    customizeBtnGroup,
    custConfig,
    ds,
  }), [
    modal,
    remote,
    history,
    customizeTable,
    customizeTabPane,
    customizeBtnGroup,
    sourceTableDs,
    stageTableDs,
    custConfig,
    ds,
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

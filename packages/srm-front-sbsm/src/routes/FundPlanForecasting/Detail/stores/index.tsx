// import { stringify } from 'querystring';
import type { ReactElement } from 'react';
import React, { createContext, useMemo, useEffect } from 'react';
import { ModalProvider, DataSet } from 'choerodon-ui/pro';
import { flow } from 'lodash';
import { observer } from 'mobx-react';

import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';

import { stageTermTableDS, stageTermDetailDS } from './indexDS';
// import type { Operate } from '../../utils/type';
import { DetailBasicCode, DetailLineCode } from '../../utils/type';

export const Store = createContext<any>({});



export interface StoreValueType {
  customizeTable: Function,
  customizeTabPane: Function,
  customizeBtnGroup: Function,
  customizeForm: Function,
  stageTermTableDs: DataSet,
  recordInfo: DataSet,
  stageTermDetailDs: DataSet,
  stageTermTableShowDs: DataSet,
};
const StoreProvider = flow(
  observer,
  withCustomize({
    unitCode: [DetailBasicCode, DetailLineCode],
  }),
  formatterCollections({ code: ['sbsm.common', 'sbsm.fundPlan', 'sbsm.payTermsCtrl', 'sbsm.fundPlanForecast'] }),
)((props) => {
  const {
    children,
    customizeTable,
    customizeTabPane,
    customizeBtnGroup,
    customizeForm,
    recordInfo,
    modal,
  } = props;

  useEffect(() => {
    if (modal) {
      modal.update({
        okText: intl.get('hzero.common.button.close').d('关闭'),
        title: intl.get('sbsm.fundPlan.view.title.detailTerm').d('条款详情'),
      });
    }
  }, [modal]);

  const { fcHeaderId, stageNum } = recordInfo?.get(['fcHeaderId', 'stageNum']) || {};
  // 条款阶段信息
  const stageTermTableDs = useMemo(() => new DataSet(stageTermTableDS()), []);
  // 显示的条款阶段信息
  const stageTermTableShowDs = useMemo(() => new DataSet(stageTermTableDS()), []);
  // 条款基本信息
  const stageTermDetailDs = useMemo(() => new DataSet({
    ...stageTermDetailDS(fcHeaderId, stageNum),
    children: {
      docTermLineList: stageTermTableDs,
      currentStageList: stageTermTableShowDs,
    },
  }), [stageTermTableDs, fcHeaderId, stageTermTableShowDs, stageNum]);


  const value: StoreValueType = useMemo(() => ({
    customizeTable,
    customizeTabPane,
    customizeBtnGroup,
    customizeForm,
    stageTermTableDs,
    recordInfo,
    stageTermDetailDs,
    stageTermTableShowDs,
  }), [
    customizeTable,
    customizeTabPane,
    customizeBtnGroup,
    customizeForm,
    stageTermTableDs,
    recordInfo,
    stageTermDetailDs,
    stageTermTableShowDs,
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

// import { stringify } from 'querystring';
import type { ReactElement } from 'react';
import React, { createContext, useMemo, useEffect } from 'react';
import { ModalProvider, DataSet, Spin } from 'choerodon-ui/pro';
import { flow } from 'lodash';
import { observer } from 'mobx-react';

import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';

import { headerDS, termTableDS, preTableDS, termDetailDS, prepListDS, summaryListDS, settleListDS } from './indexDS';
// import type { Operate } from '../../utils/type';
import { StageAllDetailBasicCode, StageAllDetailLineCode, StageAllDetailPreLineCode, StageAllPrepRuleCode, StageAllPrefabInfoCode, StageAllPrepInfoCode,
  PrepLineCode, PrepLineDetailCode, summaryInfoCode, summaryLineCode, summaryLineDetailCode, prePaymentInfoCode, prePaymentLineCode, prePaymentLineDetailCode, paymentInfoCode, paymentLineCode, paymentLineDetailCode,
 } from '../../utils/type';

export const Store = createContext<any>({});



export interface StoreValueType {
  customizeTable: Function,
  customizeTabPane: Function,
  customizeBtnGroup: Function,
  customizeForm: Function,
  termTableDs: DataSet,
  headerDs: DataSet,
  preTableDs: DataSet,
  recordInfo: any,
  termDetailDs: DataSet,
  termTableShowDs: DataSet,
  prepListDs: DataSet,
  summaryListDs: DataSet,
  paymentListDs: DataSet,
  prePaymentListDs: DataSet,
  viewType: string,
  stageType: string,
  poolHeaderId: string,
  poolStageId: string,
};
const StoreProvider = flow(
  observer,
  withCustomize({
    unitCode: [StageAllDetailBasicCode, StageAllDetailLineCode, StageAllDetailPreLineCode, StageAllPrepRuleCode, StageAllPrefabInfoCode, StageAllPrepInfoCode, PrepLineCode, PrepLineDetailCode, summaryInfoCode, summaryLineCode, summaryLineDetailCode, prePaymentInfoCode, prePaymentLineCode, prePaymentLineDetailCode, paymentInfoCode, paymentLineCode, paymentLineDetailCode],
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
    viewType,
  } = props;

  useEffect(() => {
    if (modal) {
      modal.update({
        okText: intl.get('hzero.common.button.close').d('关闭'),
        title: viewType === 'STAGE' ? intl.get('sbsm.fundPlan.view.title.viewStageDetail').d('查看阶段详情') : intl.get('sbsm.fundPlan.view.title.viewSourceDetail').d('查看编制来源单据详情'),
      });
    }
  }, [modal, viewType]);

  const { poolStageId, stageNum, poolHeaderId, stageType, documentNum } = recordInfo?.get(['poolStageId', 'stageNum', 'poolHeaderId', 'stageType', 'documentNum']) || {};
  const queryParam = useMemo(() => {
    return {poolStageId, poolHeaderId, prepViewType: viewType};
  }, [poolStageId, poolHeaderId, viewType]);
  const settleQueryParam = useMemo(() => {
    return viewType === 'STAGE' ? {
      poolStageId, prepViewType: viewType,
    } : { prepDocumentNum: documentNum, prepViewType: viewType };
  }, [poolStageId, documentNum, viewType]);
  const prepListDs = useMemo(() => new DataSet(prepListDS(queryParam)), [queryParam]);
  const summaryListDs = useMemo(() => new DataSet(summaryListDS(queryParam)), [queryParam]);
  const paymentListDs = useMemo(() => new DataSet(settleListDS(settleQueryParam)), [settleQueryParam]);
  const prePaymentListDs = useMemo(() => new DataSet(settleListDS(settleQueryParam)), [settleQueryParam]);
  // 条款阶段信息
  const termTableDs = useMemo(() => new DataSet(termTableDS()), []);
  // 显示的条款阶段信息
  const termTableShowDs = useMemo(() => new DataSet(termTableDS()), []);
  // 条款基本信息
  const termDetailDs = useMemo(() => new DataSet({
    ...termDetailDS(),
    children: {
      docTermLineList: termTableDs,
    },
  }), [termTableDs]);
  // 预制信息下面的行
  const preTableDs = useMemo(() => new DataSet(preTableDS(queryParam)), [queryParam]);

  // 基本信息
  const headerDs = useMemo(() => new DataSet({
    ...headerDS(poolStageId, stageNum, viewType, poolHeaderId),
    children: {
      documentTermList: termDetailDs,
      currentStageList: termTableShowDs,
    },
  }), [termDetailDs, poolStageId, stageNum, termTableShowDs, viewType, poolHeaderId]);


  const value: StoreValueType = useMemo(() => ({
    customizeTable,
    customizeTabPane,
    customizeBtnGroup,
    customizeForm,
    termTableDs,
    headerDs,
    preTableDs,
    recordInfo,
    termDetailDs,
    termTableShowDs,
    prepListDs,
    summaryListDs,
    paymentListDs,
    prePaymentListDs,
    viewType,
    stageType,
    poolHeaderId,
    poolStageId,
  }), [
    customizeTable,
    customizeTabPane,
    customizeBtnGroup,
    customizeForm,
    termTableDs,
    headerDs,
    preTableDs,
    recordInfo,
    termDetailDs,
    termTableShowDs,
    prepListDs,
    summaryListDs,
    paymentListDs,
    prePaymentListDs,
    viewType,
    stageType,
    poolHeaderId,
    poolStageId,
  ]);
  if (!headerDs?.current) return <Spin />;
  return (
    <Store.Provider value={value}>
      <ModalProvider>
        {children}
      </ModalProvider>
    </Store.Provider>
  );
}) as (props: any) => ReactElement;

export default StoreProvider;

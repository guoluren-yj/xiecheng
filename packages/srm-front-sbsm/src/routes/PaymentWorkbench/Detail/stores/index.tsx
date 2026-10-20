import { parse } from 'querystring';
import React, { createContext, useMemo, useCallback } from 'react';
import { flow, isNil } from 'lodash';
import { observer } from 'mobx-react';
import type { ParsedUrlQuery } from 'querystring';
import { ModalProvider, DataSet, Spin } from 'choerodon-ui/pro';

import withRemote from 'utils/remote';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';

import type { Operate} from '../../utils/type';
import { actionFlagger } from '../../utils/utils';
import permissionDS from '../../../../utils/permissionDS';
import WorkflowCaller from '../../../../components/WorkflowCaller';
import { PendingCustCodeMap } from '../../../PaymentPool/utils/type';
import { headerDS, paymentLineDS, statementLineDS } from './indexDS';
import {
  HeadCustCodeMap,
  PermissionCodeMap,
  BepResultGridCode,
  MatchLineGridCode,
  InitiatePayCodeMap,
  DetailBtnsCustCode,
  DetailCollapseCode,
  PaymentLineGridCode,
  FillPayPoolGridCode,
  FillHeadCustCodeMap,
  FlowCardCustCodeMap,
  PaperLineAddCodeMap,
  StatementLineCodeMap,
  PaymentLineAddCodeMap,
  FillPayPoolBatchEditCode,
} from '../../utils/type';

export const Store = createContext<StoreValueType>({} as StoreValueType);

export type StepType = 'PAY_POOL_SELECT' | 'CONFIRM_PAYMENT_METHOD' | 'PAY_LINE' | 'PAY_STATEMENT_LINE' | 'END';

export interface StoreValueType {
  modal: any,
  remote: any,
  loading: boolean,
  boolMap: {
    editBtn: boolean,
    approveBtn: boolean,
    confirmBtn: boolean,
    reverseBtn: boolean,
    stepFlag: boolean,
    allFlag: boolean,
    viewFlag: boolean,
    editFlag: boolean,
    confirmFlag: boolean,
    reverseFlag:boolean,
    pubFlag: boolean,
    modalFlag: boolean,
    revokeApprovalBtn: boolean,
  },
  history: any,
  headerDs: DataSet,
  location: any,
  cuxProps: Record<string, any>,
  headerListDs: DataSet,
  paymentLineDs: DataSet,
  permissionMap: any,
  workflowCaller: WorkflowCaller,
  statementLineDs: DataSet,
  selectedPoolData: object [],
  okCallback?: () => void,
  setLoading: (flag: boolean) => void,
  customizeForm: Function,
  customizeTable: Function,
  customizeCommon: Function,
  customizeTabPane: Function,
  customizeBtnGroup: Function,
  customizeCollapse: Function,
};

type ParsedSearchType = ParsedUrlQuery & {
  step: StepType,
  operate: Operate,
};

const StoreProvider = flow(
  observer,
  withCustomize({
    unitCode: [
      DetailBtnsCustCode,
      DetailCollapseCode,
      MatchLineGridCode,
      BepResultGridCode,
      PaymentLineGridCode,
      FillPayPoolGridCode,
      FillPayPoolBatchEditCode,
      PendingCustCodeMap.Grid,
      PaperLineAddCodeMap.Grid,
      PaymentLineAddCodeMap.Grid,
      ...Object.values(HeadCustCodeMap),
      ...Object.values(InitiatePayCodeMap),
      ...Object.values(FlowCardCustCodeMap),
      ...Object.values(FillHeadCustCodeMap),
      ...Object.values(StatementLineCodeMap),
    ],
  }),
  withRemote({
    code: 'SBSM.PAYMENT_WORKBENCH_DETAIL_CUX',
    name: 'remote',
  }),
  formatterCollections({ code: ['sbsm.common', 'sbsm.paymentPool', 'sbsm.bankBillPool', 'sbsm.paymentWorkbench'] }),
)((props) => {
  const {
    modal,
    match,
    remote,
    history,
    location,
    children,
    stepFlag,
    cuxProps,
    okCallback,
    customizeForm,
    customizeTable,
    customizeCommon,
    selectedPoolData,
    customizeTabPane,
    customizeBtnGroup,
    customizeCollapse,
  } = props;

  const { params } = match || {};
  const { search = '', pathname = '' } = location || {};
  const { step, payHeaderId: sourcePayHeaderId } = params || props; // 如果要使用payHeaderId， 从headerDs中获取，因为新建时无值
  const { operate } = parse(search.substring(1)) as ParsedSearchType;
  const headerListDs = useMemo(() => new DataSet(headerDS()), []);
  const paymentLineDs = useMemo(() => new DataSet(paymentLineDS()), []);
  const statementLineDs = useMemo(() => new DataSet(statementLineDS()), []);
  const headerDs = useMemo(() => new DataSet(headerDS(sourcePayHeaderId)), [sourcePayHeaderId]);
  const workflowCaller = useMemo(() => new WorkflowCaller(headerDs), [headerDs]);
  const permissionDs = useMemo<DataSet>(() => new DataSet(permissionDS(PermissionCodeMap)), []);
  const permissionMap = permissionDs.current;
  const loading = headerDs.status !== 'ready';

  const [editBtn, approveBtn, revokeApprovalBtn, confirmBtn, reverseBtn] = actionFlagger({
    permissionMap,
    workflowCaller,
    record: headerDs.current,
    action: ['edit', 'approve', 'revokeApproval', 'confirm', 'reverse'],
  });

  const setLoading = useCallback((flag: boolean) => Object.assign(headerDs, { status: flag ? 'loading' :'ready' }), [headerDs]);

  const boolMap = useMemo(() => {
    return {
      editBtn,
      stepFlag,
      approveBtn,
      confirmBtn,
      reverseBtn,
      revokeApprovalBtn,
      allFlag: operate === 'all',
      viewFlag: isNil(operate),
      editFlag: operate === 'edit' || stepFlag,
      confirmFlag: operate === 'confirm',
      reverseFlag: operate ==='reverse',
      pubFlag: pathname.split('/')[1] === 'pub',
      modalFlag: !isNil(modal),
    };
  }, [
    modal,
    editBtn,
    operate,
    pathname,
    stepFlag,
    approveBtn,
    confirmBtn,
    reverseBtn,
    revokeApprovalBtn,
  ]);

  const value = useMemo(() => ({
    step,
    modal,
    remote,
    loading,
    boolMap,
    history,
    headerDs,
    location,
    cuxProps,
    setLoading,
    okCallback,
    headerListDs,
    paymentLineDs,
    permissionMap,
    workflowCaller,
    statementLineDs,
    customizeForm,
    customizeTable,
    customizeCommon,
    selectedPoolData,
    customizeTabPane,
    customizeBtnGroup,
    customizeCollapse,
  }), [
    step,
    modal,
    remote,
    loading,
    boolMap,
    history,
    headerDs,
    location,
    cuxProps,
    setLoading,
    okCallback,
    headerListDs,
    paymentLineDs,
    permissionMap,
    workflowCaller,
    statementLineDs,
    customizeForm,
    customizeTable,
    customizeCommon,
    selectedPoolData,
    customizeTabPane,
    customizeBtnGroup,
    customizeCollapse,
  ]);

  if ((sourcePayHeaderId || headerDs.getQueryParameter('payHeaderId')) && !headerDs.current) return <Spin />;

  return (
    <Store.Provider value={value}>
      <ModalProvider>
        {children}
      </ModalProvider>
    </Store.Provider>
  );
}) as React.FC;

export default StoreProvider;

import { parse } from 'querystring';
import type { ParsedUrlQuery } from 'querystring';
import type { ReactElement } from 'react';
import React, { createContext, useMemo } from 'react';
import { ModalProvider, DataSet, Spin } from 'choerodon-ui/pro';
import { flow } from 'lodash';
import { observer } from 'mobx-react';
import type { Record as DSRecord } from 'choerodon-ui/dataset';

import remote from 'utils/remote';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';

import { permissionCodeMap } from '../../List/stores';
import permissionDS from '../../../../stores/permissionDS';
import { depositHeaderDS, payRecordDS, transferOutDS } from './storeDS';
import { DepositHeadUnitCode, DepositDetailBtnsUnitCode, DepositDetailGridUnitCode, DepositDetailCollapseUnitCode } from '../../utils/type';

export interface StoreValueType {
  remote: any,
  allFlag: boolean,
  pubFlag: boolean,
  loading: boolean,
  depositId: string | number,
  modalFlag: boolean,
  readOnlyFlag: boolean,
  workflowBatch: string | number | undefined,
  permissionMap: DSRecord | undefined,
  transferOutDs: DataSet,
  payRecordDs: DataSet,
  depositHeaderDs: DataSet,
  customizeForm: Function,
  customizeTable: Function,
  customizeCollapse: Function,
  customizeBtnGroup: Function,
  onLoad: Function,
  onFormLoaded: Function,
};

type ParsedSearchType = ParsedUrlQuery & {
  type?: 'all' | 'view',
  source?: string,
  workflowBatch?: string | number,
};

export const Store = createContext<any>({});

const StoreProvider = flow(
  observer,
  withCustomize({
    unitCode: [
      ...Object.values(DepositHeadUnitCode),
      ...Object.values(DepositDetailGridUnitCode),
      ...Object.values(DepositDetailBtnsUnitCode),
      ...Object.values(DepositDetailCollapseUnitCode),
    ],
  }),
  remote({
    code: 'SSTA.DEPOSIT_DETAIL_PUR_CUX',
    name: 'remote',
  },{
    events: {
      onLoad: () => {},
      beforeReturnSupplier: () => true,
      handleConfirmPayCallback: () => {},
      handleReturnSupplierCallback: () => {},
    },
  }),
  formatterCollections({ code: ['ssta.sourcingCost', 'ssta.common'] }),
)((props) => {

  const {
    modal,
    match,
    remote,
    location,
    children,
    customizeForm,
    customizeTable,
    customizeCollapse,
    customizeBtnGroup,
    onLoad,
    onFormLoaded,
  } = props;

  const modalFlag = Boolean(modal);
  const { params } = match || {};
  const { depositId } = params;
  const { search = '', pathname = '' } = location || {};
  const { type, workflowBatch } = parse(search.substring(1)) as ParsedSearchType;
  const allFlag = type === 'all';
  const pubFlag = pathname?.startsWith('/pub/');
  const readOnlyFlag = !type || type === 'view';
  const payRecordDs = useMemo<DataSet>(() => new DataSet(payRecordDS(workflowBatch)), [workflowBatch]);
  const transferOutDs = useMemo<DataSet>(() => new DataSet(transferOutDS()), []);
  const depositHeaderDs = useMemo<DataSet>(() => new DataSet({
    ...depositHeaderDS(depositId),
    children: {
      payRecordDs,
      transferOutDs,
    },
  }), [payRecordDs, transferOutDs, depositId]);
  const permissionDs = useMemo<DataSet>(() => new DataSet(permissionDS(permissionCodeMap)), []);
  const permissionMap = permissionDs.current;
  const loading = depositHeaderDs.status !== 'ready';

  const value = useMemo<StoreValueType>(() => {
    return {
      remote,
      allFlag,
      pubFlag,
      loading,
      depositId,
      modalFlag,
      readOnlyFlag,
      workflowBatch,
      permissionMap,
      transferOutDs,
      payRecordDs,
      depositHeaderDs,
      customizeForm,
      customizeTable,
      customizeBtnGroup,
      customizeCollapse,
      onLoad,
      onFormLoaded,
    };
  }, [
    remote,
    allFlag,
    pubFlag,
    loading,
    depositId,
    modalFlag,
    readOnlyFlag,
    workflowBatch,
    permissionMap,
    transferOutDs,
    payRecordDs,
    depositHeaderDs,
    customizeForm,
    customizeTable,
    customizeBtnGroup,
    customizeCollapse,
    onLoad,
    onFormLoaded,
  ]);

  if (depositId && !depositHeaderDs.current) return <Spin />;

  return (
    <Store.Provider value={value}>
      <ModalProvider>
        {children}
      </ModalProvider>
    </Store.Provider>
  );

}) as (props: any) => ReactElement;

export default StoreProvider;

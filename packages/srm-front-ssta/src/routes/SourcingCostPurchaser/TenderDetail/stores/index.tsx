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
import { tenderHeaderDS, payRecordDS } from './storeDS';
import permissionDS from '../../../../stores/permissionDS';
import { TenderHeadUnitCode, TenderDetailBtnsUnitCode, TenderDetailGridUnitCode } from '../../utils/type';

export interface StoreValueType {
  remote: any,
  allFlag: boolean,
  pubFlag: boolean,
  loading: boolean,
  modalFlag: boolean,
  readOnlyFlag: boolean,
  workflowBatch: string | number | undefined,
  payRecordDs: DataSet,
  permissionMap: DSRecord | undefined,
  tenderFeesId: string | number,
  tenderHeaderDs: DataSet,
  customizeForm: Function,
  customizeTable: Function,
  customizeBtnGroup: Function,
  history: any,
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
      ...Object.values(TenderHeadUnitCode),
      ...Object.values(TenderDetailBtnsUnitCode),
      ...Object.values(TenderDetailGridUnitCode),
    ],
  }),
  remote({
    code: 'SSTA.TENDER_DETAIL_PUR_CUX',
    name: 'remote',
  }, {
    events: {
      tenderConfirmPay(eventProps) {
        const { openConfirmModal } = eventProps || {};
        if (openConfirmModal) {
          openConfirmModal();
        }
      },
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
    customizeBtnGroup,
    history,
  } = props;

  const modalFlag = Boolean(modal);
  const { params } = match || {};
  const { tenderFeesId } = params;
  const { search = '', pathname = '' } = location || {};
  const { type, workflowBatch } = parse(search.substring(1)) as ParsedSearchType;
  const allFlag = type === 'all';
  const pubFlag = pathname?.startsWith('/pub/');
  const readOnlyFlag = !type || type === 'view';
  const payRecordDs = useMemo<DataSet>(() => new DataSet(payRecordDS(workflowBatch)), [workflowBatch]);
  const tenderHeaderDs = useMemo<DataSet>(() => new DataSet({
    ...tenderHeaderDS(tenderFeesId),
    children: {
      payRecordDs,
    },
  }), [payRecordDs, tenderFeesId]);
  const permissionDs = useMemo<DataSet>(() => new DataSet(permissionDS(permissionCodeMap)), []);
  const permissionMap = permissionDs.current;
  const loading = tenderHeaderDs.status !== 'ready';

  const value = useMemo<StoreValueType>(() => {
    return {
      remote,
      allFlag,
      pubFlag,
      loading,
      modalFlag,
      readOnlyFlag,
      workflowBatch,
      permissionMap,
      payRecordDs,
      tenderFeesId,
      tenderHeaderDs,
      customizeForm,
      customizeTable,
      customizeBtnGroup,
      history,
    };
  }, [
    remote,
    allFlag,
    pubFlag,
    loading,
    modalFlag,
    readOnlyFlag,
    workflowBatch,
    permissionMap,
    payRecordDs,
    tenderFeesId,
    tenderHeaderDs,
    customizeForm,
    customizeTable,
    customizeBtnGroup,
    history,
  ]);

  if (tenderFeesId && !tenderHeaderDs.current) return <Spin />;

  return (
    <Store.Provider value={value}>
      <ModalProvider>
        {children}
      </ModalProvider>
    </Store.Provider>
  );

}) as (props: any) => ReactElement;

export default StoreProvider;

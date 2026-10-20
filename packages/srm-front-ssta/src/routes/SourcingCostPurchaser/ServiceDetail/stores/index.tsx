import { parse } from 'querystring';
import type { ParsedUrlQuery } from 'querystring';
import type { ReactElement } from 'react';
import React, { createContext, useMemo } from 'react';
import type { Record as DSRecord } from 'choerodon-ui/dataset';
import { ModalProvider, DataSet, Spin } from 'choerodon-ui/pro';
import { flow } from 'lodash';
import { observer } from 'mobx-react';

import remote from 'utils/remote';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';

import { permissionCodeMap } from '../../List/stores';
import { serviceHeaderDS, payRecordDS } from './storeDS';
import permissionDS from '../../../../stores/permissionDS';
import { ServiceHeadUnitCode, ServiceDetailBtnsUnitCode, ServiceDetailGridUnitCode } from '../../utils/type';

export interface StoreValueType {
  remote: any,
  allFlag: boolean,
  pubFlag: boolean,
  loading: boolean,
  modalFlag: boolean,
  readOnlyFlag: boolean,
  workflowBatch: string | undefined, // 可能为空字符串
  payRecordDs: DataSet,
  serverFeesId: string | number,
  serverFeesNum: string,
  permissionMap: DSRecord | undefined,
  serviceHeaderDs: DataSet,
  serverFeesStatus: string,
  customizeForm: Function,
  customizeTable: Function,
  customizeBtnGroup: Function,
};

type ParsedSearchType = ParsedUrlQuery & {
  type?: 'all' | 'view',
  source?: string,
  workflowBatch?: string, // 可能为空字符串
};

export const Store = createContext<any>({});

const StoreProvider = flow(
  observer,
  withCustomize({
    unitCode: [
      ...Object.values(ServiceHeadUnitCode),
      ...Object.values(ServiceDetailGridUnitCode),
      ...Object.values(ServiceDetailBtnsUnitCode),
    ],
  }),
  remote({
    code: 'SSTA.SERVICE_DETAIL_PUR_CUX',
    name: 'remote',
  },{
    events:{
       beforeQuoteDepositPaySubmit:() => true,
    }
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
  } = props;

  const modalFlag = Boolean(modal);
  const { params } = match || {};
  const { serverFeesId } = params;
  const { search = '', pathname = '' } = location || {};
  const { type, workflowBatch } = parse(search.substring(1)) as ParsedSearchType;
  const allFlag = type === 'all';
  const pubFlag = pathname?.startsWith('/pub/');
  const readOnlyFlag = !type || type === 'view';
  const payRecordDs = useMemo<DataSet>(() => new DataSet(payRecordDS(workflowBatch)), [workflowBatch]);
  const serviceHeaderDs = useMemo<DataSet>(() => new DataSet({
    ...serviceHeaderDS(serverFeesId),
    children: {
      payRecordDs,
    },
  }), [payRecordDs, serverFeesId]);
  const permissionDs = useMemo<DataSet>(() => new DataSet(permissionDS(permissionCodeMap)), []);
  const permissionMap = permissionDs.current;
  const loading = serviceHeaderDs.status !== 'ready';
  const { serverFeesNum, serverFeesStatus } = serviceHeaderDs.current?.get(['serverFeesNum', 'serverFeesStatus']) || {};

  const value = useMemo<StoreValueType>(() => {
    return {
      remote,
      allFlag,
      pubFlag,
      loading,
      modalFlag,
      readOnlyFlag,
      workflowBatch,
      payRecordDs,
      serverFeesId,
      serverFeesNum,
      permissionMap,
      serviceHeaderDs,
      serverFeesStatus,
      customizeForm,
      customizeTable,
      customizeBtnGroup,
    };
  }, [
    remote,
    allFlag,
    pubFlag,
    loading,
    modalFlag,
    readOnlyFlag,
    workflowBatch,
    payRecordDs,
    serverFeesId,
    serverFeesNum,
    permissionMap,
    serviceHeaderDs,
    serverFeesStatus,
    customizeForm,
    customizeTable,
    customizeBtnGroup,
  ]);

  if (serverFeesId && !serviceHeaderDs.current) return <Spin />;

  return (
    <Store.Provider value={value}>
      <ModalProvider>
        {children}
      </ModalProvider>
    </Store.Provider>
  );

}) as (props: any) => ReactElement;

export default StoreProvider;
import { parse } from 'querystring';
import type { ParsedUrlQuery } from 'querystring';
import type { ReactElement } from 'react';
import React, { createContext, useMemo } from 'react';
import { ModalProvider, DataSet, Spin } from 'choerodon-ui/pro';
import { flow } from 'lodash';
import { observer } from 'mobx-react';

import remote from 'utils/remote';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';

import { serviceHeaderDS, payRecordDS } from './storeDS';
import { ServiceHeadUnitCode, ServiceDetailBtnsUnitCode, ServiceDetailGridUnitCode } from '../../utils/type';

export interface StoreValueType {
  remote: any,
  allFlag: boolean,
  pubFlag: boolean,
  loading: boolean,
  modalFlag: boolean,
  readOnlyFlag: boolean,
  payRecordDs: DataSet,
  serverFeesId: string | number,
  serviceHeaderDs: DataSet,
  customizeForm: Function,
  customizeTable: Function,
  customizeBtnGroup: Function,
};

type ParsedSearchType = ParsedUrlQuery & {
  type?: 'all' | 'view',
  source?: string,
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
    code: 'SSTA.SERVICE_DETAIL_SUP_CUX',
    name: 'remote',
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
  const { type } = parse(search.substring(1)) as ParsedSearchType;
  const allFlag = type === 'all';
  const pubFlag = pathname?.startsWith('/pub/');
  const readOnlyFlag = !type || type === 'view';
  const payRecordDs = useMemo<DataSet>(() => new DataSet(payRecordDS()), []);
  const serviceHeaderDs = useMemo<DataSet>(() => new DataSet({
    ...serviceHeaderDS(serverFeesId),
    children: {
      payRecordDs,
    },
  }), [payRecordDs, serverFeesId]);
  const loading = serviceHeaderDs.status !== 'ready';

  const value = useMemo<StoreValueType>(() => {
    return {
      remote,
      allFlag,
      pubFlag,
      loading,
      modalFlag,
      readOnlyFlag,
      payRecordDs,
      serverFeesId,
      serviceHeaderDs,
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
    payRecordDs,
    serverFeesId,
    serviceHeaderDs,
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
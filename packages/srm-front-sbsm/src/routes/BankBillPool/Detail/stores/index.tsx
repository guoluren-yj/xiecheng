import { parse } from 'querystring';
import type { ReactElement } from'react';
import type { ParsedUrlQuery } from 'querystring';
import React, { createContext, useMemo } from 'react';
import { flow } from 'lodash';
import { observer } from 'mobx-react';
import { ModalProvider, DataSet } from 'choerodon-ui/pro';

import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';

import { headerDS } from './detailDS';
import type { Operate } from '../../utils/type';
import { DetailBtnsCustCode, DetailCollapseCode, HeadCustCodeMap } from '../../utils/type';

type ParsedSearchType = ParsedUrlQuery & {
  operate?: Operate,
};

interface ContextValueType {
  history: any;
  boolMap: {
    editFlag: boolean;
    modalFlag: boolean;
    createFlag: boolean;
  };
  loading: boolean;
  headerDs: DataSet;
  customizeForm: Function;
  customizeTable: Function;
  customizeBtnGroup: Function;
  customizeCollapse: Function;
}

export const Store = createContext<ContextValueType>({} as ContextValueType);

const StoreProvider = flow(
  observer,
  withCustomize({
    unitCode: [
      DetailBtnsCustCode,
      DetailCollapseCode,
      ...Object.values(HeadCustCodeMap),
    ],
  }),
  formatterCollections({ code: ['sbsm.common', 'sbsm.bankBillPool'] }),
)((props) => {

  const {
    match,
    modal,
    history,
    location,
    children,
    customizeForm,
    customizeTable,
    customizeBtnGroup,
    customizeCollapse,
  } = props;

  const { params } = match || {};
  const { paperId } = params || {};
  const { search = '', pathname = '' } = location || {};
  const { operate } = (parse(search.substring(1))) as ParsedSearchType;

  const boolMap = useMemo(() => ({
    editFlag: operate === 'edit',
    modalFlag: !!modal,
    createFlag: pathname === '/sbsm/bank-bill-pool/create',
  }), [modal, operate, pathname]);

  const headerDs = useMemo(() => new DataSet(headerDS(paperId)), [paperId]);

  const loading = headerDs.status !== 'ready';

  const value = useMemo(() => ({
    history,
    boolMap,
    loading,
    headerDs,
    customizeForm,
    customizeTable,
    customizeBtnGroup,
    customizeCollapse,
  }), [
    history,
    boolMap,
    loading,
    headerDs,
    customizeForm,
    customizeTable,
    customizeBtnGroup,
    customizeCollapse,
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
import React, { useMemo, createContext, useEffect } from 'react';
import { observer } from 'mobx-react';
import { DataSet, ModalProvider } from 'choerodon-ui/pro';
import { noop } from 'lodash';

import { subRelationHeaderFormDS, subRelationLineDS } from "./updateDS";

export type StoreValueType = {
  loading: any,
  history: any,
  headerDS: DataSet,
  lineDS: DataSet,
  subRelationCurId?: string | number,
  customizeForm: Function,
  customizeTable: Function,
}

export const Store = createContext<any>({});

const StoreProvider = ({
  match: {params: { subRelationCurId }},
  history,
  children,
  customizeForm=noop,
  customizeTable=noop,
}) => {
  const subCurId = useMemo(() => {
    if(!subRelationCurId || subRelationCurId === 'null') {
      return '';
    }
    return subRelationCurId;
  }, [subRelationCurId]);

  const headerDS = useMemo(() => new DataSet(subRelationHeaderFormDS({subRelationCurId: subCurId})), [subCurId]);
  const lineDS = useMemo(() => new DataSet(subRelationLineDS({subRelationCurId: subCurId})), [subCurId]);

  const loading = headerDS.status !== 'ready';

  useEffect(() => {
    if(!subCurId) {
      headerDS.create();
      return;
    }
    // eslint-disable-next-line no-unused-expressions
    headerDS.current?.set('status', 'update');
    headerDS.query();
    lineDS.query();
  }, [headerDS, lineDS, subCurId]);

  const value: StoreValueType = useMemo(() => {
    return {
      loading,
      headerDS,
      lineDS,
      history,
      subRelationCurId: subCurId,
      customizeForm,
      customizeTable,
    };
  }, [headerDS, loading, lineDS, subCurId, history, customizeForm, customizeTable]);

  return (
    <Store.Provider value={value}>
      <ModalProvider>{children}</ModalProvider>
    </Store.Provider>
  );
};

export default observer(StoreProvider);
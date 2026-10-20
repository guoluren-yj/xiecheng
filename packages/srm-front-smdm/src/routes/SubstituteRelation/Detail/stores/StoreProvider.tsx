import React, { useMemo, createContext, useEffect } from 'react';
import { observer } from 'mobx-react';
import { DataSet, ModalProvider } from 'choerodon-ui/pro';
import { noop } from 'lodash';

import { subRelationHeaderFormDS, subRelationLineDS } from "./detailDS";

export type StoreValueType = {
  history: any,
  headerDS: DataSet,
  lineDS: DataSet,
  subRelationId: string | number,
  customizeForm: Function,
  customizeTable: Function,
}

export const Store = createContext<any>({});

const StoreProvider = ({
  match: {params: { subRelationId }},
  history,
  children,
  customizeForm=noop,
  customizeTable=noop,
}) => {
  const headerDS = useMemo(() => new DataSet(subRelationHeaderFormDS({subRelationId})), [subRelationId]);
  const lineDS = useMemo(() => new DataSet(subRelationLineDS({subRelationId})), [subRelationId]);

  const value: StoreValueType = useMemo(() => {
    return {
      headerDS,
      lineDS,
      history,
      subRelationId,
      customizeForm,
      customizeTable,
    };
  }, [headerDS, lineDS, history, subRelationId, customizeForm, customizeTable]);

  useEffect(() => {
    if(!subRelationId) return;
    headerDS.query();
    lineDS.query();
  }, []);

  return (
    <Store.Provider value={value}>
      <ModalProvider>{children}</ModalProvider>
    </Store.Provider>
  );
};

export default observer(StoreProvider);
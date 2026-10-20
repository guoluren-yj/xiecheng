/*
 * @Description: file content
 * @Author: jiwei.liu01@hand-china.com
 * @Date: 2022-05-01 11:14:38
 * @version: 0.0.1
 * @copyright: Copyright (c) 2022, Hand
 */
import React, { createContext, useMemo } from 'react';
import { ModalProvider, DataSet } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import formatterCollections from 'srm-front-boot/lib/utils/intl/formatterCollections';
import withProps from 'utils/withProps';
import { compose } from 'lodash';
import { tableDS } from './stores/RoManagementDS';

export const Store = createContext();

const StoreProvider = function StoreProvider(props) {
  const { history, children, tableDs, createModalDs } = props;

  const value = useMemo(() => {
    return {
      history,
      tableDs,
      createModalDs,
    };
  }, [history, tableDs, createModalDs]);
  return (
    <Store.Provider value={value}>
      <ModalProvider>{children}</ModalProvider>
    </Store.Provider>
  );
};
export default compose(
  formatterCollections({
    code: ['swbh.roManagement', 'swbh.common'],
  }),
  withProps(
    () => {
      const tableDs = new DataSet(tableDS(false));
      const createModalDs = new DataSet(tableDS(true));
      return {
        tableDs,
        createModalDs,
      };
    },
    { cacheState: true }
  ),
  observer
)(StoreProvider);

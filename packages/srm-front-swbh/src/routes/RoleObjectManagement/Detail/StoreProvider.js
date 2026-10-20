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
import { tableDS, templateDS } from '../stores/RoManagementDS';

export const Store = createContext();

const StoreProvider = function StoreProvider(props) {
  const { history, location, children, tableDs, createModalDs, templateDs } = props;
  const { combineId, domainId, domainCode, objectTenantId, combineName } =
    tableDs?.current?.get(['combineId', 'domainId', 'domainCode', 'objectTenantId', 'combineName', 'combineCode']) ||
    {};
  const value = useMemo(() => {
    return {
      history,
      location,
      tableDs,
      createModalDs,
      templateDs,
      combineId,
      domainId,
      domainCode,
      objectTenantId,
      combineName,
    };
  }, [
    history,
    location,
    tableDs,
    createModalDs,
    templateDs,
    combineId,
    domainId,
    domainCode,
    objectTenantId,
    combineName,
  ]);
  return (
    <Store.Provider value={value}>
      <ModalProvider>{children}</ModalProvider>
    </Store.Provider>
  );
};
export default compose(
  formatterCollections({
    code: ['swbh.roManagement', 'swbh.common', 'hzero.common'],
  }),
  withProps(
    () => {
      const tableDs = new DataSet(tableDS(false));
      const createModalDs = new DataSet(tableDS(true));
      const templateDs = new DataSet(templateDS(false));
      return {
        tableDs,
        createModalDs,
        templateDs,
      };
    },
    { cacheState: true }
  ),
  observer
)(StoreProvider);

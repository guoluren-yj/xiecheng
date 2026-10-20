import React, { useEffect, useMemo } from 'react';
import { DataSet } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';

import intl from 'utils/intl';
import SearchBarTable from '_components/SearchBarTable';
import { SRM_SMPC } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const itemDS = () => ({
  autoQuery: false,
  selection: 'single',
  pageSize: 20,
  transport: {
    read({ data }) {
      return {
        url: `${SRM_SMPC}/v1/${getCurrentOrganizationId()}/receive-skus/item`,
        method: 'GET',
        data: {
          ...data,
          lovCode: 'SAGM.ITEM',
          nonProduceInvManageFlag: 1,
          customizeUnitCode: 'SMPC.WORKBENCH_PUR.RECEIVE.ITEM.SEARCHBAR',
        },
      };
    },
  },
});

export default observer(function ItemSearchbarTable({ modal, push, prefixPath }) {
  const ds = useMemo(() => new DataSet(itemDS()), []);
  useEffect(() => {
    modal.update({
      okProps: {
        disabled: ds.selected.length === 0,
      },
    });
    modal.handleOk(handleOk);
  }, [ds.selected.length]);
  const handleOk = () => {
    const itemId = ds.selected[0].get('itemId');
    push(`${prefixPath}/create?req=receive&itemId=${itemId}`);
  };
  const columns = useMemo(
    () => [
      {
        name: 'itemCode',
        title: intl.get('smpc.product.model.itemCode').d('物料编码'),
        width: 110,
      },
      {
        name: 'itemName',
        width: 140,
        title: intl.get('smpc.product.model.itemName').d('物料名称'),
      },
      {
        name: 'uomCodeAndName',
        width: 100,
        title: intl.get('smpc.product.model.uom').d('单位'),
      },
      {
        name: 'itemCategoryCode',
        width: 110,
        title: intl.get('smpc.product.model.itemCategoryCode').d('品类编码'),
      },
      {
        name: 'itemCategoryName',
        width: 140,
        title: intl.get('smpc.product.model.itemCategoryName').d('品类名称'),
      },
    ],
    []
  );
  return (
    <SearchBarTable
      style={{ maxHeight: 'calc(100vh - 156px)' }}
      searchBarConfig={{
        expandable: false,
      }}
      dataSet={ds}
      columns={columns}
      searchCode="SMPC.WORKBENCH_PUR.RECEIVE.ITEM.SEARCHBAR"
      customizedCode="SMPC.WORKBENCH_PUR.RECEIVE.ITEM_CREATE.TABLE"
      // cacheState
    />
  );
});

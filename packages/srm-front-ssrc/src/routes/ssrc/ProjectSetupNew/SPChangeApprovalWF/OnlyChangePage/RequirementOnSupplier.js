import React, { useContext } from 'react';
import { observer } from 'mobx-react-lite';

import { StoreContext } from '../store/StoreProvider';
import CommonChangeForm from './CommonChangeForm';
import SupplierTable from '../CardList/SupplierTable';

// 标段/包信息
const supplierLineTable = observer(() => {
  const { onlyChangeCommonDs: { supplierLineTableDs, headerDs } = {} } = useContext(StoreContext);

  const {
    groupedDiffFields, // 调整字段map数据
  } = headerDs?.current?.get(['groupedDiffFields']) || {};

  const { sourceMethodFields } = groupedDiffFields || {};

  return (
    <>
      {sourceMethodFields?.length ? (
        <CommonChangeForm ds={headerDs} fields={sourceMethodFields} />
      ) : null}
      {supplierLineTableDs?.length > 0 && (
        <div style={{ marginTop: sourceMethodFields?.length ? '16px' : '0' }}>
          <SupplierTable changeType="onlyChange" />
        </div>
      )}
    </>
  );
});

export default supplierLineTable;

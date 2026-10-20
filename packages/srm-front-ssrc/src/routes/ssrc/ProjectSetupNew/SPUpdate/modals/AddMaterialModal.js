import React from 'react';
import { Table } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';

// 标段/包信息
const AddMaterialModal = observer((props) => {
  const { customizeTable, getCustomizeUnitCode, addMaterialDs, doubleUnitFlag } = props;

  const columns = [
    {
      name: 'projectLineItemNum',
    },
    {
      name: 'itemCode',
    },
    {
      name: 'itemName',
    },
    {
      name: 'itemCategoryName',
    },
    doubleUnitFlag
      ? {
          name: 'secondaryQuantity',
          align: 'right',
        }
      : null,
    {
      name: 'requiredQuantity',
      align: 'right',
    },
    doubleUnitFlag
      ? {
          name: 'secondaryUomName',
        }
      : null,
    {
      name: 'uomName',
    },
  ];

  return customizeTable(
    {
      code: getCustomizeUnitCode('allotItemLineTable'),
      dataSet: addMaterialDs,
    },
    <Table
      dataSet={addMaterialDs}
      columns={columns}
      queryFieldsLimit={1}
      style={{ maxHeight: 'calc(100vh - 400px)' }}
    />
  );
});

export default AddMaterialModal;

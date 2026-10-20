import React, { Fragment } from 'react';
import { Table } from 'choerodon-ui/pro';

const lineItemList = (props) => {
  const { customizeTable, lineItemDs, nodeTemplateCode, edit, tabType = false } = props;

  const getColumns = [
    {
      name: 'itemLineNum',
      width: 120,
    },
    {
      name: 'itemCode',
    },
    {
      name: 'itemName',
    },
    {
      name: 'displayUom',
    },
    {
      name: 'poQuantityTotal',
    },
    {
      name: 'canCreateQuantityTotal',
    },
    {
      name: 'actualQuantityTotal',
    },
  ];

  return (
    <Fragment>
      {customizeTable(
        {
          code: `SLOD.DELIVERY__WORKBENCH_${nodeTemplateCode}_A.DETAIL_ITEM_LIST`,
          __force_record_to_update__: true,
          readOnly: tabType && !edit,
        },
        <Table
          virtual
          dataSet={lineItemDs}
          columns={getColumns}
          pagination={{ pageSizeOptions: ['10', '20', '50', '100', '200'] }}
          style={{ maxHeight: `calc(100vh - 400px)` }}
          virtualCell
          selectionMode="none"
        />
      )}
    </Fragment>
  );
};

export default lineItemList;

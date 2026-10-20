import React from 'react';
import { Table } from 'choerodon-ui/pro';

export default function CustomLov(props) {
  const { modal, dataSet, columns = [], onRowDoubleClick = e => e } = props;
  return (
    <Table
      dataSet={dataSet}
      columns={columns}
      queryFieldsLimit={2}
      onRow={({ record }) => ({
        onDoubleClick: () => {
          modal.close();
          onRowDoubleClick(record);
        },
      })}
    />
  );
}
import React from 'react';
import { Table } from 'choerodon-ui/pro';

export default function CommonTable({ dataSet, columns }) {
  return (
    <div style={{ maxHeight: '400px' }}>
      <Table
        dataSet={dataSet}
        columns={columns}
        queryBar="none"
        border={false}
        autoHeight={{ type: 'maxHeight', diff: 40 }}
      />
    </div>
  );
}

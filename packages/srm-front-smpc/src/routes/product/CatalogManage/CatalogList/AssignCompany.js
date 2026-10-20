import React from 'react';
import { Table } from 'choerodon-ui/pro';

export default function (props) {
  const { dataSet } = props;
  const columns = [{ name: 'companyNum' }, { name: 'companyName' }];
  return <Table dataSet={dataSet} columns={columns} queryFieldsLimit={2} queryBar="normal" />;
}

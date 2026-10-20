import React from 'react';
import { Table } from 'choerodon-ui/pro';

export default function CustomizeTableComp(props) {
  const { customizeTable, dataSet, type } = props;

  const columns = () => {
    return [{ name: 'title', width: '300px' }, { name: 'description' }];
  };

  return customizeTable(
    {
      code: `'SDAT.CORPORATE_DILIGENCE_TABLE_${type}`,
    },
    <Table
      dataSet={dataSet}
      columns={columns()}
      queryBar="none"
      autoHeight={{ type: 'maxHeight', diff: 40 }}
    />
  );
}

import React, { useMemo, useEffect } from 'react';
import { Table, DataSet } from 'choerodon-ui/pro';

import tableDs from './store';

const BillRecord = (props) => {
  const { billHeaderId } = props;

  useEffect(() => {
    tableDS.query();
  }, []);

  const tableDS = useMemo(() => {
    return new DataSet(tableDs(billHeaderId));
  }, [billHeaderId]);

  const columns = [
    {
      name: 'processUser',
      width: 120,
    },
    {
      name: 'processDate',
      width: 150,
    },
    {
      name: 'processStatusMeaning',
      width: 150,
    },
    {
      name: 'lineNum',
      width: 150,
    },
    {
      name: 'processRemark',
      width: 150,
    },
  ];

  return <Table columns={columns} dataSet={tableDS} />;
};

export default BillRecord;

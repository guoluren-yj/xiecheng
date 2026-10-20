import React, { useMemo } from 'react';
import { DataSet, Table } from 'choerodon-ui/pro';

import { detailDS } from './store.js';

// import styles from './index.less';

const Index = (props) => {
  const { taskDocNum } = props;
  const tableDs = useMemo(() => new DataSet(detailDS({ taskDocNum })), [taskDocNum]);

  const columns = [
    { name: 'taskDocLineNum' },
    { name: 'quantity' },
    { name: 'completedTime', width: 150 },
    { name: 'type' },
    { name: 'errorCode' },
    { name: 'errorMsg', width: 180 },
    { name: 'remark', width: 150 },
  ];

  return (
    <Table
      dataSet={tableDs}
      columns={columns}
      style={{ maxHeight: 'calc(100vh - 160px)' }}
    />
  );
};

export default Index;

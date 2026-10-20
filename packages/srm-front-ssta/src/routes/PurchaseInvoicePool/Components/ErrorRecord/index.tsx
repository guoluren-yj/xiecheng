import React, { useMemo } from 'react';
import { DataSet, Table } from 'choerodon-ui/pro';
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';

import { listDS } from './storeDS';

const ErrorRecord = () => {

  const listDs = useMemo<DataSet>(() => new DataSet(listDS()), []);

  const columns = useMemo<ColumnProps[]>(() => {
    return [
      { name: 'documentCode', width: 150 },
      { name: 'content', width: 150 },
      { name: 'lastUpdateDate', width: 150 },
      { name: 'errorMsg', width: 200 },
    ];
  }, []);

  return (
    <Table dataSet={listDs} columns={columns} style={{ maxHeight: 'calc(100vh - 200px)' }} />
  );
};

export default ErrorRecord;
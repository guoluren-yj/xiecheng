import React, { useEffect, useMemo } from 'react';
import { DataSet, Table } from 'choerodon-ui/pro';

import { lockQuantityDS as lockQuantityDs } from '../../stores/SupplySettlePoolDS';

const LockQuantity = ({ settleId, documentType }) => {
  const tableDS = useMemo(() => new DataSet(lockQuantityDs()), []);

  const columns = useMemo(
    () => [
      {
        name: 'lockDocumentNum',
        width: 150,
      },
      {
        name: 'lockDocumentLineNum',
        width: 150,
      },
      {
        name: 'campMeaning',
        width: 150,
      },
      {
        name: 'createdUserName',
        width: 150,
      },
    ],
    []
  );

  useEffect(() => {
    tableDS.setQueryParameter('settleId', settleId);
    tableDS.setQueryParameter('documentType', documentType);
    tableDS.query();
  }, []);

  return <Table dataSet={tableDS} columns={columns} />;
};

export default LockQuantity;

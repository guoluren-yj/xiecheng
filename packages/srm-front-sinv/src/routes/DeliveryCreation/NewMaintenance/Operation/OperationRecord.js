import React, { Fragment, useMemo, useEffect } from 'react';
import { DataSet, Table } from 'choerodon-ui/pro';

import { OperationDS } from './OperationDS';

const OperationRecord = (props) => {
  const { asnHeaderId } = props;
  const OperationDs = useMemo(() => new DataSet(OperationDS()), []);

  useEffect(() => {
    OperationDs.setQueryParameter('params', {
      asnHeaderId,
    });
    OperationDs.query();
  }, []);

  const columns = [
    {
      name: 'processUser',
      width: 200,
      align: 'left',
    },
    {
      width: 180,
      align: 'left',
      name: 'processDate',
    },
    {
      width: 120,
      align: 'left',
      name: 'processStatusMeaning',
    },
    {
      width: 100,
      align: 'left',
      name: 'processRemark',
    },
  ];

  return (
    <Fragment>
      <Table columns={columns} dataSet={OperationDs} />
    </Fragment>
  );
};

export default OperationRecord;

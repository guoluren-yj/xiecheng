import React, { useMemo, useEffect } from 'react';
import { Table, DataSet } from 'choerodon-ui/pro';

import { recordDS as recordDs } from '../../stores/SupplySettleDS';

const Record = (props) => {
  const { settleHeaderId } = props;

  const recordDS = useMemo(() => {
    return new DataSet(recordDs());
  }, []);

  useEffect(() => {
    recordDS.setQueryParameter('settleHeaderId', settleHeaderId);
    recordDS.query();
  }, []);

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
      name: 'processRemark',
    },
  ];

  return <Table columns={columns} dataSet={recordDS} />;
};

export default Record;

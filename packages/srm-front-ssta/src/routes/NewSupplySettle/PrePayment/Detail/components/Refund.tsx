import React, { useMemo, useEffect } from 'react';
import { Table } from 'choerodon-ui/pro';
import { statusTagRender } from '../../../../Components/StatusTag';


const Refund = (props) => {

  const { refundRecordDs } = props;

  useEffect(() => {
    refundRecordDs.query();
  }, []);

  const column: any = useMemo(() => {
    return [
      {
        name: 'settleNum',
        width: 190,
      },
      {
        name: 'lineNum',
      },
      {
        name: 'settleStatus',
        renderer: statusTagRender,
      },
      {
        name: 'refundAmount',
      },
    ];
  }, []);

  return (
    <Table
      columns={column}
      dataSet={refundRecordDs}
      style={{ maxHeight: 620 }}
    />
  );
};

export default Refund;

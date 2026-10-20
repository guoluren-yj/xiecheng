import React, { useEffect, useMemo, useState } from 'react';
import { DataSet, Table } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import { ReportDetailDs } from './ds';

function Detail(props) {
  const { record } = props;
  const [visible, setVisible] = useState(false);
  const { ds, columns } = useMemo(() => {
    return {
      ds: new DataSet(ReportDetailDs(record.toData())),
      columns: [
        { name: 'autoBillNum', width: 170 },
        { name: 'autoBillStatusMeaning' },
        { name: 'billStatusMeaning', width: 130 },
        { name: 'billRemark' },
        { name: 'asnNum', width: 170 },
        { name: 'ecPoSubNum', width: 130 },
        { name: 'itemCode', width: 130 },
        { name: 'itemName', width: 130 },
        { name: 'taxIncludedAmount', width: 170, align: 'right' },
        { name: 'billOccupiedNums' },
        { name: 'settleNum', width: 130 },
        { name: 'sourceSettleNum', width: 170 },
      ],
    };
  }, []);
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(true);
    }, 150);
    return () => {
      clearTimeout(timer);
    };
  }, []);
  return (
    visible && (
      <Table
        dataSet={ds}
        columns={columns}
        autoHeight={{ type: 'maxHeight', diff: 30 }}
        customizable
        customizedCode="SDRP.SETTLE.RECONCILIATION_REPORT.DETAIL_TABLE"
      />
    )
  );
}

export default observer(Detail);

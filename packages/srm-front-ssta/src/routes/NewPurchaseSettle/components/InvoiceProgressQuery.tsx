import React, { useMemo } from 'react';
import { DataSet } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

import FilterBarTable from '_components/FilterBarTable';
import { invoiceProgressQueryDS } from '../../../stores/NewPurchaseSettleDS';

interface InvProgressQueryProps {
  settleHeaderId: string;
}

export default observer((props: InvProgressQueryProps) => {
  const { settleHeaderId } = props;
  const tableDs = useMemo(() => new DataSet(invoiceProgressQueryDS(settleHeaderId)), [settleHeaderId]);

  const columns = useMemo(() => [
    { name: 'lineNum', width: 150 },
    { name: 'settleNum', width: 150 },
    { name: 'ecPoSubNum', width: 150 },
    { name: 'asnNumAndLineNum', width: 150 },
    { name: 'itemCode', width: 150 },
    { name: 'itemName', width: 150 },
    { name: 'invoiceCode', width: 150 },
    { name: 'invoiceNum', width: 150 },
    { name: 'invoiceUrl', width: 300 },
  ], []);


  return (
    <FilterBarTable
      dataSet={tableDs}
      columns={columns}
      style={{ maxHeight: 'calc(100vh - 160px)' }}
      customizedCode="SSTA.PURCHASE_SETTLE_LIST.INV_PROGRESS_LIST"
    />
  );
});
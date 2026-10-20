import { memo, useContext, useMemo } from 'react';
import { Store } from './stores';
import { useTable } from './hooks';

const BillTable = function BillTable(props) {
  const { dataSet } = props;
  const { associatedConfigFlag, customizeTable } = useContext(Store);
  const columns = useMemo(
    () => [
      {
        name: 'billNum',
        width: 120,
      },
      {
        name: associatedConfigFlag ? 'lineNum' : 'billLineNum',
        width: 60,
      },
      {
        name: associatedConfigFlag ? 'sourceSettleNumAndLineNum' : 'trxAndLineNum',
        width: 120,
      },
      {
        name: 'quantity',
        width: 90,
      },
      {
        name: associatedConfigFlag ? 'uom' : 'uomName',
        width: 100,
      },
      {
        name: associatedConfigFlag ? 'confirmDate' : 'approvedDate',
        width: 120,
      },
      {
        name: 'billStatusMeaning',
        width: 100,
      },
      {
        name: 'attachmentUuid',
        width: 60,
      },
    ],
    [associatedConfigFlag]
  );
  return useTable(dataSet, columns, {
    customizeTable,
    code: associatedConfigFlag
      ? 'SODR.SEND_ORDER_DETAIL.DOCRELATE_BILL_NEW'
      : 'SODR.SEND_ORDER_DETAIL.DOCRELATE_BILL',
  });
};

export default memo(BillTable);

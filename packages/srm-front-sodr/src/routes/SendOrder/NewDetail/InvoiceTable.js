import { memo, useContext, useMemo } from 'react';
import { Store } from './stores';
import { useTable } from './hooks';

const InvoiceTable = function InvoiceTable(props) {
  const { dataSet } = props;
  const { associatedConfigFlag } = useContext(Store);
  const columns = useMemo(
    () => [
      {
        name: associatedConfigFlag ? 'settleHeaderNum' : 'invoiceNum',
        width: 150,
      },
      {
        name: associatedConfigFlag ? 'lineNum' : 'invoiceLineNum',
        width: 60,
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
        name: 'syncDate',
        width: 120,
      },
      {
        name: associatedConfigFlag ? 'settleStatusMeaning' : 'invoiceStatusMeaning',
        width: 100,
      },
      {
        name: 'attachmentUuid',
        width: 60,
      },
    ],
    [associatedConfigFlag]
  );
  return useTable(dataSet, columns);
};

export default memo(InvoiceTable);

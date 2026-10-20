import { memo, useMemo } from 'react';
import { useTable } from './hooks';

const RcvTable = function RcvTable(props) {
  const { dataSet } = props;
  const columns = useMemo(
    () => [
      {
        name: 'rcvTrxTypeName',
        width: 100,
      },
      {
        name: 'displayTrxNum',
        width: 100,
      },
      {
        name: 'trxLineNum',
        width: 60,
      },
      {
        name: 'quantity',
        width: 60,
      },
      {
        name: 'uomName',
        width: 100,
        renderer: ({ record }) => record.get('uomCodeAndName'),
      },
      {
        name: 'trxDate',
        width: 100,
      },
      {
        name: 'sinvHeaderAttachmentUuid',
        width: 60,
      },
    ],
    []
  );
  return useTable(dataSet, columns);
};

export default memo(RcvTable);

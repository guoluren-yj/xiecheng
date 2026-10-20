import { memo, useContext } from 'react';
import { useDefaultColumns, useTable } from './hooks';
import { Store } from './stores';

const AssociatedTable = function AssociatedTable() {
  const { associateDs, sourceFromCancel, customizeTable } = useContext(Store);
  const columns = useDefaultColumns('invoice');
  const onRow = () => ({
    className: 'associated-tale-row',
  });
  return customizeTable(
    {
      code: sourceFromCancel
        ? 'SODR.ORDER_PROCESS_CONTROL_DETAIL.INVOICE'
        : 'SODR.SEND_ORDER_DETAIL.INVOICE',
    },
    useTable(associateDs, columns, {
      highLightRow: 'click',
      onRow,
    })
  );
};

export default memo(AssociatedTable);

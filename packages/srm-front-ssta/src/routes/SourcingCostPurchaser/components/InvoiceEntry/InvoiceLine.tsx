import React, { useMemo, useCallback } from 'react';
import { Table } from 'choerodon-ui/pro';
import type { Buttons, ColumnProps } from 'choerodon-ui/pro/lib/table/interface';
import { TableButtonType } from 'choerodon-ui/pro/lib/table/interface';
import { observer } from 'mobx-react';

import intl from 'utils/intl';
import { getSelectedNegActConfirmMsg } from '../../../../utils/utils';

const InvoiceLine = observer((props) => {
  const { invoiceLineDs, invoiceHeaderDs } = props;

  const handleDelete = useCallback(async () => {
    const res = await invoiceLineDs.delete(invoiceLineDs.selected, getSelectedNegActConfirmMsg('delete'));
    if (!res) return;
    invoiceHeaderDs.query();
  }, [invoiceLineDs, invoiceHeaderDs]);

  const columns = useMemo<ColumnProps[]>(() => {
    return [
      { name: 'taxInvoiceLineNum' },
      { name: 'itemName', editor: true },
      { name: 'netAmount', editor: true },
      { name: 'quantity', editor: true },
      {
        name: 'taxRate',
        editor: true,
        help: intl
          .get('ssta.invoice.view.help.unifiedMaintenanceZerpPercent')
          .d(`“免税”、“*”号、“0%、“不征税”发票，统一维护0%`),
      },
      { name: 'taxAmount', editor: true },
      { name: 'netPrice', editor: true },
      { name: 'specificationsModel', editor: true },
      { name: 'uom', editor: true },
      { name: 'plateNo', editor: true },
      { name: 'trafficType', editor: true },
      { name: 'trafficDateStart', editor: true },
      { name: 'trafficDateEnd', editor: true },
    ];
  }, []);

  const buttons = useMemo<Buttons[]>(() => {
    return [
      TableButtonType.add,
      [TableButtonType.delete, {
        icon: 'delete_sweep',
        children: intl.get('hzero.common.button.batchDelete').d('批量删除'),
        onClick: handleDelete,
      }],
    ];
  }, [handleDelete]);

  return (
    <Table
      columns={columns}
      buttons={buttons}
      dataSet={invoiceLineDs}
      customizedCode="SSTA.SOURCING_COST_PUR.INV_LINE"
    />
  );
});

export default InvoiceLine;

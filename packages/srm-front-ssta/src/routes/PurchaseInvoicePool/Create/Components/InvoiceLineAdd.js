import React, { useMemo, useCallback } from 'react';
import { Table } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';
import intl from 'utils/intl';

import { getSelectedNegActConfirmMsg } from '../../../../utils/utils';

const Index = (props) => {
  const { invoiceLineAddDS, customizeTable, customizeCode, headerAddDS } = props;

  const handleDelete = useCallback(async () => {
    const res = await invoiceLineAddDS
      .setState('headInfo', headerAddDS?.current?.toData() || {})
      .delete(invoiceLineAddDS.selected, getSelectedNegActConfirmMsg('delete', invoiceLineAddDS));
    if (res?.content?.length) {
      headerAddDS.loadData(res.content);
      invoiceLineAddDS.query(undefined, undefined, true);
    }
  }, [invoiceLineAddDS, headerAddDS]);

  const columns = useMemo(
    () => [
      {
        name: 'lineNum',
        width: 80,
      },
      {
        name: 'itemName',
        editor: true,
        width: 220,
      },
      {
        name: 'netAmount',
        editor: true,
        width: 120,
      },
      {
        name: 'quantity',
        editor: true,
        width: 120,
      },
      {
        name: 'taxRate',
        editor: true,
        help: intl
          .get('ssta.costSheet.model.costSheet.TaxRateTooltip')
          .d(`“免税”、“*”号、“0%、“不征税”发票，统一维护0%`),
        width: 120,
      },
      {
        name: 'taxAmount',
        type: 'number',
        editor: true,
        width: 120,
      },
      {
        name: 'netPrice',
        editor: true,
        width: 120,
      },
      {
        name: 'spec',
        editor: true,
      },
      {
        name: 'uom',
        editor: true,
        width: 120,
      },
      {
        name: 'plateNo',
        editor: true,
        width: 150,
      },
      {
        name: 'trafficType',
        editor: true,
        width: 120,
      },
      {
        name: 'trafficDateStart',
        type: 'string',
        editor: true,
        width: 150,
      },
      {
        name: 'trafficDateEnd',
        editor: true,
        width: 150,
      },
    ],
    []
  );

  return customizeTable(
    { code: customizeCode },
    <Table
      style={{ maxHeight: 510 }}
      dataSet={invoiceLineAddDS}
      columns={columns}
      buttons={[
        'add',
        [
          'delete',
          {
            icon: 'delete_sweep',
            onClick: handleDelete,
            children: intl.get(`hzero.common.button.batchDelete`).d('批量删除'),
          },
        ],
      ]}
    />
  );
};

export default observer(Index);

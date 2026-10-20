import React from 'react';
import { Table, Modal, DataSet } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { precisionRender } from '@/utils/precision';

const getLadderDs = () => {
  return {
    paging: false,
    autoQuery: false,
    selection: false,
    fields: [
      {
        label: intl.get('sagm.common.model.lineNumber').d('行号'),
        name: 'lineNum',
      },
      {
        label: intl.get('sagm.common.model.numberFrom').d('数量从(>=)'),
        name: 'ladderFrom',
        type: 'number',
      },
      {
        label: intl.get('sagm.common.model.numberTo').d('数量至(<)'),
        name: 'ladderTo',
        type: 'number',
      },
      {
        label: intl.get('sagm.common.view.purchasePrice').d('采购价'),
        name: 'purchasePrice',
        type: 'number',
      },
      {
        label: intl.get('sagm.common.model.salePrice').d('销售价'),
        name: 'salePrice',
        type: 'number',
      },
      {
        label: intl.get('sagm.common.model.noTaxPrice').d('未税单价'),
        name: 'unitPrice',
        type: 'number',
      },
      {
        label: intl.get('sagm.common.model.taxPrice').d('含税单价'),
        name: 'taxPrice',
        type: 'number',
      },
    ],
  };
};

export default function openLadder({
  data = [],
  filterFields = [],
  readOnly = true,
  onSave = e => e,
}) {
  const ds = new DataSet(getLadderDs());
  ds.loadData(data);

  const footers = readOnly
    ? { okText: intl.get('hzero.common.button.close').d('关闭'), okCancel: false }
    : {};

  const columns = [
    {
      name: 'lineNum',
      width: 60,
    },
    {
      name: 'ladderFrom',
      minWidth: 100,
      align: 'right',
    },
    {
      name: 'ladderTo',
      minWidth: 100,
      align: 'right',
    },
    {
      name: 'purchasePrice',
      minWidth: 120,
      renderer: precisionRender,
      align: 'right',
    },
    {
      name: 'salePrice',
      minWidth: 120,
      renderer: precisionRender,
      align: 'right',
    },
    {
      name: 'unitPrice',
      minWidth: 120,
      renderer: precisionRender,
      align: 'right',
    },
    {
      name: 'taxPrice',
      minWidth: 120,
      renderer: precisionRender,
      align: 'right',
    },
    {
      name: 'number',
      width: 60,
      header: intl.get('sagm.common.model.lineNumber').d('行号'),
    },
    {
      name: 'quantityFrom',
      minWidth: 100,
      align: 'right',
      header: intl.get('sagm.common.model.numberFrom').d('数量从(>=)'),
    },
    {
      name: 'quantityTo',
      minWidth: 100,
      align: 'right',
      header: intl.get('sagm.common.model.numberTo').d('数量至(<)'),
    },
    {
      name: 'percentage',
      minWidth: 120,
      align: 'right',
      header: intl.get('sagm.common.view.percent').d('百分比'),
    },
    {
      name: 'amount',
      minWidth: 120,
      align: 'right',
      renderer: precisionRender,
      header: intl.get('sagm.common.view.amount').d('金额'),
    },
  ];

  const filterColumns = columns.filter(column => filterFields.includes(column.name));

  Modal.open({
    ...footers,
    drawer: true,
    closable: true,
    style: { width: 742 },
    onOk: async () => {
      if (readOnly) return true;
      const flag = await ds.validate();
      if (flag) {
        const ladders = ds.toData();
        return onSave(ladders);
      } else {
        return false;
      }
    },
    children: (
      <Table
        dataSet={ds}
        columns={filterColumns}
        style={{ maxHeight: 'calc(100vh - 160px)' }}
        customizedCode="SAGM.SALE_AGREEMENT_WORKBENCH.DETAIL.SALE_LINE_LADDER"
      />
    ),
    title: intl.get('sagm.common.view.title.ladderPirce').d('阶梯价'),
  });
}

import React from 'react';
import { Modal, Table, DataSet } from 'choerodon-ui/pro';
import intl from 'utils/intl';

import { precisionRender } from '@/utils/precision';

export function openLadderPrice(data) {
  const ds = new DataSet({
    data,
    paging: false,
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
        label: intl.get('sagm.common.view.price.noTax').d('单价(不含税)'),
        name: 'unitPrice',
        type: 'number',
      },
      {
        label: intl.get('sagm.common.view.price.tax').d('单价(含税)'),
        name: 'taxPrice',
        type: 'number',
      },
    ],
  });
  const columns = [
    {
      name: 'lineNum',
    },
    {
      name: 'ladderFrom',
    },
    {
      name: 'ladderTo',
    },
    {
      name: 'unitPrice',
      renderer: precisionRender,
    },
    {
      name: 'taxPrice',
      renderer: precisionRender,
    },
  ];
  return Modal.open({
    drawer: true,
    okCancel: false,
    style: { width: 742 },
    okText: intl.get('hzero.common.button.close').d('关闭'),
    title: intl.get('sagm.common.model.ladderPrice').d('阶梯价格'),
    children: (
      <Table
        dataSet={ds}
        columns={columns}
        style={{ maxHeight: 'calc(100vh - 160px)' }}
        customizedCode="SAGM.SALE_AGREEMENT_WORKBENCH.DETAIL.STRATEGY_LINE_CHECK_LADDERPRICE"
      />
    ),
  });
}

export function openPriceInfo(data) {
  const ds = new DataSet({
    data,
    paging: false,
    selection: false,
    fields: [
      {
        name: 'ladderEnableFlag',
        label: intl.get('sagm.common.view.priceType').d('价格类型'),
      },
      {
        name: 'nakedPrice',
        type: 'number',
        label: intl.get('sagm.common.view.price.noTax').d('单价(不含税)'),
        renderer: precisionRender,
      },
      {
        name: 'agreementPrice',
        type: 'number',
        label: intl.get('sagm.common.view.price.tax').d('单价(含税)'),
        renderer: precisionRender,
      },
      { name: 'uomName', label: intl.get('sagm.common.model.uom').d('单位') },
    ],
  });
  const columns = [
    {
      name: 'ladderEnableFlag',
      renderer: ({ value }) =>
        value
          ? intl.get('sagm.common.view.ladderPirce').d('阶梯价格')
          : intl.get('sagm.common.view.fixPrice').d('固定价格'),
    },
    {
      name: 'nakedPrice',
      renderer: ({ name, record }) => {
        const isLadder = record.get('ladderEnableFlag');
        const ladderList = record.get('productPoolLadderList');
        if (isLadder) {
          return (
            <a onClick={() => openLadderPrice(ladderList)}>
              {intl.get('sagm.common.model.ladderPrice').d('阶梯价格')}
            </a>
          );
        }
        return precisionRender({ name, record });
      },
    },
    {
      name: 'agreementPrice',
      renderer: ({ name, record }) => {
        const isLadder = record.get('ladderEnableFlag');
        if (!isLadder) {
          return precisionRender({ name, record });
        }
      },
    },
    { name: 'uomName' },
  ];
  return Modal.open({
    drawer: true,
    okCancel: false,
    style: { width: 742 },
    okText: intl.get('hzero.common.button.close').d('关闭'),
    title: intl.get('sagm.common.model.priceInfo').d('价格信息'),
    children: (
      <Table
        dataSet={ds}
        columns={columns}
        style={{ maxHeight: 'calc(100vh - 160px)' }}
        customizedCode="SAGM.SALE_AGREEMENT_WORKBENCH.DETAIL.STRATEGY_LINE_CHECK_PRICE_INFO"
      />
    ),
  });
}

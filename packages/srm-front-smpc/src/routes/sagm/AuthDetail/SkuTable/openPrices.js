import React from 'react';
import { Modal, Table, DataSet } from 'choerodon-ui/pro';
import intl from 'utils/intl';

import { precisionRender } from '@/routes/product/utilsApi/precision';

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
        customizedCode="authority-ladder-price"
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
      { name: 'agreementNumber', label: intl.get('sagm.common.model.agreementNum').d('协议号') },
      {
        name: 'agreementLineNumber',
        label: intl.get('sagm.common.model.lineNumber').d('行号'),
        type: 'number',
      },
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

  const renderAgreementLineOrNumber = ({ name, record }) => {
    return record.get(name);
  };

  const columns = [
    {
      name: 'agreementNumber',
      width: 120,
      renderer: renderAgreementLineOrNumber,
    },
    {
      name: 'agreementLineNumber',
      width: 50,
      renderer: renderAgreementLineOrNumber,
    },
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
    children: <Table dataSet={ds} columns={columns} style={{ maxHeight: 'calc(100vh - 160px)' }} />,
  });
}

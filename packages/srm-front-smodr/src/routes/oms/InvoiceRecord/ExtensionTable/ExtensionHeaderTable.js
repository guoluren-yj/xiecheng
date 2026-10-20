import React from 'react';
import { Table } from 'hzero-ui';

import intl from 'utils/intl';

export default class ExtensionHeaderTable extends React.Component {
  render() {
    const { extensionHeaderData = [], loading, handleOpenModal } = this.props;

    const columns = [
      {
        title: intl.get('smodr.invoiceRecord.model.invoiceNum').d('商城开票编码'),
        width: 200,
        dataIndex: 'invoiceNum',
      },
      {
        title: intl.get('smodr.invoiceRecord.model.invoiceBatch').d('发票号码'),
        width: 150,
        dataIndex: 'invoiceBatch',
      },
      {
        title: intl.get('smodr.invoiceRecord.model.invoiceCode').d('发票代码'),
        width: 200,
        dataIndex: 'invoiceCode',
      },
      {
        title: intl.get('smodr.invoiceRecord.model.invoiceTypeMeaning').d('发票类型'),
        width: 100,
        dataIndex: 'invoiceTypeMeaning',
      },
      {
        title: intl.get('smodr.invoiceRecord.model.invoiceFromMeaning').d('开票类型'),
        width: 100,
        dataIndex: 'invoiceFromMeaning',
      },
      {
        title: intl.get('smodr.invoiceRecord.model.currencyCode').d('币种'),
        width: 100,
        dataIndex: 'currencyName',
      },
      {
        title: intl.get('smodr.invoiceRecord.model.invoiceAmountNew').d('开票金额(含税含运费)'),
        width: 160,
        dataIndex: 'invoiceAmountMeaning',
      },
      {
        title: intl.get('smodr.invoiceRecord.model.invoiceTimeMin').d('开票时间'),
        width: 150,
        dataIndex: 'invoiceTime',
      },
      {
        title: intl.get('smodr.invoiceRecord.model.invoiceTitle').d('发票抬头'),
        width: 150,
        dataIndex: 'invoiceTitle',
      },
      {
        title: intl.get('smodr.invoiceRecord.model.regCode').d('纳税人识别号'),
        width: 120,
        dataIndex: 'regCode',
      },
      {
        title: intl.get('smodr.invoiceRecord.model.depositBank').d('开户行'),
        width: 100,
        dataIndex: 'depositBank',
      },
      {
        title: intl.get('smodr.invoiceRecord.model.bankAccountNum').d('银行账户'),
        width: 150,
        dataIndex: 'bankAccountNum',
      },
      {
        title: intl.get('smodr.invoiceRecord.model.contactAddress').d('联系地址'),
        width: 120,
        dataIndex: 'contactAddress',
      },
      {
        title: intl.get('smodr.invoiceRecord.model.contactNumber').d('联系电话'),
        width: 120,
        dataIndex: 'contactNumber',
      },
      {
        title: intl.get('smodr.invoiceRecord.model.action').d('操作'),
        width: 200,
        render: (_, record) => (
          <span className="action-link">
            <a onClick={() => handleOpenModal(record)}>
              {intl.get('smodr.invoiceRecord.model.history').d('操作记录')}
            </a>
            {/* <a>{intl.get('smodr.invoiceRecord.model.attachment').d('附件信息')}</a> */}
          </span>
        ),
      },
    ];
    return (
      <React.Fragment>
        <div style={{ fontSize: '16px', margin: '18px 0' }}>
          {intl.get('smodr.invoiceRecord.view.invoiceTitle').d('发票头信息')}
        </div>
        <Table
          bordered
          loading={loading}
          rowKey="invoiceId"
          columns={columns}
          dataSource={extensionHeaderData}
          pagination={false}
        />
      </React.Fragment>
    );
  }
}

import React from 'react';
import { Table } from 'hzero-ui';

import intl from 'utils/intl';

export default class ProductInfoTable extends React.Component {
  render() {
    const { loading, extensionHeaderData = {} } = this.props;

    const columns = [
      {
        title: intl.get('smodr.payment.model.cecPaymentCode').d('交易流水号'),
        width: 200,
        dataIndex: 'cecPaymentCode',
      },
      {
        title: intl.get('smodr.payment.model.paymentMethods').d('支付方式'),
        width: 100,
        dataIndex: 'paymentTypeMeaning',
      },
      {
        title: intl.get('smodr.payment.model.currencyCode').d('币种'),
        width: 100,
        dataIndex: 'currencyName',
      },
      {
        title: intl.get('smodr.payment.model.paymentAmount').d('付款金额'),
        width: 100,
        dataIndex: 'paymentAmount',
      },
      {
        title: intl.get('smodr.payment.model.paymentTime').d('支付日期'),
        width: 150,
        dataIndex: 'paymentTime',
      },
      {
        title: intl.get('smodr.payment.model.shouCompanyName').d('收款公司'),
        width: 150,
        dataIndex: 'supplierCompanyName',
      },
    ];
    return (
      <React.Fragment>
        <div style={{ fontSize: '16px', margin: '18px 0' }}>
          {intl.get('smodr.payment.view.paymentHeadInfo').d('支付头信息')}
        </div>
        <Table
          bordered
          loading={loading}
          rowKey="orderEntryId"
          columns={columns}
          dataSource={[extensionHeaderData]}
          pagination={false}
        />
      </React.Fragment>
    );
  }
}

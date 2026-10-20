import React from 'react';
import { Table } from 'hzero-ui';

import intl from 'utils/intl';

export default class FeightInfoTable extends React.Component {
  render() {
    const { freightPayments = [], productPayments = [], loading } = this.props;

    const proColumns = [
      {
        title: intl.get('smodr.payment.model.cecPaymentCode').d('交易流水号'),
        width: 200,
        dataIndex: 'cecPaymentCode',
      },
      {
        title: intl.get('smodr.payment.model.orderCode').d('商城订单编码'),
        width: 200,
        dataIndex: 'orderCode',
      },
      {
        title: intl.get('smodr.payment.model.entryCode').d('订单行号'),
        width: 100,
        dataIndex: 'entryCode',
      },
      {
        title: intl.get('smodr.payment.model.skuCode').d('商品编码'),
        width: 150,
        dataIndex: 'skuCode',
      },
      {
        title: intl.get('smodr.payment.model.skuName').d('商品名称'),
        width: 100,
        dataIndex: 'skuName',
      },
      {
        title: intl.get('smodr.payment.model.skuTypeMeaning').d('商品类型'),
        width: 100,
        dataIndex: 'skuTypeMeaning',
      },
      {
        title: intl.get('smodr.payment.model.quantity').d('数量'),
        width: 100,
        dataIndex: 'quantity',
      },
      {
        title: intl.get('smodr.payment.model.unitPrice').d('单价'),
        width: 100,
        dataIndex: 'unitPrice',
      },
      {
        title: intl.get('smodr.payment.model.taxRateMeaning').d('税率'),
        width: 100,
        dataIndex: 'taxRateMeaning',
      },
      {
        title: intl.get('smodr.payment.model.lineAmount').d('行金额'),
        width: 100,
        dataIndex: 'paymentAmount',
      },
    ];

    const columns = [
      {
        title: intl.get('smodr.payment.model.cecPaymentCode').d('交易流水号'),
        width: 200,
        dataIndex: 'cecPaymentCode',
      },
      {
        title: intl.get('smodr.payment.model.orderCode').d('商城订单编码'),
        width: 200,
        dataIndex: 'orderCode',
      },
      {
        title: intl.get('smodr.payment.model.freightRowNum').d('运费行号'),
        width: 100,
        dataIndex: 'freightRowNum',
      },
      {
        title: intl.get('smodr.payment.model.freightTypeMeaning').d('运费类型'),
        width: 100,
        dataIndex: 'freightTypeMeaning',
      },
      {
        title: intl.get('smodr.payment.model.freightRuleCode').d('运费规则编码'),
        width: 120,
        dataIndex: 'freightRuleCode',
      },
      {
        title: intl.get('smodr.payment.model.quantity').d('数量'),
        width: 100,
        dataIndex: 'quantity',
      },
      {
        title: intl.get('smodr.payment.model.unitPrice').d('单价'),
        width: 100,
        dataIndex: 'unitPrice',
      },
      {
        title: intl.get('smodr.payment.model.taxRateMeaning').d('税率'),
        width: 100,
        dataIndex: 'taxRateMeaning',
      },
      {
        title: intl.get('smodr.payment.model.lineAmount').d('行金额'),
        width: 100,
        dataIndex: 'paymentAmount',
      },
    ];
    return (
      <React.Fragment>
        <div style={{ fontSize: '16px', margin: '18px 0' }}>
          {intl.get('smodr.payment.view.paymentProInfo').d('支付行商品信息')}
        </div>
        <Table
          bordered
          loading={loading}
          rowKey="orderEntryId"
          columns={proColumns}
          dataSource={productPayments}
          pagination={false}
        />
        <div style={{ fontSize: '16px', margin: '18px 0' }}>
          {intl.get('smodr.payment.view.paymentFreInfo').d('支付行运费信息')}
        </div>
        <Table
          bordered
          loading={loading}
          rowKey="orderEntryId"
          columns={columns}
          dataSource={freightPayments}
          pagination={false}
        />
      </React.Fragment>
    );
  }
}

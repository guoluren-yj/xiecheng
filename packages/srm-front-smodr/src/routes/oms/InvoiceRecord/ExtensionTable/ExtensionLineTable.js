import React from 'react';
import { Table } from 'hzero-ui';

import intl from 'utils/intl';

export default class ExtensionLineTable extends React.Component {
  render() {
    const { productInvoices = [], freightInvoices = [], loading } = this.props;

    const productColumns = [
      {
        title: intl.get('smodr.invoiceRecord.model.invoiceNum').d('商城开票编码'),
        width: 200,
        dataIndex: 'invoiceNum',
      },
      {
        title: intl.get('smodr.invoiceRecord.model.invoiceBatch').d('发票号码'),
        width: 100,
        dataIndex: 'invoiceBatch',
      },
      {
        title: intl.get('smodr.invoiceRecord.model.invoiceCode').d('发票代码'),
        width: 100,
        dataIndex: 'invoiceCode',
      },
      {
        title: intl.get('smodr.invoiceRecord.model.invoiceContentCode').d('开票内容'),
        width: 100,
        dataIndex: 'invoiceContentName',
      },
      {
        title: intl.get('smodr.invoiceRecord.model.orderCode').d('商城订单编码'),
        width: 200,
        dataIndex: 'orderCode',
      },
      {
        title: intl.get('smodr.invoiceRecord.model.entryCode').d('订单行号'),
        width: 100,
        dataIndex: 'entryCode',
      },
      {
        title: intl.get('smodr.invoiceRecord.model.skuCode').d('商品编码'),
        width: 150,
        dataIndex: 'skuCode',
      },
      {
        title: intl.get('smodr.invoiceRecord.model.skuName').d('商品名称'),
        width: 100,
        dataIndex: 'skuName',
      },
      {
        title: intl.get('smodr.invoiceRecord.model.skuTypeMeaning').d('商品类型'),
        width: 100,
        dataIndex: 'skuTypeMeaning',
      },
      {
        title: intl.get('smodr.invoiceRecord.model.quantity').d('数量'),
        width: 100,
        dataIndex: 'quantityMeaning',
      },
      {
        title: intl.get('smodr.invoiceRecord.model.entryTaxRateMeaning').d('税率'),
        width: 100,
        dataIndex: 'entryTaxRateMeaning',
      },
      {
        title: intl.get('smodr.invoiceRecord.model.unitPriceTax').d('含税单价'),
        width: 100,
        dataIndex: 'unitPriceMeaning',
      },
      {
        title: intl.get('smodr.invoiceRecord.model.entryAmountTax').d('含税行金额'),
        width: 100,
        dataIndex: 'entryAmountMeaning',
      },
    ];

    const feightColumns = [
      {
        title: intl.get('smodr.invoiceRecord.model.invoiceNum').d('商城开票编码'),
        width: 200,
        dataIndex: 'invoiceNum',
      },
      {
        title: intl.get('smodr.invoiceRecord.model.invoiceBatch').d('发票号码'),
        width: 100,
        dataIndex: 'invoiceBatch',
      },
      {
        title: intl.get('smodr.invoiceRecord.model.invoiceCode').d('发票代码'),
        width: 100,
        dataIndex: 'invoiceCode',
      },
      {
        title: intl.get('smodr.invoiceRecord.model.invoiceContentCode').d('开票内容'),
        width: 100,
        dataIndex: 'invoiceContentName',
      },
      {
        title: intl.get('smodr.invoiceRecord.model.orderCode').d('商城订单编码'),
        width: 200,
        dataIndex: 'orderCode',
      },
      {
        title: intl.get('smodr.invoiceRecord.model.freightRowNum').d('运费行号'),
        width: 100,
        dataIndex: 'freightRowNum',
      },
      {
        title: intl.get('smodr.invoiceRecord.model.freightTypeMeaning').d('运费类型'),
        width: 100,
        dataIndex: 'freightTypeMeaning',
      },
      {
        title: intl.get('smodr.invoiceRecord.model.freightRuleCode').d('运费规则编码'),
        width: 120,
        dataIndex: 'freightRuleCode',
      },
      {
        title: intl.get('smodr.invoiceRecord.model.quantity').d('数量'),
        width: 100,
        dataIndex: 'quantityMeaning',
      },
      {
        title: intl.get('smodr.invoiceRecord.model.entryTaxRateMeaning').d('税率'),
        width: 100,
        dataIndex: 'entryTaxRateMeaning',
      },
      {
        title: intl.get('smodr.invoiceRecord.model.unitPriceTax').d('含税单价'),
        width: 100,
        dataIndex: 'unitPriceMeaning',
      },
      {
        title: intl.get('smodr.invoiceRecord.model.entryAmountTax').d('含税行金额'),
        width: 100,
        dataIndex: 'entryAmountMeaning',
      },
    ];
    return (
      <React.Fragment>
        <div style={{ fontSize: '16px', margin: '18px 0' }}>
          {intl.get('smodr.invoiceRecord.view.invoiceProTitle').d('发票行商品明细信息')}
        </div>
        <Table
          bordered
          loading={loading}
          rowKey="orderEntryId"
          columns={productColumns}
          dataSource={productInvoices}
          pagination={false}
        />
        <div style={{ fontSize: '16px', margin: '18px 0' }}>
          {intl.get('smodr.invoiceRecord.view.invoiceFreTitle').d('发票行运费明细信息')}
        </div>
        <Table
          bordered
          loading={loading}
          rowKey="orderEntryId"
          columns={feightColumns}
          dataSource={freightInvoices}
          pagination={false}
        />
      </React.Fragment>
    );
  }
}

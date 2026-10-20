/*
 * PurchaseRequestItem - 采购Item
 * @date: 2019-12-4
 * @author: gzq <zhiqiang.guo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import React, { PureComponent } from 'react';
import { Table } from 'hzero-ui';
import intl from 'utils/intl';
import { isNumber, sum } from 'lodash';
import { yesOrNoRender, dateRender } from 'utils/renderer';

import { thousandBitSeparator } from '@/routes/utils';

const promptCode = 'sfin.paymentRecord';
/**
 * PurchaseRequestHeader - 采购申请头页面
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
export default class Result extends PureComponent {
  componentDidMount() {
    const { fetchList } = this.props;
    fetchList();
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const { content = {}, fetchListLoading, fetchList } = this.props;
    const { list = [], pagination = {} } = content;
    const columns = [
      {
        title: intl
          .get(`${promptCode}.view.message.model.paymentRecord.paymentInvoiceNum`)
          .d('付款行号'),
        dataIndex: 'paymentInvoiceNum',
        width: 100,
      },
      {
        title: intl.get(`sfin.invoiceBill.model.invoiceBill.erpInvoiceNum`).d('ERP发票号'),
        dataIndex: 'erpInvoiceNum',
        width: 120,
      },
      {
        title: intl.get(`sfin.payment.invoiceNum`).d('SRM发票号'),
        dataIndex: 'srmInvoiceNum',
        width: 150,
      },
      {
        title: intl.get(`sfin.payment.reversedFlagMeaning`).d('冲销标识'),
        dataIndex: 'reversedFlagMeaning',
        width: 150,
        render: yesOrNoRender,
      },
      {
        title: intl.get(`sfin.invoiceBill.model.invoiceBill.invoiceAmount`).d('发票总额'),
        dataIndex: 'invoiceTotalAmount',
        width: 120,
        render: (text, record) => thousandBitSeparator(text, record.amountPrecision),
      },
      {
        title: intl.get(`sfin.payment.common.paymentAmount`).d('付款金额'),
        dataIndex: 'paymentAmount',
        width: 120,
        render: (text, record) => thousandBitSeparator(text, record.amountPrecision),
      },
      {
        title: intl
          .get(`${promptCode}.view.message.model.paymentRecord.totalPaymentAmount`)
          .d('累计付款金额'),
        dataIndex: 'totalPaymentAmount',
        width: 120,
        render: (text, record) => thousandBitSeparator(text, record.amountPrecision),
      },
      {
        title: intl.get(`sfin.payment.taxInvoiceDateIssued`).d('开票日期'),
        dataIndex: 'billingDate',
        width: 120,
        render: dateRender,
      },
    ];
    const scrollX = sum(columns.map((item) => (isNumber(item.width) ? item.width : 0))) + 200;
    const tableProps = {
      scroll: { x: scrollX },
      dataSource: list,
      columns,
      bordered: true,
      pagination,
      loading: fetchListLoading,
      onChange: (page) => fetchList(page),
    };
    return <Table {...tableProps} />;
  }
}

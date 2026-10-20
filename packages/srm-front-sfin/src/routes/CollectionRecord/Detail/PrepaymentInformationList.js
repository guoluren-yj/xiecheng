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
        title: intl.get(`sfin.payableInvoice.model.payableInvoice.lineNum`).d('行号'),
        dataIndex: 'advancePaymentLineNum',
        width: 80,
      },
      {
        title: intl
          .get(`${promptCode}.view.message.model.paymentRecord.advancePaymentNum`)
          .d('预付款单号'),
        dataIndex: 'advancePaymentNum',
        width: 120,
      },
      {
        title: intl
          .get(`${promptCode}.view.message.model.paymentRecord.advanceTotalAmount`)
          .d('单据金额'),
        dataIndex: 'advanceTotalAmount',
        width: 150,
        render: (text, record) => thousandBitSeparator(text, record.amountPrecision),
      },
      {
        title: intl
          .get(`${promptCode}.view.message.model.paymentRecord.verifyTotalAmount`)
          .d('本次核销金额'),
        dataIndex: 'verifyTotalAmount',
        width: 150,
        render: (text, record) => thousandBitSeparator(text, record.amountPrecision),
      },
      {
        title: intl
          .get(`${promptCode}.view.message.model.paymentRecord.verifyBalance`)
          .d('本次核销后余额'),
        dataIndex: 'verifyBalance',
        width: 150,
        render: (text, record) => thousandBitSeparator(text, record.amountPrecision),
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

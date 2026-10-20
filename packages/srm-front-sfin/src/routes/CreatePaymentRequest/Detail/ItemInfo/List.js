/**
 * LineCreation - 扣款单列表
 * @date: 2019-02-20
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import React, { PureComponent } from 'react';
import { Table } from 'hzero-ui';
// import { sum } from 'lodash';
import intl from 'utils/intl';
import { tableScrollWidth } from 'utils/utils';
import { dateTimeRender, dateRender } from 'utils/renderer';
import { thousandBitSeparator } from '@/routes/utils';

const promptCode = 'sfin.payment';

export default class List extends PureComponent {
  defaultTableRowKey = 'poLineLocationId';

  render() {
    const { dataSource = [], rowKey, fetchDetailList, pagination, ...others } = this.props;
    const tableProps = {
      // onChange: page => fetchDetailList(page),
      dataSource,
      pagination,
      columns: [
        {
          title: intl.get(`${promptCode}.invoiceNum`).d('SRM发票号'),
          dataIndex: 'invoiceNum',
          // width: 170,
        },
        {
          title: intl.get(`${promptCode}.taxIncludedAmount`).d('发票总额'),
          dataIndex: 'taxIncludedAmount',
          width: 110,
          render: (text, record) => thousandBitSeparator(text, record.amountPrecision),
        },
        {
          title: intl.get(`${promptCode}.taxAmount`).d('发票税额'),
          dataIndex: 'taxAmount',
          width: 110,
          render: (text, record) => thousandBitSeparator(text, record.amountPrecision),
        },
        {
          title: intl.get(`${promptCode}.laveAmount`).d('剩余可付金额'),
          dataIndex: 'laveAmount',
          width: 130,
          render: (text, record) => thousandBitSeparator(text, record.amountPrecision),
        },
        {
          title: intl.get(`${promptCode}.paymentAmounted`).d('已付款金额'),
          dataIndex: 'paymentAmounted',
          width: 120,
          render: (text, record) => thousandBitSeparator(text, record.amountPrecision),
        },
        {
          title: intl.get(`${promptCode}.cancelVerificationAmount`).d('已核销金额'),
          dataIndex: 'cancelVerificationAmount',
          width: 120,
          render: (text, record) => thousandBitSeparator(text, record.amountPrecision),
        },
        {
          title: intl.get(`${promptCode}.validateStatusCodeMeaning`).d('查验状态'),
          dataIndex: 'validateStatusCodeMeaning',
          width: 130,
        },
        {
          title: intl.get(`${promptCode}.taxInvoiceDateIssued`).d('开票日期'),
          dataIndex: 'taxInvoiceDateIssued',
          width: 130,
          render: dateRender,
        },
        {
          title: intl.get(`${promptCode}.headerCreationDate`).d('创建日期'),
          dataIndex: 'headerCreationDate',
          width: 130,
          render: dateTimeRender,
        },
      ],
      rowKey: 'invoiceHeaderId',
      bordered: true,
      ...others,
    };
    tableProps.scroll = { x: tableScrollWidth(tableProps.columns) };
    return <Table {...tableProps} onChange={(page) => fetchDetailList(page)} />;
  }
}

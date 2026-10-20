/**
 * LineCreation - 预付款
 * @date: 2020-03-18
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import React, { PureComponent } from 'react';
import { Table } from 'hzero-ui';
// import { sum } from 'lodash';
import intl from 'utils/intl';
import { tableScrollWidth } from 'utils/utils';
import { dateTimeRender, dateRender } from 'utils/renderer';
import { thousandBitSeparator } from '@/routes/utils';

const promptCode = 'sinv.advancePaymentRecord.model.common';

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
          title: intl.get(`${promptCode}.displayNum`).d('采购协议编号'),
          dataIndex: 'displayNum',
        },
        {
          title: intl.get(`${promptCode}.pcName`).d('采购协议名称'),
          dataIndex: 'pcName',
          width: 110,
        },
        {
          title: intl.get(`${promptCode}.taxIncludedAmount`).d('协议总额'),
          dataIndex: 'taxIncludedAmount',
          width: 110,
          render: (text, record) => thousandBitSeparator(text, record.amountPrecision),
        },
        {
          title: intl.get(`${promptCode}.amount`).d('不含税金额'),
          dataIndex: 'amount',
          width: 110,
          render: (text, record) => thousandBitSeparator(text, record.amountPrecision),
        },
        {
          title: intl.get(`${promptCode}.paymentAmount`).d('剩余可付金额'),
          dataIndex: 'paymentAmount',
          width: 130,
          render: (text, record) => thousandBitSeparator(text, record.amountPrecision),

          // fixed: 'left',
        },
        {
          title: intl.get(`${promptCode}.currencyCode`).d('币种'),
          dataIndex: 'currencyCode',
          width: 170,
        },
        {
          title: intl.get(`${promptCode}.pcTypeName`).d('协议类型'),
          dataIndex: 'pcTypeName',
          width: 120,
        },
        {
          title: intl.get(`${promptCode}.startDateActive`).d('协议起始日期'),
          dataIndex: 'startDateActive',
          width: 120,
          render: dateRender,
        },
        {
          title: intl.get(`${promptCode}.endDateActive`).d('协议终止日期'),
          dataIndex: 'endDateActive',
          width: 130,
          render: dateRender,
        },
        {
          title: intl.get(`${promptCode}.realName`).d('创建人'),
          dataIndex: 'realName',
          width: 130,
        },
        {
          title: intl.get(`${promptCode}.creationDate`).d('创建时间'), // 字段不一定对
          dataIndex: 'creationDate',
          width: 150,
          render: dateTimeRender,
        },
        {
          title: intl.get(`${promptCode}.confirmedDate`).d('生效时间'),
          dataIndex: 'confirmedDate',
          width: 150,
          render: dateTimeRender,
        },
      ],
      rowKey: 'headerId',
      bordered: true,
      ...others,
    };
    tableProps.scroll = { x: tableScrollWidth(tableProps.columns) };
    return <Table {...tableProps} onChange={(page) => fetchDetailList(page)} />;
  }
}

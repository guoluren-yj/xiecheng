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
import { dateTimeRender } from 'utils/renderer';
import intl from 'utils/intl';
import { tableScrollWidth } from 'utils/utils';
import { thousandBitSeparator } from '@/routes/utils';

const promptCode = 'sfin.advancePaymentRecord.model.common';

export default class List extends PureComponent {
  defaultTableRowKey = 'poLineLocationId';

  render() {
    const {
      dataSource = [],
      isOrderLine,
      rowKey,
      fetchDetailList,
      pagination,
      ...others
    } = this.props;
    const tableProps = {
      // onChange: page => fetchDetailList(page),
      dataSource,
      pagination,
      columns: [
        {
          title: intl.get(`${promptCode}.displayNumOrder`).d('采购订单号'),
          dataIndex: 'displayNum',
        },
        {
          title: intl.get(`${promptCode}.taxIncludedAmount1`).d('含税金额'),
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
        // {
        //   title: intl.get(`${promptCode}.paymentAdvanceAmount`).d('本次付款金额'),
        //   dataIndex: 'paymentAdvanceAmount',
        //   width: 170,
        // },
        {
          title: intl.get(`${promptCode}.orderTypeName`).d('采购订单类型'),
          dataIndex: 'orderTypeName',
          width: 120,
        },
        {
          title: intl.get(`${promptCode}.ouName`).d('业务实体'),
          dataIndex: 'ouName',
          width: 120,
        },
        {
          title: intl.get(`${promptCode}.organizationName`).d('采购组织'),
          dataIndex: 'organizationName',
          width: 130,
        },
        {
          title: intl.get(`${promptCode}.purchaseAgentName`).d('采购员'),
          dataIndex: 'purchaseAgentName',
          width: 130,
        },
        {
          title: intl.get(`${promptCode}.creationDate`).d('创建时间'),
          dataIndex: 'creationDate',
          width: 150,
          render: dateTimeRender,
        },
        {
          title: intl.get(`${promptCode}.releasedDate`).d('发布时间'),
          dataIndex: 'releasedDate',
          width: 150,
          render: dateTimeRender,
        },
      ],
      rowKey: isOrderLine === 1 ? 'poLineId' : 'headerId',
      bordered: true,
      ...others,
    };
    if (isOrderLine === 1) {
      tableProps.columns.splice(
        1,
        0,
        {
          title: intl.get(`${promptCode}.displayLineNum`).d('订单行号'),
          dataIndex: 'displayLineNum',
        },
        {
          title: intl.get(`${promptCode}.itemCode`).d('物料编码'),
          dataIndex: 'itemCode',
        },
        {
          title: intl.get(`${promptCode}.itemName`).d('物料名称'),
          dataIndex: 'itemName',
        }
      );
    }

    tableProps.scroll = { x: tableScrollWidth(tableProps.columns) };
    return <Table {...tableProps} onChange={(page) => fetchDetailList(page)} />;
  }
}

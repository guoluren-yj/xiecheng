/**
 * LineCreation - 扣款单列表
 * @date: 2019-02-20
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import React, { PureComponent } from 'react';
import { Table } from 'hzero-ui';
import { sum } from 'lodash';
import intl from 'utils/intl';
import { thousandBitSeparator } from '@/routes/utils';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import Styles from '@/routes/common.less';

const promptCode = 'sfin.supplierChargeEntry';

@withCustomize({
  unitCode: ['SFIN.INVOICE_CREATE_LIST.TOTAL_ADD_LIST'],
})
export default class List extends PureComponent {
  defaultTableRowKey = 'poLineLocationId';

  render() {
    const {
      dataSource = [],
      rowKey,
      fetchDetailList,
      pagination,
      customizeTable,
      ...others
    } = this.props;
    const tableProps = {
      dataSource,
      pagination,
      columns: [
        {
          title: intl.get(`${promptCode}.model.deductionsNum`).d('扣款单号'),
          dataIndex: 'deductionsNum',
          width: 150,
        },
        {
          title: intl.get(`${promptCode}.accountSubjectNum`).d('总账科目编码'),
          dataIndex: 'accountSubjectNum',
          width: 130,
        },
        {
          title: intl.get(`${promptCode}.accountSubjectName`).d('总账科目名称'),
          dataIndex: 'accountSubjectName',
          width: 150,
        },
        {
          title: intl.get(`${promptCode}.model.debitCreditCodeMeaning`).d('借贷方'),
          dataIndex: 'debitCreditCodeMeaning',
          width: 100,
        },
        {
          title: intl.get(`${promptCode}.model.amount`).d('不含税扣款额'),
          dataIndex: 'amount',
          width: 120,
          render: (text, record) => thousandBitSeparator(text, record.amountPrecision),
        },
        {
          title: intl.get(`${promptCode}.model.taxRate`).d('税率'),
          dataIndex: 'taxRate',
          width: 100,
        },
        {
          title: intl.get(`${promptCode}.model.taxIncludedAmount`).d('含税扣款额'),
          dataIndex: 'taxIncludedAmount',
          width: 100,
          render: (text, record) => thousandBitSeparator(text, record.amountPrecision),
        },
        {
          title: intl.get(`${promptCode}.model.remainingDeductionAmount`).d('剩余可扣款额'),
          dataIndex: 'remainingDeductionAmount',
          width: 120,
          render: (text, record) => thousandBitSeparator(text, record.amountPrecision),
        },
        {
          title: intl.get(`${promptCode}.model.relationAmount`).d('已扣款额'),
          dataIndex: 'relationAmount',
          width: 100,
          render: (text, record) => thousandBitSeparator(text, record.amountPrecision),
        },
      ],
      rowKey: 'supplierDeductionsId',
      bordered: true,
      ...others,
    };
    tableProps.scroll = { x: sum(tableProps.columns.map((n) => n.width)) };
    return customizeTable(
      { code: 'SFIN.INVOICE_CREATE_LIST.TOTAL_ADD_LIST' },
      <Table
        {...tableProps}
        onChange={(page) => fetchDetailList(page)}
        className={Styles['modal-item-info-Table']}
      />
    );
  }
}

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
        dataIndex: 'deductionLineNum',
        width: 80,
      },
      {
        title: intl
          .get(`${promptCode}.view.message.model.paymentRecord.erpDeductionNum`)
          .d('ERP扣款单号'),
        dataIndex: 'erpDeductionNum',
        width: 120,
      },
      {
        title: intl.get(`sqam.common.model.8d.srmDeductionNum`).d('SRM扣款单号'),
        dataIndex: 'srmDeductionNum',
        width: 150,
      },
      {
        title: intl
          .get(`${promptCode}.view.message.model.paymentRecord.deductionTotalAmount`)
          .d('单据总额'),
        dataIndex: 'deductionTotalAmount',
        width: 120,
        render: (text, record) => thousandBitSeparator(text, record.amountPrecision),
      },
      {
        title: intl
          .get(`${promptCode}.view.message.model.paymentRecord.deductionAmount`)
          .d('扣款金额'),
        dataIndex: 'deductionAmount',
        width: 120,
        render: (text, record) => thousandBitSeparator(text, record.amountPrecision),
      },
      {
        title: intl
          .get(`${promptCode}.view.message.model.paymentRecord.deductionRemark`)
          .d('扣款说明'),
        dataIndex: 'deductionRemark',
        width: 120,
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

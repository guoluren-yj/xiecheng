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
        dataIndex: 'paymentTypeLineNum',
        width: 80,
      },
      {
        title: intl.get(`sfin.payment.common.sourceCode`).d('付款方式'),
        dataIndex: 'paymentTypeName',
        width: 120,
      },
      {
        title: intl.get(`sfin.payment.common.paymentAmount`).d('付款金额'),
        dataIndex: 'paymentAmount',
        width: 150,
      },
    ];
    const scrollX = sum(columns.map(item => (isNumber(item.width) ? item.width : 0))) + 200;
    const tableProps = {
      scroll: { x: scrollX },
      dataSource: list,
      columns,
      bordered: true,
      pagination,
      loading: fetchListLoading,
      onChange: page => fetchList(page),
    };
    return <Table {...tableProps} />;
  }
}

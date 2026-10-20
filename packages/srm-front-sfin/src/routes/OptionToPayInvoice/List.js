/**
 * index -创建一般付款申请
 * @date: 2019-12-11
 * @author zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import React from 'react';
// import { Form, Input } from 'hzero-ui';
import EditTable from 'components/EditTable';

import { sum } from 'lodash';
import intl from 'utils/intl';
import { dateTimeRender, dateRender } from 'utils/renderer';

const commonPrompt = 'sfin.payment';

export default class List extends React.Component {
  render() {
    const {
      loading,
      dataSource,
      onSearch,
      pagination,
      selectedRows,
      onSelectedRowChange,
    } = this.props;
    const selectedRowKeys = selectedRows.map((item) => item.invoiceHeaderId);
    const rowSelection = {
      selectedRowKeys,
      onChange: onSelectedRowChange,
    };
    const tableProps = {
      columns: [
        {
          title: intl.get(`${commonPrompt}.invoiceNum`).d('SRM发票号'),
          dataIndex: 'invoiceNum',
          width: 130,
        },
        {
          title: intl.get(`${commonPrompt}.taxInvoiceNum`).d('税务发票代码'),
          dataIndex: 'taxInvoiceNum',
          width: 140,
        },
        {
          title: intl.get(`entity.supplier.code`).d('供应商编码'),
          dataIndex: 'supplierNum',
          width: 130,
        },
        {
          title: intl.get(`${commonPrompt}.supplierCompanyName`).d('供应商'),
          dataIndex: 'supplierCompanyName',
          width: 140,
        },
        {
          title: intl.get(`entity.company.tag`).d('公司'),
          dataIndex: 'companyName',
          width: 145,
        },
        {
          title: intl.get(`sfin.payment.invoiceTaxAmount`).d('发票税额'),
          dataIndex: 'taxAmount',
          width: 80,
        },
        {
          title: intl.get(`sfin.payment.taxIncludedAmout`).d('发票总额'),
          dataIndex: 'taxIncludedAmount',
          width: 100,
        },
        {
          title: intl.get(`sfin.payment.laveAmount`).d('剩余可付金额'),
          dataIndex: 'laveAmount',
          width: 80,
        },
        {
          title: intl.get(`sfin.payment.amountPaid`).d('已付款金额'),
          dataIndex: 'canAmount',
          width: 80,
        },
        {
          title: intl.get(`sfin.payment.canAmounts`).d('已销核金额'),
          dataIndex: 'canAmount',
          width: 80,
        },
        {
          title: intl.get(`sfin.payment.currencyCode`).d('币种'),
          dataIndex: 'currencyCode',
          width: 100,
        },
        {
          title: intl.get(`sfin.payment.validateStatusCode`).d('查验状态'),
          dataIndex: 'validateStatusCodeMeaning',
          width: 120,
        },
        {
          title: intl.get(`sfin.payment.taxInvoiceDateIssued`).d('开票日期'),
          dataIndex: 'taxInvoiceDateIssued',
          width: 130,
          render: dateRender,
        },
        {
          title: intl.get(`sfin.payment.creationDate`).d('创建日期'),
          dataIndex: 'creationDate',
          width: 130,
          render: dateTimeRender,
        },
      ],
      loading,
      dataSource,
      rowSelection,
      bordered: true,
      rowKey: 'invoiceHeaderId',
      onChange: (page) => onSearch(page),
      pagination,
    };
    tableProps.scroll = { x: sum(tableProps.columns.map((n) => n.width)) + 300 };

    return (
      <React.Fragment>
        <EditTable {...tableProps} />
      </React.Fragment>
    );
  }
}

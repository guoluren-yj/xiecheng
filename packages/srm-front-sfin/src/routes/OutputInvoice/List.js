import React, { Component, Fragment } from 'react';
import { Table } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
// import { numberRender } from 'utils/renderer';
import { dateRender } from 'utils/renderer';
import { thousandBitSeparator } from '@/routes/utils';

const promptCode = 'sfin.invoiceBill';
const inputInvoiceCode = 'sfin.inputInvoice';
export default class List extends Component {
  @Bind()
  scrollWidth(columns, fixWidth) {
    const total = columns.reduce((prev, current) => prev + (current.width ? current.width : 0), 0);
    return total + fixWidth + 1;
  }

  @Bind()
  handleInvoiceDetail(record) {
    const { onInvoiceDetail } = this.props;
    onInvoiceDetail(record);
  }

  @Bind()
  toDerect(record) {
    const { onToDetail } = this.props;
    onToDetail(record);
  }

  render() {
    const columns = [
      {
        title: intl.get(`${promptCode}.model.invoiceBill.taxInvoiceCode`).d('发票代码'),
        width: 150,
        dataIndex: 'invoiceCode',
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.invoiceNumber`).d('发票号码'),
        width: 150,
        dataIndex: 'invoiceNumber',
      },
      {
        title: intl.get(`${inputInvoiceCode}.model.billingDate`).d('开票日期'),
        width: 150,
        dataIndex: 'billingDate',
        render: dateRender,
      },
      {
        title: intl.get(`${inputInvoiceCode}.model.netAmount`).d('不含税金额'),
        width: 150,
        align: 'right',
        dataIndex: 'totalAmount',
        render: (text, record) => thousandBitSeparator(text, record.amountPrecision),
      },
      {
        title: intl.get(`${inputInvoiceCode}.model.checkCode`).d('校验码后六位'),
        width: 150,
        dataIndex: 'checkCode',
      },
      {
        title: intl.get(`${inputInvoiceCode}.model.taxInvoiceStatus`).d('状态'),
        width: 100,
        dataIndex: 'issueStatusCodeMeaning',
      },
      {
        title: intl.get(`${inputInvoiceCode}.model.supplierCompanyName`).d('销售方'),
        width: 150,
        dataIndex: 'supplierCompanyName',
      },
      {
        title: intl.get(`${inputInvoiceCode}.model.purchaser`).d('购买方'),
        width: 150,
        dataIndex: 'companyName',
      },
      {
        title: intl.get(`${inputInvoiceCode}.model.srmInvoiceNum`).d('SRM发票号'),
        width: 150,
        dataIndex: 'srmInvoiceNum',
        render: (value, record) => (
          <a
            onClick={() => {
              this.toDerect(record);
            }}
          >
            {value}
          </a>
        ),
      },
      {
        title: intl.get(`${inputInvoiceCode}.model.taxType`).d('发票类型'),
        width: 150,
        dataIndex: 'invoiceTypeCodeMeaning',
      },
      {
        title: intl.get(`${inputInvoiceCode}.model.ocrFileUrl`).d('发票信息'),
        width: 150,
        dataIndex: 'taxInvoiceLineId',
        render: (val, record) => (
          <a color="#29BECE" onClick={() => this.handleInvoiceDetail(record)}>
            {intl.get(`${inputInvoiceCode}.model.viewInvoice`).d('发票查看')}
          </a>
        ),
      },
    ];
    const scrollWidth = this.scrollWidth(columns, 300);
    const { pagination = {}, dataSource = [], loading, onChange } = this.props;
    const tableProps = {
      onChange,
      rowKey: 'taxInvoiceLineId',
      columns,
      loading,
      rowSelection: null,
      pagination,
      dataSource,
      bordered: true,
      scroll: {
        x: scrollWidth,
      },
    };
    return (
      <Fragment>
        <Table {...tableProps} />
      </Fragment>
    );
  }
}

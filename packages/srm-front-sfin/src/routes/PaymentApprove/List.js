import React, { Component, Fragment } from 'react';
import { Table } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { dateTimeRender, dateRender } from 'utils/renderer';
import { thousandBitSeparator } from '@/routes/utils';

export default class List extends Component {
  @Bind()
  scrollWidth(columns, fixWidth) {
    const total = columns.reduce((prev, current) => prev + (current.width ? current.width : 0), 0);
    return total + fixWidth + 1;
  }

  @Bind()
  handleInvoiceDetail(record) {
    const { openActionHistory } = this.props;
    openActionHistory(record);
  }

  @Bind()
  toDetail(record) {
    const { onToDetail } = this.props;
    onToDetail(record);
  }

  render() {
    const columns = [
      {
        title: intl.get(`sfin.payment.common.payApproveNo`).d('付款申请单号'),
        width: 150,
        dataIndex: 'paymentNum',
        render: (val, record) => <a onClick={() => this.toDetail(record)}>{val}</a>,
      },
      {
        title: intl.get(`sfin.payment.common.type`).d('类型'),
        width: 80,
        dataIndex: 'paymentTypeCodeMeaning',
      },
      {
        title: intl.get(`sfin.payment.common.company`).d('公司'),
        width: 120,
        dataIndex: 'companyName',
      },
      {
        title: intl.get(`sfin.common.model.common.ouName`).d('业务实体'),
        dataIndex: 'ouName',
        width: 120,
      },
      {
        title: intl.get(`entity.supplier.code`).d('供应商编码'),
        width: 120,
        dataIndex: 'supplierCompanyNum',
      },
      {
        title: intl.get(`entity.supplier.name`).d('供应商名称'),
        width: 120,
        dataIndex: 'supplierCompanyName',
      },
      {
        title: intl.get(`sfin.payment.invoiceBodyName`).d('开票主体'),
        dataIndex: 'invoiceTitle',
        width: 100,
      },
      {
        title: intl.get(`sfin.payment.common.payMoney`).d('付款金额'),
        width: 90,
        dataIndex: 'paymentAmount',
        render: (text, record) => thousandBitSeparator(text, record.amountPrecision),
      },
      {
        title: intl.get(`sfin.payment.common.currency`).d('币种'),
        width: 100,
        dataIndex: 'currencyCode',
      },
      {
        title: intl.get(`sfin.payment.common.payDate`).d('付款日期'),
        width: 100,
        dataIndex: 'paymentDate',
        render: dateRender,
      },
      {
        title: intl.get(`sfin.payment.common.payer`).d('申请人'),
        width: 80,
        dataIndex: 'createdByName',
      },
      {
        title: intl.get(`sfin.payment.common.applyDate`).d('申请日期'),
        width: 100,
        dataIndex: 'creationDate',
        render: dateTimeRender,
      },
      {
        title: intl.get(`sfin.payment.common.remark`).d('备注'),
        dataIndex: 'remark',
        width: 80,
      },
      {
        title: intl.get(`hzero.common.button.operating`).d('操作记录'),
        width: 100,
        dataIndex: 'taxInvoiceLineId',
        render: (val, record) => (
          <a color="#29BECE" onClick={() => this.handleInvoiceDetail(record)}>
            {intl.get(`hzero.common.button.operating`).d('操作记录')}
          </a>
        ),
      },
    ];
    const scrollWidth = this.scrollWidth(columns, 300);
    const { pagination = {}, dataSource = [], loading, onChange, rowSelection } = this.props;
    const tableProps = {
      onChange,
      rowKey: 'paymentHeaderId',
      columns,
      loading,
      rowSelection,
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

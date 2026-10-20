import React, { Component, Fragment } from 'react';
import { Table } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { dateTimeRender, dateRender } from 'utils/renderer';
// import { numberRender ,dateRender} from 'utils/renderer';
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
        title: intl.get(`sfin.payment.common.payStatusMeaning`).d('申请单状态'),
        width: 100,
        dataIndex: 'paymentStatusMeaning',
      },
      {
        title: intl.get(`sfin.payment.common.receivedpayNo`).d('收款申请单号'),
        width: 150,
        dataIndex: 'paymentNum',
        render: (val, record) => <a onClick={() => this.toDetail(record)}>{val}</a>,
      },
      {
        title: intl.get(`sfin.payment.common.type`).d('类型'),
        width: 120,
        dataIndex: 'paymentTypeCodeMeaning',
      },
      {
        title: intl.get(`sfin.payment.common.displayPoNum`).d('关联单据单号'),
        width: 160,
        dataIndex: 'displayPoNum',
      },
      {
        title: intl
          .get(`sfin.paymentRecord.view.message.model.paymentRecord.erpReceivedPayNum`)
          .d('ERP收款单号'),
        width: 120,
        dataIndex: 'erpPaymentNum',
      },
      {
        title: intl.get(`sfin.invoiceBill.model.invoiceBill.syncStatus`).d('导入状态'),
        width: 120,
        dataIndex: 'erpImportCodeMeaning',
      },
      {
        title: intl.get(`sfin.payment.common.clintConpany`).d('客户公司'),
        width: 120,
        dataIndex: 'companyName',
      },
      {
        title: intl.get(`sfin.common.model.common.ouName`).d('业务实体'),
        dataIndex: 'ouName',
        width: 120,
      },
      {
        title: intl.get(`sfin.common.model.common.companyNum`).d('公司编码'),
        width: 120,
        dataIndex: 'supplierCompanyNum',
      },
      {
        title: intl.get(`sfin.common.model.common.companyName`).d('公司名称'),
        width: 120,
        dataIndex: 'supplierCompanyName',
      },
      {
        title: intl.get(`sfin.payment.invoiceBodyName`).d('开票主体'),
        dataIndex: 'invoiceTitle',
        width: 100,
      },
      {
        title: intl.get(`sfin.payment.common.receivedPay`).d('收款金额'),
        width: 80,
        dataIndex: 'paymentAmount',
        render: (text, record) => thousandBitSeparator(text, record.amountPrecision),
      },
      {
        title: intl.get(`sfin.payment.common.currency`).d('币种'),
        width: 80,
        dataIndex: 'currencyCode',
      },
      {
        title: intl.get(`sfin.payment.common.receivedPayDate`).d('收款日期'),
        width: 120,
        dataIndex: 'paymentDate',
        render: dateRender,
      },
      {
        title: intl.get(`sfin.paymentQuery.view.model.receivedPaid`).d('已收金额'),
        width: 120,
        dataIndex: 'amountPaid',
        render: (text, record) =>
          Number(thousandBitSeparator(text, record.amountPrecision))
            ? thousandBitSeparator(text, record.amountPrecision)
            : '',
      },
      {
        title: intl.get(`sfin.paymentQuery.view.model.unReceivedAmount`).d('未收金额'),
        width: 120,
        dataIndex: 'unpaidAmount',
        render: (text, record) =>
          Number(thousandBitSeparator(text, record.amountPrecision))
            ? thousandBitSeparator(text, record.amountPrecision)
            : '',
      },
      {
        title: intl.get(`sfin.payment.common.payer`).d('申请人'),
        width: 100,
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

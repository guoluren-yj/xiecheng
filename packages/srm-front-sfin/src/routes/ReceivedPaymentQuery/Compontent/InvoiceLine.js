import React, { Component, Fragment } from 'react';
import { Bind } from 'lodash-decorators';
import { dateTimeRender, dateRender } from 'utils/renderer';
import intl from 'utils/intl';
import { Table } from 'hzero-ui';
import formatterCollections from 'utils/intl/formatterCollections';

@formatterCollections({
  code: [
    'sfin.payment',
    'sfin.advancePaymentRecord',
    'sfin.paymentRecord',
    'entity.supplier',
    'sfin.invoiceBill',
    'sfin.paymentQuery',
  ],
})
export default class InvoiceLine extends Component {
  @Bind()
  operation(record) {
    const { onToDetail } = this.props;
    onToDetail(record);
  }

  @Bind()
  getColumns() {
    //   SRM发票号|行号 含税金额 本次收款金额 币种
    const columns = [
      {
        title: intl.get(`sfin.payment.invoiceNum`).d('SRM发票号'),
        dataIndex: 'invoiceNum',
        // width: 170,
        // fixed: 'left',
      },
      {
        title: intl.get(`sfin.payment.invoiceAmount`).d('发票总额'),
        dataIndex: 'taxIncludedAmount',
        width: 110,
        // fixed: 'left',
      },
      {
        title: intl.get(`sfin.payment.invoiceTaxAmount`).d('发票税额'),
        dataIndex: 'taxAmount',
        width: 110,
        // fixed: 'left',
      },
      // {
      //   title: intl.get(`sfin.payment.laveAmount`).d('剩余可付金额'),
      //   dataIndex: 'laveAmount',
      //   width: 130,
      //   // fixed: 'left',
      // },
      {
        title: intl.get(`sfin.payment.receivedAmount`).d('本次收款金额'),
        dataIndex: 'paymentAmount',
        width: 140,
      },
      {
        title: intl.get(`sfin.payment.receivedAmounted`).d('已收款金额'),
        dataIndex: 'paymentAmounted',
        width: 120,
      },
      {
        title: intl.get(`sfin.payment.cancelVerificationAmount`).d('已核销金额'),
        dataIndex: 'cancelVerificationAmount',
        width: 120,
      },
      {
        title: intl.get(`sfin.payment.validateStatusCodeMeaning`).d('查验状态'),
        dataIndex: 'validateStatusCodeMeaning',
        width: 130,
      },
      {
        title: intl.get(`sfin.payment.taxInvoiceDateIssued`).d('开票日期'),
        dataIndex: 'taxInvoiceDateIssued',
        width: 150,
        render: dateRender,
      },
      {
        title: intl.get(`sfin.payment.headerCreationDate`).d('创建日期'),
        dataIndex: 'headerCreationDate',
        width: 150,
        render: dateTimeRender,
      },
      {
        title: intl.get(`sfin.payment.caozuo`).d('操作'),
        dataIndex: 'headerCreationDate',
        width: 150,
        render: (_, record) => (
          <a onClick={() => this.operation(record)}>
            {intl.get(`sfin.payment.caozuo`).d('查看核销明细')}
          </a>
        ),
      },
    ];
    return columns;
  }

  /**
   * 计算table列宽度
   * @param {Array} columns 列
   * @param {Number} fixWidth 固定列宽度
   */
  @Bind()
  scrollWidth(columns, fixWidth) {
    const total = columns.reduce((prev, current) => prev + (current.width ? current.width : 0), 0);
    return total + fixWidth + 1;
  }

  render() {
    const columns = this.getColumns();
    const { dataSource, pagination, onTableChange, loading } = this.props;
    return (
      <Fragment>
        <Table
          bordered
          loading={loading}
          rowKey="billLineId"
          columns={columns}
          dataSource={dataSource}
          pagination={pagination}
          onChange={onTableChange}
          scroll={{ x: this.scrollWidth(columns, 150) }}
        />
      </Fragment>
    );
  }
}

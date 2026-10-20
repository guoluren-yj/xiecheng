/**
 * index -创建一般付款申请
 * @date: 2019-12-11
 * @author zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import React from 'react';
import EditTable from 'components/EditTable';

import { sum } from 'lodash';
import intl from 'utils/intl';
import { yesOrNoRender, dateTimeRender } from 'utils/renderer';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { thousandBitSeparator } from '@/routes/utils';

const commonPrompt = 'sfin.payment';
@withCustomize({
  unitCode: ['SFIN.PAYMENT_REQUEST_CREATE_DETAIL.GRID'],
})
export default class List extends React.Component {
  render() {
    const { loading, dataSource, onSearch, pagination, rowSelection, customizeTable } = this.props;

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
          title: intl.get(`entity.supplier.name`).d('供应商'),
          dataIndex: 'supplierCompanyName',
          width: 140,
        },
        {
          title: intl.get(`entity.company.name`).d('公司'),
          dataIndex: 'companyName',
          width: 145,
        },
        {
          title: intl.get(`sfin.common.model.common.ouName`).d('业务实体'),
          dataIndex: 'ouName',
          width: 120,
        },
        {
          title: intl.get(`sfin.payment.invoiceBodyName`).d('开票主体'),
          dataIndex: 'invoiceTitle',
          width: 100,
        },
        {
          title: intl.get(`${commonPrompt}.taxAmount`).d('发票税额'),
          dataIndex: 'taxAmount',
          width: 80,
          render: (text, record) => thousandBitSeparator(text, record.amountPrecision),
        },
        {
          title: intl.get(`${commonPrompt}.taxIncludedAmout`).d('发票总额'),
          dataIndex: 'taxIncludedAmount',
          width: 100,
          render: (text, record) => thousandBitSeparator(text, record.amountPrecision),
        },
        {
          title: intl.get(`${commonPrompt}.laveAmount`).d('剩余可付金额'),
          dataIndex: 'laveAmount',
          width: 110,
          render: (text, record) => thousandBitSeparator(text, record.amountPrecision),
        },
        {
          title: intl.get(`${commonPrompt}.paymentAmounted`).d('已付款金额'),
          dataIndex: 'paymentAmounted',
          width: 110,
          render: (text, record) => thousandBitSeparator(text, record.amountPrecision),
        },
        {
          title: intl.get(`${commonPrompt}.cancelVerificationAmount`).d('已销核金额'),
          dataIndex: 'cancelVerificationAmount',
          width: 110,
          render: (text, record) => thousandBitSeparator(text, record.amountPrecision),
        },
        {
          title: intl.get(`${commonPrompt}.currencyCode`).d('币种'),
          dataIndex: 'currencyCode',
          width: 100,
        },
        {
          title: intl.get(`${commonPrompt}.validateStatusCode`).d('查验状态'),
          dataIndex: 'validateStatusCodeMeaning',
          width: 120,
        },
        {
          title: intl.get(`${commonPrompt}.purchaseAgentName`).d('采购员'),
          dataIndex: 'purchaseAgentName',
          width: 120,
        },
        {
          title: intl.get(`${commonPrompt}.taxInvoiceDateIssued`).d('开票日期'),
          dataIndex: 'taxInvoiceDateIssued',
          width: 130,
          render: dateTimeRender,
        },
        {
          title: intl.get(`${commonPrompt}.creationDate`).d('创建日期'),
          dataIndex: 'creationDate',
          width: 130,
          render: dateTimeRender,
        },
        {
          title: intl.get(`${commonPrompt}.removeflag`).d('移除标识'),
          dataIndex: 'removeFlag',
          width: 90,
          render: yesOrNoRender,
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
        {customizeTable(
          {
            code: 'SFIN.PAYMENT_REQUEST_CREATE_DETAIL.GRID', // 单元编码，必传
          },
          <EditTable {...tableProps} />
        )}
      </React.Fragment>
    );
  }
}

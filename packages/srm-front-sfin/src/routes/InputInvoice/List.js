/**
 * index.js - 进项发票池
 * @date: 2019-09-19
 * @author: ZJC <junchao.zhou@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import React from 'react';
import { sum } from 'lodash';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import EditTable from 'components/EditTable';
// import { numberRender } from 'utils/renderer';
import { dateRender } from 'utils/renderer';
import { thousandBitSeparator } from '@/routes/utils';

const commonPrompt = 'sfin.inputInvoice';
export default class List extends React.Component {
  /**
   *  SRM发票号列内容渲染
   */
  @Bind()
  goToLink(record) {
    const { redirectInvoiceSummary } = this.props;
    const { invoiceHeaderId, srmInvoiceNum } = record;
    return (
      <p style={{ marginBottom: 0 }}>
        <a onClick={() => redirectInvoiceSummary(invoiceHeaderId)}>{srmInvoiceNum}</a>
      </p>
    );
  }

  /**
   *  根据发票类型跳转到不同的发票样式页面
   */
  @Bind()
  goToOtherInvoicePage(record) {
    const { goToOtherInvoicePage } = this.props;
    return (
      <p style={{ marginBottom: 0 }}>
        <a onClick={() => goToOtherInvoicePage(record)}>
          {intl.get(`${commonPrompt}.model.invoiceView`).d('发票查看')}
        </a>
      </p>
    );
  }

  render() {
    const { maintainQueryList, loading, pagination, onChange } = this.props;

    const tableProps = {
      columns: [
        {
          title: intl.get(`${commonPrompt}.model.invoiceCode`).d('发票代码'),
          dataIndex: 'invoiceCode',
          width: 150,
        },
        {
          title: intl.get(`${commonPrompt}.model.invoiceNumber`).d('发票号码'),
          dataIndex: 'invoiceNumber',
          width: 120,
        },
        {
          title: intl.get(`${commonPrompt}.model.billingDate`).d('开票日期'),
          dataIndex: 'billingDate',
          width: 160,
          render: dateRender,
        },
        {
          title: intl.get(`${commonPrompt}.model.approveDate`).d('审核日期'),
          dataIndex: 'approveDate',
          width: 120,
          render: dateRender,
        },
        {
          title: intl.get(`${commonPrompt}.model.netAmount`).d('不含税金额'),
          dataIndex: 'totalAmount',
          align: 'right',
          render: (value, record) => {
            return thousandBitSeparator(value, record.amountPrecision);
          },
          width: 120,
        },
        {
          title: intl.get(`${commonPrompt}.model.checkCode`).d('校验码后六位'),
          dataIndex: 'checkCode',
          width: 120,
        },
        {
          title: intl.get(`${commonPrompt}.model.taxInvoiceStatus`).d('状态'),
          dataIndex: 'issueStatusCodeMeaning',
          width: 120,
        },
        {
          title: intl.get(`${commonPrompt}.model.purchaser`).d('购买方'),
          dataIndex: 'companyName',
          width: 180,
        },
        {
          title: intl.get(`${commonPrompt}.model.supplierCompanyName`).d('销售方'),
          dataIndex: 'supplierCompanyName',
          width: 240,
        },
        {
          title: intl.get(`${commonPrompt}.model.srmInvoiceNum`).d('SRM发票号'),
          dataIndex: 'srmInvoiceNum',
          width: 150,
          render: (_, record) => this.goToLink(record),
        },
        {
          title: intl.get(`${commonPrompt}.model.taxType`).d('发票类型'),
          dataIndex: 'invoiceTypeCodeMeaning',
        },
        {
          title: intl.get(`${commonPrompt}.model.ocrFileUrl`).d('发票信息'),
          dataIndex: 'ocrFileUrl',
          render: (_, record) => this.goToOtherInvoicePage(record),
          align: 'center',
          width: 120,
        },
      ],
      dataSource: maintainQueryList,
      loading,
      bordered: true,
      pagination,
      onChange,
      rowKey: 'pcTypeId',
    };
    tableProps.scroll = { x: sum(tableProps.columns.map((n) => n.width)) + 300 };

    return (
      <React.Fragment>
        <EditTable {...tableProps} />
      </React.Fragment>
    );
  }
}

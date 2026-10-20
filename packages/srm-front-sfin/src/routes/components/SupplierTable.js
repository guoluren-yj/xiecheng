/**
 * RowTable - 总账科目表格-供应商模块
 * @date: 2019-11-14
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */
import React, { Component } from 'react';
// import { Form } from 'hzero-ui';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
// import { Form, Input } from 'hzero-ui';

// import Lov from 'components/Lov';

import intl from 'utils/intl';
import EditTable from 'components/EditTable';
import withCustomize from 'srm-front-cuz/lib/h0Customize';

import formatterCollections from 'utils/intl/formatterCollections';
import { thousandBitSeparator } from '@/routes/utils';

// import { TreeInput } from '../Invoice/Components/TreeInput';

// const FormItem = Form.Item;
const promptCode = 'sfin.supplierChargeEntry';
/**
 * 行表格
 * @extends {Component} - Component
 * @reactProps {String} organizationId - 租户Id
 * @return React.element
 */
@withCustomize({
  unitCode: ['SFIN.BILL_SALE_DETAIL.LEDGER_ACCOUNT'],
})
@formatterCollections({
  code: ['sfin.supplierChargeEntry'],
})
@connect(({ bill, loading }) => ({
  bill,
  queryTaxationDataing: loading.effects['invoice/queryTaxationData'],
  queryTreeDataing: loading.effects['invoice/queryTreeData'],
}))
export default class RowTable extends Component {
  state = {};

  /**
   * 计算table列宽度
   * @param {Array} columns 列
   * @param {Number} fixWidth 固定列宽度
   */
  @Bind()
  scrollWidth(columns, fixWidth) {
    const total = columns.reduce(
      (prev, current) => prev + (current.className ? 0 : current.width ? current.width : 0),
      0
    );
    return total + fixWidth + 1;
  }

  @Bind()
  getTreeInput(taxItemId = null, fn) {
    const { dispatch, organizationId } = this.props;
    dispatch({
      type: `invoice/queryTreeData`,
      payload: {
        organizationId,
        taxItemId,
      },
    }).then(fn);
  }

  @Bind()
  getTaxationData(page = {}, taxItemId = null, fn) {
    const { dispatch, organizationId } = this.props;
    dispatch({
      type: `invoice/queryTaxationData`,
      payload: {
        page,
        organizationId,
        taxItemId,
      },
    }).then(fn);
  }

  @Bind()
  setTreeInputData(data) {
    this.TreeInputData = data;
  }

  render() {
    const {
      onTableChange,
      dataSource = [],
      pagination = {},
      customizeTable,
      selectedModalRows = [],
      modalRowSelectedChange,
      // queryTreeDataing = false,
      // queryTaxationDataing = false,
      // permitDirectInvoiceFlag,
      // type,
    } = this.props;
    const selectedRowKeys = selectedModalRows.map((n) => n.supplierDeductionsId);
    const rowSelection = { selectedRowKeys, onChange: modalRowSelectedChange };
    const content = dataSource;
    // const TreeInputProps = {
    //   queryTreeDataing,
    //   getTreeInput: this.getTreeInput,
    //   queryTaxationDataing,
    //   getTaxationData: this.getTaxationData,
    // };
    const columns = [
      {
        title: intl.get(`${promptCode}.model.Num`).d('行号'),
        dataIndex: 'relationLineNum',
        width: 80,
      },
      {
        title: intl.get(`${promptCode}.model.deductionsNum`).d('扣款单号'),
        dataIndex: 'deductionsNum',
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.model.accountSubjectName`).d('总账科目'),
        dataIndex: 'accountSubjectName',
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.model.debitCreditCodeMeaning`).d('借贷方'),
        dataIndex: 'debitCreditCodeMeaning',
        width: 100,
      },
      // {
      //   title: intl.get(`${promptCode}.model.amount`).d('不含税扣款额'),
      //   dataIndex: 'amount',
      //   width: 120,
      // },
      {
        title: intl.get(`${promptCode}.model.taxRate`).d('税率(%)'),
        dataIndex: 'taxRate',
        width: 100,
      },
      // {
      //   title: intl.get(`${promptCode}.model.taxAmount`).d('税额'),
      //   dataIndex: 'taxAmount',
      //   width: 100,
      // },
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
        title: intl.get(`${promptCode}.model.deductionAmount`).d('本次扣款额'),
        dataIndex: 'deductionAmount',
        width: 120,
        render: (text, record) => thousandBitSeparator(text, record.amountPrecision),
      },
      {
        title: intl.get(`${promptCode}.model.relationAmount`).d('已扣款额'),
        dataIndex: 'relationAmount',
        width: 100,
        render: (text, record) => thousandBitSeparator(text, record.amountPrecision),
      },
      {
        title: intl.get(`${promptCode}.model.remark`).d('备注'),
        dataIndex: 'remark',
        // width: 100,
      },
    ];
    // console.log(permitDirectInvoiceFlag === 1 && ['create', 'update'].includes(type));
    // if (permitDirectInvoiceFlag === 1 && ['create', 'update'].includes(type)) {
    //   columns.splice(3, 0, {
    //     title: intl.get(`${promptCode}.model.invoiceBill.taxItemCode`).d('商品编码'),
    //     dataIndex: 'taxItemCode',
    //     width: 120,
    //     render: (value, record) => {
    //       const { taxItemId } = record;
    //       record.$form.getFieldDecorator('taxItemId', {
    //         initialValue: taxItemId,
    //       });
    //       return (
    //         <Form.Item>
    //           {record.$form.getFieldDecorator('taxItemCode', {
    //             initialValue: value,
    //             rules: [
    //               {
    //                 required: true,
    //                 message: intl.get('hzero.common.validation.notNull', {
    //                   name: intl.get(`${promptCode}.model.invoiceBill.taxItemCode`).d('商品编码'),
    //                 }),
    //               },
    //             ],
    //           })(
    //             <TreeInput
    //               record={record}
    //               setTreeInputData={this.setTreeInputData}
    //               initialValue={value}
    //               TreeInputProps={TreeInputProps}
    //             />
    //           )}
    //         </Form.Item>
    //       );
    //     },
    //   });
    //   columns.splice(4, 0, {
    //     title: intl.get(`${promptCode}.model.invoiceBill.taxItemSimpleName`).d('税收商品简称'),
    //     dataIndex: 'taxItemSimpleName',
    //     width: 120,
    //     render: (value, record) => {
    //       return (
    //         <Form.Item>
    //           {record.$form.getFieldDecorator('taxItemSimpleName', {
    //             initialValue: value,
    //           })(<Input disabled />)}
    //         </Form.Item>
    //       );
    //     },
    //   });
    //   columns.splice(5, 0, {
    //     title: intl.get(`${promptCode}.model.invoiceBill.invoiceItemName`).d('发票品名'),
    //     dataIndex: 'invoiceItemName',
    //     width: 120,
    //     render: (value, record) => {
    //       return (
    //         <Form.Item>
    //           {record.$form.getFieldDecorator('invoiceItemName', {
    //             initialValue: value,
    //             rules: [
    //               {
    //                 required: true,
    //                 message: intl.get('hzero.common.validation.notNull', {
    //                   name: intl
    //                     .get(`${promptCode}.model.invoiceBill.invoiceItemName`)
    //                     .d('发票品名'),
    //                 }),
    //               },
    //             ],
    //           })(<Input />)}
    //         </Form.Item>
    //       );
    //     },
    //   });
    //   columns.splice(6, 0, {
    //     title: intl.get(`${promptCode}.model.invoiceBill.goodsName`).d('货物或应税劳务、服务名称'),
    //     dataIndex: 'goodsName',
    //     width: 120,
    //     render: (value, record) => {
    //       const { taxItemSimpleName, invoiceItemName } = record;

    //       return (
    //         <Form.Item>
    //           {record.$form.getFieldDecorator('goodsName', {
    //             initialValue: `*${taxItemSimpleName}*${invoiceItemName}`,
    //           })(<Input disabled />)}
    //         </Form.Item>
    //       );
    //     },
    //   });
    // }
    return (
      <React.Fragment>
        {customizeTable(
          {
            code: 'SFIN.BILL_SALE_DETAIL.LEDGER_ACCOUNT',
          },
          <EditTable
            bordered
            rowKey="supplierDeductionsId"
            columns={columns}
            dataSource={content}
            pagination={pagination}
            onChange={onTableChange}
            scroll={{ x: this.scrollWidth(columns, 200), y: 'calc(100vh - 422px)' }}
            rowSelection={rowSelection}
          />
        )}
      </React.Fragment>
    );
  }
}

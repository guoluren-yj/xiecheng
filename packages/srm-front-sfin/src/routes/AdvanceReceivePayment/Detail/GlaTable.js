/**
 * GlaTable - 预收款申请明细 - 基于供应商
 * @date: 2019-12-12
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */
import React, { Component } from 'react';
import { Form, InputNumber, Input } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import EditTable from 'components/EditTable';
// import {
//   // precisionParams,
//   precisionNum,
// } from '@/routes/utils';

const promptCode = 'sfin.advanceReceivePayment.model.common';
@withCustomize({
  unitCode: ['SFIN.RECEIVE_PREPAYMENT_DETAIL.LINE_SUPPLIER'],
})
@Form.create({ fieldNameProp: null })
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
  changeList(text, values, record) {
    const { updateState } = this.props;
    updateState(text, values, record);
  }

  render() {
    const {
      onSearch,
      loading,
      headerInfo,
      dataSource = [],
      pagination = {},
      selectedRows = [],
      customizeTable,
      onSelectedRowChange = (e) => e,
    } = this.props;
    const selectedRowKeys = selectedRows.map((n) => n.advanceLineId);
    const rowSelection = { selectedRowKeys, onChange: onSelectedRowChange };
    const columns = [
      {
        title: intl.get(`${promptCode}.lineNum`).d('行号'),
        dataIndex: 'lineNum',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.receiveAmount`).d('本次收款金额'),
        dataIndex: 'paymentAdvanceAmount',
        width: 260,
        render: (_, record) => (
          <Form.Item>
            {record.$form.getFieldDecorator(`paymentAdvanceAmount`, {
              initialValue: record.paymentAdvanceAmount,
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`${promptCode}.model.receiveAmount`).d('本次收款金额'),
                  }),
                },
                // {
                //   pattern: /(^[1-9](\d+)?(\.\d{0,2})?$)/,
                //   message: intl.get(`${promptCode}.decimals`).d('金额需大于零或为两位小数'),
                // },
                // {
                //   validator: (i, value, callback) => {
                //     const currentLength = Number(value).toString().split('.')[1]
                //       ? Number(value).toString().split('.')[1].length
                //       : 0;

                //     if (currentLength > record.amountPrecision) {
                //       callback(intl.get(`${promptCode}.msgError`).d(`精度校验不通过`));
                //     } else {
                //       callback();
                //     }
                //   },
                // },
              ],
            })(
              <InputNumber
                // precision={record.amountPrecision}
                precision={headerInfo.amountPrecision}
                // precision={precisionNum(_, record, 'paymentAdvanceAmount')}
                // {...precisionParams(_, true)}
                allowThousandth
                style={{ width: '100%' }}
              />
            )}
          </Form.Item>
        ),
      },
      {
        title: intl.get(`${promptCode}.receivePaymentReason`).d('收款事由'),
        dataIndex: 'paymentReason',
        // width: 170,
        render: (_, record) => (
          <Form.Item>
            {record.$form.getFieldDecorator(`paymentReason`, {
              initialValue: record.paymentReason,
            })(<Input />)}
          </Form.Item>
        ),
      },
      {
        title: intl.get(`${promptCode}.remark`).d('备注'),
        dataIndex: 'remark',
        width: 260,
        render: (_, record) => (
          <Form.Item>
            {record.$form.getFieldDecorator(`remark`, {
              initialValue: record.remark,
            })(<Input />)}
          </Form.Item>
        ),
      },
    ];
    return (
      <React.Fragment>
        {customizeTable(
          {
            code: 'SFIN.RECEIVE_PREPAYMENT_DETAIL.LINE_SUPPLIER',
          },
          <EditTable
            bordered
            loading={loading}
            rowSelection={rowSelection}
            rowKey="advanceLineId"
            columns={columns}
            dataSource={dataSource}
            pagination={pagination}
            onChange={onSearch}
            scroll={{ x: this.scrollWidth(columns, 200) }}
          />
        )}
      </React.Fragment>
    );
  }
}

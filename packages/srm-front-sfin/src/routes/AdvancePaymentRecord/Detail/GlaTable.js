/**
 * GlaTable - 预付款申请明细 - 基于供应商
 * @date: 2019-12-12
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */
import React, { Component } from 'react';
import { Form, InputNumber, Input } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
// import withCustomize from 'srm-front-cuz/lib/h0Customize'
import EditTable from 'components/EditTable';
// import { precisionParams, precisionNum } from '@/routes/utils';

const promptCode = 'sfin.advancePaymentRecord.model.common';

@Form.create({ fieldNameProp: null })
// @withCustomize({
//   unitCode: ['SFIN.ADVANCE_PAYMENT_RECORD_DETAIL.LINE_SUPPLIER'],
// })
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
      dataSource = [],
      pagination = {},
      selectedRows = [],
      customizeTable,
      onSelectedRowChange = (e) => e,
      headerInfo,
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
        title: intl.get(`${promptCode}.paymentAdvanceAmount`).d('本次付款金额'),
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
                    name: intl.get(`${promptCode}.model.paymentAdvanceAmount`).d('本次付款金额'),
                  }),
                },
                // {
                //   validator: (i, value, callback) => {
                //     const currentLength = Number(value).toString().split('.')[1]
                //       ? Number(value).toString().split('.')[1].length
                //       : 0;

                //     if (currentLength > record.amountPrecision) {
                //       callback(intl.get(`${promptCode}.errMsg`).d(`精度校验不通过`));
                //     } else {
                //       callback();
                //     }
                //   },
                // },
              ],
            })(
              <InputNumber
                precision={headerInfo.amountPrecision}
                // precision={precisionNum(_, record, 'paymentAdvanceAmount')}
                // {...precisionParams(record.paymentAdvanceAmount, true)}
                allowThousandth
                style={{ width: '100%' }}
              />
            )}
          </Form.Item>
        ),
      },
      {
        title: intl.get(`${promptCode}.paymentReason`).d('付款事由'),
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
            code: 'SFIN.ADVANCE_PAYMENT_RECORD_DETAIL.LINE_SUPPLIER',
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

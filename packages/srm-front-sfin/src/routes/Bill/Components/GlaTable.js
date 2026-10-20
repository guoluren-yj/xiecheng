/**
 * RowTable - 总账科目表格
 * @date: 2019-11-14
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */
import React, { Component } from 'react';
import { Form, InputNumber } from 'hzero-ui';
import { isNumber } from 'lodash';

import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
// import Lov from 'components/Lov';

import intl from 'utils/intl';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import EditTable from 'components/EditTable';

import { thousandBitSeparator } from '@/routes/utils';
// const FormItem = Form.Item;
const promptCode = 'sfin.supplierChargeEntry';
const customizeUnitCode = ['SFIN.BILL_MAINTAIN_DETAIL.LEDGER_ACCOUNT'];
/**
 * 行表格
 * @extends {Component} - Component
 * @reactProps {String} organizationId - 租户Id
 * @return React.element
 */

@withCustomize({
  unitCode: customizeUnitCode,
})
@connect(({ bill }) => ({ bill }))
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
      loading,
      onTableChange,
      dataSource = [],
      pagination = {},
      customizeTable,
      selectedModalRows = [],
      modalRowSelectedChange,
      editFlag = true,
    } = this.props;
    const selectedRowKeys = selectedModalRows.map((n) => n.supplierDeductionsId);
    const rowSelection = { selectedRowKeys, onChange: modalRowSelectedChange };
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
        width: 120,
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
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && editFlag ? (
            <Form.Item>
              {record.$form.getFieldDecorator('deductionAmount', {
                initialValue: val || record.remainingDeductionAmount,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${promptCode}.deductionAmount`).d('本次扣款额'),
                    }),
                  },
                  {
                    validator: (rule, value, callback) => {
                      if (value === 0) {
                        callback(
                          intl.get(`${promptCode}.message.notZeroAmount`).d('本次扣款额不能等于零')
                        );
                      } else {
                        callback();
                      }
                    },
                  },
                ],
              })(
                <InputNumber
                  {...(isNumber(
                    record.$form.getFieldValue('amountPrecision') || record.amountPrecision
                  )
                    ? {
                        precision:
                          record.$form.getFieldValue('amountPrecision') || record.amountPrecision,
                      }
                    : {})}
                  allowThousandth
                  step={0.01}
                  min={record.taxIncludedAmount > 0 ? 0.01 : -Infinity}
                  max={record.taxIncludedAmount < 0 ? -0.01 : Infinity}
                />
              )}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${promptCode}.model.relationAmount`).d('已扣款额'),
        dataIndex: 'relationAmount',
        render: (text, record) => thousandBitSeparator(text, record.amountPrecision),
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.model.remark`).d('备注'),
        dataIndex: 'remark',
        // width: 100,
      },
    ];
    return (
      <React.Fragment>
        {customizeTable(
          {
            code: 'SFIN.BILL_MAINTAIN_DETAIL.LEDGER_ACCOUNT',
          },
          <EditTable
            bordered
            loading={loading}
            rowSelection={rowSelection}
            rowKey="supplierDeductionsId"
            columns={columns}
            dataSource={dataSource}
            pagination={pagination}
            onChange={onTableChange}
            scroll={{ x: this.scrollWidth(columns, 200) }}
          />
        )}
      </React.Fragment>
    );
  }
}

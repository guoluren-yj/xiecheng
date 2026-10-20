/**
 * GlaTable - 预付款核销明细 - 行信息
 * @date: 2020-03-13
 * @author JSS <shangshang.jing@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { Form, InputNumber } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import EditTable from 'components/EditTable';
import { dateRender } from 'utils/renderer';
import { math } from 'choerodon-ui/dataset';
import {
  thousandBitSeparator,
  // precisionParams,
  precisionNum,
} from '@/routes/utils';
import '../index.less';

const FormItem = Form.Item;
const commonPrompt = 'sfin.payment.common';

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
      isFromModal,
      dataSource = [],
      pagination = {},
      selectedRows = [],
      onSelectedRowChange = (e) => e,
      className,
    } = this.props;
    const selectedRowKeys = selectedRows.map((n) => n.advanceLineId);
    const rowSelection = {
      selectedRowKeys,
      onChange: onSelectedRowChange,
      // getCheckboxProps: record => ({
      //   disabled: record._status !== 'create' && !isFromModal,
      // }),
    };
    const columns = [
      {
        title: intl.get(`${commonPrompt}.thisTimeAmount`).d('本次核销金额'),
        dataIndex: 'amount',
        width: 150,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('amount', {
                initialValue: val,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${commonPrompt}.thisTimeAmount`).d('本次核销金额'),
                    }),
                  },
                  {
                    validator: (i, value, callback) => {
                      const currentLength = math.dp(value);

                      if (currentLength > record.amountPrecision) {
                        callback(intl.get(`${commonPrompt}.msgError`).d(`精度校验不通过`));
                      } else {
                        callback();
                      }
                    },
                  },
                ],
              })(
                <InputNumber
                  min={0.01}
                  // precision={record.amountPrecision}
                  precision={precisionNum(val, record, 'amount')}
                  // {...precisionParams(val, true)}
                  allowThousandth
                  step={0.01}
                />
              )}
            </FormItem>
          ) : (
            thousandBitSeparator(val, record.amountPrecision)
          ),
      },
      {
        title: intl.get(`${commonPrompt}.notCancelVerificationAmount`).d('未核销金额'),
        dataIndex: 'notCancelVerificationAmount',
        width: 110,
        render: (text, record) => thousandBitSeparator(text, record.amountPrecision),
      },
      {
        title: intl.get(`${commonPrompt}.paymentNum`).d('预付款申请单号'),
        dataIndex: 'paymentNum',
      },
      {
        title: intl.get(`${commonPrompt}.paymentSourceType`).d('付款类型'),
        dataIndex: 'paymentSourceTypeCodeMeaning',
        width: 110,
      },
      {
        title: intl.get(`${commonPrompt}.displayNum`).d('单据编号'),
        dataIndex: 'displayNum',
        width: 130,
        render: (val, record) => {
          return record.paymentSourceTypeCode === 'PO_LINE' ? record.displayPoLineNum : val;
        },
      },
      {
        title: intl.get(`${commonPrompt}.payMoney`).d('付款金额'),
        dataIndex: 'paymentAdvanceAmount',
        width: 110,
        render: (text, record) => thousandBitSeparator(text, record.amountPrecision),
      },
      {
        title: intl.get(`${commonPrompt}.currencyCode`).d('币种'),
        dataIndex: 'currencyCode',
        width: 80,
      },
      {
        title: intl.get(`${commonPrompt}.cancelVerificationStatus`).d('核销状态'),
        dataIndex: 'cancelVerificationStatusMeaning',
        width: 120,
      },
      {
        title: intl.get(`entity.roles.proposer`).d('申请人'),
        dataIndex: 'realName',
        width: 120,
      },
      {
        title: intl.get(`hzero.common.date.creation`).d('创建日期'),
        dataIndex: 'creationDate',
        width: 130,
        render: dateRender,
      },
      {
        title: intl.get(`hzero.common.remark`).d('备注'),
        dataIndex: 'remark',
        width: 130,
      },
    ];
    if (isFromModal) {
      columns.shift();
    }
    return (
      <React.Fragment>
        <EditTable
          bordered
          loading={loading}
          rowSelection={rowSelection}
          className={className || ''}
          rowKey="advanceLineId"
          columns={columns}
          dataSource={dataSource}
          pagination={pagination}
          onChange={(page) => onSearch(page)}
          scroll={{ x: this.scrollWidth(columns, 200) }}
        />
      </React.Fragment>
    );
  }
}

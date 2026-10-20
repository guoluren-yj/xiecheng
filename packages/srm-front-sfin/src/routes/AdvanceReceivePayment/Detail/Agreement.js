/**
 * GlaTable - 预收款申请明细 - 基于协议
 * @date: 2020-03-10
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */
import React, { Component } from 'react';
import { Form, InputNumber } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import EditTable from 'components/EditTable';
import { dateTimeRender, dateRender } from 'utils/renderer';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import {
  thousandBitSeparator,
  // precisionParams,
  // precisionNum,
} from '@/routes/utils';

const promptCode = 'sfin.advanceReceivePayment.model.common';
@withCustomize({
  unitCode: ['SFIN.RECEIVE_PREPAYMENT_DETAIL.LINE_CONTRACT'],
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
      dataSource = [],
      pagination = {},
      selectedRows = [],
      customizeTable,
      onSelectedRowChange = (e) => e,
      handleInput = (e) => e,
      // validateSelect = e => e,
    } = this.props;
    const selectedRowKeys = selectedRows.map((n) => n.referenceDataId);
    const rowSelection = { selectedRowKeys, onChange: onSelectedRowChange };
    const columns = [
      {
        title: intl.get(`${promptCode}.displayNums`).d('采购协议编号'),
        dataIndex: 'displayNum',
        width: 180,
      },
      {
        title: intl.get(`${promptCode}.pcName`).d('采购协议名称'),
        dataIndex: 'pcName',
        // width: 110,
      },
      {
        title: intl.get(`${promptCode}.taxIncludedAmount`).d('协议总额'),
        dataIndex: 'taxIncludedAmount',
        width: 110,
        render: (text, record) => thousandBitSeparator(text, record.amountPrecision),
      },
      {
        title: intl.get(`${promptCode}.amount`).d('不含税金额'),
        dataIndex: 'amount',
        width: 110,
        render: (text, record) => thousandBitSeparator(text, record.amountPrecision),
      },
      {
        title: intl.get(`${promptCode}.restReceiveAmount`).d('剩余可收金额'),
        dataIndex: 'paymentAmount',
        width: 130,
        render: (text, record) => thousandBitSeparator(text, record.amountPrecision),

        // fixed: 'left',
      },
      {
        title: intl.get(`${promptCode}.receiveAmount`).d('本次收款金额'),
        dataIndex: 'paymentAdvanceAmount',
        width: 200,
        // fixed: 'left', // fixed导致输入框卡顿 解除定位即可解决此问题
        render: (_, record) => (
          <Form.Item>
            {record.$form.getFieldDecorator(`paymentAdvanceAmount`, {
              initialValue:
                record.paymentAdvanceAmount === null
                  ? record.paymentAmount
                  : record.paymentAdvanceAmount,
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`${promptCode}.model.receiveAmount`).d('本次收款金额'),
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
                // {
                //   pattern: /(^[1-9](\d+)?(\.\d{0,2})?$)/,
                //   message: intl.get(`${promptCode}.decimals`).d('金额需大于零或为两位小数'),
                // },
              ],
            })(
              <InputNumber
                precision={record.amountPrecision}
                // precision={precisionNum(_, record, 'paymentAdvanceAmount')}
                // {...precisionParams(_, true)}
                allowThousandth
                // eslint-disable-next-line no-shadow
                onChange={(text, values) => {
                  handleInput(text, values, record);
                }}
              />
            )}
          </Form.Item>
        ),
      },
      {
        title: intl.get(`${promptCode}.pcTypeName`).d('协议类型'),
        dataIndex: 'pcTypeName',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.startDateActive`).d('协议起始日期'),
        dataIndex: 'startDateActive',
        width: 120,
        render: dateRender,
      },
      {
        title: intl.get(`${promptCode}.endDateActive`).d('协议终止日期'),
        dataIndex: 'endDateActive',
        width: 130,
        render: dateRender,
      },
      {
        title: intl.get(`${promptCode}.realName`).d('创建人'),
        dataIndex: 'realName',
        width: 130,
      },
      {
        title: intl.get(`${promptCode}.creationDate`).d('创建时间'), // 字段不一定对
        dataIndex: 'creationDate',
        width: 150,
        render: dateTimeRender,
      },
      {
        title: intl.get(`${promptCode}.confirmedDate`).d('生效时间'),
        dataIndex: 'confirmedDate',
        width: 150,
        render: dateTimeRender,
      },
    ];
    return (
      <React.Fragment>
        {customizeTable(
          {
            code: 'SFIN.RECEIVE_PREPAYMENT_DETAIL.LINE_CONTRACT',
          },
          <EditTable
            bordered
            loading={loading}
            rowSelection={rowSelection}
            rowKey="referenceDataId"
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

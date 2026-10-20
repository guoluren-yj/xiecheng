/**
 * GlaTable - 预付款申请明细 - 基于协议
 * @date: 2020-03-12
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { Form, InputNumber } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import EditTable from 'components/EditTable';
import { math } from 'choerodon-ui/dataset';
import { dateRender, dateTimeRender } from 'utils/renderer';
import { thousandBitSeparator } from '@/routes/utils';

const promptCode = 'sfin.advancePaymentRecord.model.common';

@Form.create({ fieldNameProp: null })
export default class RowTable extends Component {
  state = {
    disabled: true,
  };

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

  /**
   * 本次预付比例=本次付款金额/含税总额；
   * taxIncludedAmount 含税总额
   * paymentAmountNum  本次付款金额
   */
  @Bind()
  handleAdvanceRatio(text, values, record) {
    const { taxIncludedAmount, amountPrecision } = record || {};
    const { setFieldsValue } = record.$form;
    const num = Number(amountPrecision) || 0;
    const paymentAdvanceAmount = math.toFixed(
      math.multipliedBy(taxIncludedAmount, math.div(text, 100)),
      num
    );
    setFieldsValue({ paymentAdvanceAmount });
  }

  render() {
    const {
      onSearch,
      loading,
      unitCode,
      dataSource = [],
      pagination = {},
      customizeTable,
      // selectedRows = [],
      receivePayQuery = false,
      // onSelectedRowChange = e => e,
    } = this.props;
    // const selectedRowKeys = selectedRows.map(n => n.paymentLineId);
    // const rowSelection = { selectedRowKeys, onChange: onSelectedRowChange };
    const columns = [
      {
        title: intl.get(`${promptCode}.displayNums`).d('采购协议编号'),
        dataIndex: 'displayNum',
      },
      {
        title: intl.get(`${promptCode}.pcName`).d('采购协议名称'),
        dataIndex: 'pcName',
        width: 110,
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
        title: receivePayQuery
          ? intl.get(`${promptCode}.restReceivePay`).d('剩余可收金额')
          : intl.get(`${promptCode}.paymentAmount`).d('剩余可付金额'),
        dataIndex: 'paymentAmount',
        width: 130,
        render: (text, record) => thousandBitSeparator(text, record.amountPrecision),

        // fixed: 'left',
      },
      {
        title: intl.get(`${promptCode}.advanceRatio`).d('本次预付比例'),
        dataIndex: 'advanceRatio',
        width: 170,
        render: (val, record) => (
          <Form.Item>
            {record.$form.getFieldDecorator(`advanceRatio`, {
              initialValue: record.advanceRatio,
            })(
              <InputNumber
                disabled={this.state.disabled}
                precision={5}
                // precision={amountPrecision}
                max={100}
                min={0}
                formatter={(value) => `${value}%`}
                parser={(value) => value?.replace('%', '')}
                allowThousandth
                // eslint-disable-next-line no-shadow
                onChange={(text, values) => {
                  this.handleAdvanceRatio(text, values, record);
                }}
              />
            )}
          </Form.Item>
        ),
      },
      {
        title: receivePayQuery
          ? intl.get(`${promptCode}.currentReceivePay`).d('本次收款金额')
          : intl.get(`${promptCode}.paymentAdvanceAmount`).d('本次付款金额'),
        dataIndex: 'paymentAdvanceAmount',
        width: 170,
        render: (text, record) => thousandBitSeparator(text, record.amountPrecision),
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
        {unitCode && customizeTable ? (
          customizeTable(
            {
              code: unitCode,
            },
            <EditTable
              bordered
              loading={loading}
              // rowSelection={rowSelection}
              rowKey="advancePaymentLineId"
              columns={columns}
              dataSource={dataSource}
              pagination={pagination}
              onChange={onSearch}
              scroll={{ x: this.scrollWidth(columns, 200) }}
            />
          )
        ) : (
          <EditTable
            bordered
            loading={loading}
            // rowSelection={rowSelection}
            rowKey="advancePaymentLineId"
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

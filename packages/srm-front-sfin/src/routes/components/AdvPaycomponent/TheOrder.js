/**
 * GlaTable - 预付款申请明细 - 基于订单
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
import { dateTimeRender } from 'utils/renderer';
import { thousandBitSeparator } from '@/routes/utils';

const promptCode = 'sfin.advancePaymentRecord.model.common';

@Form.create({ fieldNameProp: null })
export default class RowTable extends Component {
  // state = {};
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

  // @Bind()
  // taxValues (text, record) {
  //   const { taxIncludedAmount, amountPrecision } = record || {};
  //   const paymentAmountNum =
  //     record.paymentAdvanceAmount === null ? record.paymentAmount : record.paymentAdvanceAmount; // 本次付款金额
  //   const advanceRatio = Number(paymentAmountNum / (taxIncludedAmount * 100)).toFixed(
  //     amountPrecision
  //   );
  //   record.$form.setFieldsValue({ advanceRatio });
  // }

  render() {
    const {
      onSearch,
      loading,
      unitCode,
      customizeTable,
      dataSource = [],
      pagination = {},
      receivePayQuery = false,
      isOrderLine,
      // selectedRows = [],
      // onSelectedRowChange = e => e,
    } = this.props;
    // const selectedRowKeys = selectedRows.map(n => n.paymentLineId);
    // const rowSelection = { selectedRowKeys, onChange: onSelectedRowChange };
    const columns = [
      {
        title: intl.get(`${promptCode}.displayNum`).d('采购订单号'),
        dataIndex: 'displayNum',
      },
      {
        title: intl.get(`${promptCode}.taxIncludedAmounts`).d('含税总额'),
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
        title: intl.get(`${promptCode}.orderTypeName`).d('采购订单类型'),
        dataIndex: 'orderTypeName',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.ouName`).d('业务实体'),
        dataIndex: 'ouName',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.organizationName`).d('采购组织'),
        dataIndex: 'organizationName',
        width: 130,
      },
      {
        title: intl.get(`${promptCode}.purchaseAgentName`).d('采购员'),
        dataIndex: 'purchaseAgentName',
        width: 130,
      },
      {
        title: intl.get(`${promptCode}.creationDate`).d('创建时间'),
        dataIndex: 'creationDate',
        width: 150,
        render: dateTimeRender,
      },
      {
        title: intl.get(`${promptCode}.releasedDate`).d('发布时间'),
        dataIndex: 'releasedDate',
        width: 150,
        render: dateTimeRender,
      },
    ];
    if (isOrderLine === 1) {
      columns.splice(
        1,
        0,
        {
          title: intl.get(`${promptCode}.displayLineNum`).d('订单行号'),
          dataIndex: 'displayLineNum',
          width: 180,
        },
        {
          title: intl.get(`${promptCode}.itemCode`).d('物料编码'),
          dataIndex: 'itemCode',
          width: 180,
        },
        {
          title: intl.get(`${promptCode}.itemName`).d('物料名称'),
          dataIndex: 'itemName',
          width: 180,
        }
      );
    }
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

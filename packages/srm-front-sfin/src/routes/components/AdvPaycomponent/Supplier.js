/**
 * GlaTable - 预付款申请明细 - 基于供应商
 * @date: 2019-12-12
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */
import React, { Component } from 'react';
import { Form } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import EditTable from 'components/EditTable';
import { thousandBitSeparator } from '@/routes/utils';

const promptCode = 'sfin.advancePaymentRecord.model.common';

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

  render() {
    const {
      onSearch,
      loading,
      unitCode,
      customizeTable,
      dataSource = [],
      pagination = {},
      receivePayQuery = false,
      // selectedRows = [],
      // onSelectedRowChange = e => e,
    } = this.props;
    // const selectedRowKeys = selectedRows.map(n => n.paymentLineId);
    // const rowSelection = { selectedRowKeys, onChange: onSelectedRowChange };
    const columns = [
      {
        title: intl.get(`${promptCode}.lineNum`).d('行号'),
        dataIndex: 'lineNum',
        width: 100,
      },
      {
        title: receivePayQuery
          ? intl.get(`${promptCode}.receivePayAmount`).d('本次收款金额')
          : intl.get(`${promptCode}.paymentAdvanceAmount`).d('本次付款金额'),
        dataIndex: 'paymentAdvanceAmount',
        width: 260,
        render: (text, record) => thousandBitSeparator(text, record.amountPrecision),
      },
      {
        title: receivePayQuery
          ? intl.get(`${promptCode}.receiveReason`).d('收款事由')
          : intl.get(`${promptCode}.paymentReason`).d('付款事由'),
        dataIndex: 'paymentReason',
      },
      {
        title: intl.get(`${promptCode}.remark`).d('备注'),
        dataIndex: 'remark',
        width: 260,
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

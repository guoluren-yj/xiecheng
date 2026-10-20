/**
 * GlaTable - 预付款核销明细 - 行信息
 * @date: 2020-03-12
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { Form } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import EditTable from 'components/EditTable';
import { dateRender } from 'utils/renderer';
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
      // selectedRows = [],
      // onSelectedRowChange = e => e,
    } = this.props;
    // const selectedRowKeys = selectedRows.map(n => n.paymentLineId);
    // const rowSelection = { selectedRowKeys, onChange: onSelectedRowChange };
    const columns = [
      {
        title: intl.get(`${promptCode}.amounts`).d('本次核销金额'),
        dataIndex: 'amount',
        width: 110,
        render: (text, record) => thousandBitSeparator(text, record.amountPrecision),
      },
      {
        title: intl.get(`${promptCode}.notCancelVerificationAmount`).d('未核销金额'),
        dataIndex: 'notCancelVerificationAmount',
        width: 110,
        render: (text, record) => thousandBitSeparator(text, record.amountPrecision),
      },
      {
        title: intl.get(`${promptCode}.paymentNum`).d('预付款申请单号'),
        dataIndex: 'paymentNum',
      },
      {
        title: intl.get(`${promptCode}.paymentSourceTypeCodeMeaning`).d('付款类型'),
        dataIndex: 'paymentSourceTypeCodeMeaning',
        width: 110,
      },
      {
        title: intl.get(`${promptCode}.paymentAmount`).d('付款金额'),
        dataIndex: 'paymentAdvanceAmount',
        width: 130,
        render: (text, record) => thousandBitSeparator(text, record.amountPrecision),

        // fixed: 'left',
      },
      {
        title: intl.get(`${promptCode}.currencyCode`).d('币种'),
        dataIndex: 'currencyCode',
        width: 80,
      },
      {
        title: intl.get(`${promptCode}.cancelVerificationStatusMeaning`).d('核销状态'),
        dataIndex: 'cancelVerificationStatusMeaning',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.realName`).d('申请人'),
        dataIndex: 'realName',
        width: 120,
        // render: dateRender,
      },
      {
        title: intl.get(`${promptCode}.creationDate`).d('创建日期'),
        dataIndex: 'creationDate',
        width: 130,
        render: dateRender,
      },
      {
        title: intl.get(`${promptCode}.remark`).d('备注'),
        dataIndex: 'remark',
        width: 130,
      },
    ];
    return (
      <React.Fragment>
        <EditTable
          bordered
          loading={loading}
          // rowSelection={rowSelection}
          rowKey="paymentLineId"
          columns={columns}
          dataSource={dataSource}
          pagination={pagination}
          onChange={onSearch}
          scroll={{ x: this.scrollWidth(columns, 200) }}
        />
      </React.Fragment>
    );
  }
}

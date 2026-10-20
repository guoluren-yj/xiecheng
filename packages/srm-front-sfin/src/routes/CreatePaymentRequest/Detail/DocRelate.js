/**
 * DocTable - 税务发票行
 * @date: 2019-12-12
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */
import React, { Component } from 'react';
// import { Form } from 'hzero-ui';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
// import Lov from 'components/Lov';

import intl from 'utils/intl';
import { dateRender } from 'utils/renderer';

import EditTable from 'components/EditTable';
import { thousandBitSeparator, thousandBitSeparatorDJ } from '@/routes/utils';

// const FormItem = Form.Item;
const promptCode = 'sfin.payment';
/**
 * 行表格
 * @extends {Component} - Component
 * @reactProps {String} organizationId - 租户Id
 * @return React.element
 */

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
      //   selectedModalRows = [],
      //   modalRowSelectedChange,
    } = this.props;
    const columns = [
      {
        title: intl.get(`${promptCode}.invoiceNumAndLineNum`).d('SRM发票号|行号'),
        dataIndex: 'invoiceNumAndLineNum',
        width: 165,
        fixed: 'left',
      },
      {
        title: intl.get(`${promptCode}.itemCode`).d('物料编码'),
        dataIndex: 'itemCode',
        width: 100,
        fixed: 'left',
      },
      {
        title: intl.get(`${promptCode}.itemName`).d('物料描述'),
        dataIndex: 'itemName',
        width: 130,
        fixed: 'left',
      },
      {
        title: intl.get(`${promptCode}.specificationsAndModel`).d('规格型号'),
        dataIndex: 'specificationsAndModel',
        // width: 150,
      },
      //   税务发票代码 物料编码 物料描述 规格型号 单位
      {
        title: intl.get(`${promptCode}.uomName`).d('单位'),
        dataIndex: 'uomName',
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.quantity`).d('开票数量'),
        dataIndex: 'quantity',
        width: 150,
        render: (text) => thousandBitSeparator(text),
      },
      {
        title: intl.get(`${promptCode}.netPrice`).d('不含税单价'),
        dataIndex: 'netPrice',
        width: 150,
        render: (text, record) => thousandBitSeparatorDJ(text, record.pricePrecision),
      },
      {
        title: intl.get(`${promptCode}.netAmount`).d('不含税金额'),
        dataIndex: 'netAmount',
        width: 150,
        render: (text, record) => thousandBitSeparator(text, record.amountPrecision),
      },
      {
        title: intl.get(`${promptCode}.taxRate`).d('税率'),
        dataIndex: 'taxRate',
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.taxAmount`).d('税额'),
        dataIndex: 'taxAmount',
        width: 150,
        render: (text, record) => thousandBitSeparator(text, record.amountPrecision),
      },
      {
        title: intl.get(`${promptCode}.taxIncludedPrice`).d('含税单价'),
        dataIndex: 'taxIncludedPrice',
        width: 150,
        render: (text, record) => thousandBitSeparatorDJ(text, record.pricePrecision),
      },
      {
        title: intl.get(`${promptCode}.taxIncludedAmount`).d('含税金额'),
        dataIndex: 'taxIncludedAmount',
        width: 150,
        render: (text, record) => thousandBitSeparator(text, record.amountPrecision),
      },
      {
        title: intl.get(`${promptCode}.poNumAndLineNum`).d('订单号|行号'),
        dataIndex: 'poNumAndLineNum',
        width: 160,
      },
      {
        title: intl.get(`${promptCode}.displayReleaseNum`).d('发放号'),
        dataIndex: 'displayReleaseNum',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.displayLineLocationNum`).d('发运号'),
        dataIndex: 'displayLineLocationNum',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.prNumAndLineNum`).d('采购申请号|行号'),
        dataIndex: 'prNumAndLineNum',
        width: 160,
      },
      {
        title: intl.get(`${promptCode}.asnNumAndAsnLineNum`).d('送货单号|行号'),
        dataIndex: 'asnNumAndAsnLineNum',
        width: 160,
      },
      {
        title: intl.get(`${promptCode}.trxAndLineNum`).d('事务编号|行号'),
        dataIndex: 'trxAndLineNum',
        width: 160,
      },
      {
        title: intl.get(`${promptCode}.trxDate`).d('事务日期'),
        dataIndex: 'trxDate',
        width: 150,
        render: dateRender,
      },
      {
        title: intl.get(`${promptCode}.billNumAndBillLineNum`).d('对账单号|行号'),
        dataIndex: 'billNumAndBillLineNum',
        width: 160,
      },
      {
        title: intl.get(`${promptCode}.orderTypeName`).d('订单类型'),
        dataIndex: 'orderTypeName',
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.ouName`).d('业务实体'),
        dataIndex: 'ouName',
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.organizationName`).d('采购组织'),
        dataIndex: 'organizationName',
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.purchaseAgentName`).d('采购员'),
        dataIndex: 'purchaseAgentName',
        width: 150,
      },
    ];
    return (
      <React.Fragment>
        <EditTable
          bordered
          //   rowSelection={rowSelection}
          rowKey="abcdId"
          loading={loading}
          columns={columns}
          dataSource={dataSource}
          pagination={pagination}
          onChange={onTableChange}
          scroll={{ x: this.scrollWidth(columns, 200) }}
        />
      </React.Fragment>
    );
  }
}

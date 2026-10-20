/**
 * 组件-多轮报价物品信息 弹窗
 * @date: 2019-11-21
 * @author: zoukang <kang.zou@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Table, DataSet } from 'choerodon-ui/pro';

import CPopover from '@/routes/components/CPopover/';
import { roundQuotationDS } from './RoundQuotationDS';

import common from './index.less';

export default class RoundQuotationModal extends Component {
  tableDS = new DataSet(
    roundQuotationDS({
      rfxHeaderId: this.props.rfxHeaderId,
      quotationName: this.props.quotationName,
    })
  );

  componentDidMount() {
    this.tableDS.query();
  }

  /**
   * 依据状态渲染行样式
   *
   * @param {*} [item={}]
   * @param {*} [index=null]
   * @returns
   * @memberof RoundQuotationModal
   */
  tableRowClass(record = {}) {
    let RedColorClassName = 'ssrc-round-quotation-red-color';
    if (!record.get('minPriceFlag')) {
      RedColorClassName = '';
    }

    return { className: common[RedColorClassName] };
  }

  /**
   * 表格列
   *
   * @returns
   * @memberof RoundQuotationModal
   */
  renderColumns() {
    const columns = [
      {
        name: 'itemCode',
        width: 180,
      },
      {
        name: 'itemName',
        width: 250,
        renderer: ({ value }) => <CPopover content={value}>{value}</CPopover>,
      },
      {
        name: 'supplierCompanyNum',
        width: 180,
      },
      {
        name: 'supplierCompanyName',
        width: 250,
        renderer: ({ value }) => <CPopover content={value}>{value}</CPopover>,
      },
      {
        name: 'totalPrice',
        width: 80,
        align: 'right',
        // render: (val) => val && parseFloat(val).toLocaleString(),
      },
      {
        name: 'validQuotationQuantity',
        width: 80,
      },
      {
        name: 'validQuotationPrice',
        width: 80,
        // render: (val) => val && parseFloat(val).toLocaleString(),
      },
      {
        name: 'taxRate',
        width: 80,
      },
      {
        name: 'quotationLineStatusMeaning',
        width: 100,
      },
    ];

    return columns;
  }

  render() {
    const { customizeTable } = this.props;
    return customizeTable(
      {
        code: 'SSRC.EXPERT_SCORE_MANAGE.ROUND_QUOTATION_LINE',
      },
      <Table
        dataSet={this.tableDS}
        columns={this.renderColumns()}
        onRow={({ record }) => this.tableRowClass(record)}
      />
    );
  }
}

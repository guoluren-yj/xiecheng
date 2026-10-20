/**
 * 公用页面组件-多轮报价 全部报价明细 tabs
 * @date: 2019-11-21
 * @author: zoukang <kang.zou@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Table } from 'hzero-ui';
import { noop } from 'lodash';

import { tableScrollWidth } from 'utils/utils';
import intl from 'utils/intl';
import { roundEliminate } from '@/utils/renderer';
import { getUomName, getQtyName } from '@/utils/utils';

export default class AllQuotation extends Component {
  /**
   * 依据供应商名称排序
   *
   * @param {*} [a={}]
   * @param {*} [b={}]
   * @returns
   * @memberof AllQuotation
   */
  sortBySupplierName(a = {}, b = {}) {
    if (!a.supplierCompanyName || !b.supplierCompanyName) {
      return;
    }

    const result = a.supplierCompanyName.localeCompare(b.supplierCompanyName, 'zh', {});
    return result;
  }

  // 合众能源二开
  renderColumns(roundColumns = []) {
    const { doubleUnitFlag = false } = this.props;
    const columns = [
      {
        title: intl.get('ssrc.common.goodsNum').d('物料编码'),
        dataIndex: 'itemCode',
        width: 150,
      },
      {
        title: intl.get('ssrc.common.goodsDescription').d('物品描述'),
        dataIndex: 'itemName',
        width: 250,
        sorter: (a, b) => a.itemName.charCodeAt(0) - b.itemName.charCodeAt(0),
      },
      {
        title: intl.get('ssrc.common.supplierNum').d('供应商编码'),
        dataIndex: 'supplierCompanyNum',
        width: 150,
      },
      {
        title: intl.get('ssrc.common.supplierName').d('供应商名称'),
        dataIndex: 'supplierCompanyName',
        width: 250,
        // sorter: (a, b) => a.supplierCompanyName.charCodeAt(0) - b.supplierCompanyName.charCodeAt(0),
        sorter: (a, b) => this.sortBySupplierName(a, b),
        render: (val, record) => roundEliminate(val, record),
      },
      doubleUnitFlag
        ? {
            title: intl.get(`ssrc.bidHall.model.bidHall.needNum`).d('需求数量'),
            dataIndex: 'secondaryQuantity',
            width: 100,
          }
        : null,
      doubleUnitFlag
        ? {
            title: intl.get(`ssrc.bidHall.model.bidHall.unit`).d('单位'),
            dataIndex: 'secondaryUomName',
            width: 100,
          }
        : null,
      {
        title: getQtyName(doubleUnitFlag),
        dataIndex: 'rfxQuantity',
        width: 120,
      },
      {
        title: getUomName(doubleUnitFlag),
        dataIndex: 'uomName',
        width: 120,
      },
      ...roundColumns,
    ].filter(Boolean);

    return columns;
  }

  render() {
    const {
      roundColumns = [],
      dataSource = [],
      quotationAllListPagination,
      fetchAllLoading,
      fetchAll,
      customizeTable = noop,
      getCustomizeUnitCode = noop,
    } = this.props;

    const scrollX = tableScrollWidth(this.renderColumns());

    return customizeTable(
      {
        code: getCustomizeUnitCode('allQuotationDetail'),
      },
      <Table
        bordered
        rowKey="quotationLineId"
        columns={this.renderColumns(roundColumns)}
        scroll={{ x: scrollX }}
        pagination={quotationAllListPagination}
        dataSource={dataSource}
        loading={fetchAllLoading}
        onChange={(page) => fetchAll(page)}
      />
    );
  }
}

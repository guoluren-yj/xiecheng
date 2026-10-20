/**
 * SupplierClassify - 供应商分类
 * @date: 2021-04-01
 * @author: xiaomei.lv <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */
import React, { Component } from 'react';
import { sum, isNumber } from 'lodash';
import { Table } from 'hzero-ui';
import intl from 'utils/intl';
import { formatYesOrNo } from '@/routes/components/utils';

export default class SupplierClassify extends Component {
  render() {
    const { dataSource, custLoading, customizeTable } = this.props;
    const columns = [
      {
        title: intl.get('sslm.supplyAbility.model.supplyAbility.categoryCode').d('供应商类型分类'),
        dataIndex: 'categoryCode',
        width: 100,
      },
      {
        title: intl
          .get('sslm.supplyAbility.model.supplyAbility.categoryDescription')
          .d('供应商分类描述'),
        dataIndex: 'categoryDescription',
        width: 150,
      },
      {
        title: intl.get('hzero.common.status.isEnable').d('是否启用'),
        dataIndex: 'enabledFlag',
        width: 100,
        render: val => formatYesOrNo(val),
      },
    ].map(n => ({
      ...n,
      render: (val, record) => {
        return (
          <div
            style={{
              color:
                (['update', 'insert', 'delete'].includes(record[`${n.dataIndex}StateFlag`]) ||
                  ['insert', 'delete'].includes(record.supChangeBeanStateFlag)) &&
                'red',
            }}
          >
            {n.render ? n.render(val, record) : val}
          </div>
        );
      },
    }));

    const scrollX = sum(columns.map(n => (isNumber(n.width) ? n.width : 150)));

    return customizeTable(
      {
        code: 'SSLM.SUPPLIER_INFORM_CHANGE_DETAIL.SUPPLIER_CLASSIFY',
        readOnly: true,
      },
      <Table
        bordered
        custLoading={custLoading}
        rowKey="supplierCategoryId"
        pagination={false}
        dataSource={dataSource}
        columns={columns}
        scroll={{ x: scrollX }}
      />
    );
  }
}

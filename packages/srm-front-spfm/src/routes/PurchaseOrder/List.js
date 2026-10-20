/*
 * List - 采购订单列表
 * @date: 2018/09/17 15:40:00
 * @author: LZH <zhaohui.liu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent, Fragment } from 'react';
import { Table } from 'hzero-ui';
import intl from 'utils/intl';
import { enableRender } from 'utils/renderer';
import { Bind } from 'lodash-decorators';

export default class List extends PureComponent {
  @Bind()
  handleRemoveProps(obj, paramsArr) {
    const newItem = { ...obj };
    paramsArr.forEach(item => {
      if (newItem[item]) {
        delete newItem[item];
      }
    });
    return newItem;
  }

  @Bind()
  showEditModal(record) {
    this.props.editLine(record);
  }

  render() {
    const { dataList, fetchListLoading } = this.props;
    const columns = [
      {
        title: intl.get(`spfm.purchaseOrder.model.purchaseOrder.orderSeq`).d('排序号'),
        width: 100,
        dataIndex: 'orderSeq',
      },
      {
        title: intl
          .get(`spfm.purchaseOrder.model.purchaseOrder.orderTypeCode`)
          .d('采购订单类型编码'),
        align: 'left',
        dataIndex: 'orderTypeCode',
      },
      {
        title: intl
          .get(`spfm.purchaseOrder.model.purchaseOrder.orderTypeName`)
          .d('采购订单类型名称'),
        align: 'left',
        dataIndex: 'orderTypeName',
      },
      {
        title: intl.get('hzero.common.status.enableFlag').d('启用'),
        dataIndex: 'enabledFlag',
        key: 'enabledFlag',
        width: 80,
        render: enableRender,
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 100,
        render: (val, record) => (
          <a onClick={() => this.showEditModal(record)}>
            {intl.get('hzero.common.button.edit').d('编辑')}
          </a>
        ),
      },
    ];
    return (
      <Fragment>
        <Table
          bordered
          loading={fetchListLoading}
          pagination={false}
          columns={columns}
          dataSource={dataList}
          rowKey="orderTypeId"
          onChange={this.handleSearch}
        />
      </Fragment>
    );
  }
}

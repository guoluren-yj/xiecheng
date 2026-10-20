/*
 * ListTable - 采购订单类型列表
 * @date: 2018/08/07 14:49:19
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Table, Badge } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { sum, isNumber } from 'lodash';

import intl from 'utils/intl';
// import { enableRender } from 'utils/renderer';

/**
 * 采购订单类型列表
 * @extends {Component} - React.Component
 * @reactProps {Function} editRow 修改行
 * @reactProps {Function} handleSave 保存行
 * @reactProps {Function} deleteRow 删除行
 * @reactProps {Function} cancelRow 取消行
 * @reactProps {Function} 取消行handleLovOnChange Lov发生改变的回调
 * @reactProps {Object} form 表单
 * @return React.element
 */
export default class DemangTable extends Component {
  /**
   * 渲染是否
   * @param {Boolean} v
   */
  @Bind()
  yesOrNoRender(v) {
    const statusMap = ['default', 'success'];
    return (
      <Badge
        status={statusMap[v]}
        text={v === 1 ? intl.get('hzero.common.status.yes') : intl.get('hzero.common.status.no')}
      />
    );
  }

  render() {
    const { loading, dataSource, pagination, onSearch, handleApplicationTypeCreate } = this.props;
    const columns = [
      {
        title: intl.get(`entity.order.type.applicationTypeCode`).d('申请类型编码'),
        dataIndex: 'prTypeCode',
        width: 150,
      },
      {
        title: intl.get(`entity.order.type.applicationTypeName`).d('申请类型'),
        dataIndex: 'prTypeName',
        width: 220,
      },
      {
        title: intl.get(`sodr.orderType.model.orderType.orderSeq`).d('排序号'),
        dataIndex: 'orderSeq',
        width: 80,
      },
      {
        title: intl.get(`sodr.common.model.common.sourceCode`).d('来源系统'),
        dataIndex: 'sourceCode',
      },
      {
        title: intl.get('hzero.common.status.enable').d('启用'),
        dataIndex: 'enabledFlag',
        width: 80,
        render: this.yesOrNoRender,
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 80,
        fixed: 'right',
        render: (val, record) => (
          <a
            onClick={() => {
              handleApplicationTypeCreate(record);
            }}
          >
            {intl.get('hzero.common.button.edit').d('编辑')}
          </a>
        ),
      },
    ];
    const scrollX = sum(columns.map(n => (isNumber(n.width) ? n.width : 0))) + 300;
    return (
      <Table
        bordered
        loading={loading}
        rowKey="prTypeId"
        columns={columns}
        scroll={{ x: scrollX }}
        dataSource={dataSource}
        pagination={pagination}
        onChange={page => onSearch(page)}
      />
    );
  }
}

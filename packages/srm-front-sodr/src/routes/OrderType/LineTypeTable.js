/*
 * LineTypeTable - 采购行类型列表
 * @date: 2020/04/14 14:49:19
 * @author: mjq <jiaqi.mao@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import React, { Component } from 'react';
import { Table, Badge } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { sum, isNumber } from 'lodash';

import intl from 'utils/intl';
// import { enableRender } from 'utils/renderer';

/**
 * 采购行类型列表
 * @extends {Component} - React.Component
 * @reactProps {Function} editRow 修改行
 * @reactProps {Function} handleSave 保存行
 * @reactProps {Function} deleteRow 删除行
 * @reactProps {Function} cancelRow 取消行
 * @reactProps {Function} 取消行handleLovOnChange Lov发生改变的回调
 * @reactProps {Object} form 表单
 * @return React.element
 */
export default class LineTypeTable extends Component {
  /**
   * 打开编辑弹窗
   * @param {Object} record
   */
  @Bind()
  showEditModal(record) {
    if (this.props.showEditModal) {
      this.props.showEditModal(record);
    }
  }

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
    const { loading, dataSource, pagination, onSearch } = this.props;
    const columns = [
      {
        title: intl.get(`sodr.orderType.model.orderType.purchaseLineTypeCode`).d('采购行类型编码'),
        dataIndex: 'purchaseLineTypeCode',
        width: 150,
      },
      {
        title: intl.get(`sodr.orderType.model.orderType.purchaseLineTypeName`).d('采购行类型描述'),
        dataIndex: 'purchaseLineTypeName',
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
              this.showEditModal(record);
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

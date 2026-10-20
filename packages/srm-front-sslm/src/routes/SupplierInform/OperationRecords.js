/**
 * OperationRecords - 操作记录
 * @date: 2019-12-13
 * @author: WXM <xiaomin.wang01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import { Table } from 'hzero-ui';
import React, { Component } from 'react';

import intl from 'utils/intl';
import { dateTimeRender } from 'utils/renderer';

export default class OperationRecords extends Component {
  componentDidMount() {
    const { onChange } = this.props;
    onChange();
  }

  render() {
    const { dataSource, pagination, onChange, loading } = this.props;
    const columns = [
      {
        title: intl.get('hzero.common.table.column.option').d('操作'),
        dataIndex: 'processStatusMeaning',
        width: 100,
      },
      {
        title: intl.get('sslm.supplierInform.model.supplierInform.operateDes').d('操作描述'),
        dataIndex: 'approveRemark',
        width: 150,
      },
      {
        title: intl.get('sslm.supplierInform.model.supplierInform.operator').d('操作人'),
        dataIndex: 'processUserName',
        width: 150,
      },
      {
        title: intl.get('sslm.supplierInform.model.supplierInform.operationTime').d('操作时间'),
        dataIndex: 'creationDate',
        width: 150,
        render: dateTimeRender,
      },
    ];
    return (
      <Table
        bordered
        loading={loading}
        rowKey="changeRecordId"
        columns={columns}
        dataSource={dataSource}
        pagination={pagination}
        onChange={onChange}
      />
    );
  }
}

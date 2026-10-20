import React, { Component } from 'react';
import { Table, Badge } from 'hzero-ui';

import intl from 'utils/intl';

export default class TableList extends Component {
  render() {
    const {
      pagination,
      list,
      loading,
      onEnable,
      onEditInfo,
      onEditPassword,
      onOpenModal,
      queryAuthorizateList,
    } = this.props;
    const columns = [
      {
        title: intl.get('small.common.customer.code').d('客户代码'),
        dataIndex: 'customerCode',
        width: 100,
      },
      {
        title: intl.get('small.common.model.tenant').d('租户'),
        dataIndex: 'tenantName',
        width: 200,
      },
      {
        title: intl.get('small.common.model.ecommerce').d('电商'),
        dataIndex: 'supplierName',
      },
      {
        title: intl.get('small.common.model.accountNumber').d('账号'),
        dataIndex: 'username',
      },
      {
        title: intl.get('small.common.model.status').d('状态'),
        dataIndex: 'yn',
        render: (val) => (
          <Badge
            status={val ? 'success' : 'error'}
            text={
              val
                ? intl.get('hzero.common.status.enable').d('启用')
                : intl.get('hzero.common.status.disable').d('禁用')
            }
          />
        ),
      },
      {
        title: intl.get('scec.common.table.column.remark').d('备注'),
        dataIndex: 'remark',
      },
      {
        title: intl.get('small.common.button.operating').d('操作'),
        render: (record) => {
          return (
            <span className="action-link">
              <a onClick={() => onEnable(record)}>
                {record.yn === true
                  ? intl.get('small.common.button.disable').d('停用')
                  : intl.get('small.common.button.enable').d('启用')}
              </a>
              <a onClick={() => onEditInfo(record)}>
                {intl.get('small.common.button.add.edit').d('编辑')}
              </a>
              <a onClick={() => onEditPassword(record)}>
                {intl.get('small.common.button.changePassword').d('修改密码')}
              </a>
              <a onClick={() => onOpenModal(record, 'white')}>
                {intl.get('small.common.button.newWhite').d('新增白名单')}
              </a>
              <a onClick={() => onOpenModal(record, 'black')}>
                {intl.get('small.common.button.newBlack').d('新增黑名单')}
              </a>
            </span>
          );
        },
      },
    ];
    return (
      <React.Fragment>
        <Table
          className="small-table-all-space"
          bordered
          rowKey="id"
          columns={columns}
          loading={loading}
          pagination={pagination}
          onChange={(page) => queryAuthorizateList(page)}
          dataSource={list || []}
        />
      </React.Fragment>
    );
  }
}

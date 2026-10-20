/**
 * OperationRecords - 操作记录
 * @date: 2020-06-15
 * @author: LXM <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { Table, Modal } from 'hzero-ui';

import intl from 'utils/intl';
import { dateTimeRender } from 'utils/renderer';

export default class OperationRecords extends Component {
  render() {
    const {
      visible,
      onCancel,
      onChange,
      dataSource = [],
      pagination = {},
      allLoading,
    } = this.props;
    const columns = [
      {
        dataIndex: 'operationCodeMeaning',
        width: 120,
        title: intl.get('hzero.common.table.column.option').d('操作'),
      },
      {
        dataIndex: 'operationDescription',
        title: intl.get('sslm.supplierQuotaManage.modal.quota.operationDesc').d('操作描述'),
      },
      {
        dataIndex: 'realName',
        width: 120,
        title: intl.get('sslm.supplierQuotaManage.modal.quota.operator').d('操作人'),
      },
      {
        dataIndex: 'operatedDate',
        width: 150,
        render: dateTimeRender,
        title: intl.get('sslm.supplierQuotaManage.modal.quota.operateTime').d('操作时间'),
      },
    ];
    return (
      <Modal
        width={600}
        footer={null}
        destroyOnClose
        visible={visible}
        onCancel={onCancel}
        title={intl.get('sslm.supplierQuotaManage.modal.quota.operationRecords').d('操作记录')}
      >
        <Table
          bordered
          rowKey="quotaHistoryId"
          columns={columns}
          dataSource={dataSource}
          pagination={pagination}
          loading={allLoading}
          onChange={onChange}
        />
      </Modal>
    );
  }
}

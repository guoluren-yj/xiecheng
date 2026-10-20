/*
 * @Descripttion:
 * @version: 0.0.1
 * @Author: lilingfeng <lingfeng.li@going-link.com>
 * @Date: 2021-05-31 09:41:50
 * @LastEditors: lilingfeng
 * @LastEditTime: 2021-09-08 17:14:13
 */
import React, { PureComponent } from 'react';
import { Modal } from 'hzero-ui';
import intl from 'utils/intl';
import EditTable from 'components/EditTable';
import { dateTimeRender } from 'utils/renderer';
import { showBigNumber } from '../components/utils';

export default class OperationRecordModal extends PureComponent {
  render() {
    const { loading, dataSource, pagination, visible, onCancel, onFetchOperationList } = this.props;
    const prefix = 'sinv.common.model.common';
    const columns = [
      {
        title: intl.get(`entity.roles.operator`).d('操作人'),
        dataIndex: 'remark',
        width: 100,
      },
      {
        title: intl.get(`${prefix}.operatorDate`).d('操作时间'),
        dataIndex: 'creationDate',
        width: 150,
        render: dateTimeRender,
      },
      {
        title: intl.get(`${prefix}.processStatusMeaning`).d('动作'),
        dataIndex: 'operationCodeMeaning',
        width: 100,
      },
      {
        title: intl.get(`${prefix}.variableQuantity`).d('变动数量'),
        dataIndex: 'variableQuantity',
        width: 80,
        render: (value) => showBigNumber(value),
      },
      {
        title: intl.get(`${prefix}.lastStockQuantity`).d('上一次库存现有量'),
        dataIndex: 'lastStockQuantity',
        width: 120,
        render: (value) => showBigNumber(value),
      },
      {
        title: intl.get(`${prefix}.stockQuantity`).d('库存现有量'),
        dataIndex: 'stockQuantity',
        width: 80,
        render: (value) => showBigNumber(value),
      },
      {
        title: intl.get(`${prefix}.comment`).d('备注'),
        dataIndex: 'comment',
        width: 80,
      },
    ];
    return (
      <Modal
        width={800}
        visible={visible}
        footer={null}
        onCancel={() => onCancel(false)}
        title={intl.get(`${prefix}.operationRecord`).d('操作记录')}
      >
        <EditTable
          bordered
          loading={loading}
          dataSource={dataSource}
          pagination={pagination}
          columns={columns}
          onChange={onFetchOperationList}
        />
      </Modal>
    );
  }
}

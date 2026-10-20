import React, { PureComponent } from 'react';
import { Table, Modal } from 'hzero-ui';
import intl from 'utils/intl';
import { dateTimeRender } from 'utils/renderer';

export default class OperationRecordModal extends PureComponent {
  render() {
    const { loading, dataSource, pagination, visible, onCancel, onFetchOperationList } = this.props;
    const prefix = 'sodr.orderMaintenanceEntry.model.common';
    const columns = [
      {
        title: intl.get(`${prefix}.statusChangeRecord`).d('状态变更记录'),
        children: [
          {
            title: intl.get(`${prefix}.operator`).d('操作人'),
            dataIndex: 'processUserName',
            width: 100,
          },
          {
            title: intl.get(`${prefix}.operationDate`).d('操作日期'),
            dataIndex: 'processedDate',
            width: 150,
            render: dateTimeRender,
          },
          {
            title: intl.get(`${prefix}.operationAction`).d('动作'),
            dataIndex: 'processTypeMeaning',
            width: 100,
          },
          {
            title: intl.get(`${prefix}.operationRemark`).d('说明'),
            dataIndex: 'processRemark',
            width: 150,
          },
          {
            title: intl.get(`${prefix}.versionNumber`).d('版本'),
            dataIndex: 'versionNum',
            width: 80,
          },
        ],
      },
      {
        title: intl.get(`${prefix}.dataChangeRecord`).d('数据变更记录'),
        children: [
          {
            title: intl.get(`${prefix}.changeAction`).d('变更动作'),
            dataIndex: 'changeTypeMeaning',
            width: 100,
          },
          {
            title: intl.get(`${prefix}.lineNumber`).d('行号'),
            dataIndex: 'displayLineNum',
            width: 80,
          },
          {
            title: intl.get(`${prefix}.shipmentNum`).d('发运号'),
            dataIndex: 'displayLineLocationNum',
            width: 90,
          },
          {
            title: intl.get(`${prefix}.changeContent`).d('修改内容'),
            dataIndex: 'changeFieldNameMeaning',
          },
          {
            title: intl.get(`${prefix}.oldValue`).d('修改前'),
            dataIndex: 'oldValue',
            width: 80,
          },
          {
            title: intl.get(`${prefix}.newValue`).d('修改后'),
            dataIndex: 'newValue',
            width: 80,
          },
        ],
      },
    ];
    return (
      <Modal
        width={1300}
        visible={visible}
        footer={null}
        onCancel={() => onCancel(false)}
        title={intl.get(`${prefix}.operationRecord`).d('操作记录')}
      >
        <Table
          bordered
          loading={loading}
          dataSource={dataSource}
          pagination={pagination}
          columns={columns}
          onChange={onFetchOperationList}
          rowKey="poProcessActionId"
        />
      </Modal>
    );
  }
}

import React, { PureComponent } from 'react';
import { Modal, Table } from 'hzero-ui';
import intl from 'utils/intl';
import { dateTimeRender } from 'utils/renderer';

export default class OperatorRecordModal extends PureComponent {
  // componentDidMount() {
  //   console.log('aaa')
  //   const { fetchOperationRecord } = this.props;
  //   fetchOperationRecord();
  // }

  render() {
    const { visible, dataSource, loading, onCancel } = this.props;
    const columns = [
      {
        title: intl.get(`entity.roles.operator`).d('操作人'),
        dataIndex: 'realName',
        width: 100,
      },
      {
        title: intl.get(`hzero.common.components.operationAudit.operatedTime`).d('操作时间'),
        dataIndex: 'processDate',
        width: 150,
        render: dateTimeRender,
      },
      {
        title: intl.get(`hzero.common.actions`).d('动作'),
        dataIndex: 'processStatusMeaning',
        width: 100,
      },
    ];
    return (
      <Modal
        visible={visible}
        footer={null}
        title={intl.get(`hzero.common.button.operating`).d('操作记录')}
        onCancel={onCancel}
        width={800}
      >
        <Table
          bordered
          rowKey="portalAttachmentActionId"
          loading={loading}
          dataSource={dataSource}
          columns={columns}
          pagination={false}
        />
      </Modal>
    );
  }
}

import React, { PureComponent } from 'react';
import { Modal, Table } from 'hzero-ui';
import intl from 'utils/intl';
import { dateTimeRender } from 'utils/renderer';

export default class OperatorRecordModal extends PureComponent {
  componentDidMount() {
    const { fetchOperationRecord } = this.props;
    fetchOperationRecord();
  }

  render() {
    const { visible, dataSource, loading, onCancel } = this.props;
    const columns = [
      {
        title: intl.get(`entity.roles.operator`).d('操作人'),
        dataIndex: 'processUserName',
        width: 100,
      },
      {
        title: intl.get(`spfm.common.model.common.operationTime`).d('操作时间'),
        dataIndex: 'processDate',
        width: 150,
        render: dateTimeRender,
      },
      {
        title: intl.get(`spfm.common.model.common.action`).d('动作'),
        dataIndex: 'processOperationMeaning',
        width: 100,
      },
    ];
    return (
      <Modal
        visible={visible}
        title={intl.get(`hzero.common.button.operating`).d('操作记录')}
        onCancel={onCancel}
        width={800}
      >
        <Table
          bordered
          rowKey="operationHistoryId"
          loading={loading}
          dataSource={dataSource}
          columns={columns}
          pagination={false}
        />
      </Modal>
    );
  }
}

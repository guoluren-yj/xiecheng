import React, { Component } from 'react';
import { Modal, Table } from 'hzero-ui';
import intl from 'utils/intl';
import { dateTimeRender } from 'utils/renderer';
import formatterCollections from 'utils/intl/formatterCollections';

/**
 *
 *
 * @export
 * @class OperationRecModal
 * @extends {Component}
 */
@formatterCollections({
  code: ['sslm.evaluationQuery'],
})
export default class OperationRecModal extends Component {
  render() {
    const { visible, pagination, loading, dataSource, closeModal, onChange } = this.props;
    const columns = [
      {
        title: intl.get(`sslm.evaluationQuery.model.operator`).d('操作人'),
        dataIndex: 'operatedName',
        width: 150,
      },
      {
        title: intl.get(`sslm.evaluationQuery.model.operation.time`).d('操作时间'),
        dataIndex: 'operatedDate',
        width: 160,
        render: dateTimeRender,
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        dataIndex: 'operationCodeMeaning',
        width: 120,
      },
      {
        title: intl.get('sslm.common.model.operate.remark').d('操作说明'),
        dataIndex: 'operatedRemark',
      },
    ];
    return (
      <Modal
        title={intl.get(`sslm.evaluationQuery.model.operation.record`).d('操作记录')}
        visible={visible}
        onCancel={() => closeModal(false)}
        width={700}
        footer={null}
      >
        <Table
          columns={columns}
          dataSource={dataSource}
          bordered
          loading={loading}
          pagination={pagination}
          onChange={onChange}
          rowKey="evalOprHistoryId"
        />
      </Modal>
    );
  }
}

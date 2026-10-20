import React, { Component } from 'react';
import { DataSet, Table } from 'choerodon-ui/pro';
import { Modal } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import { isEmpty } from 'lodash';

import intl from 'utils/intl';
import notification from 'utils/notification';

export default class JumpModal extends Component {
  constructor(props) {
    super(props);
    this.formDs = new DataSet({
      autoCreate: true,
      fields: [
        {
          label: intl.get('hwfp.task.model.task.comment').d('驳回意见'),
          name: 'comment',
          required: true,
        },
      ],
    });
    this.tableDs = new DataSet({
      paging: false,
      selection: 'single',
      fields: [
        { label: intl.get('hwfp.task.model.task.actName').d('节点名称'), name: 'actName' },
        { label: intl.get('hwfp.task.model.task.approver').d('审批人'), name: 'approverName' },
      ],
    });
  }

  componentDidMount() {
    const { jumpList = [] } = this.props;
    this.tableDs.loadData(jumpList);
  }

  @Bind()
  async handleOk() {
    const { onSubmit } = this.props;
    const { selected } = this.tableDs;
    if (isEmpty(selected)) {
      notification.warning({
        message: intl.get('hzero.common.message.confirm.selected.atLeast').d('请至少选择一行数据'),
      });
    } else {
      const { actId, actName, approver } = selected[0].toData();
      onSubmit({
        assignee: approver,
        jumpTarget: actId,
        jumpTargetName: actName,
      });
    }
  }

  render() {
    const { onClose } = this.props;
    return (
      <Modal
        title={intl.get('hwfp.task.view.message.reject').d('指定驳回节点')}
        visible
        width={620}
        onOk={this.handleOk}
        maskClosable={false}
        okButtonProps={{ funcType: 'raised' }}
        cancelButtonProps={{ funcType: 'raised' }}
        onCancel={onClose}
      >
        <Table dataSet={this.tableDs} style={{ margin: '20px 0' }}>
          <Table.Column name="actName" width={150} />
          <Table.Column name="approverName" />
        </Table>
      </Modal>
    );
  }
}

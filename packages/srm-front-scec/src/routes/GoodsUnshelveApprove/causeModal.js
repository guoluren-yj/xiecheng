import React from 'react';
import { Modal } from 'hzero-ui';
import intl from 'utils/intl';

export default class CauseModal extends React.PureComponent {
  render() {
    const { modalVisible, onHandleCancel, recordData } = this.props;
    return (
      <Modal title="下架原因" visible={modalVisible} onCancel={onHandleCancel} footer={null}>
        <span>{intl.get('scec.common.table.column.remark').d('备注')}：</span>
        <span>{recordData.operatedRemark}</span>
      </Modal>
    );
  }
}

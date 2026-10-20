import React from 'react';
import { connect } from 'dva';
import { compose } from 'lodash';
import intl from 'utils/intl';
import { Button, Modal } from 'choerodon-ui/pro';

import MessageDrawer from './MessageDrawer';

const AddButton = (props) => {
  const { formDs, onSaveMessage, dispatch } = props;
  const openModal = () => {
    Modal.open({
      title: intl.get('hpfm.message.view.message.create').d('新建消息'),
      closable: true,
      drawer: true,
      style: { width: 742 },
      children: <MessageDrawer formDs={formDs} />,
      onOk: () => onSaveMessage(),
    });
  };

  /**
   * 新建消息模态框
   */
  const handleAddModal = () => {
    dispatch({
      type: 'message/updateState',
      payload: { messageDetail: {} },
    });
    formDs.reset();
    openModal();
  };

  return (
    <Button
      style={{
        marginLeft: '0.08rem',
      }}
      // funcType='flat'
      icon="add"
      color="primary"
      onClick={handleAddModal}
    >
      {intl.get('hzero.common.button.create').d('新建')}
    </Button>
  );
};

export default compose(
  connect(({ message }) => ({
    message,
  }))
)(AddButton);

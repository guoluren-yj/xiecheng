import React from 'react';
import { Modal } from 'choerodon-ui/pro';

import intl from 'utils/intl';

import Container from './Container';

const useIPDetailModal = () => {
  const openIPDetailModal = (props) => {
    const Props = {
      ...props,
    };

    Modal.open({
      key: Modal.key(),
      title: intl.get('ssrc.common.model.common.IPDetail').d('IP详情'),
      children: <Container {...Props} />,
      style: { width: '742px' },
      drawer: true,
      closable: true,
      okButton: false,
      cancelText: intl.get('hzero.common.button.close').d('关闭'),
      cancelProps: { color: 'primary' },
    });
  };
  return {
    openIPDetailModal,
  };
};

export default useIPDetailModal;

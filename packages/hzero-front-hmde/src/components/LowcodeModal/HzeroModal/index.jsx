import React from 'react';
import { Modal } from 'hzero-ui';
import globalStyles from '@/lowcodeGlobalStyles/global.less';

const HzeroModal = (props) => (
  <Modal {...props} wrapClassName={`lowcode-m-modal ${globalStyles['lowcode-m-modal']}`}>
    {props.children}
  </Modal>
);

export default HzeroModal;

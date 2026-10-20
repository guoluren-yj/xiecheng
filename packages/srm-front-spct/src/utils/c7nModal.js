import { Modal } from 'choerodon-ui/pro';

// 封装通用c7nModal
export default function c7nModal(modalProps = {}) {
  return Modal.open({
    movable: false,
    closable: true,
    mask: true,
    maskClosable: true,
    destroyOnClose: true,
    drawer: true,
    ...modalProps,
  });
}

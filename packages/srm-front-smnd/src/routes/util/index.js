import { Modal } from 'choerodon-ui/pro';

// 封装通用c7nModal
export function c7nModal(modalProps = {}) {
  return Modal.open({
    movable: false,
    mask: true,
    maskClosable: false,
    destroyOnClose: true,
    drawer: true,
    key: Modal.key(),
    ...modalProps,
  });
}

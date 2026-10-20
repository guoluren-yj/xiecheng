import { Modal } from 'choerodon-ui/pro';

function c7nModal(modalProps = {}) {
  return Modal.open({
    movable: false,
    closable: true,
    mask: true,
    maskClosable: false,
    destroyOnClose: true,
    drawer: true,
    ...modalProps,
  });
}

export { c7nModal };

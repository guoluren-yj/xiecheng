import Modal from './Modal';
import confirm from './confirm';
import type { ActionButtonProps } from './ActionButton';
import type { ModalProps, ModalFuncProps } from './Modal';

export type { ActionButtonProps, ModalProps, ModalFuncProps };

Modal.info = function (props: ModalFuncProps) {
  const config = {
    type: 'info',
    iconType: 'info',
    okCancel: false,
    ...props,
  };
  return confirm(config);
};

Modal.success = function (props: ModalFuncProps) {
  const config = {
    type: 'success',
    iconType: 'check_circle',
    okCancel: false,
    ...props,
  };
  return confirm(config);
};

Modal.error = function (props: ModalFuncProps) {
  const config = {
    type: 'error',
    iconType: 'cancel',
    okCancel: false,
    ...props,
  };
  return confirm(config);
};

Modal.warn = function (props: ModalFuncProps) {
  const config = {
    type: 'warning',
    iconType: 'info',
    okCancel: false,
    ...props,
  };
  return confirm(config);
};

Modal.warning = Modal.warn;

Modal.confirm = function (props: ModalFuncProps) {
  const config = {
    type: 'confirm',
    okCancel: true,
    ...props,
  };
  return confirm(config);
};

export default Modal;

import type { FunctionComponent } from 'react';
import React from 'react';
import type { ModalProps as C7NModalProps } from 'choerodon-ui/lib/modal/Modal';
import type { ModalFunc, ModalFuncProps, ModalLocale } from 'choerodon-ui/lib/modal/Modal';
import C7NModal from 'choerodon-ui/lib/modal';
import C7NButtonProps from '../button/overwriteProps';

export interface ModalProps extends Omit<C7NModalProps, 'center'> {
  autoCenter?: boolean;
}

export type {
  ModalFunc, ModalFuncProps, ModalLocale,
};

const Modal: FunctionComponent<ModalProps> = function Modal(props) {
  const { autoCenter, okButtonProps, cancelButtonProps, ...rest } = props;
  return (
    <C7NModal
      prefixCls="ant-modal"
      maskClosable
      center={autoCenter}
      movable={false}
      {...rest}
      okButtonProps={okButtonProps ? {
        ...C7NButtonProps,
        ...okButtonProps,
      } : C7NButtonProps}
      cancelButtonProps={cancelButtonProps ? {
        ...C7NButtonProps,
        ...cancelButtonProps,
      } : C7NButtonProps}
    />
  );
};

Modal.displayName = 'Modal<hzeroWithC7n>';

type ModalType = typeof Modal & {
  info: ModalFunc;
  success: ModalFunc;
  error: ModalFunc;
  warn: ModalFunc;
  warning: ModalFunc;
  confirm: ModalFunc;
}

export default Modal as ModalType;

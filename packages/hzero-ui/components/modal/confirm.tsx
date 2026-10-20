import c7nConfirm from 'choerodon-ui/lib/modal/confirm';
import type { ModalFuncProps } from './Modal';
import C7NButtonProps from '../button/overwriteProps';

export default function confirm(config: ModalFuncProps) {
  return c7nConfirm({
    prefixCls: 'ant-confirm',
    modalPrefixCls: 'ant-modal',
    okButtonProps: C7NButtonProps,
    cancelButtonProps: C7NButtonProps,
    ...config,
    iconType: config.iconType || 'help',
  });
}

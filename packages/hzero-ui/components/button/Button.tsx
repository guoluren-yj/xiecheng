import type { ForwardRefExoticComponent } from 'react';
import React, { forwardRef } from 'react';
import { Size } from 'choerodon-ui/lib/_util/enum';
import type {
  AnchorButtonProps,
  BaseButtonProps,
  ButtonFuncType,
  ButtonHTMLType,
  ButtonProps,
  ButtonShape,
  ButtonType,
  NativeButtonProps,
} from 'choerodon-ui/lib/button/Button';
import C7NButton from 'choerodon-ui/lib/button';
import Group from './ButtonGroup';
import Icon from '../icon';
import C7NButtonProps from './overwriteProps';

function renderIcon(type: string) {
  return <Icon type={type} />;
}

export {
  Size as ButtonSize,
};

export type {
  BaseButtonProps,
    AnchorButtonProps,
    NativeButtonProps,
    ButtonProps,
    ButtonFuncType,
    ButtonShape,
    ButtonType,
    ButtonHTMLType,
};

const Button: ForwardRefExoticComponent<ButtonProps> = forwardRef<C7NButton, ButtonProps>((props, ref) => {
  return <C7NButton {...C7NButtonProps} renderIcon={renderIcon} {...props} ref={ref} />;
});

Button.displayName = 'Button<hzeroWithC7n>';

type ButtonComponent = typeof Button & {
  Group: typeof Group;
  __ANT_BUTTON: boolean;
}

(Button as ButtonComponent).Group = Group;
(Button as ButtonComponent).__ANT_BUTTON = true;

export default Button as ButtonComponent;

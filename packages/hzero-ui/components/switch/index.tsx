import type { ForwardRefExoticComponent } from 'react';
import React, { forwardRef } from 'react';
import C7NSwitch from 'choerodon-ui/lib/switch';
import type { SwitchProps } from 'choerodon-ui/lib/switch';

export type {
  SwitchProps,
};

const Switch: ForwardRefExoticComponent<SwitchProps> = forwardRef<C7NSwitch, SwitchProps>((props, ref) => {
  return <C7NSwitch prefixCls="ant-switch" {...props} ref={ref} />;
});

Switch.displayName = 'Switch<hzeroWithC7n>';

export default Switch;

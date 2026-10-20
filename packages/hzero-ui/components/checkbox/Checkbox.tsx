import type { ForwardRefExoticComponent } from 'react';
import React, { forwardRef } from 'react';
import type {
  AbstractCheckboxProps,
  CheckboxChangeEvent,
  CheckboxChangeEventTarget,
  CheckboxProps,
} from 'choerodon-ui/lib/checkbox/Checkbox';
import C7NCheckbox from 'choerodon-ui/lib/checkbox';
import CheckboxGroup from './Group';

export type {
  AbstractCheckboxProps, CheckboxChangeEvent, CheckboxChangeEventTarget, CheckboxProps,
};

const Checkbox: ForwardRefExoticComponent<CheckboxProps> = forwardRef<C7NCheckbox, CheckboxProps>((props, ref) => {
  return <C7NCheckbox prefixCls="ant-checkbox" {...props} ref={ref} />;
});

Checkbox.displayName = 'Checkbox<hzeroWithC7n>';

type CheckboxType = typeof Checkbox & { Group: typeof CheckboxGroup };

(Checkbox as CheckboxType).Group = CheckboxGroup;

export default Checkbox as CheckboxType;

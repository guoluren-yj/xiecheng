import type { ForwardRefExoticComponent } from 'react';
import React, { forwardRef } from 'react';
import type C7NCheckboxGroupType from 'choerodon-ui/lib/checkbox/Group';
import type {
  AbstractCheckboxGroupProps,
  CheckboxGroupContext,
  CheckboxGroupProps,
  CheckboxGroupState,
  CheckboxOptionType,
  CheckboxValueType,
} from 'choerodon-ui/lib/checkbox/Group';
import C7NCheckbox from 'choerodon-ui/lib/checkbox';

const C7NCheckboxGroup = C7NCheckbox.Group;

export type {
  CheckboxValueType,
  CheckboxGroupContext,
  CheckboxOptionType,
  AbstractCheckboxGroupProps,
  CheckboxGroupProps,
  CheckboxGroupState,
};

const CheckboxGroup: ForwardRefExoticComponent<CheckboxGroupProps> = forwardRef<C7NCheckboxGroupType, CheckboxGroupProps>((props, ref) => {
  return <C7NCheckboxGroup prefixCls="ant-checkbox-group" checkboxPrefixCls="ant-checkbox" {...props} ref={ref} />;
});

export default CheckboxGroup;

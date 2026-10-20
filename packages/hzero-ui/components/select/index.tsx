import type { ForwardRefExoticComponent } from 'react';
import React, { forwardRef } from 'react';
import C7NSelect from 'choerodon-ui/lib/select';
import type {
  AbstractSelectProps,
  LabeledValue,
  OptGroupProps,
  OptionProps,
  SelectLocale,
  SelectProps,
  SelectValue,
} from 'choerodon-ui/lib/select';
import C7NSelectProps from './overwriteProps';

const { OptGroup, Option } = C7NSelect;

export { OptGroup, Option };

export type {
  AbstractSelectProps, LabeledValue, OptGroupProps, OptionProps, SelectLocale, SelectProps, SelectValue,
};

const Select: ForwardRefExoticComponent<SelectProps> = forwardRef<C7NSelect, SelectProps>((props, ref) => {
  return <C7NSelect {...C7NSelectProps} {...props} ref={ref} />;
});

Select.displayName = 'Select<hzeroWithC7N>';

type SelectType = typeof Select & { Option: typeof Option; OptGroup: typeof OptGroup, SECRET_COMBOBOX_MODE_DO_NOT_USE: string };

(Select as SelectType).Option = Option;
(Select as SelectType).OptGroup = OptGroup;
(Select as SelectType).SECRET_COMBOBOX_MODE_DO_NOT_USE = 'SECRET_COMBOBOX_MODE_DO_NOT_USE';

export default Select as SelectType;

import type { ForwardRefExoticComponent } from 'react';
import React, { forwardRef } from 'react';
import type { RadioChangeEvent, RadioGroupButtonStyle, RadioGroupProps, RadioGroupState } from 'choerodon-ui/lib/radio/interface';
import { Group } from 'choerodon-ui/lib/radio';

export type {
  RadioChangeEvent, RadioGroupButtonStyle, RadioGroupProps, RadioGroupState,
};

const RadioGroup: ForwardRefExoticComponent<RadioGroupProps> = forwardRef<Group, RadioGroupProps>((props, ref) => {
  return <Group prefixCls="ant-radio" {...props} ref={ref} />;
});

RadioGroup.displayName = 'RadioGroup<hzeroWithC7n>';

export default RadioGroup;

import type { ForwardRefExoticComponent } from 'react';
import React, { forwardRef } from 'react';
import C7NTimerPicker, { generateShowHourMinuteSecond } from 'choerodon-ui/lib/time-picker';
import type { TimePickerLocale, TimePickerProps } from 'choerodon-ui/lib/time-picker';

export { generateShowHourMinuteSecond };
export type { TimePickerProps, TimePickerLocale };

const TimePicker: ForwardRefExoticComponent<TimePickerProps> = forwardRef<C7NTimerPicker, TimePickerProps>((props, ref) => {
  return <C7NTimerPicker prefixCls="ant-time-picker" component="input" {...props} ref={ref} />;
});

TimePicker.displayName = 'TimePicker<hzeroWithC7n>';

export default TimePicker;

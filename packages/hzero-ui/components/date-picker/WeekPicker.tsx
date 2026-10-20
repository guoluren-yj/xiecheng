import * as React from 'react';
import type { FunctionComponent } from 'react';
import { ViewMode } from 'choerodon-ui/pro/lib/date-picker/enum';
import DatePicker from './DatePicker';
import type { DatePickerProps } from './interface';

const WeekPicker: FunctionComponent<DatePickerProps> = props => (
  <DatePicker {...props} c7nMode={ViewMode.week} />
);

WeekPicker.displayName = 'WeekPicker<hzeroWithC7n>';

export default WeekPicker;

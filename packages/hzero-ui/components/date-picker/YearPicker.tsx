import * as React from 'react';
import type { FunctionComponent } from 'react';
import { ViewMode } from 'choerodon-ui/pro/lib/date-picker/enum';
import DatePicker from './DatePicker';
import type { DatePickerProps } from './interface';

const YearPicker: FunctionComponent<DatePickerProps> = props => (
  <DatePicker {...props} c7nMode={ViewMode.year} />
);

YearPicker.displayName = 'YearPicker<hzeroWithC7n>';

export default YearPicker;

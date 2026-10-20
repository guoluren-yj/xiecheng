import wrapPicker from './wrapPicker';
import RangePicker from './RangePicker';
import WeekPicker from './WeekPicker';
import HDatePicker from './DatePicker';
import YearPicker from './YearPicker';
import MonthPicker from './MonthPicker';

const DatePicker = wrapPicker(HDatePicker as any);

Object.assign(DatePicker, {
  RangePicker: wrapPicker(RangePicker as any),
  YearPicker: wrapPicker(YearPicker as any),
  MonthPicker: wrapPicker(MonthPicker as any),
  WeekPicker: wrapPicker(WeekPicker as any),
});

export default DatePicker;

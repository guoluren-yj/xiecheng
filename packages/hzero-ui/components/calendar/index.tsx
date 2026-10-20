import type { FunctionComponent } from 'react';
import React from 'react';
import C7NCalendar from 'choerodon-ui/lib/calendar';
import type { CalendarMode, CalendarProps, CalendarState, HeaderProps } from 'choerodon-ui/lib/calendar';
import { PREFIX_CLS } from './Constants';
import C7NSelectProps from '../select/overwriteProps';

export type {
  CalendarProps,
  CalendarMode,
  CalendarState,
  HeaderProps,
};

const Calendar: FunctionComponent<CalendarProps> = function Calendar(props) {
  return <C7NCalendar prefixCls={PREFIX_CLS} {...props} selectProps={C7NSelectProps} radioProps={{ prefixCls: 'ant-radio' }} />;
};

Calendar.displayName = 'Calendar<hzeroWithC7n>';

export default Calendar;

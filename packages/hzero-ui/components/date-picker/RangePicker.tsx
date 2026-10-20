import * as React from 'react';
import type { FunctionComponent} from 'react';
import { useMemo } from 'react';
import { ViewMode } from 'choerodon-ui/pro/lib/date-picker/enum';
import isArray from 'lodash/isArray';
import DatePicker from './DatePicker';
import type { RangePickerProps } from './interface';

function transformRangeMode(mode?: string | string[]): ViewMode | undefined {
  if (isArray(mode)) {
    return transformRangeMode(mode[0]);
  }
  switch (mode) {
    case 'time':
      return ViewMode.time;
    case 'month':
      return ViewMode.month;
    case 'year':
      return ViewMode.year;
    case 'date':
      return ViewMode.date;
    default:
      return undefined;
  }
}

const RangePicker: FunctionComponent<RangePickerProps> = (props) => {
  const { mode, placeholder = [], locale } = props;
  const dateInputPlaceholder: [string, string] = useMemo(() => {
    const startPlaceholder = ('placeholder' in props)
      ? placeholder[0] : locale.lang.rangePlaceholder[0];
    const endPlaceholder = ('placeholder' in props)
      ? placeholder[1] : locale.lang.rangePlaceholder[1];
    return [startPlaceholder, endPlaceholder];
  }, [locale, placeholder]);
  return (
    <DatePicker {...props} range c7nMode={transformRangeMode(mode)} placeholder={dateInputPlaceholder} />
  );
};

RangePicker.displayName = 'RangePicker<hzeroWithC7n>';

export default RangePicker;

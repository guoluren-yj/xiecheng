import type { FunctionComponent} from 'react';
import React, { cloneElement, useCallback, useEffect, useRef, useState } from 'react';
import { action, reaction } from 'mobx';
import classNames from 'classnames';
import type { Moment } from 'moment';
import moment from 'moment';
import isArray from 'lodash/isArray';
import type { DatePickerProps as C7NDatePickerProps } from 'choerodon-ui/pro/lib/date-picker/DatePicker';
import C7NDatePicker from 'choerodon-ui/pro/lib/date-picker';
import { ViewMode } from 'choerodon-ui/pro/lib/date-picker/enum';
import type { DatePickerProps, DisabledTimeConfig, RangePickerProps } from './interface';
import transformSize from '../_util/transformSize';

const defaultDisabledTime = {
  disabledHours() {
    return [];
  },
  disabledMinutes() {
    return [];
  },
  disabledSeconds() {
    return [];
  },
};

function transformMode(mode: string | string[] | undefined, c7nMode: ViewMode): ViewMode {
  if (isArray(mode)) {
    [mode] = mode;
  }
  if (mode) {
    switch (mode) {
      case 'year':
        return ViewMode.year;
      case 'month':
        return ViewMode.month;
      case 'week':
        return ViewMode.week;
      case 'time':
        return ViewMode.time;
      default:
    }
  }
  return c7nMode;
}

const DatePicker: FunctionComponent<(DatePickerProps | RangePickerProps) & { c7nMode?: ViewMode, range?: boolean, processValue?: (value: any) => any, showFormat?: string }> = (props) => {
  const {
    onChange, defaultValue, format, showFormat, locale, showTime, mode: hZeroMode,
    placeholder = (showTime ? locale.timePickerLocale.placeholder : locale.lang.placeholder),
    disabled, open, size, onOpenChange, allowClear, className, style, popupStyle, dropdownClassName,
    renderExtraFooter, disabledDate, disabledTime, c7nMode = showTime ? ViewMode.dateTime : ViewMode.date, range,
    dateRender,
    processValue,
  } = props;
  const mode = transformMode(hZeroMode, c7nMode);
  const pickerRef = useRef<C7NDatePicker>(null);
  const [disabledTimeConfig, setDisabledTimeConfig] = useState<DisabledTimeConfig | undefined>();
  const handleChange = useCallback((value) => {
    if (onChange) {
      const { current } = pickerRef;
      const currentFormat = format || (current ? current.getDateFormat() : format);
      onChange(value, isArray(value) ? value.map(v => (v && v.format(currentFormat)) || '') : (value && value.format(currentFormat)) || '');
    }
  }, [onChange, pickerRef, format]);
  const handlePopupHiddenChange = useCallback((hidden) => {
    if (onOpenChange) {
      onOpenChange(!hidden);
    }
  }, [onOpenChange]);
  const handleRenderCell = useCallback(viewMode => (
    dateRender && viewMode === mode
      ? ((cellProps: { children?: any }, text: string, currentDate: Moment) => {
        const inner = dateRender(currentDate, moment()) || text;
        return (
          <td {...cellProps}>
            {cellProps.children ? cloneElement(cellProps.children, { children: inner }) : inner}
          </td>
        );
      }) : undefined
  ), [mode, dateRender]);
  const handleFilter = useCallback((current, _selected, viewMode) => {
    if (disabledDate && viewMode !== ViewMode.time) {
      const start = current.clone();
      const end = current.clone();
      switch (viewMode) {
        case ViewMode.decade:
          return !disabledDate(
            end
              .endOf('y')
              .add(9 - (end.year() % 10), 'y')
              .endOf('d'),
          ) || !disabledDate(
            start
              .startOf('y')
              .subtract(start.year() % 10, 'y')
              .startOf('d'),
          );
        case ViewMode.month:
          return !disabledDate(end.endOf('M')) || !disabledDate(start.startOf('M'));
        case ViewMode.year:
          return !disabledDate(end.endOf('y')) || !disabledDate(start.startOf('y'));
        case ViewMode.dateTime:
          return !disabledDate(end.endOf('d')) || !disabledDate(start.startOf('d'));
        default:
          return !disabledDate(end);
      }
    }
    if (disabledTimeConfig && viewMode === ViewMode.time) {
      const hour = current.hour();
      const minutes = current.minute();
      const seconds = current.second();
      const config = {
        ...defaultDisabledTime,
        ...disabledTimeConfig,
      };
      const disabledHours = config.disabledHours();
      if (disabledHours.indexOf(hour) !== -1) {
        return false;
      }
      const disabledMinutes = config.disabledMinutes(hour);
      if (disabledMinutes.indexOf(minutes) !== -1) {
        return false;
      }
      const disabledSeconds = config.disabledSeconds(hour, minutes);
      return disabledSeconds.indexOf(seconds) === -1;
    }
    return true;
  }, [disabledDate, disabledTime, disabledTimeConfig]);
  const pickerProps: C7NDatePickerProps = {
    size: transformSize(size),
    className: classNames(className, 'ant-calendar-picker', {
      'ant-calendar-picker-lg': size === 'large',
      'ant-calendar-picker-sm': size === 'small',
    }),
    elementClassName: 'ant-input',
    popupCls: dropdownClassName,
    style,
    popupStyle,
    defaultValue,
    processValue,
    disabled,
    placeholder,
    clearButton: allowClear,
    // @ts-ignore
    defaultTime: typeof showTime === 'object' ? showTime.defaultValue : undefined,
    renderExtraFooter,
    range,
    mode,
    useInvalidDate: false,
    showFormat,
  };
  if ('value' in props) {
    pickerProps.value = props.value;
  }
  if (onChange) {
    pickerProps.onChange = handleChange;
  }
  if (onOpenChange) {
    pickerProps.onPopupHiddenChange = handlePopupHiddenChange;
  }
  if (disabledDate || disabledTime) {
    pickerProps.filter = handleFilter;
  }
  if (dateRender) {
    pickerProps.cellRenderer = handleRenderCell;
  }
  useEffect(action(() => {
    const { current } = pickerRef;
    if (current && open !== undefined) {
      current.statePopup = open;
    }
  }), [pickerRef, open]);

  useEffect(() => {
    const { current } = pickerRef;
    if (current && disabledTime) {
      setDisabledTimeConfig(disabledTime(current.getSelectedDate(), current.rangeTarget ? 'end' : 'start'));
      if (range) {
        const dispose = reaction(() => current.rangeTarget, (rangeTarget) => {
          setDisabledTimeConfig(disabledTime(current.getSelectedDate(), rangeTarget ? 'end' : 'start'));
        });
        return () => {
          dispose();
        };
      }
    }
  }, [pickerRef, disabledTime, range]);

  return (
    <C7NDatePicker {...pickerProps} ref={pickerRef} />
  );
};

DatePicker.displayName = 'DatePicker<hzeroWithC7n>';

export default DatePicker;

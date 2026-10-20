/**
 * 时间相关
 * @date: 2019-12-25
 * @author: wjc <jiacheng.wang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import moment from 'moment';

import { DEFAULT_DATE_FORMAT, DEFAULT_DATETIME_FORMAT, DEFAULT_TIME_FORMAT, GMT2ETCMap } from '../constants';
import { newArray } from './common';
import { getCurrentUser } from './user';


export function getDateMonthFormat() {
  const { dateFormat = DEFAULT_DATE_FORMAT } = getCurrentUser();
  let monthFormat = dateFormat.replace(/d/gi, '').replace('//', '/').replace('--', '-');
  if (['-', '/'].includes(monthFormat.charAt(0))) {
    monthFormat = monthFormat.slice(1);
  }
  if (['-', '/'].includes(monthFormat.charAt(0))) {
    monthFormat = monthFormat.slice(1);
  }
  if (['-', '/'].includes(monthFormat.charAt(monthFormat.length - 1))) {
    monthFormat = monthFormat.slice(0, monthFormat.length - 1);
  }
  return monthFormat;
}

/**
 * 获取日期(date)格式化字符串
 *
 * @export
 * @returns
 */
export function getDateFormat() {
  const { dateFormat = DEFAULT_DATE_FORMAT } = getCurrentUser();
  return dateFormat;
}

/**
 * 获取日期(dateTime)格式化字符串
 * @export
 * @returns
 */
export function getDateTimeFormat() {
  const { dateTimeFormat = DEFAULT_DATETIME_FORMAT } = getCurrentUser();
  return dateTimeFormat;
}

/**
 * 获取时间(time)格式化字符串
 * @export
 * @returns
 */
export function getTimeFormat() {
  const { timeFormat = DEFAULT_TIME_FORMAT } = getCurrentUser();
  return timeFormat;
}

/**
 * 获取当前设置的时区
 */
export function getTimeZone() {
  const { timeZone } = getCurrentUser();
  return timeZone;
}

/**
 * 生成 antd 的时间禁用支持函数
 * @param {String|Moment} data - 时间日期字符串
 * @param {String} type - 类型，可选 start, end
 */
export function disabledTime(data, type = 'start') {
  const DATE_FORMAT = 'YYYY-MM-DD';
  const timepoint = moment(data);
  const hour = timepoint.hour();
  const minute = timepoint.minute();
  const second = timepoint.second();

  return curDate => {
    const curHour = curDate && curDate.hour();
    const curMinute = curDate && curDate.minute();

    if (curDate && curDate.format(DATE_FORMAT) === timepoint.format(DATE_FORMAT)) {
      return {
        disabledHours() {
          if (type === 'end') {
            if (minute === 0 && second === 0) {
              return newArray(hour, 24);
            }
            return newArray(hour + 1, 24);
          }
          if (minute === 59 && second === 59) {
            return newArray(0, hour + 1);
          }
          return newArray(0, hour);
        },
        disabledMinutes() {
          if (curHour === hour) {
            if (type === 'end') {
              if (second === 0) {
                return newArray(minute, 60);
              }
              return newArray(minute + 1, 60);
            }
            if (second === 59) {
              return newArray(0, minute + 1);
            }
            return newArray(0, minute);
          }
          return [];
        },
        disabledSeconds() {
          if (curHour === hour && curMinute === minute) {
            if (type === 'end') {
              return newArray(second, 60);
            }
            return newArray(0, second + 1);
          }
          return [];
        },
      };
    }
  };
}

export function getLocaleDateOffset(localeDate) {
  if (localeDate) {
    return new Date().getTime() - new Date(localeDate).getTime();
  }
  return 0;
}

export function getLocaleDate() {
  const { localeDateOffset } = getCurrentUser();
  const localeDate = new Date().getTime() - localeDateOffset;
  const date = formarDateToString(new Date(localeDate));
  return date;
}

export function formarDateToString(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();
  const _format = v => v < 10 ? `0${v}` : v;
  return `${year}-${_format(month)}-${_format(day)} ${_format(hour)}:${_format(minute)}:${_format(second)}`;
}
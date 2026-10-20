import React, { useEffect, useState } from 'react';
import moment from 'moment';
import classNames from 'classnames';
import { Icon } from 'choerodon-ui';

import styles from './index.less'; // 可选，用于样式

const MonthDayPicker = props => {
  const { defaultSelected = [], onSelect = () => {} } = props;

  const [selectedDates, setSelectedDates] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(moment().month()); // 当前月份

  const getDateIn2024 = date => moment(date).year(2024);

  useEffect(() => {
    if (defaultSelected && defaultSelected.length) {
      setSelectedDates(defaultSelected);
    }
  }, [defaultSelected]);

  // 处理日期选择
  const handleDateClick = date => {
    const dateStr = date.format('MM-DD');
    let list = [];
    if (selectedDates.includes(dateStr)) {
      // 如果已经选中，则取消选择
      list = selectedDates.filter(d => d !== dateStr);
    } else {
      // 否则添加到选中列表
      list = [...selectedDates, dateStr];
    }
    setSelectedDates(list);
    onSelect(list);
  };

  // 渲染星期几标题
  const renderWeekdays = () => {
    const weekdays = moment.weekdaysMin(); // 获取简写的星期几（如 "一", "二"）
    return weekdays.map(weekday => (
      <div key={weekday} className={styles.weekday}>
        {weekday}
      </div>
    ));
  };

  // 渲染日历
  const renderCalendar = () => {
    const startOfMonth = getDateIn2024(moment().month(currentMonth)).startOf('month');
    const endOfMonth = getDateIn2024(moment().month(currentMonth)).endOf('month');
    const daysInMonth = endOfMonth.diff(startOfMonth, 'days') + 1;

    const calendar = [];
    // eslint-disable-next-line prefer-const
    let currentDay = startOfMonth.clone();

    // 填充上个月的空白（如果需要）
    const startDayOfWeek = currentDay.day(); // 当前月份的第一天是星期几
    for (let i = 0; i < startDayOfWeek; i++) {
      calendar.push(
        <div key={`empty-${i}`} className={classNames(styles['calendar-day'], styles.empty)} />
      );
    }

    for (let i = 0; i < daysInMonth; i++) {
      const dateStr = currentDay.format('MM-DD');

      const thisDate = currentDay.clone();

      const isSelected = selectedDates.includes(dateStr);

      const classes = classNames(styles['calendar-day'], isSelected ? styles.selected : '');

      calendar.push(
        <div key={dateStr} className={classes} onClick={() => handleDateClick(thisDate)}>
          {currentDay.format('D')}
        </div>
      );
      currentDay.add(1, 'day');
    }

    return calendar;
  };

  // 切换月份
  const handleMonthChange = offset => {
    setCurrentMonth(prevMonth => {
      const newMonth = prevMonth + offset;
      // 确保月份在 0 - 11 之间
      return (newMonth + 12) % 12;
    });
  };

  return (
    <div className={styles['month-day-picker']}>
      <div className={styles['month-controls']}>
        <Icon
          type="navigate_before"
          style={{ color: '#000', cursor: 'pointer' }}
          onClick={() => handleMonthChange(-1)}
        />
        <span>{getDateIn2024(moment().month(currentMonth)).format('MMMM')}</span>
        <Icon
          type="navigate_next"
          style={{ color: '#000', cursor: 'pointer' }}
          onClick={() => handleMonthChange(1)}
        />
      </div>
      <div>
        <div
          className={styles['calendar-grid']}
          style={{ borderBottom: '1px solid rgba(0,0,0,0.08)' }}
        >
          {renderWeekdays()}
        </div>
        <div className={styles['calendar-grid']}>{renderCalendar()}</div>
      </div>
    </div>
  );
};

export default MonthDayPicker;

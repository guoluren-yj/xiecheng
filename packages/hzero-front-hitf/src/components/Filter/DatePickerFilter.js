import React, { useState, useEffect } from 'react';
import { Output, DatePicker } from 'choerodon-ui/pro';
import { Icon } from 'choerodon-ui';
import intl from 'hzero-front/lib/utils/intl';
import moment from 'moment';

import styles from './index.less';

/**
 * 高级查询-日期
 */

export default function DatePickerFilter(props) {
  const {
    title,
    startTitle,
    endTitle,
    filterName,
    datePickerAfter,
    datePickerBefore,
    onSearch,
    dataSet,
  } = props;
  const initialValue = dataSet.current.toData()[filterName];
  const [datePickerStatus, setDatePickerStatus] = useState(false);
  const [startTimeValue, setStartTimeValue] = useState(
    initialValue ? moment(initialValue[datePickerAfter]).format('YYYY-MM-DD') : null
  );
  const [endTimeValue, setEndTimeValue] = useState(
    initialValue ? moment(initialValue[datePickerBefore]).format('YYYY-MM-DD') : null
  );

  useEffect(() => {
    dataSet.addEventListener('reset', handleFieldsValue);
  }, []);

  const handleFieldsValue = () => {
    setStartTimeValue(null);
    setEndTimeValue(null);
  };

  const setDatePickerValue = (value) => {
    onSearch();
    setStartTimeValue(
      value && value[datePickerAfter] ? moment(value[datePickerAfter]).format('YYYY-MM-DD') : null
    );
    setEndTimeValue(
      value && value[datePickerBefore] ? moment(value[datePickerBefore]).format('YYYY-MM-DD') : null
    );
  };

  const handleDatePicker = () => {
    return (
      <div
        // eslint-disable-next-line
        tabIndex="0"
        className={`${styles['filter-condition']}`}
        style={{
          position: 'relative',
          backgroundColor: datePickerStatus ? 'rgba(0,0,0,0.05)' : '',
        }}
        onFocus={() => setDatePickerStatus(true)}
      >
        <div className={styles['filter-condition-title']}>{title}</div>
        {/* 没有日期值时不显示 */}
        {(startTimeValue || endTimeValue) && (
          <>
            <div
              style={{
                display: 'flex',
              }}
            >
              <div
                // eslint-disable-next-line
                tabIndex="0"
                onFocus={() => setDatePickerStatus(true)}
                style={{
                  margin: '0 6px 0 0',
                  color: startTimeValue ? '' : 'rgba(0,0,0,0.25)',
                }}
                className={styles['filter-condition-value']}
              >
                {startTimeValue || startTitle}
              </div>
              <span>{intl.get('hitf.common.to').d('至')}</span>
              <div
                // eslint-disable-next-line
                tabIndex="0"
                onFocus={() => setDatePickerStatus(true)}
                style={{
                  margin: '0 0 0 6px',
                  color: endTimeValue ? '' : 'rgba(0,0,0,0.25)',
                }}
                className={styles['filter-condition-value']}
              >
                {endTimeValue || endTitle}
              </div>
            </div>
          </>
        )}
        <Icon
          type="date_range-o"
          className={styles['filter-condition-icon']}
          style={{ margin: '1px 2px 0', fontSize: '13px' }}
        />
        {/* 日期选择 */}
        {datePickerStatus && (
          <div
            className={styles['filter-condition-datePicker']}
            onBlur={() => setDatePickerStatus(false)}
          >
            <DatePicker
              name={filterName}
              autoFocus
              placeholder={[startTitle, endTitle]}
              onChange={setDatePickerValue}
              popupStyle={{
                marginTop: '-3px',
                width: '360px',
              }}
            />
          </div>
        )}
      </div>
    );
  };

  return <Output renderer={handleDatePicker} />;
}

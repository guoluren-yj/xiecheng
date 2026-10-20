/**
 * dropDown 类型 日期选择框
 */
import React, { useState, useRef, useEffect, useImperativeHandle } from 'react';
import { Icon, DatePicker } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import moment from 'moment';

import './index.less';

export const stylePrefix = 'c7n-pro-table-search-bar';

const DropDownPicker = React.forwardRef((props, ref) => {
  const {
    title = intl.get('sdps.cloudWarehouse.view.label.selectDate').d('选择日期'),
    onChange = () => {},
    defaultValue = [],
    format = 'YYYY-MM-DD',
    onlyKey = '',
  } = props;

  const pickerRef = useRef(null);
  const [inputVal, setVal] = useState('');
  const [pickerVal, setPickerVal] = useState(null);
  const [showIcon, setShowIcon] = useState(false);

  useEffect(() => {
    if (defaultValue && Array.isArray(defaultValue) && defaultValue.length === 2) {
      setVal(
        `${defaultValue[0]} ${intl.get('srm.filterBar.view.message.rangTo').d('至')} ${
          defaultValue[1]
        }`
      );
      setPickerVal([
        moment(defaultValue[0]).format(format),
        moment(defaultValue[1]).format(format),
      ]);
    }
  }, [defaultValue]);

  const handleChange = (value) => {
    const val1 =
      value && Array.isArray(value) && value.length && value[0] ? value[0].format(format) : '';
    const val2 =
      value && Array.isArray(value) && value.length === 2 && value[1]
        ? value[1].format(format)
        : '';

    const valStr =
      val1 || val2
        ? `${val1} ${intl.get('srm.filterBar.view.message.rangTo').d('至')} ${val2}`
        : '';

    setVal(valStr);
    onChange([val1, val2]);
    setPickerVal([moment(val1).format(format), moment(val2).format(format)]);
  };

  const handleFocus = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (pickerRef && pickerRef.current) {
      if (pickerRef.current.focus) {
        pickerRef.current.focus();
      }
      if (pickerRef.current.handleFocus) {
        pickerRef.current.handleFocus();
      }
    }
  };

  const handleClear = (event) => {
    event.preventDefault();
    event.stopPropagation();

    setPickerVal([]);
    setVal(null);
    onChange([]);
  };

  const resetValue = () => {
    setPickerVal([]);
    setVal('');
  };

  /**
   * 下拉框关闭 触发 onChange 事件
   * @param {*} hidden
   */
  const handlePopupFieldEditorHidden = (hidden) => {
    if (hidden) {
      setTimeout(() => {
        // 调用失焦以触发onChange
        if (pickerRef && pickerRef.current && pickerRef.current.blur) {
          pickerRef.current.blur();
        }
      }, 0);
    }
  };

  useImperativeHandle(ref, () => ({
    resetValue: () => resetValue(),
  }));

  return (
    <div
      ref={ref}
      tabIndex="-1"
      id={`sdps-common-picker-${onlyKey}`}
      className="picker-drop-down"
      style={{ marginLeft: '20px' }}
      onClick={handleFocus}
      onMouseEnter={() => setShowIcon(true)}
      onMouseLeave={() => setShowIcon(false)}
    >
      <span style={{ verticalAlign: 'middle' }}>{title}</span>
      <span className="picker-value-span">{inputVal}</span>
      <DatePicker
        range
        editorInPopup
        placeholder={[
          intl.get('srm.filterBar.view.placeholder.startDate').d('开始日期'),
          intl.get('srm.filterBar.view.placeholder.endDate').d('结束日期'),
        ]}
        ref={pickerRef}
        value={pickerVal}
        className="picker-input-area"
        onChange={handleChange}
        onPopupHiddenChange={handlePopupFieldEditorHidden}
        getPopupAlignTarget={() => document.getElementById(`sdps-common-picker-${onlyKey}`)}
      />
      <span className="picker-clear-span">
        {showIcon && inputVal ? (
          <Icon style={{ cursor: 'pointer' }} type="close" onClick={handleClear} />
        ) : (
          <Icon style={{ cursor: 'pointer' }} type="date_range-o" />
        )}
      </span>
    </div>
  );
});

export default DropDownPicker;

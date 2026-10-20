import React, { useRef, useState, useEffect, useImperativeHandle } from 'react';
import { Lov, Icon } from 'choerodon-ui/pro';

import './index.less';

const LovDropDown = React.forwardRef((props, ref) => {
  const { onChange, lovDS, title = '', textField = 'tenantName', fieldName } = props;

  const [showIcon, setShowIcon] = useState(false);
  const [inputVal, setVal] = useState('');

  const lovSearchRef = useRef(null);

  useEffect(() => {
    return () => {
      resetValue();
    };
  }, []);

  const handleChange = (record = {}) => {
    const val = record && record[textField] ? record[textField] : '';
    setVal(val);
    onChange(record);
  };

  const handleFocus = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (lovSearchRef && lovSearchRef.current) {
      if (lovSearchRef.current.focus) {
        lovSearchRef.current.focus();
      }
      if (lovSearchRef.current.handleFocus) {
        lovSearchRef.current.handleFocus();
      }
    }
  };

  const handleClear = (event) => {
    event.preventDefault();
    event.stopPropagation();

    resetValue();
  };

  const resetValue = () => {
    setVal('');
    if (lovSearchRef && lovSearchRef.current) {
      if (lovSearchRef.current.clear) {
        lovSearchRef.current.clear();
      }
      if (lovSearchRef.current.handleClear) {
        lovSearchRef.current.handleClear();
      }
    }
  };

  useImperativeHandle(ref, () => ({
    resetValue: () => resetValue(),
  }));

  return (
    <>
      <span
        ref={ref}
        className="lov-drop-down"
        tabIndex="-2"
        style={{ marginLeft: '20px' }}
        onClick={handleFocus}
        onMouseEnter={() => setShowIcon(true)}
        onMouseLeave={() => setShowIcon(false)}
      >
        <span style={{ verticalAlign: 'middle' }}>{title}</span>
        <span className="lov-value-span">{inputVal}</span>
        <span className="lov-clear-span">
          {showIcon && inputVal ? (
            <Icon style={{ cursor: 'pointer' }} type="close" onClick={handleClear} />
          ) : (
            <Icon style={{ cursor: 'pointer' }} type="search" />
          )}
        </span>
      </span>
      <span className="drop-down-lovSpan">
        <Lov
          isFlat
          ref={lovSearchRef}
          clearButton
          viewMode="popup"
          name={fieldName}
          dataSet={lovDS}
          onChange={handleChange}
        />
      </span>
    </>
  );
});

export default LovDropDown;

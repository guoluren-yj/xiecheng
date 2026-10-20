import React, { useState, useEffect } from 'react';
import { Icon } from 'choerodon-ui/pro';
import classNames from 'classnames';

import styles from './index.less';

export default function SwitchBox(props) {
  const {
    value,
    disabled,
    options = [],
    textField = 'meaning',
    valueField = 'value',
    defaultValue,
    onChange = (e) => e,
  } = props;
  const [selectKey, setSelectKey] = useState(defaultValue);
  useEffect(() => setSelectKey(value), [value]);
  return (
    <div className={styles['switch-box-container']}>
      {options.map((m) => (
        <div
          className={classNames({
            'switch-box-option': true,
            'switch-box-option-disabled': disabled,
            'switch-box-option-selected': selectKey === m[valueField],
          })}
          onClick={() => {
            if (!disabled) {
              setSelectKey(m[valueField]);
              onChange(m[valueField]);
            }
          }}
        >
          <span className="switch-box-option-text">{m[textField]}</span>
          {selectKey === m[valueField] && <div className="switch-box-option-check" />}
          {selectKey === m[valueField] && <Icon type="done" />}
        </div>
      ))}
    </div>
  );
}

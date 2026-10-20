import React from 'react';
import { Radio } from 'choerodon-ui/pro';

import styles from './index.less';

export default function SwitchBox(props) {
  const {
    value,
    title,
    disabled,
    readOnly,
    readText,
    options = [],
    textField = 'meaning',
    valueField = 'value',
    onChange = (e) => e,
  } = props;

  return (
    <div className={styles['switch-box-container']}>
      <div className="switch-box-title">{title}</div>
      {readOnly ? (
        <span className="dimension-all-read">{readText}</span>
      ) : (
        options.map((m) => (
          <Radio
            value={m[valueField]}
            disabled={disabled}
            key={m[valueField]}
            checked={value === m[valueField]}
            onChange={() => {
              if (!disabled) {
                onChange(m[valueField]);
              }
            }}
          >
            {m[textField]}
          </Radio>
        ))
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Output, TextField } from 'choerodon-ui/pro';
import { Icon } from 'choerodon-ui';
import styles from './index.less';

export default function TextFieldFilter(props) {
  const { title, filterName, onSearch, dataSet, defaultValue, placeholder = '' } = props;
  const [focusStatus, setFocusStatus] = useState(false);
  const [textFieldValue, setTextFieldValue] = useState('');

  useEffect(() => {
    dataSet.addEventListener('reset', handleFieldsValue);
  }, []);

  const handleFieldsValue = () => {
    setTextFieldValue('');
  };

  const changeValue = (value) => {
    onSearch();
    setTextFieldValue(value);
  };

  useEffect(() => {
    if (dataSet.current) {
      const value = dataSet.current.get(filterName);
      if (value) {
        setTextFieldValue(value);
      }
    }
  }, [defaultValue]);

  const handleTextField = () => {
    return (
      <div
        // eslint-disable-next-line
        tabIndex="0"
        className={`${styles['filter-condition']} ${
          focusStatus ? styles['filter-condition-focus'] : ''
        }`}
        onFocus={() => setFocusStatus(true)}
        style={{ position: 'relative' }}
      >
        <div className={styles['filter-condition-title']}>{title}</div>
        {!focusStatus && <div className={styles['filter-condition-value']}>{textFieldValue}</div>}
        {focusStatus && (
          <TextField
            className={styles['text-field-filter-content']}
            autoFocus
            name={filterName}
            onChange={(value, oldValue) => changeValue(value, oldValue)}
            onBlur={() => setFocusStatus(false)}
            placeholder={placeholder}
            clearButton
          />
        )}
        <Icon className={styles['filter-condition-icon']} type="expand_more" />
      </div>
    );
  };

  return <Output renderer={handleTextField} />;
}

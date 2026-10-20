import React, { useState, useRef, useEffect } from 'react';
import { Output, TextField } from 'choerodon-ui/pro';
import { Icon, Popover } from 'choerodon-ui';

import styles from './index.less';

/**
 * 高级查询-文本框
 */
export default function TextFieldFilter(props) {
  const { title, filterName, onSearch, dataSet } = props;
  const initialValue = dataSet.current.toData()[filterName];
  const [textStatus, setTextStatus] = useState(false);
  const [textValue, setTextValue] = useState(initialValue || '');
  const textTarget = useRef(null);

  useEffect(() => {
    dataSet.addEventListener('reset', handleFieldsValue);
  }, []);

  const handleFieldsValue = () => {
    setTextValue('');
  };

  const changeTextValue = (value) => {
    setTextValue(value);
    onSearch();
  };

  const contentRender = () => {
    return (
      <TextField
        autoFocus
        name={filterName}
        onChange={changeTextValue}
        onBlur={() => setTextStatus(false)}
      />
    );
  };

  const handleText = () => {
    return (
      <Popover trigger="click" placement="bottom" content={contentRender()}>
        <div
          // eslint-disable-next-line
          tabIndex="0"
          className={`${styles['filter-condition']} ${
            textStatus ? styles['filter-condition-focus'] : ''
          }`}
          onFocus={() => setTextStatus(true)}
          ref={textTarget}
        >
          <div className={styles['filter-condition-title']}>{title}</div>
          <div className={styles['filter-condition-value']}>{textValue}</div>
          <Icon className={styles['filter-condition-icon']} type="expand_more" />
        </div>
      </Popover>
    );
  };

  return <Output renderer={handleText} />;
}

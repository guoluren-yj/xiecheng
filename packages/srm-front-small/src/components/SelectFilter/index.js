import React, { useState, useRef, useEffect } from 'react';
import { Output, Select } from 'choerodon-ui/pro';
import { Icon } from 'choerodon-ui';

import styles from './index.less';

/**
 * 高级查询-下拉：下拉选项动态获取
 */
const { Option } = Select;
export default function SelectFilter(props) {
  const {
    title,
    filterName,
    selectList,
    onSearch,
    dataSet,
    isFirst,
    defaultValue,
    valueName,
  } = props;
  const [selectStatus, setSelectStatus] = useState(false);
  const [valueStatus, setValueStatus] = useState(true);
  const [selectValue, setSelectValue] = useState('');
  const selectTarget = useRef(null);

  useEffect(() => {
    dataSet.addEventListener('reset', handleFieldsValue);
  }, []);

  useEffect(() => {
    if (isFirst) {
      setSelectValue(selectList?.[0]?.[filterName]);
    }
    if (defaultValue) {
      setSelectValue(defaultValue?.[filterName]);
    }
  }, [selectList]);

  const handleFieldsValue = () => {
    setSelectValue('');
  };

  const changeSelectValue = (value, oldValue, processStatusList) => {
    if (
      (value === null && JSON.stringify(oldValue) === '[]') ||
      (JSON.stringify(value) === '[]' && oldValue === null)
    ) {
      return;
    }
    const findObj = processStatusList.find((i) => i?.[valueName] === value);
    setSelectValue(findObj?.[filterName]);
    setValueStatus(false);
    onSearch(value);
  };

  const handleSelect = () => {
    return (
      <div
        // eslint-disable-next-line
        tabIndex="0"
        className={`${styles['filter-condition']} ${
          selectStatus ? styles['filter-condition-focus'] : ''
        }`}
        onFocus={() => setSelectStatus(true)}
        ref={selectTarget}
      >
        <div className={styles['filter-condition-title']}>{title}</div>
        {valueStatus && <div className={styles['filter-condition-value']}>{selectValue}</div>}
        {selectStatus && (
          <Select
            isFlat
            autoFocus
            clearButton={false}
            name={filterName}
            getPopupAlignTarget={() => {
              return selectTarget.current;
            }}
            onChange={(value, oldValue) => changeSelectValue(value, oldValue, selectList)}
            onBlur={() => {
              setSelectStatus(false);
              setValueStatus(true);
            }}
          >
            {selectList.map((item) => (
              <Option value={item.value} key={item.key}>
                {item.title}
              </Option>
            ))}
          </Select>
        )}
        <Icon className={styles['filter-condition-icon']} type="expand_more" />
      </div>
    );
  };

  return <Output style={{ display: 'inline-block' }} renderer={handleSelect} />;
}

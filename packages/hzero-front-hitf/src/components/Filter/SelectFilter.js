import React, { useState, useRef, useEffect } from 'react';
import { Output, Select } from 'choerodon-ui/pro';
import { Icon } from 'choerodon-ui';

import styles from './index.less';

/**
 * 高级查询-下拉：下拉选项动态获取
 */
const { Option } = Select;
export default function SelectFilter(props) {
  const { title, filterName, selectList, onSearch, dataSet } = props;
  const initialValue = dataSet.current.toData()[filterName];
  const [selectStatus, setSelectStatus] = useState(false);
  const [selectValue, setSelectValue] = useState('');
  const selectTarget = useRef(null);

  useEffect(() => {
    dataSet.addEventListener('reset', handleFieldsValue);
    if (initialValue) {
      selectList.forEach((item) => {
        if (item.value === initialValue) {
          setSelectValue(item.title);
        }
      });
    }
  }, []);

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
    onSearch();
    const selectTitle = [];
    processStatusList.map((item) => {
      if (
        value !== null &&
        ((typeof value === 'object' && value.indexOf(item.value) > -1) || value === item.value)
      ) {
        selectTitle.push(item.title);
      }
      return selectTitle;
    });
    setSelectValue(selectTitle.join(','));
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
        {!selectStatus && <div className={styles['filter-condition-value']}>{selectValue}</div>}
        {selectStatus && (
          <Select
            isFlat
            autoFocus
            name={filterName}
            getPopupAlignTarget={() => {
              return selectTarget.current;
            }}
            onChange={(value, oldValue) => changeSelectValue(value, oldValue, selectList)}
            onBlur={() => setSelectStatus(false)}
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

  return <Output renderer={handleSelect} />;
}

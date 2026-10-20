import React, { useState, useRef, useEffect } from 'react';
import { Output, TreeSelect } from 'choerodon-ui/pro';
import { Icon } from 'choerodon-ui';

import styles from './index.less';

/**
 * 高级查询-树形下拉：下拉选项动态获取
 */
export default function SelectFilter(props) {
  const { title, filterName, onSearch, dataSet } = props;
  const [selectStatus, setSelectStatus] = useState(false);
  const [selectValue, setSelectValue] = useState(dataSet.current.get('bannerName') || '');
  const selectTarget = useRef(null);

  useEffect(() => {
    dataSet.addEventListener('reset', handleFieldsValue);
  }, []);

  const handleFieldsValue = () => {
    setSelectValue('');
  };

  const changeSelectValue = (value, oldValue) => {
    if (
      (value === null && JSON.stringify(oldValue) === '[]') ||
      (JSON.stringify(value) === '[]' && oldValue === null)
    ) {
      return;
    }
    onSearch();
    setSelectValue(dataSet.current.get('bannerName'));
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
          <TreeSelect
            isFlat
            autoFocus
            dataSet={dataSet}
            name={filterName}
            getPopupAlignTarget={() => {
              return selectTarget.current;
            }}
            onChange={(value, oldValue) => changeSelectValue(value, oldValue)}
            onBlur={() => setSelectStatus(false)}
          />
        )}
        <Icon className={styles['filter-condition-icon']} type="expand_more" />
      </div>
    );
  };

  return <Output renderer={handleSelect} />;
}

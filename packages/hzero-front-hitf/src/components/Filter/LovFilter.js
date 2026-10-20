import React, { useState, useRef, useEffect } from 'react';
import { Output, Lov } from 'choerodon-ui/pro';
import { Icon } from 'choerodon-ui';
import { isString, isArray } from 'lodash';
import { lovQueryAxiosConfig } from 'srm-front-boot/lib/utils/c7nUiConfig';

import styles from './index.less';

/**
 * 高级查询-值集
 */

export default function LovFilter(props) {
  const { title, filterName, lovField, onSearch, dataSet } = props;
  const initialValue = dataSet.current.toData()[filterName];
  const [lovStatus, setLovStatus] = useState(false);
  const [lovTitle, setLovTitle] = useState(initialValue ? initialValue[lovField] : '');
  const lovModal = useRef(null);
  const lovTarget = useRef(null);

  useEffect(() => {
    dataSet.addEventListener('reset', handleFieldsValue);
  }, []);

  const handleFieldsValue = () => {
    setLovTitle('');
  };

  const changeLovTitle = (value, oldValue) => {
    if (
      (value === null && JSON.stringify(oldValue) === '[]') ||
      (JSON.stringify(value) === '[]' && oldValue === null)
    ) {
      return;
    }
    onSearch();
    // 清空lov值时，value值变为null
    setLovTitle(value && value[lovField] ? value[lovField] : '');
  };

  const getLovQueryAxiosConfig = (code, config, options) => {
    const axiosConfig = lovQueryAxiosConfig(code, config);
    return {
      ...axiosConfig,
      headers: {
        ...axiosConfig.headers,
        ...options.headers,
      },
    };
  };

  const handleLovSearchMatcherChange = (searchFieldName) => {
    const searchField = dataSet ? dataSet.getField(filterName) : '';
    searchField.set('lovQueryAxiosConfig', (code, config) =>
      getLovQueryAxiosConfig(code, config, {
        headers: {
          's-lov-view-code':
            filterName === 'startedUserLov' ? 'HPFM.EMPLOYEE' : 'HWFP.PROCESS_DOCUMENT',
          's-lov-display-field': searchFieldName,
        },
      })
    );
  };

  const handleLov = () => {
    return (
      <div
        // eslint-disable-next-line
        tabIndex="0"
        className={`${styles['filter-condition']} ${
          lovStatus ? styles['filter-condition-focus'] : ''
        }`}
        onFocus={() => setLovStatus(true)}
        ref={lovTarget}
      >
        <div className={styles['filter-condition-title']}>{title}</div>
        {!lovStatus && <div className={styles['filter-condition-value']}>{lovTitle}</div>}
        {lovStatus && (
          <Lov
            isFlat
            name={filterName}
            autoFocus
            clearButton
            ref={lovModal}
            searchAction="input"
            onChange={changeLovTitle}
            onBlur={() => setLovStatus(false)}
            viewMode="popup"
            searchFieldInPopup
            searchFieldProps={{
              multiple: true,
            }}
            paramMatcher={({ key, text }) => ({
              [`${key}`]: isString(text) ? text : isArray(text) ? text.join(',') : '',
            })}
            getPopupAlignTarget={() => {
              return lovTarget.current;
            }}
            onSearchMatcherChange={handleLovSearchMatcherChange}
          />
        )}
        <Icon className={styles['filter-condition-icon']} type="expand_more" />
      </div>
    );
  };

  return <Output renderer={handleLov} />;
}

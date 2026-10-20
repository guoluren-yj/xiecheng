import React, { useState, useRef, useEffect } from 'react';
import { Output, Lov, Tooltip } from 'choerodon-ui/pro';
import { Icon } from 'choerodon-ui';
import { isString, isArray } from 'lodash';
import { lovQueryAxiosConfig } from 'srm-front-boot/lib/utils/c7nUiConfig';
import styles from './index.less';

/**
 * 高级查询-值集
 */

export default function LovFilter(props) {
  const {
    title,
    filterName,
    lovField,
    onSearch,
    dataSet,
    defaultValue = '',
    multiple = true,
  } = props;
  const [lovStatus, setLovStatus] = useState(false);
  const [lovTitle, setLovTitle] = useState('');
  const [searchMatcher, setSearchMatcher] = useState();
  const lovModal = useRef(null);
  const lovTarget = useRef(null);
  useEffect(() => {
    dataSet.addEventListener('reset', handleFieldsValue);
    return () => {
      dataSet.removeEventListener('reset', () => {});
    };
  }, []);

  // 默认值显示，用于链接跳转时加筛选条件
  useEffect(() => {
    if (dataSet.current) {
      const value = dataSet.current.toData()[filterName];
      if (multiple) {
        setLovTitle(value.map((v) => v[lovField]));
      } else {
        setLovTitle(value ? value[lovField] : '');
      }
    }
  }, [defaultValue]);

  const handleFieldsValue = () => {
    setLovTitle('');
  };

  const changeLovTitle = (value, oldValue) => {
    if (
      multiple &&
      ((value === null && JSON.stringify(oldValue) === '[]') ||
        (JSON.stringify(value) === '[]' && oldValue === null))
    ) {
      return;
    }
    onSearch();
    // 清空lov值时，value值变为null
    if (Array.isArray(value)) {
      setLovTitle(value.map((v) => v[lovField] || ''));
    } else {
      setLovTitle(value && value[lovField] ? value[lovField] : '');
    }
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
    setSearchMatcher(searchFieldName);
    const searchField = dataSet?.getField(filterName);
    searchField.set('lovQueryAxiosConfig', (code, config) =>
      getLovQueryAxiosConfig(code, config, {
        headers: {
          's-lov-view-code': ['startedUserLov', 'assignLov'].includes(filterName)
            ? 'HWFP.EMPLOYEE'
            : 'HWFP.PROCESS_DOCUMENT',
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
        {!lovStatus && (
          <div className={styles['filter-condition-value']}>
            {Array.isArray(lovTitle) ? (
              <Tooltip arrowPointAtCenter title={lovTitle.join(', ')} placement="top">
                {lovTitle.map((_title, index) => (
                  <span>
                    {_title}
                    {index < lovTitle.length - 1 ? ',' : ''}
                  </span>
                ))}
              </Tooltip>
            ) : (
              lovTitle
            )}
          </div>
        )}
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
              // placeholder: intl.get('hwfp.common.model.apply.owner').d('申请人'),
            }}
            searchMatcher={searchMatcher}
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

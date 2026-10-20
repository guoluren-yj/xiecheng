/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2022-05-24 17:10:43
 * @LastEditors: yanglin
 * @LastEditTime: 2022-07-14 20:52:11
 */
import React, { useEffect } from 'react';
import { Table, TextField, useDataSet, Tooltip } from 'choerodon-ui/pro';
import { Divider, Icon } from 'choerodon-ui';
import { isEmpty } from 'lodash';
import intl from 'utils/intl';
import classnames from 'classnames';
import formatterCollections from 'utils/intl/formatterCollections';
import { searchInputDS } from './store';
import styles from './index.less';

const noop = () => {};

const Index = (props) => {
  const {
    dataSet,
    columns,
    queryFieldsLimit,
    suffixes,
    prefixes,
    fuzzyQueryCode,
    fuzzyQueryPlaceholder,
    fuzzyQueryName,
    fuzzyQuery = true, // 是否开启模糊查询
    onQuery = noop,
    onReset = noop,
    onBeforeQuery = noop,
    className = '',
    ...otherProps
  } = props;

  const renderCustomLeft = () => {
    if (isEmpty(prefixes)) {
      return null;
    }
    return (
      <>
        {prefixes}
        <Divider type="vertical" style={{ background: '#ccc' }} />
      </>
    );
  };

  const searchInputDs = useDataSet(() => searchInputDS({ fuzzyQueryCode }), [
    fuzzyQueryCode,
    dataSet,
  ]);

  const renderFuzzyQueryInput = () => {
    if (isEmpty(fuzzyQueryCode)) {
      return null;
    }

    const queryPlaceholder =
      fuzzyQueryPlaceholder ||
      intl
        .get('srm.filterBar.view.message.mergeSearchPlaceholder', { name: fuzzyQueryName })
        .d(`请输入${fuzzyQueryName}`);
    return (
      <span>
        <Tooltip title={queryPlaceholder}>
          <TextField
            dataSet={searchInputDs}
            name={fuzzyQueryCode}
            clearButton
            placeholder={queryPlaceholder}
            prefix={<Icon type="search" />}
          />
        </Tooltip>
      </span>
    );
  };

  const renderHeaderLeft = () => {
    if (isEmpty(prefixes) && isEmpty(fuzzyQueryCode)) {
      return null;
    }
    return [
      <div>
        {renderCustomLeft()}
        {renderFuzzyQueryInput()}
      </div>,
    ];
  };

  useEffect(() => {
    const handleUpdate = ({ name, value }) => {
      if (name === fuzzyQueryCode) {
        dataSet.setQueryParameter(name, value);
        dataSet.query();
      }
    };

    searchInputDs.addEventListener('update', handleUpdate);
    return () => {
      searchInputDs.removeEventListener('update', handleUpdate);
    };
  }, [searchInputDs, dataSet]);

  useEffect(() => {
    dataSet.addEventListener('query', onBeforeQuery);
    return () => {
      dataSet.removeEventListener('query', onBeforeQuery);
    };
  }, [dataSet]);

  return (
    <Table
      style={{ maxHeight: 'calc(100% - 120px)' }}
      {...otherProps}
      boxSizing="wrapper"
      className={classnames(className, styles['filter-bar-table'])}
      dataSet={dataSet}
      columns={columns}
      queryBar="filterBar"
      queryFieldsLimit={queryFieldsLimit || 3}
      border={false}
      queryBarProps={{
        dynamicFilterBar: {
          suffixes: suffixes || null,
          prefixes: renderHeaderLeft(),
        },
        fuzzyQuery,
        onReset,
        onQuery,
      }}
    />
  );
};

export default formatterCollections({
  code: ['srm.filterBar'],
})(Index);

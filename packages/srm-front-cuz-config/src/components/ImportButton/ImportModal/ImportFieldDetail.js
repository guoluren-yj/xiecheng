import React, { useState, useEffect, useMemo, useCallback } from 'react';
import classnames from 'classnames';
import { DataSet, Table, Tooltip } from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';
import intl from 'utils/intl';

import PopoverField, { PopoverFieldType } from '@/components/PopoverField';
import { fieldFilterFormDS, ImportFieldTableDs, ImportStatusRenderer } from './util';
import styles from '../index.less';

const ImportFieldDetail = ({
  isSearchBarUnit,
  fieldList = [],
  filterLogList = [],
  custTypeObj = {},
}) => {
  const importFieldTableDs = useMemo(() => new DataSet(ImportFieldTableDs()), []);
  const importFieldFromDs = useMemo(() => new DataSet(fieldFilterFormDS()), []);
  const importSearchBarTableDs = useMemo(() => new DataSet(ImportFieldTableDs()), []);
  const importSearchBarFormDs = useMemo(() => new DataSet(ImportFieldTableDs()), []);

  const [currentFilterCode, setCurrentFilterCode] = useState(null);
  const [activeTabKey, setActiveTabKey] = useState('field');
  useEffect(() => {
    importFieldTableDs.loadData(fieldList);
  }, [fieldList]);

  useEffect(() => {
    let newData = [];
    if (filterLogList.length > 0) {
      const target = filterLogList.find(item => item.filterCode === currentFilterCode);
      if (target) {
        newData = target.filterFieldLogList || [];
      }
    }
    importSearchBarTableDs.loadData(newData);
  }, [currentFilterCode]);

  useEffect(() => {
    if (filterLogList.length > 0) {
      setCurrentFilterCode(filterLogList[0].filterCode);
      importSearchBarTableDs.loadData(filterLogList[0].filterFieldLogList);
    }
  }, [filterLogList]);

  useEffect(() => {
    importFieldFromDs.addEventListener('update', handleFieldFormUpdate);
    if (isSearchBarUnit) {
      importSearchBarFormDs.addEventListener('update', handleSearchBarFormUpdate);
    }
    return () => {
      importFieldFromDs.removeEventListener('update', handleFieldFormUpdate);
      if (isSearchBarUnit) {
        importSearchBarFormDs.removeEventListener('update', handleSearchBarFormUpdate);
      }
    };
  }, [importFieldFromDs, importFieldTableDs, currentFilterCode]);

  const filterData = (record, data) => {
    const { status, fieldName, fieldCode, model } = record.get([
      'status',
      'fieldName',
      'fieldCode',
      'model',
    ]);
    if (!data.length) {
      return [];
    }
    if (!status && !fieldName && !fieldCode && !model) {
      return data;
    }
    return data.filter(item => {
      let flag = true;
      if (status) {
        flag = item.status && item.status === status;
      }
      if (flag && fieldName) {
        if (item.fieldName) {
          flag = item.fieldName.includes(fieldName);
        } else if (item.fieldAlias) {
          flag = item.fieldAlias.includes(fieldName);
        }
      }
      if (flag && fieldCode) {
        flag = item.fieldCode && item.fieldCode.includes(fieldCode);
      }
      if (flag && model) {
        flag = item.modelName && item.modelName.includes(model);
      }
      return flag;
    });
  };

  const handleFieldFormUpdate = ({ record }) => {
    importFieldTableDs.loadData(filterData(record, fieldList));
  };

  const handleSearchBarFormUpdate = ({ record }) => {
    if (filterLogList.length > 0) {
      const filter = filterLogList.find(item => item.filterCode === currentFilterCode);
      if (filter) {
        importSearchBarTableDs.loadData(filterData(record, filter.filterFieldLogList));
      }
    }
  };

  const handleClickSearchBar = useCallback(filterCode => {
    if (filterCode && filterCode !== currentFilterCode) {
      // 第一次先清空保证右侧区域重新渲染
      setTimeout(() => setCurrentFilterCode(null));
      setTimeout(() => setCurrentFilterCode(filterCode));
    }
  }, []);

  const renderStatusIcon = (status = 'warn') => {
    const StatusType = {
      pass: intl.get('hpfm.individual.import.status.pass').d('成功'),
      error: intl.get('hpfm.individual.import.status.error').d('失败'),
      warn: intl.get('hpfm.individual.import.status.warn').d('异常'),
    };
    const color = {
      pass: '#47B881',
      error: '#F56349',
      warn: '#FCA000',
    };
    if (!status) {
      return;
    }
    return (
      <span className={styles['list-item-icon']} style={{ color: color[status] }}>
        {ImportStatusRenderer(status)}
        {StatusType[status]}
      </span>
    );
  };

  const tableCols = useCallback(
    (flag = false) => [
      {
        name: 'status',
        width: 100,
        renderer: ({ value }) => renderStatusIcon(value),
      },
      {
        name: 'fieldName',
        width: 200,
        renderer: ({ value, record }) => (
          <div className={styles['field-info']}>
            <div>
              {record.get('custType') && (
                <Tag
                  color={
                    record.get('custType') === 'STD' ? 'rgba(0,0,0,0.06)' : 'rgba(252,160,0,0.10)'
                  }
                  style={{
                    color: record.get('custType') === 'STD' ? 'rgba(0,0,0,0.65)' : '#FCA000',
                  }}
                >
                  {custTypeObj[record.get('custType')]}
                </Tag>
              )}
              <span className='field-name'>{value}</span>
            </div>
            <div>{record.get('fieldCode') || record.get('fieldAlias')}</div>
          </div>
        ),
      },
      { name: 'modelName', width: 200, hidden: flag },
      { name: 'message', tooltip: 'overflow' },
    ],
    [custTypeObj]
  );

  const renderFieldDetail = useCallback(
    (formDataSet, tableDataSet, flag) => {
      return (
        <div className={styles['history-detail']}>
          <div style={{ margin: '0 0 8px' }}>
            <PopoverField
              type={PopoverFieldType.select}
              options={[
                {
                  value: 'pass',
                  meaning: intl.get('hpfm.individual.import.status.success').d('成功'),
                },
                {
                  value: 'warn',
                  meaning: intl.get('hpfm.individual.import.status.warn').d('异常'),
                },
                {
                  value: 'error',
                  meaning: intl.get('hpfm.individual.import.status.error').d('失败'),
                },
              ]}
              dataSet={formDataSet}
              name="status"
              label={intl.get('hpfm.individual.import.status').d('状态')}
            />
            <PopoverField
              dataSet={formDataSet}
              name="fieldName"
              label={intl.get('hpfm.individual.import.fieldName').d('字段名称')}
            />
            <PopoverField
              dataSet={formDataSet}
              name="fieldCode"
              label={intl.get('hpfm.individual.import.fieldCode').d('字段编码')}
            />
            <PopoverField
              dataSet={formDataSet}
              name="model"
              label={intl.get('hpfm.individual.import.model').d('所属模型')}
            />
          </div>
          <Table
            className={styles['list-table']}
            style={{maxHeight: "calc(100% - 80px)"}}
            rowHeight={40}
            dataSet={tableDataSet}
            columns={tableCols(flag)}
          />
        </div>
      );
    },
    [custTypeObj]
  );

  return !isSearchBarUnit ? (
    renderFieldDetail(importFieldFromDs, importFieldTableDs)
  ) : (
    <div className={styles['detail-tabs']}>
      <div className={styles['tabs-title']}>
        <span
          key="field"
          className={classnames({
            [styles['tabs-title-active']]: activeTabKey === 'field',
          })}
          onClick={() => setActiveTabKey('field')}
        >
          {intl.get('hpfm.individual.import.fieldDetail').d('字段明细')}
        </span>
        <span
          key="searchBar"
          className={classnames({
            [styles['tabs-title-active']]: activeTabKey === 'searchBar',
          })}
          onClick={() => setActiveTabKey('searchBar')}
        >
          {intl.get('hpfm.individual.import.searchBarDetail').d('筛选器明细')}
        </span>
      </div>

      <div
        className={styles['tab-content']}
        style={{ display: activeTabKey !== 'field' ? 'none' : '', overflow: 'auto', flex: 1 }}
      >
        {renderFieldDetail(importFieldFromDs, importFieldTableDs)}
      </div>
      <div
        className={styles['tab-content']}
        style={{
          display: activeTabKey !== 'searchBar' ? 'none' : 'flex',
          overflow: 'hidden',
          flex: 1,
        }}
      >
        <div className={styles['search-bar-list']}>
          <div className={styles['search-bar-list-title']}>
            {intl.get('hpfm.individual.import.searchBarList').d('快速筛选列表')}
          </div>
          <div>
            {filterLogList.map(item => (
              <div
                className={classnames(styles['search-bar-list-item'], {
                  [styles['search-bar-list-item-active']]: item.filterCode === currentFilterCode,
                })}
                onClick={() => handleClickSearchBar(item.filterCode)}
              >
                <div>
                  {ImportStatusRenderer(item.status)}
                  <span>{item.filterName}</span>
                </div>
                {item.message && (
                  <Tooltip title={item.message}>
                    <div className={styles['search-bar-list-item-error']}>{item.message}</div>
                  </Tooltip>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className={styles['search-bar-detail']}>
          {currentFilterCode &&
            renderFieldDetail(importSearchBarFormDs, importSearchBarTableDs, true)}
        </div>
      </div>
    </div>
  );
};

export default ImportFieldDetail;

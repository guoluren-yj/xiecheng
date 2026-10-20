/**
 * 表单查询Form
 */
import React, { useEffect, useState } from 'react';
import { TextField, Icon } from 'choerodon-ui/pro';
import intl from 'utils/intl';

import SortSelector from '@/components/SortSelector';
import PopoverTextField from '@/components/PopoverTextField';

import styles from './index.less';

let queryParam = {}; // 查询条件

const FilterBar = (props) => {
  const { onQuery = () => {} } = props;

  const [inputVal, setInput] = useState('');
  // const [inputTopicVal, setTopic] = useState('');

  useEffect(() => {
    return () => {
      queryParam = {};
    };
  }, []);

  /**
   * 输入查询条件
   */
  const handleInput = (e) => {
    queryParam.tableName = e?.target?.value?.trim() ?? '';
    setInput(e?.target?.value?.trim() ?? '');
  };

  /**
   * 主题编码查询
   */
  const handleInputTopic = (value = '') => {
    queryParam.topicName = value;
    handleQuery();
  };

  /**
   * 清空查询条件
   */
  const handleClear = () => {
    queryParam.tableName = '';
    setInput('');
    handleQuery();
  };

  const handleQuerySort = (sortFieldCode, sortType) => {
    queryParam.sort = `${sortFieldCode},${sortType?.toLowerCase() ?? ''}`;
    handleQuery();
  };

  const handleQuery = () => {
    onQuery(queryParam);
  };

  /**
   * 排序字段
   */
  const fields = [
    {
      name: 'submitDate',
      label: intl.get(`sdat.cardsDistribution.model.lastUpdateDate`).d('最后更新时间'),
    },
  ];

  return (
    <div className={styles['card-filter-bar']}>
      <TextField
        placeholder={intl
          .get('sdat.cardsDistribution.view.title.searchHolder')
          .d('请输入表编码、名称查询')}
        prefix={<Icon type="search" />}
        style={{ width: '280px' }}
        clearButton
        value={inputVal}
        onInput={handleInput}
        onClear={handleClear}
        onEnterDown={handleQuery}
      />

      {/* <TextField
        placeholder={intl
          .get('sdat.cardsDistribution.view.title.searchTopicHolder')
          .d('请输入主题编码、名称查询')}
        prefix={<Icon type="search" />}
        style={{ width: '280px', marginLeft: '20px' }}
        clearButton
        value={inputTopicVal}
        onInput={handleInputTopic}
        onClear={handleClearTopic}
        onEnterDown={handleQuery}
      /> */}

      <PopoverTextField
        label={intl.get('sdat.cardsDistribution.model.topicNumOrName').d('主题编码/名称')}
        onChange={handleInputTopic}
      />

      <div className={styles['card-field-sort']}>
        <SortSelector sortFieldCode="submitDate" onSortQuery={handleQuerySort} fields={fields} />
      </div>
    </div>
  );
};

export default FilterBar;

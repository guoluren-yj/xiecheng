/**
 * 表单查询Form
 */
import React, { useEffect, useState } from 'react';
import { TextField, Icon } from 'choerodon-ui/pro';
import intl from 'utils/intl';

import SortSelector from '@/components/SortSelector';
import PopoverTextField from '@/components/PopoverTextField';

import './index.less';

let queryParam = {
  sort: 'lastUpdateDate,desc',
}; // 查询条件

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
      name: 'lastUpdateDate',
      label: intl.get(`sdps.dataSheet.model.lastUpdateDate`).d('最后更新时间'),
    },
  ];

  return (
    <div className="card-filter-bar">
      <TextField
        placeholder={intl.get('sdps.dataSheet.view.title.searchHolder').d('请输入表编码、名称查询')}
        prefix={<Icon type="search" />}
        style={{ width: '280px' }}
        clearButton
        value={inputVal}
        onInput={handleInput}
        onClear={handleClear}
        onEnterDown={handleQuery}
      />

      <PopoverTextField
        label={intl.get('sdps.dataSheet.model.topicNumOrName').d('主题编码/名称')}
        onChange={handleInputTopic}
      />

      <div className="card-field-sort">
        <SortSelector
          sortFieldCode="lastUpdateDate"
          onSortQuery={handleQuerySort}
          fields={fields}
        />
      </div>
    </div>
  );
};

export default FilterBar;

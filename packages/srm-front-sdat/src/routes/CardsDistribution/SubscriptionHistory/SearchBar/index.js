/**
 * 表单查询Form
 */
import React, { useEffect, useState } from 'react';
import { TextField, Icon } from 'choerodon-ui/pro';
import intl from 'utils/intl';

import SortSelector from '@/components/SortSelector';

import styles from './index.less';

let queryParam = {}; // 查询条件

const SearchBar = (props) => {
  const { onQuery = () => {} } = props;

  const [inputVal, setInput] = useState('');

  useEffect(() => {
    return () => {
      queryParam = {};
    };
  }, []);

  /**
   * 输入查询条件
   */
  const handleInput = (e) => {
    queryParam.tenantName = e?.target?.value?.trim() ?? '';
    setInput(e?.target?.value?.trim() ?? '');
  };

  /**
   * 清空查询条件
   */
  const handleClear = () => {
    queryParam.tenantName = '';
    setInput('');
    handleQuery();
  };

  // 切换同步状态查询条件
  // const handleChangeStatus = (value) => {
  //   queryParam.type = value;
  //   handleQuery();
  // };

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
      name: 'operateTime',
      label: intl.get(`sdat.cardsDistribution.model.operateDate`).d('操作时间'),
    },
  ];

  return (
    <div className={styles['card-search-bar']}>
      <TextField
        placeholder={intl
          .get('sdat.cardsDistribution.view.title.tenantSearchHolder')
          .d('请输入租户编码、租户名称查询')}
        prefix={<Icon type="search" />}
        style={{ width: '280px' }}
        clearButton
        value={inputVal}
        onInput={handleInput}
        onClear={handleClear}
        onEnterDown={handleQuery}
      />

      <div className={styles['card-content-sort']}>
        <SortSelector sortFieldCode="submitDate" onSortQuery={handleQuerySort} fields={fields} />
      </div>
    </div>
  );
};

export default SearchBar;

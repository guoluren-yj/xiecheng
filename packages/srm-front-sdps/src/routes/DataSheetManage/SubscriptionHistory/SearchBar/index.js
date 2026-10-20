/**
 * 表单查询Form
 */
import React, { useRef, useEffect, useState } from 'react';
import { TextField, Icon } from 'choerodon-ui/pro';
import intl from 'utils/intl';

import DropDownSelect from '@/components/DropDownSelect';
import SortSelector from '@/components/SortSelector';

import './index.less';

let queryParam = {}; // 查询条件

const SearchBar = (props) => {
  const { onQuery = () => {}, statusList = [] } = props;

  const [inputVal, setInput] = useState('');

  const selectRef = useRef(null);

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
  const handleChangeStatus = (value) => {
    queryParam.type = value;
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
      label: intl.get(`sdps.dataSheet.model.operateDate`).d('操作时间'),
    },
  ];

  return (
    <div className="card-search-bar">
      <TextField
        placeholder={intl
          .get('sdps.dataSheet.view.title.tenantSearchHolder')
          .d('请输入租户编码、租户名称查询')}
        prefix={<Icon type="search" />}
        style={{ width: '280px' }}
        clearButton
        value={inputVal}
        onInput={handleInput}
        onClear={handleClear}
        onEnterDown={handleQuery}
      />

      <DropDownSelect
        ref={selectRef}
        keyIndex="status"
        // defaultValue="PENDING"
        allowClear
        label={intl.get(`sdps.dataSheet.model.operateType`).d('操作类型')}
        optionList={statusList}
        onSelect={handleChangeStatus}
        style={{ marginLeft: '20px' }}
      />

      <div className="card-content-sort">
        <SortSelector sortFieldCode="submitDate" onSortQuery={handleQuerySort} fields={fields} />
      </div>
    </div>
  );
};

export default SearchBar;

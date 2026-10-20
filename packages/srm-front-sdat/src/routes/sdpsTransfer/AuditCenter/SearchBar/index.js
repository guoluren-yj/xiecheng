/**
 * 表单查询Form
 */
import React, { useRef, useEffect, useState } from 'react';
import { TextField, Icon } from 'choerodon-ui/pro';
import intl from 'utils/intl';

import DropDownSelect from '@/components/DropDownSelect';
import SortSelector from '@/components/SortSelector';
// import LovDropDown from '@/components/LovDropDown';

import './index.less';

let queryParam = {
  sort: 'auditDate,asc',
  status: 'PENDING',
}; // 查询条件

const SearchBar = (props) => {
  const { onQuery = () => {}, statusList = [] } = props;

  const [inputVal, setInput] = useState('');
  const [tenantVal, setValue] = useState('');

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
    queryParam.searchTerm = e?.target?.value?.trim() ?? '';
    setInput(e?.target?.value?.trim() ?? '');
  };

  const handleInputTanent = (e) => {
    queryParam.tenantName = e?.target?.value?.trim() ?? '';
    setValue(e?.target?.value?.trim() ?? '');
  };

  /**
   * 清空查询条件
   */
  const handleClear = () => {
    queryParam.searchTerm = '';
    setInput('');
    handleQuery();
  };

  const handleClearTanent = () => {
    queryParam.tenantName = '';
    setValue('');
    handleQuery();
  };

  // 切换同步状态查询条件
  const handleChangeStatus = (value) => {
    queryParam.status = value;
    handleQuery();
  };

  const handleQuerySort = (sortFieldCode, sortType) => {
    queryParam.sort = `${sortFieldCode},${sortType?.toLowerCase() ?? ''}`;
    handleQuery();
  };

  /**
   * 切换租户
   * @param {*} record
   */
  // const handleChangeTenant = (record = {}) => {
  //   queryParam.tenantId = record?.tenantId ?? '';
  //   handleQuery();
  // };

  const handleQuery = () => {
    onQuery(queryParam);
  };

  /**
   * 排序字段
   */
  const fields = [
    {
      name: 'submitDate',
      label: intl.get(`sdps.auditCenter.model.submitTime`).d('提交时间'),
    },
  ];

  return (
    <div className="card-search-bar">
      <TextField
        placeholder={intl
          .get('sdps.auditCenter.view.title.searchPlaceholder')
          .d('请输入对象编码、名称查询')}
        prefix={<Icon type="search" />}
        style={{ width: '280px' }}
        clearButton
        value={inputVal}
        onInput={handleInput}
        onClear={handleClear}
        onEnterDown={handleQuery}
      />

      <TextField
        placeholder={intl
          .get('sdps.auditCenter.view.title.searchTenantPlaceholder')
          .d('请输入租户编码、名称查询')}
        prefix={<Icon type="search" />}
        style={{ width: '280px', marginLeft: '20px' }}
        clearButton
        value={tenantVal}
        onInput={handleInputTanent}
        onClear={handleClearTanent}
        onEnterDown={handleQuery}
      />

      <DropDownSelect
        ref={selectRef}
        keyIndex="status"
        defaultValue="PENDING"
        allowClear
        label={intl.get(`sdps.auditCenter.model.checkStatus`).d('审核状态')}
        optionList={statusList}
        onSelect={handleChangeStatus}
        style={{ marginLeft: '20px' }}
      />

      {/* <LovDropDown
        title={intl.get('sdps.auditCenter.model.tantentBelong').d('所属租户')}
        lovDS={lovDS}
        textField="tenantName"
        fieldName="tenantVal"
        onChange={handleChangeTenant}
      /> */}

      <div className="card-content-sort">
        <SortSelector sortFieldCode="submitDate" onSortQuery={handleQuerySort} fields={fields} />
      </div>
    </div>
  );
};

export default SearchBar;

import React, { useState } from 'react';
import intl from 'utils/intl';
import { Cascader } from 'hzero-ui';

export default function (props) {
  const { treeList = [], allowClear = true, onChange = (e) => e } = props;
  const [typeValue, setTypeValue] = useState(['', '', '']);

  const handleTypeFilter = (inputValue, path) => {
    return path.some((option) => option.label.toLowerCase().indexOf(inputValue.toLowerCase()) > -1);
  };

  const handleTypeChange = (value) => {
    onChange(value[2]);
    setTypeValue(value);
  };

  return (
    <Cascader
      options={treeList}
      style={{ width: '100%' }}
      fieldNames={{ label: 'categoryName', value: 'categoryId', children: 'children' }}
      placeholder={intl.get('small.common.choose.search.category').d('请搜索或选择分类')}
      value={typeValue[0] && typeValue[1] && typeValue[2] ? typeValue : null}
      allowClear={allowClear}
      showSearch={handleTypeFilter}
      onChange={handleTypeChange}
    />
  );
}

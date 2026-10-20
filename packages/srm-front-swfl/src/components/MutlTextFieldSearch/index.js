import React from 'react';
import { flatten } from 'lodash';
import { TextField, Icon } from 'choerodon-ui/pro';

export default function MutlTextFieldSearch({ name, placeholder, dataSet, onSearch }) {
  const handleChange = (value) => {
    const values = flatten((value || []).map((ele) => ele.trim().replace(/\s+/g, ',').split(',')));
    // eslint-disable-next-line no-unused-expressions
    dataSet?.current?.set(name, values);
    onSearch();
  };
  return (
    <TextField
      onChange={handleChange}
      name={name}
      dataSet={dataSet}
      multiple
      prefix={<Icon type="search" />}
      placeholder={placeholder}
      clearButton
      style={{ width: '300px', margin: '0 20px 4px 0', zIndex: '0' }}
      // onBlur={onSearch}
      onClear={onSearch}
      onKeyDown={(e) => {
        // 回车检索
        if (e.keyCode === 13) return onSearch();
      }}
    />
  );
}

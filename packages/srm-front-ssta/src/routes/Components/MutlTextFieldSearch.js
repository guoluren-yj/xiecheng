import React from 'react';

import { TextField, Icon } from 'choerodon-ui/pro';

export default ({ name, placeholder, dataSet, multiple = true }) => {
  const handleTextFieldChange = (value) => {
    // eslint-disable-next-line no-unused-expressions
    dataSet.queryDataSet?.current.set({
      [name]: value
        ? multiple
          ? value.map((ele) => ele.trim().replace(/\s+/g, ',')).join(',')
          : value.trim()
        : undefined,
    });
    dataSet.query(dataSet.currentPage);
  };
  return (
    <TextField
      valueChangeAction="blur"
      onChange={(value, oldValue) => {
        handleTextFieldChange(value, oldValue);
      }}
      style={{ width: 300 }}
      multiple={multiple}
      prefix={<Icon type="search" />}
      placeholder={placeholder}
      clearButton
      value={
        multiple
          ? dataSet.queryDataSet?.current?.get(name)?.split(',')
          : dataSet.queryDataSet?.current?.get(name)
      }
    />
  );
};

import React from 'react';
import { observer } from 'mobx-react-lite';
import { TextField, Icon } from 'choerodon-ui/pro';

export default observer(({ name, placeholder, dataSet, multiple }) => {
  const handleTextFieldChange = (value) => {
    let result;
    if (multiple) {
      result = value ? value.map((ele) => ele.trim().replace(/\s+/g, ',')).join(',') : undefined;
    } else {
      result = value ? value.trim().replace(/\s+/g, ',') : undefined;
    }
    if (dataSet.queryDataSet) {
      // eslint-disable-next-line no-unused-expressions
      dataSet.queryDataSet?.current.set({
        [name]: result,
      });
    } else {
      dataSet.setQueryParameter(name, result);
    }

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
      value={dataSet.queryDataSet?.current?.get(name)?.split(',')}
    />
  );
});

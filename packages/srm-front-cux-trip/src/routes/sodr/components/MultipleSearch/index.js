import React from 'react';
import { flatten } from 'lodash';
import { TextField, Icon } from 'choerodon-ui/pro';

export function MutlTextFieldSearch({ name, placeholder, dataSet }) {
  const handleChange = (value) => {
    const values = flatten((value || []).map((ele) => ele.trim().replace(/\s+/g, ',').split(',')));
    // eslint-disable-next-line no-unused-expressions
    dataSet?.current?.set(name, values);
  };

  return (
    <TextField
      valueChangeAction="blur"
      onChange={handleChange}
      name={name}
      dataSet={dataSet}
      style={{ width: 300 }}
      multiple
      prefix={<Icon type="search" />}
      placeholder={placeholder}
      clearButton
      // value={dataSet.queryDataSet?.current?.get(name)?.split(',')}
    />
  );
}

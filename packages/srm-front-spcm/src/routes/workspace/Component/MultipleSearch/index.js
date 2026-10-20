import React from 'react';
import { flatten } from 'lodash';
import { TextField, Icon } from 'choerodon-ui/pro';

export function MutlTextFieldSearch({ name, placeholder, dataSet, multiple = true, style = {} }) {
  const handleChange = (value) => {
    if (multiple) {
      const values = flatten(
        (value || []).map((ele) =>
          ele
            .trim()
            .replace(/[\uff0c','\s]+/g, ',')
            .split(',')
        )
      );
      // eslint-disable-next-line no-unused-expressions
      dataSet?.current?.set(name, values);
    } else {
      // eslint-disable-next-line no-unused-expressions
      dataSet?.current?.set(name, value);
    }
  };

  return (
    <TextField
      valueChangeAction="blur"
      onChange={handleChange}
      name={name}
      dataSet={dataSet}
      style={{ width: 300, ...style }}
      multiple={multiple}
      prefix={<Icon type="search" />}
      placeholder={placeholder}
      clearButton
    />
  );
}

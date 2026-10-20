import React, { useState, useEffect } from 'react';
import { TextField, Icon } from 'choerodon-ui/pro';
import { isPlainObject } from 'lodash';

export default function QueryField(props) {
  const { placeholder, name, dataSet = [], queryParams = {}, onRef = (e) => e } = props;
  const [leftDs] = dataSet;

  const [value, setValue] = useState();

  useEffect(() => {
    onRef({ handleClear });
    const initVal = leftDs.getQueryParameter(name);
    setValue((initVal || '').trim());
  }, []);

  function handleClear() {
    setValue('');
    dataSet.forEach(ds => ds.setQueryParameter(name, null));
  }

  function handleQueryChange(val) {
    setValue((val || '').trim());
    dataSet.forEach(ds => {
      ds.setQueryParameter(name, val);
      if (isPlainObject(queryParams)) {
        for (const key in queryParams) {
          if (key) ds.setQueryParameter(key, queryParams[key]);
        }
      }
      ds.query();
    });
  }

  return (
    <TextField
      value={value}
      clearButton
      style={{ width: 300 }}
      placeholder={placeholder}
      prefix={<Icon type="search" />}
      onChange={handleQueryChange}
    />
  );
}

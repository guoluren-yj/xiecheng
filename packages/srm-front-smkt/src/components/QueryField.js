import React, { useState, useEffect } from 'react';
import { TextField, Icon } from 'choerodon-ui/pro';

const splitRex = /[,\s+]/;

export default function QueryField(props) {
  const { placeholder, name, dataSet, onRef = (e) => e } = props;

  const [value, setValue] = useState([]);

  useEffect(() => {
    onRef({ handleClear });
    const initVal = dataSet.getQueryParameter(name)?.split(',');
    setValue(initVal);
  }, []);

  function handleClear() {
    setValue([]);
    dataSet.setQueryParameter(name, null);
  }

  function handleQueryChange(val) {
    if (val) {
      let newVal = [];
      val.forEach((f) => {
        const splitVals = f.split(splitRex).filter((v) => !!v);
        newVal = newVal.concat(splitVals);
      });
      setValue(newVal);
      dataSet.setQueryParameter(name, newVal.join(','));
    } else {
      setValue(val);
      dataSet.setQueryParameter(name, val);
    }
    dataSet.query();
  }

  return (
    <TextField
      multiple
      value={value}
      clearButton
      style={{ width: 200 }}
      placeholder={placeholder}
      prefix={<Icon type="search" />}
      onChange={handleQueryChange}
    />
  );
}

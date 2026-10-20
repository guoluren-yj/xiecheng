import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { TextField, Icon } from 'choerodon-ui/pro';

const splitRex = /[,\s+]/;

function MultipleTextField(props) {
  const { defaultValue, placeholder, name, dataSet, onRef = (e) => e } = props;

  useEffect(() => {
    onRef({ handleClear });
    dataSet.setQueryParameter(name, defaultValue);
  }, []);

  function handleClear() {
    console.log('handleClear');
    // eslint-disable-next-line no-unused-expressions
    dataSet.queryDataSet?.current.reset();
    dataSet.setQueryParameter([name], null);
  }

  function handleQueryChange(val) {
    console.log('handleQueryChange');
    // eslint-disable-next-line no-unused-expressions
    dataSet.queryDataSet?.current.set({
      [name]: val ? val.map((ele) => ele.trim().replace(/\s+/g, ',')).join(',') : undefined,
    });
    if (val) {
      let newVal = [];
      val.forEach((f) => {
        const splitVals = f.split(splitRex).filter((v) => !!v);
        newVal = newVal.concat(splitVals);
      });
      dataSet.setQueryParameter(name, newVal.join(','));
    } else {
      dataSet.setQueryParameter(name, val);
    }
    dataSet.query();
  }

  return (
    <TextField
      multiple
      value={dataSet.queryDataSet?.current?.get(name)?.split(',')}
      clearButton
      style={{ width: 300 }}
      placeholder={placeholder}
      prefix={<Icon type="search" />}
      onChange={handleQueryChange}
    />
  );
}

export default observer(MultipleTextField);

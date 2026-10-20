import React, { useState, useEffect } from 'react';
import { TextField } from 'choerodon-ui/pro';
import { Icon } from 'choerodon-ui';

const reg = /[,\s+]/;
function TextFieldPro(props) {
  const {
    style = { width: '300px' },
    placeholder = '',
    initData = [],
    ds,
    name,
    // nameList,
    onRef,
  } = props;

  const [value, setValue] = useState(initData);

  useEffect(() => {
    onRef({ handleClear });
    if (ds?.getQueryParameter(name)?.indexOf(',') > 0) {
      const initVal = ds?.getQueryParameter(name)?.split(',');
      setValue(initVal);
    } else {
      const initVal = ds?.getQueryParameter(name);
      setValue(initVal);
    }
  }, []);

  const handleClear = () => {
    setValue(undefined);
    ds.setQueryParameter(name, null);
  };

  const handleChange = (val) => {
    if (val) {
      let newStr = [];
      val.forEach((v) => {
        const str = v?.split(reg)?.filter((item) => !!item);
        newStr = newStr.concat(str);
      });
      setValue(newStr);
      if (newStr?.length > 1) {
        ds.setQueryParameter(name, newStr.join(','));
        // ds.setQueryParameter(name, null);
      } else {
        ds.setQueryParameter(name, newStr?.[0]);
        // ds.setQueryParameter(nameList, null);
      }
    } else {
      setValue(val);
      ds.setQueryParameter(name, val);
    }
    // console.log(ds?.getQueryParameter(name)?.split(','))
    ds.query();
  };

  return (
    <TextField
      value={value}
      valueChangeAction="blur"
      style={style}
      multiple
      prefix={<Icon type="search" />}
      placeholder={value ? '' : placeholder}
      clearButton
      onChange={handleChange}
    />
  );
}
export default TextFieldPro;

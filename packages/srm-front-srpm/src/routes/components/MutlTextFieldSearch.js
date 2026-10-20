/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2022-01-04 10:51:34
 * @LastEditors: yanglin
 * @LastEditTime: 2022-01-17 22:41:49
 */
import React from 'react';
import { isFunction } from 'lodash';
import { observer } from 'mobx-react-lite';
import { TextField, Icon, Tooltip } from 'choerodon-ui/pro';

export default observer(({ name, placeholder, dataSet, callbackFuc, handleQuery }) => {
  const handleTextFieldChange = (value) => {
    // eslint-disable-next-line no-unused-expressions
    dataSet.queryDataSet?.current?.set({
      [name]: value ? value.map((ele) => ele.trim().replace(/\s+/g, ',')).join(',') : undefined,
    });

    if (isFunction(handleQuery)) {
      handleQuery({});
    } else {
      dataSet.query();
    }

    if (isFunction(callbackFuc)) {
      callbackFuc();
    }
  };

  return (
    <Tooltip title={placeholder}>
      <TextField
        // valueChangeAction="blur"
        onChange={(value, oldValue) => {
          handleTextFieldChange(value, oldValue);
        }}
        style={{ width: 300, height: '32px' }}
        multiple
        prefix={<Icon type="search" />}
        placeholder={placeholder}
        clearButton
        value={dataSet.queryDataSet?.current?.get(name)?.split(',')}
      />
    </Tooltip>
  );
});

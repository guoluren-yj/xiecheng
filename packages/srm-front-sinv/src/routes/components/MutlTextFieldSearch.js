/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2022-01-04 10:51:34
 * @LastEditors: yanglin
 * @LastEditTime: 2022-01-17 22:39:40
 */
import React from 'react';
import { observer } from 'mobx-react-lite';
import { TextField, Icon, Tooltip } from 'choerodon-ui/pro';

export default observer(({ name, placeholder, tooltipText, dataSet, queryparams }) => {
  const handleTextFieldChange = (value) => {
    // eslint-disable-next-line no-unused-expressions
    dataSet.queryDataSet?.current?.set({
      [name]: value ? value.map((ele) => ele.trim().replace(/\s+/g, ',')).join(',') : undefined,
    });
    if (queryparams && Object.keys(queryparams)?.length) {
      dataSet.setQueryParameter('params', {
        ...queryparams,
        allSource: value
          ? value.map((ele) => ele.trim().replace(/\s+/g, ',')).join(',')
          : undefined,
      });
    }
    dataSet.query();
  };

  return tooltipText ? (
    <Tooltip title={tooltipText}>
      <TextField
        valueChangeAction="blur"
        onChange={(value, oldValue) => {
          handleTextFieldChange(value, oldValue);
        }}
        style={{ width: 300 }}
        multiple
        prefix={<Icon type="search" />}
        placeholder={placeholder}
        clearButton
        value={dataSet.queryDataSet?.current?.get(name)?.split(',')}
      />
    </Tooltip>
  ) : (
    <TextField
      valueChangeAction="blur"
      onChange={(value, oldValue) => {
        handleTextFieldChange(value, oldValue);
      }}
      style={{ width: 300 }}
      multiple
      prefix={<Icon type="search" />}
      placeholder={placeholder}
      clearButton
      value={dataSet.queryDataSet?.current?.get(name)?.split(',')}
    />
  );
});

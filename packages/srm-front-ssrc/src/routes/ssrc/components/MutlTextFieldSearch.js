/*
 * @Descripttion:
 * @version:
 * @Author: lizhijian
 * @Date: 2022-02-08 16:04:34
 * @LastEditors: yiping.liu
 * @LastEditTime: 2023-02-10 10:48:33
 */
import React from 'react';
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';
import { TextField, Icon } from 'choerodon-ui/pro';
import Style from './MutlTextFieldSearchStyle.less';

/**
 * MutlTextFieldSearch - 函数组件 props extends ButtonProps 多单号查询组件
 * @extends {FunctionComponent} - React.FunctionComponent
 * @reactProps {name} string 字段名
 * @reactProps {placeholder} string placeholder
 * @reactProps {className} className
 * @reactProps {searchBarDS} searchBarDS
 * @returns React.element
 */
const MutlTextFieldSearch = observer(({ name, placeholder, className, searchBarDS, onChange }) => {
  const handleTextFieldChange = (value) => {
    // eslint-disable-next-line no-unused-expressions
    searchBarDS?.current?.set({
      [name]: value
        ? value
            .map((ele) => ele.trim().replace(/\s+/g, ','))
            .join(',')
            .split(',')
        : undefined,
    });
    if (onChange) {
      onChange(searchBarDS, value);
    }
  };

  return (
    <TextField
      dataSet={searchBarDS}
      className={classNames(Style.search, className)}
      name={name}
      valueChangeAction="blur"
      onChange={(value, oldValue) => {
        handleTextFieldChange(value, oldValue);
      }}
      style={{ width: 300 }}
      multiple
      prefix={<Icon type="search" />}
      placeholder={placeholder}
      clearButton
    />
  );
});

export default MutlTextFieldSearch;

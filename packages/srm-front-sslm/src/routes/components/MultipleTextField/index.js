/*
 * @Date: 2022-01-13 16:07:42
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import { TextField, Icon } from 'choerodon-ui/pro';
import { isEmpty } from 'lodash';
import styles from './index.less';

const MultipleTextField = ({ name, dataSet, placeholder, multiple = true }) => {
  const handleChange = value => {
    if (multiple) {
      let valueList = [];
      // srm-107982 多单号拆分
      (value || []).forEach(n => {
        const formatValue = n.trim().split(/[\uff0c','\s]+/g);
        if (!isEmpty(formatValue)) {
          valueList = valueList.concat(formatValue);
        }
      });
      // eslint-disable-next-line no-unused-expressions
      dataSet?.current?.set(name, !isEmpty(valueList) ? valueList : null);
    } else {
      // eslint-disable-next-line no-unused-expressions
      dataSet?.current?.set(name, value);
    }
  };

  return (
    <TextField
      clearButton
      name={name}
      dataSet={dataSet}
      multiple={multiple}
      valueChangeAction="blur"
      onChange={handleChange}
      placeholder={placeholder}
      className={styles['multiple-text']}
      prefix={<Icon type="search" style={{ fontSize: 14, paddingLeft: 12 }} />}
    />
  );
};

export default MultipleTextField;

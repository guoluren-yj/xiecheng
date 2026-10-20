/**
 * 标签颜色
 * @date: 2020-11-24
 * @author: hl <li.huang04@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import React from 'react';
import { Icon, Tooltip } from 'choerodon-ui/pro';

import styles from './index.less';

export function AutoLabel(props) {
  const { value, style = {}, wrapperStyle = {}, tooltip = true } = props;
  const element = (
    <div className={styles['label-auto-wrapper']} style={{ ...wrapperStyle }}>
      <span
        className={styles['label-auto-container']}
        style={{
          color: 'rgba(0,0,0,0.65)',
          backgroundColor: 'rgba(0,0,0,0.06)',
          marginRight: 4,
          border: '1px solid rgba(0, 0, 0, 0.06)',
          height: 20,
          display: 'inline-block',
          ...style,
        }}
      >
        {value}
      </span>
    </div>
  );
  return tooltip ? (
    <Tooltip title={value} placement="top">
      {element}
    </Tooltip>
  ) : (
    element
  );
}

export default function (props) {
  const { value, style = {}, closable = false, onChange = (e) => e } = props;
  return (
    <Tooltip title={value} placement="top">
      <span
        className={styles['label-preview-container']}
        style={{
          color: 'rgba(0,0,0,0.65)',
          borderColor: 'rgba(0,0,0,0.06)',
          backgroundColor: 'rgba(0,0,0,0.06)',
          ...style,
        }}
      >
        <span>{value}</span>
        {closable && <Icon type="close" onClick={() => onChange()} />}
      </span>
    </Tooltip>
  );
}

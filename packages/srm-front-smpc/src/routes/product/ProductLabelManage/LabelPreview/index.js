/**
 * 标签颜色
 * @date: 2020-11-24
 * @author: hl <li.huang04@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import React from 'react';
import { Icon, Tooltip, Button } from 'choerodon-ui/pro';

import styles from './index.less';
import colors from './colors';

export function AutoLabel(props) {
  const { code, value, style = {}, wrapperStyle = {}, tooltip = true } = props;
  const c = colors[code] || {};
  const element = (
    <div className={styles['label-auto-wrapper']} style={{ ...wrapperStyle }}>
      <span
        className={styles['label-auto-container']}
        style={{
          color: c['label-preview-color'],
          borderColor: c['label-preview-border-color'],
          backgroundColor: c['label-preview-background-color'],
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

export function LinkLabel(props) {
  const { value, tooltip = false, wrapperStyle = {}, onClick = (e) => e } = props;
  const element = (
    <div className={styles['label-auto-wrapper']} style={{ ...wrapperStyle }}>
      <Button
        className={styles['label-auto-container']}
        style={{ border: 'none', padding: 0 }}
        funcType="link"
        color="primary"
        onClick={onClick}
      >
        {' '}
        {value}
      </Button>
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
  const { code, value, style = {}, closable = false, onChange = (e) => e } = props;
  const c = colors[code] || {};
  return (
    <Tooltip title={value} placement="top">
      <span
        className={styles['label-preview-container']}
        style={{
          color: c['label-preview-color'],
          borderColor: c['label-preview-border-color'],
          backgroundColor: c['label-preview-background-color'],
          ...style,
        }}
      >
        <span>{value}</span>
        {closable && <Icon type="close" onClick={() => onChange()} />}
      </span>
    </Tooltip>
  );
}

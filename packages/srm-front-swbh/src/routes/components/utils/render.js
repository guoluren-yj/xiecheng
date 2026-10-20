import React from 'react';
import intl from 'utils/intl';
import { Badge } from 'hzero-ui';
import './index.less';

export function enableRender(v) {
  return (
    <div className="bo-enable-render">
      {React.createElement(Badge, {
        status: v ? 'success' : 'error',
        text: v ? intl.get('hzero.common.enable').d('启用') : intl.get('hzero.common.disable').d('禁用'),
      })}
    </div>
  );
}

// 发布render
export function publishRender(v) {
  return (
    <div className="bo-enable-render">
      {React.createElement(Badge, {
        status: v ? 'success' : 'error',
        text: v ? intl.get('hzero.common.published').d('已发布') : intl.get('hzero.common.unPublished').d('未发布'),
      })}
    </div>
  );
}

export function statusRender(...args) {
  const statusList = args.length > 1 && args[1] !== undefined ? args[1] : [];
  const value = args[0];
  const text = args.length > 2 && args[2] !== undefined ? args[2] : '';
  if (value === '' || value === undefined || value === null) return '';
  const currentStatus =
    statusList.find((item) => {
      return item.value === value;
    }) ||
    statusList.find((item) => {
      return item.status === 'default';
    }) ||
    {};

  return (
    <div className="bo-enable-render">
      {React.createElement(Badge, {
        status: currentStatus.status || 'default',
        text: text || currentStatus.text,
      })}
    </div>
  );
}
const colorMap = {
  NORMAL: 'grey',
  REMIND: 'orange',
  WARN: 'plain',
};
/**
 * 下拉自定义渲染
 * @param {} param
 * @returns
 */
export function optionRenderer({ text, value }) {
  return (
    <div className="select-render-item">
      <span className={`select-render-item-txt select-render-item-${colorMap[value]}`}>{text}</span>
    </div>
  );
}

import React from 'react';
import { isFunction } from 'lodash';
import { Tooltip } from 'choerodon-ui/pro';
import intl from 'utils/intl';

export default function renderCompare({ value, name, isHistory, showHistory, keyList }) {
  const list = keyList || [];
  const style1 = { background: 'rgba(245, 99, 73, 0.1)', border: '1px solid #F56349' };
  const style2 = {
    background: 'rgba(71, 184, 129, 0.1)',
    border: '1px solid rgba(71, 184, 129, 0.45)',
  };
  const isChange = list.includes(name);
  const resVal = value === 0 ? value : value || '-';
  if (!isChange || !showHistory || !value) return resVal;
  return <div style={isHistory ? style1 : style2}>{resVal}</div>;
}

export function renderFlowCompare({
  value,
  name,
  names = [],
  keyList,
  getLastVersionValue,
  placement = 'topLeft',
}) {
  const list = keyList || [];
  const isChange = names.length > 0 ? list.some((s) => names.includes(s)) : list.includes(name);
  const resVal = value === 0 ? value : value || '-';
  if (!isChange) return resVal;
  const prefix = intl.get('smpc.product.view.changeBefore').d('变更前');
  return (
    <Tooltip
      placement={placement}
      title={
        isChange && isFunction(getLastVersionValue)
          ? `${prefix}${getLastVersionValue() || '-'}`
          : ''
      }
    >
      <div style={{ color: '#E64322' }}>{resVal}</div>
    </Tooltip>
  );
}

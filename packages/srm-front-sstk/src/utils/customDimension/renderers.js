import React from 'react';
import intl from 'utils/intl';
import { openList } from '@/utils/c7nModal';

export function rendererLovDimension({
  isAll = () => false,
  allText = intl.get('sagm.common.view.all').d('所有'),
  title,
  data = [],
  columns = [],
  textField = 'meaning',
  //   valueField = 'value',
}) {
  const allFlag = isAll();
  if (allFlag) return allText;
  if (data.length === 0) {
    return '-';
  } else if (data.length === 1) {
    return data[0][textField];
  } else {
    return (
      <a onClick={() => openList({ title, columns, data, width: 742 })}>
        {intl.get('hzero.common.button.look').d('查看')}
      </a>
    );
  }
}

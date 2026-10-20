import React from 'react';
import intl from 'utils/intl';
import { Tooltip } from 'choerodon-ui';
import { openList } from '@/utils/c7nModal';
import { renderFlowCompare } from '@/routes/product/SkuDetail/renderCompare';

export function rendererLovDimension({
  isAll = () => false,
  allText = intl.get('sagm.common.view.all').d('所有'),
  title,
  data = [],
  columns = [],
  text,
  textField = 'meaning',
  getOldValue = () => '',
  names = [],
  keyList,
  createLine,
  //   valueField = 'value',
}) {
  const allFlag = isAll();
  if (allFlag) {
    return createLine ? (
      <span style={{ color: 'red' }}>{allText}</span>
    ) : (
      renderFlowCompare({ value: allText, names, keyList, getLastVersionValue: getOldValue })
    );
  }
  if (data.length === 0) {
    return '-';
  } else if (data.length === 1) {
    const valid = data[0].regionEnableFlag === 0; // 失效
    return valid ? (
      <Tooltip
        title={intl
          .get('smpc.product.model.skuSalesRegions.validator')
          .d('地址库已升级，该地址已经不存在，请重新编辑。')}
      >
        <span style={{ color: 'red' }}>{text || data[0][textField]}</span>
      </Tooltip>
    ) : createLine ? (
      <div style={{ color: '#E64322' }}>{text || data[0][textField]}</div>
    ) : (
      renderFlowCompare({
        value: text || data[0][textField],
        names,
        keyList,
        getLastVersionValue: getOldValue,
      })
    );
  } else {
    return (
      <a onClick={() => openList({ title, columns, data })}>
        {intl.get('hzero.common.button.look').d('查看')}
      </a>
    );
  }
}

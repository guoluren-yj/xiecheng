import React from 'react';
import { observer } from 'mobx-react';

import PurchaseTimer from './PurchaseTimer';

// 行状态渲染
const PurchaseLineStatus = observer((props) => {
  const { lineStatusStyle, ...surplusParams } = props || {};
  return (
    <span
      style={{
        fontFamily: 'PingFangSC-Medium',
        borderRadius: '.02rem',
        padding: '0 .04rem',
        lineHeight: '.18rem',
        fontWeight: 500,
        fontSize: '.12rem',
        display: 'inline-block',
        ...(lineStatusStyle || {}),
      }}
    >
      <PurchaseTimer {...(surplusParams || {})} />
    </span>
  );
});

export default PurchaseLineStatus;

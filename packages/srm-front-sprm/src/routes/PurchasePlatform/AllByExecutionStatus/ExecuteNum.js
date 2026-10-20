import React from 'react';
import { numberPrecision } from '@/routes/utils.js';
import intl from 'utils/intl';

const ExecuteNum = ({ count, uomPrecision, numberFalg, type }) => (
  <div
    style={{
      minWidth: '188px',
      display: 'inline-block',
    }}
  >
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        height: '32px',
        background: '#F5F5F5',
        lineHeight: '22px',
        marginBottom: 16,
        marginRight: 16,
      }}
    >
      <span
        style={{
          padding: '8px 10px',
          fontSize: '12px',
          color: 'rgba(0,0,0,0.65)',
          lineHeight: '18px',
          fontWeight: 400,
        }}
      >
        {type !== 'AmountNumber'
          ? intl.get('sodr.workspace.model.common.totalExecutedQuantity').d('总执行数量')
          : intl.get('sodr.workspace.model.common.paymentAmountTotal').d('总执行金额')}
      </span>
      <span style={{ color: '#000000', padding: '5px 10px', fontWeight: 600 }}>
        {(count || count === 0) && numberFalg ? numberPrecision(count, uomPrecision) : '-'}
      </span>
    </div>
  </div>
);

export default ExecuteNum;

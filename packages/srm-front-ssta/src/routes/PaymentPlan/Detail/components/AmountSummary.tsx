import React, { useContext } from 'react';
import { observer } from 'mobx-react';
import { isNil } from 'lodash';

import styles from '../index.less';
import { Store } from '../stores';
import type { StoreValueType } from '../stores';


const AmountCard = observer((props) => {
  const { name, planHeaderDs } = props;
  const field = planHeaderDs.getField(name);
  const label = field?.get('label');
  const value = field?.getValue();
  const text = isNil(value) ? '-' : value;
  return (
    <div className="amount-card">
      <div className="amount-card-label">{label}</div>
      <div className="amount-card-value">{text}</div>
    </div>
  );
});

const AmountSummary = observer(() => {
  const { planHeaderDs } = useContext<StoreValueType>(Store);
  return (
    <div className={styles['ssta-amount-summary-paymentPlan']}>
      <AmountCard key="sourceAmount" name="sourceAmount" planHeaderDs={planHeaderDs} />
      <div className="amount-sign">-</div>
      <AmountCard key="paymentAmount" name="paymentAmount" planHeaderDs={planHeaderDs} />
      <div className="amount-sign">=</div>
      <AmountCard key="paymentDiffAmount" name="paymentDiffAmount" planHeaderDs={planHeaderDs} />
    </div>
  );
});

export default AmountSummary;
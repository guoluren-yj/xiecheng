import React from 'react';
import intl from 'utils/intl';
import TodoCard from '../TodoCard';
import styles from '../style.less';

export default function MallCard() {
  return (
    <TodoCard
      code="SRM_SSRC_NewBidEvent"
      className={styles['mall-card']}
      title={intl.get('spfm.dashboard.view.title.BID').d('招投标')}
    />
  );
}

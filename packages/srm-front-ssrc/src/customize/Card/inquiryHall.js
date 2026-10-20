import React from 'react';
import intl from 'utils/intl';
import TodoCard from '../TodoCard';
import styles from '../style.less';

export default function MallCard() {
  return (
    <TodoCard
      code="SRM_SSRC_RfqEvent"
      className={styles['mall-card']}
      title={intl.get('spfm.dashboard.view.title.RFX').d('询报价')}
    />
  );
}

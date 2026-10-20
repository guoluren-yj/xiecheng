import React from 'react';
import intl from 'utils/intl';
import TodoCard from '../TodoCard';
import styles from '../style.less';

export default function MallCard() {
  return (
    <TodoCard
      code="SRM_SSRC_SupEvent"
      className={styles['mall-card']}
      title={intl.get(`spfm.dashboard.view.title.supplierAction`).d('供应商操作')}
    />
  );
}

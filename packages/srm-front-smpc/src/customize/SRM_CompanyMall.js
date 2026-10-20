import React from 'react';
import intl from 'utils/intl';
import TodoCard from './TodoCard';
import styles from './style.less';

export default function MallCard() {
  return (
    <TodoCard
      code="SRM_CompanyMall"
      className={styles['mall-card']}
      title={intl.get(`spfm.dashboard.view.title.enterpriseMall`).d('企业商城')}
    />
  );
}

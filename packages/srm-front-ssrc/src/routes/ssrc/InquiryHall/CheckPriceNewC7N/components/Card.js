/**
 * 卡片组件
 */
import React from 'react';

import styles from './index.less';

export default function Card(props) {
  const { title, children, detailFlag } = props;
  return (
    <div className={detailFlag ? styles['card-wrap-read'] : styles['card-wrap']}>
      {title && (
        <div className={styles['card-head']}>
          <h4 className={styles['card-head-title']}>{title}</h4>
        </div>
      )}
      <div className={styles['card-content']}>{children}</div>
    </div>
  );
}

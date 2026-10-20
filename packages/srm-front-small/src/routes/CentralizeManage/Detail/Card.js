import React from 'react';
import styles from './index.less';

export default function Card({ title, children }) {
  return (
    <div className={styles['card-container']}>
      <div className={styles['card-title']}>{title}</div>
      <div className={styles['card-body']}>{children}</div>
    </div>
  );
}

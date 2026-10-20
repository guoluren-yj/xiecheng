import React from 'react';
import styles from './index.less';

export default function SecondCard({
  children,
  offsetTop = 32,
  title = '',
}) {

  return (
    <div style={{ marginTop: offsetTop }}>
      <p className={styles['second-top-title']}>
        {title}
      </p>
      {children}
    </div>
  );
}
/**
 自定义表单
 */
import React from 'react';

import styles from './index.less';

export default function FormItem(props) {
  const { label, children } = props;
  return (
    <div className={styles['approve-record-timeline-content']}>
      <span className={styles['approve-record-timeline-label']}>{label}</span>
      <span className={styles['approve-record-timeline-value']}>{children}</span>
    </div>
  );
}

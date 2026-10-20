import React from 'react';
import styles from './index.less';

export default function Card(props) {
  const { children, title, tip, style = {} } = props;
  return (
    <div className={styles['card-container']} style={style}>
      <div className="card-header">
        <div className="sagm-card-title">{title}</div>
      </div>
      {tip && <div className="sagm-card-tip">{tip}</div>}
      <div className="card-body">{children}</div>
    </div>
  );
}

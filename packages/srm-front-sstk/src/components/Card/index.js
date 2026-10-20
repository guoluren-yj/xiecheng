import React from 'react';
import styles from './index.less';

export default function Card(props) {
  const { children, title, style = {}, cardBodyStyle = {} } = props;
  return (
    <div className={styles['card-container']} style={style}>
      <div className="card-header">
        <div className="sagm-card-title">{title}</div>
      </div>
      <div className="card-body" style={cardBodyStyle}>
        {children}
      </div>
    </div>
  );
}

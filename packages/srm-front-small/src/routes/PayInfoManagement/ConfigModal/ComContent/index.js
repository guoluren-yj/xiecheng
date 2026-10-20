import React from 'react';
import styles from './index.less';

export default function ComContent(props) {
  const { title = '', children } = props;
  return (
    <div className={styles['mall-home-config-content']}>
      <p className="mall-home-config-com-title">{title}</p>
      <div className="mall-home-config-com-content">{children}</div>
    </div>
  );
}

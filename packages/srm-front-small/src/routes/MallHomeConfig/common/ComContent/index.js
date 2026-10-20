import React from 'react';
import styles from './index.less';

export default function ComContent(props) {
  const { title = '', children, desc = '', titleStyle = {}, ...other } = props;
  return (
    <div {...other} className={styles['mall-home-config-content']}>
      <div style={titleStyle} className="mall-home-config-com-title">
        {title}
      </div>
      {desc && <p className="mall-home-config-com-desc">{desc}</p>}
      {children && <div className="mall-home-config-com-content">{children}</div>}
    </div>
  );
}

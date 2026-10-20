import React from 'react';
import { Icon } from 'choerodon-ui/pro';

import styles from './index.less';

export default function Info({ icon = 'info', message, style = {}, iconStyle = {} }) {
  return (
    <div className={styles['info-wrapper']} style={style}>
      <Icon type={icon} style={iconStyle} />
      <span className="info-message">{message}</span>
    </div>
  );
}

import React from 'react';
import { Icon } from 'choerodon-ui/pro';
import classnames from 'classnames';

import styles from './index.less';

export default function Info({ icon = 'info', message, style = {}, className, iconStyle = {} }) {
  return (
    <div className={classnames(styles['info-wrapper'], className)} style={style}>
      <Icon type={icon} style={iconStyle} />
      <span className="info-message">{message}</span>
    </div>
  );
}

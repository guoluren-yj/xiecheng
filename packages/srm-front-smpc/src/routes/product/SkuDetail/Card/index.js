import React from 'react';
import { Tooltip } from 'choerodon-ui';
import styles from './index.less';

export default function Card(props) {
  const { children, title, id, dot } = props;
  return (
    <div className={styles['card-container']}>
      <div id={id} className="card-header">
        {title}
        {dot && (
          <Tooltip placement="bottom" title={dot}>
            <span className="card-header-dot" />
          </Tooltip>
        )}
      </div>
      <div className="card-body">{children}</div>
    </div>
  );
}

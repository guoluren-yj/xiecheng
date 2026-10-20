import React, { memo } from 'react';
import { Icon } from 'choerodon-ui';

import { noop } from 'lodash';
import styles from '../../index.less';

export default memo(function Card({
  title,
  children,
  allowArrow = true,
  direction = false,
  onClick = noop,
}) {
  return (
    <>
      <div className={styles['card-wrapper']}>
        <div className={styles['card-content']}>
          <div className={styles['card-content-title']} onClick={onClick}>
            {title} {allowArrow ? <Icon type={direction ? 'expand_more' : 'expand_less'} /> : null}
          </div>
          <div className={styles['card-content-form']}>{children}</div>
        </div>
      </div>
      <div className={styles['card-wrapper-bottom']} />
    </>
  );
});

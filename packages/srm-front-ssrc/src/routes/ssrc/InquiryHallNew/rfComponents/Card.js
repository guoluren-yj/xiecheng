import React from 'react';
import { Icon } from 'choerodon-ui/pro';

import styles from './common.less';

const Card = (props) => {
  const { component, id, title, validateFlag } = props;

  return (
    <div className={styles['card-warp']} id={id}>
      {title && (
        <div className={styles['card-title']}>
          {title}
          {validateFlag ? (
            <Icon type="check_circle" style={{ color: '#71ab42', marginLeft: '8px' }} />
          ) : null}
        </div>
      )}
      <div className={styles['card-content']}>{component}</div>
    </div>
  );
};

export default Card;

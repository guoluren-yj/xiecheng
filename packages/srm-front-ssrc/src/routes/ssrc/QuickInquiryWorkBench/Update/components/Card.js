import React from 'react';

import styles from '../common.less';

const Card = (props) => {
  const { component = null, id = '', title = '' } = props;

  return (
    <div className={styles['card-warp']} id={id}>
      {title && <div className={styles['card-title']}>{title}</div>}
      <div className={styles['card-content']}>{component}</div>
    </div>
  );
};

export default Card;

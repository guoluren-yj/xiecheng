import React from 'react';

import styles from './index.less';

const Card = (props) => {
  const { title, children, id, disabled } = props;
  return (
    <div id={id} className={styles['sku-card-container']}>
      {/* {disabled && <div className="disable-mask" />} */}
      <div className={`sku-card-head ${disabled ? 'sku-card-disable' : ''}`}>{title}</div>
      <div className={`sku-card-body ${disabled ? 'sku-card-disable' : ''}`}>
        {!disabled && children}
      </div>
    </div>
  );
};

export default Card;

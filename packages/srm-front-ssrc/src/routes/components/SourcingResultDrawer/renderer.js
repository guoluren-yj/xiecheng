import React from 'react';

import styles from './index.less';

const renderSubTitle = (title) => {
  return (
    <div className={styles['sub-title']}>
      <h3>
        <div className={styles['vertical-line']} />
        <span>{title}</span>
      </h3>
    </div>
  );
};

export { renderSubTitle };

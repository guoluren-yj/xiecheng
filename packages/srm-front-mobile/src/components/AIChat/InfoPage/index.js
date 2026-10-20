/* eslint-disable no-param-reassign */
import React, { memo } from 'react';
import CLN from 'classnames';
import styles from './index.less';

const InfoPage = (props) => {
  const { className, title, content } = props;
  return (
    <div className={CLN(styles['info-page'], className)}>
      <div className={styles['info-inner']}>
        <span>{title}</span>
        <span>{content}</span>
      </div>
    </div>
  );
};

export default memo(InfoPage);

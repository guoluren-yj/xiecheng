import React from 'react';
import iconStyles from './iconfont/iconfont.css';
import styles from './index.less';
import './iconfont/iconfont.js';

const MyIcon = ({ type, isSvg = true }) => {
  return isSvg ? (
    <svg className={`${styles['icon-swbh']} icon-swbh`} aria-hidden="true">
      <use href={`#icon-${type}`} />
    </svg>
  ) : (
    <span className={`${iconStyles.iconfont} iconfont ${iconStyles[`icon-${type}`]}`} />
  );
};

export default MyIcon;

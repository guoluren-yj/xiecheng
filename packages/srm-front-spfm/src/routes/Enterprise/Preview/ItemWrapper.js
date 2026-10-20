/**
 * ItemWrapper.js
 * @date: 2018-12-17
 * @author: wangjiacheng <jiacheng.wang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React from 'react';

import styles from './index.less';

export default class ItemWrapper extends React.Component {
  render() {
    const { children, className, message, title, ...other } = this.props;
    let mainClassName = styles['item-wrapper'];
    if (className) {
      mainClassName += ` ${className}`;
    }
    return (
      <div className={mainClassName} {...other}>
        <div className={styles['item-wrapper']}>
          <h3 className={styles['item-wrapper-title']}>{title}</h3>
          <div className={styles['item-wrapper-message']}>{message}</div>
        </div>
        {children}
      </div>
    );
  }
}

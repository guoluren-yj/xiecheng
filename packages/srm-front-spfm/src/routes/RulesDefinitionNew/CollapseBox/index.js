/**
 * CollapseBox.js
 * @date: 2021-06-11
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { useState } from 'react';
import styles from './index.less';

export default function CollapseBox(props = {}) {
  const { children } = props;
  const [collapseFlag, handleCollapse] = useState(true);
  return (
    <div className={styles['collapse-box']}>
      <div className="collapse-box-wrapper">
        <div
          className={`collapse-box-content ${
            collapseFlag ? 'collapse-box-show' : 'collapse-box-hide'
          }`}
        >
          {children}
        </div>
        <div
          className={`tree-divide-op ${collapseFlag ? '' : 'collpase'}`}
          onClick={() => handleCollapse(!collapseFlag)}
        />
      </div>
    </div>
  );
}

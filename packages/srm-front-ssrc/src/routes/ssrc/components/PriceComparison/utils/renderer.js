import React from 'react';
import classnames from 'classnames';

import Style from './renderer.less';

/**
 * 面板头标题
 * @param {string} title 标题
 */
export const panelHeaderRender = (title) => {
  return (
    <div className={classnames(Style['ssrc-history-price-analysis-panel'])}>
      {title}
    </div>
  )
}
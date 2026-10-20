/**
 * 标签颜色
 * @date: 2020-11-24
 * @author: hl <li.huang04@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import React from 'react';
import { Icon } from 'choerodon-ui/pro';

import styles from './index.less';
import colors from './colors';

export default function (props) {
  const { colorCode = 'A', onChange = (e) => e, singleFlag = false } = props;
  const colorList = Object.keys(colors);
  const changeColor = (c) => {
    onChange(c);
  };
  return (
    <div className={styles['label-color-container']}>
      {colorList.map((c) => {
        return (
          <span
            onClick={() => changeColor(c)}
            className={`color-container ${singleFlag ? 'single-color' : 'multipe-color'}`}
            style={{
              display: singleFlag ? (colorCode === c ? 'inline-flex' : 'none') : 'inline-flex',
              background: colors[c]['label-color'],
              opacity: colors[c]['label-opacity'],
            }}
          >
            <Icon
              type="done"
              className={colorCode === c && !singleFlag ? 'label-selected-color' : ''}
            />
          </span>
        );
      })}
    </div>
  );
}

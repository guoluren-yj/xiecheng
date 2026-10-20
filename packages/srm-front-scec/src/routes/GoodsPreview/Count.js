/**
 * Count -计数器
 * @date: 2019-3-12
 * @author DTM <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import style from './Count.less';

export default class Count extends Component {
  render() {
    return (
      <div className={style.counter}>
        <div className={style['minus-img']} />
        <input type="text" className={style['count-value']} value={1} />
        <div className={style['add-img']} />
      </div>
    );
  }
}

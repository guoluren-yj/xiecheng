/**
 * ClarifyContent - 澄清函详情文本框展示
 * @date: 2019-11-13
 * @author: jing.chen05@hand-china.com
 * @version: 1.0.0
 * @copyright Copyright (c) 2019, Hand
 */
import React, { Component } from 'react';
import { replacePrivateBucket } from '@/utils/utils';
import style from './index.less';

export default class ClarifyContent extends Component {
  render() {
    const { detail } = this.props;
    const newContext = replacePrivateBucket(detail.context);
    return (
      <React.Fragment>
        {detail && detail.context && (
          <div
            className={style['context-style']}
            dangerouslySetInnerHTML={{ __html: newContext }}
          />
        )}
      </React.Fragment>
    );
  }
}

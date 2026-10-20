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

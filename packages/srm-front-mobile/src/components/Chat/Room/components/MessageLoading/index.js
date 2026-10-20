import React, { Component } from 'react';
import { Icon } from 'choerodon-ui';
import intl from 'utils/intl';
import styles from './index.less';

export default class MessageLoading extends Component {
  render() {
    const { loadingState, config } = this.props;
    return (
      <div className={styles['smbl-message-loading']}>
        {loadingState === 1 && (
          <span className={styles['smbl-message-loading-ing']}>
            {config?.loading?.title || intl.get('smbl.chat.view.message.loading').d('加载中...')}
          </span>
        )}
        {loadingState === 2 && (
          <span className={styles['smbl-message-loading-more']} onClick={this.props.onLoadMore}>
            <Icon
              type={config?.loadMore?.icon || 'arrow_downward'}
              style={{ fontSize: '14px', marginRight: '3px' }}
            />
            {config?.loadMore?.title || intl.get('smbl.chat.view.message.loadMore').d('加载更多')}
          </span>
        )}
        {loadingState === 3 && (
          <span className={styles['smbl-message-loading-no-more']}>
            {config?.noMore?.title ||
              intl.get('smbl.chat.view.message.noMoreMsg').d('没有更多消息')}
          </span>
        )}
      </div>
    );
  }
}

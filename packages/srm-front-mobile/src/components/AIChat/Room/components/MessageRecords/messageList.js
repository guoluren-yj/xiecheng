import React, { Component } from 'react';
import intl from 'utils/intl';
// import classnames from 'classnames';
// import { getCurrentUser } from 'utils/utils';
import aiAvatar from '@/assets/aiAgent/sales-ai.png';
import logoAvatar from '@/assets/icons/logo.png';

import TextMessage from '../MessageWrap/TextMessage';
import { MSG_TYPE } from '../../common/global';
import MessageLoading from '../MessageLoading';
// import { formateTime } from '../../functions/message';
import styles from './messageList.less';
import commonStyles from '../../common/index.less';

export default class MessageList extends Component {
  render() {
    const { messages, loadingState, onScroll } = this.props;

    return (
      <div
        className={`${styles['smbl-history-message-list']} ${commonStyles['smbl-talk-scrollbar']}`}
        onScroll={onScroll}
      >
        {(messages || []).map(record => {
          return (
            <div className={styles['smbl-history-message-wrap']} key={record.message_uuid}>
              <div style={{ paddingTop: '6px' }}>
                <img
                  src={record?.sender === 'AI' ? aiAvatar : logoAvatar}
                  style={{ width: '20px', height: '26px' }}
                  alt=""
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div className={styles['smbl-history-message-first']}>
                  <span className={styles['smbl-history-message-name']}>
                    {record.sender === 'AI'
                      ? intl.get('smbl.chat.view.planeType.aiAgent').d('AI助理')
                      : 'SRM'}
                  </span>
                  {/* <span className={styles['smbl-history-message-time']}>
                    {formateTime(record.creationDate)}
                  </span> */}
                </div>
                <div className={styles['smbl-history-message-content']}>
                  {(record.msgType === MSG_TYPE.TEXT || !record.msgType) && (
                    <TextMessage record={record} style={{ maxWidth: '100%' }} />
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <MessageLoading
          config={{
            loadMore: {
              title: intl.get('smbl.chat.view.message.pullupLoadMore').d('上拉加载更多'),
              icon: 'arrow_upward',
            },
          }}
          loadingState={loadingState}
        />
      </div>
    );
  }
}

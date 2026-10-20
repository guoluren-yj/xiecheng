import React, { Component } from 'react';
import intl from 'utils/intl';
import classnames from 'classnames';
import { getCurrentUser } from 'utils/utils';
import TextMessage from '../MessageWrap/TextMessage';
import ImageMessage from '../MessageWrap/ImageMessage';
import FileMessage from '../MessageWrap/FileMessage';
import { MSG_TYPE } from '../../common/global';
import MessageLoading from '../MessageLoading';
import { formateTime } from '../../functions/message';
import styles from './messageList.less';
import commonStyles from '../../common/index.less';

export default class MessageList extends Component {
  render() {
    const { messages, loadingState, onScroll, roomInfo } = this.props;
    const currentUser = getCurrentUser();
    const { themeConfigVO = {} } = currentUser;
    return (
      <div
        className={`${styles['smbl-history-message-list']} ${commonStyles['smbl-talk-scrollbar']}`}
        onScroll={onScroll}
      >
        {(messages || []).map((record) => {
          const nameClass = classnames(styles['smbl-history-message-name'], {
            [styles['smbl-history-message-my-name']]:
              record.senderRoomMemberId === roomInfo?.currentUser?.roomMemberId,
          });
          const nameStyle = {
            ...(record.senderRoomMemberId === roomInfo?.currentUser?.roomMemberId && {
              color: themeConfigVO.colorCode,
            }),
          };
          return (
            <div
              className={styles['smbl-history-message-wrap']}
              key={record.msgId || record.msgUuid}
            >
              <div className={styles['smbl-history-message-first']}>
                <span className={nameClass} style={nameStyle}>
                  {record.senderUserName}
                </span>
                <span className={styles['smbl-history-message-time']}>
                  {formateTime(record.creationDate)}
                </span>
              </div>
              <div className={styles['smbl-history-message-content']}>
                {record.msgType === MSG_TYPE.TEXT && (
                  <TextMessage record={record} roomInfo={roomInfo} style={{ maxWidth: '100%' }} />
                )}
                {record.msgType === MSG_TYPE.IMAGE && <ImageMessage record={record} />}
                {record.msgType === MSG_TYPE.FILE && <FileMessage record={record} />}
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

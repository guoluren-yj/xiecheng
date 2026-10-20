/**
 * 即刻3.0聊天列表元素
 * @author: sheng.yao <sheng.yao@going-link.com>
 * @date: 2024/02/26
 * @copyright: Copyright (c) 2024, Zhenyun
 */
import React, { forwardRef, useImperativeHandle, useRef, memo, useEffect } from 'react';
import CLN from 'classnames';
import intl from 'utils/intl';
import { Badge } from 'choerodon-ui';
import { isEmpty } from 'lodash';
import { formateTime, transformMessageToText } from '@/components/Chat/Room/functions/message';
import DefaultAvator from '@/assets/detault_avatar.jpg';

import { CHAT_PANEL_CONTENT_TYPE, CHAT_PANEL_TYPE } from '../../constant';
import { isAssistatnt, getText } from '../../utils';
import FadeIn from './fadeIn';
import styles from './index.less';

const ChatItem = forwardRef((props, ref) => {
  const { className, style, roomInfo, isActive, panelType, onClick, onRightClick } = props;
  const itemRef = useRef();
  const {
    type,
    topFlag,
    lastTopFlag,
    drafts = {},
    lastMessage = {},
    userRoomMemberId,
    showDate,
  } = roomInfo;
  const { html, detail, sendTo = [] } = drafts;
  const isAssistantPanel = panelType === CHAT_PANEL_TYPE.ASSISTANT; // 当前是否助手面板
  const isMessagePanel = panelType === CHAT_PANEL_TYPE.MESSAGE; // 当前是否消息面板
  const isAssistatntItem = isAssistatnt(roomInfo); // 当前是否是助手

  // 分析草稿内容
  const parseDrafts = () => {
    if (!detail?.length) return '';
    let message = sendTo.map((item) => `@${item.displayName || item.userNameSuffix}`).join(' ');
    detail.forEach((item) => {
      message += transformMessageToText(item);
    });
    return message;
  };

  // 渲染消息体
  const renderMessage = () => {
    const draftContent = parseDrafts();
    if (html && draftContent) {
      return `<div class=${styles['chat-item-message-drafts']}>
          <span>[${intl.get('smbl.chatHub.view.drafts').d('草稿')}]</span>
          <span>${draftContent}</span>
        </div>`;
    }
    if (!isEmpty(lastMessage)) return transformMessageToText(lastMessage, userRoomMemberId);
    if (type === CHAT_PANEL_CONTENT_TYPE.CHAT_BI) return ''; // 针对chatBi，不显示任何消息体
    return intl.get('smbl.chatHub.view.emptyMessage').d('暂无消息');
  };

  const renderAvatar = () => {
    if (isAssistantPanel || isAssistatntItem) {
      return <img src={roomInfo?.roomIcon || DefaultAvator} alt="" />;
    }
    return (
      <div className={styles['chat-item-avatar']}>{roomInfo?.roomName?.slice(0, 1) ?? ''}</div>
    );
  };

  useImperativeHandle(ref, () => itemRef, []);

  useEffect(() => {
    return () => {
      FadeIn.setInit(userRoomMemberId);
    };
  }, []);

  return (
    <div
      ref={itemRef}
      id={`chat-item-${userRoomMemberId}`}
      key={userRoomMemberId}
      className={CLN(className, styles['chat-item'], 'flex', {
        [styles.init]: !FadeIn.getInit(userRoomMemberId) && isAssistatntItem,
        [styles['fade-in']]: !FadeIn.getInit(userRoomMemberId) && !isAssistatntItem,
        [styles.active]: isActive,
        [styles.top]: topFlag && isMessagePanel,
        [styles['last-top']]: lastTopFlag && isMessagePanel,
      })}
      style={style}
      onClick={() => onClick(roomInfo)}
      onContextMenu={(e) => onRightClick(e, roomInfo)}
    >
      <div className={CLN(styles['chat-item-inner'], 'flex')}>
        {isMessagePanel ? (
          <Badge size="small" count={roomInfo.unreadMsgNum} offset={[0, 40]}>
            {renderAvatar()}
          </Badge>
        ) : (
          renderAvatar()
        )}
        <div
          className={CLN(styles['chat-item-info'], 'flex-column', {
            [styles['chat-item-info-center']]: isAssistantPanel,
          })}
        >
          <div className={CLN(styles['chat-item-title'], 'flex')}>
            <span>{getText(roomInfo.roomName)}</span>
            {isMessagePanel && <span>{formateTime(showDate, false)}</span>}
          </div>
          {isMessagePanel && (
            <span
              className={styles['chat-item-message']}
              dangerouslySetInnerHTML={{ __html: renderMessage() }}
            />
          )}
        </div>
      </div>
    </div>
  );
});

export default memo(ChatItem);

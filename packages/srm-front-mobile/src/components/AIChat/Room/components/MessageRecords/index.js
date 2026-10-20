/* eslint-disable no-param-reassign */
import React, { Component } from 'react';
import classnames from 'classnames';
import uuid from 'uuid';
import intl from 'utils/intl';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import { Button, TextField } from 'choerodon-ui/pro';
import { Icon } from 'choerodon-ui';
import { getChatRoomHistoryMessagesApi } from '@/services/aiChatService';
import styles from './index.less';
import MessageList from './messageList';
import { judgeMessageRecords } from '../../functions/message';

export default class MessageRecords extends Component {
  constructor(props) {
    super(props);
    this.state = {
      allLoadingState: 2, // 1: 加载中; 2: 加载完成可加载下一页;3: 无更多
      allMessages: [],
    };
  }

  componentDidMount() {
    this.loadMessage();
  }

  listScroll = (event) => {
    if (event.target.scrollHeight - event.target.clientHeight - event.target.scrollTop > 10) {
      return;
    }

    const { allLoadingState, allMessages } = this.state;

    if (allLoadingState === 2) {
      const lastMsgId = allMessages.length ? allMessages[allMessages.length - 1].outerMsgId : null;
      this.loadMessage(lastMsgId);
    }
  };

  searchKeyword = null;

  loadMessage = (msgId) => {
    const { agentId } = this.props;
    const { allLoadingState } = this.state;

    if (!agentId) return;
    const pageSize = 20;
    const params = {
      size: pageSize,
      // agentCode: 'AI',
      skillConfigId: agentId,
      tenantId: getCurrentOrganizationId(),
    };

    if (this.searchKeyword) {
      params.msgContent = this.searchKeyword;
    }

    if (msgId) {
      params.lastMsgId = msgId;
    }

    if (allLoadingState !== 2) return;

    this.setState({ allLoadingState: 1 }, () => {
      getChatRoomHistoryMessagesApi(params)
        .then((response) => {
          if (getResponse(response)) {
            const responseList = judgeMessageRecords(response);
            if (responseList?.length) responseList.reverse();
            let messages = [];
            if (msgId) {
              messages = this.state.allMessages;
            }
            messages.push(...responseList);
            messages.forEach((item) => {
              item.message_uuid = uuid();
              item.msgType = 'TEXT';
            });

            this.setState(
              {
                allMessages: messages,
              },
              () => {
                setTimeout(() => {
                  this.setState({
                    allLoadingState: responseList.length < pageSize ? 3 : 2,
                  });
                }, 2000);
              }
            );
          } else {
            this.setState({
              allLoadingState: 2,
            });
          }
        })
        .catch(() => {
          this.setState({
            allLoadingState: 2,
          });
        });
    });
  };

  searchKeywordChanged = (nVal) => {
    if (this.searchKeyword === nVal) {
      return;
    }
    this.searchKeyword = nVal;
    this.loadMessage();
  };

  render() {
    const { allMessages, allLoadingState } = this.state;
    const { className, pageStyle, onClose } = this.props;
    const isRoomOpen = true;
    const groupMemberClass = classnames(styles['smbl-chat-room-history'], className, {
      [styles['smbl-chat-room-history-cover']]: pageStyle === 'cover',
      [styles['smbl-chat-room-history-right']]: pageStyle !== 'cover',
      [styles['smbl-chat-room-history-main']]: !isRoomOpen,
    });

    return (
      <div className={groupMemberClass}>
        {isRoomOpen && (
          <>
            <Button
              className={styles['smbl-chat-room-history-close-btn']}
              funcType="flat"
              icon="close"
              onClick={onClose}
            />
            <div className={styles['smbl-chat-room-history-title']}>
              {intl.get('smbl.chat.view.title.messageRecords').d('消息记录')}
            </div>
          </>
        )}
        <div className={styles['smbl-chat-room-history-search']}>
          <TextField
            style={{ width: '100%' }}
            placeholder={intl.get('smbl.chat.view.message.searchPlaceHolder').d('请输入搜索内容')}
            onEnterDown={(e) => {
              if (e && e.target) {
                this.searchKeywordChanged(e.target.value || '');
              }
            }}
            onBlur={(e) => {
              if (e && e.target) {
                this.searchKeywordChanged(e.target.value || '');
              }
            }}
            prefix={
              <Icon
                type="search"
                style={{ margin: '0 0 0 8px', color: '#1D2129', fontSize: '14px' }}
              />
            }
          />
        </div>
        <div className={styles['smbl-chat-room-history-content']}>
          <MessageList
            messages={allMessages}
            loadingState={allLoadingState}
            onScroll={this.listScroll}
          />
        </div>
      </div>
    );
  }
}

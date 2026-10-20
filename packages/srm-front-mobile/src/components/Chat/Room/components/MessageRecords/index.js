import React, { Component } from 'react';
import classnames from 'classnames';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import { Button, TextField } from 'choerodon-ui/pro';
import { Tabs, Icon } from 'choerodon-ui';
import { getChatRoomHistoryMessagesApi } from '@/services/chatService';
import styles from './index.less';
import MessageList from './messageList';
import { judgeMessageRecords } from '../../functions/message';

export default class MessageRecords extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentTabKey: 'all',
      allLoadingState: 0, // 0: 空，切换到tab自动加载;1: 加载中; 2: 加载完成可加载下一页;3: 无更多
      imageLoadingState: 0,
      fileLoadingState: 0,
      allMessages: [],
      imageMessages: [],
      fileMessages: [],
    };
  }

  componentDidMount() {
    const { allLoadingState } = this.state;
    if (allLoadingState === 0) {
      this.loadMessage('all');
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.suppliersChatType !== nextProps.suppliersChatType) {
      const { suppliersChatType, roomInfo } = nextProps;
      ['allMessages', 'imageMessages', 'fileMessages'].forEach((item) => {
        this.setState({
          [item]: judgeMessageRecords(nextState[item], roomInfo, suppliersChatType),
        });
      });
    }
    return true;
  }

  tabChanged = (nVal) => {
    this.setState({ currentTabKey: nVal });
    if (this.getLoadingState(nVal) === 0) {
      this.loadMessage(nVal);
    }
  };

  listScroll = (event) => {
    if (event.target.scrollHeight - event.target.clientHeight - event.target.scrollTop > 10) {
      return;
    }
    const { currentTabKey, allLoadingState, imageLoadingState, fileLoadingState } = this.state;
    const allLoadingEnable = currentTabKey === 'all' && allLoadingState === 2;
    const imageLoadingEnable = currentTabKey === 'image' && imageLoadingState === 2;
    const fileLoadingEnable = currentTabKey === 'file' && fileLoadingState === 2;
    if (allLoadingEnable) {
      const { allMessages } = this.state;
      const lastMsgId = allMessages.length ? allMessages[allMessages.length - 1].msgId : null;
      this.loadMessage(currentTabKey, lastMsgId);
    } else if (imageLoadingEnable) {
      const { imageMessages } = this.state;
      const lastMsgId = imageMessages.length ? imageMessages[imageMessages.length - 1].msgId : null;
      this.loadMessage(currentTabKey, lastMsgId);
    } else if (fileLoadingEnable) {
      const { fileMessages } = this.state;
      const lastMsgId = fileMessages.length ? fileMessages[fileMessages.length - 1].msgId : null;
      this.loadMessage(currentTabKey, lastMsgId);
    }
  };

  loadMessageState = {
    all: { page: 0 },
    image: { page: 0 },
    file: { page: 0 },
  };

  searchKeyword = null;

  setLoadingState = (tab, stateCode) => {
    if (tab === 'all') {
      this.setState({ allLoadingState: stateCode });
    } else if (tab === 'image') {
      this.setState({ imageLoadingState: stateCode });
    } else if (tab === 'file') {
      this.setState({ fileLoadingState: stateCode });
    }
  };

  getLoadingState = (tab) => {
    if (tab === 'all') {
      return this.state.allLoadingState;
    } else if (tab === 'image') {
      return this.state.imageLoadingState;
    } else if (tab === 'file') {
      return this.state.fileLoadingState;
    }
    return null;
  };

  loadMessage = (tab, msgId) => {
    const pageSize = 20;
    const { roomId, roomInfo } = this.props;
    const params = {
      roomId,
      size: pageSize,
      companyId: roomInfo.currentUser?.companyId,
    };
    if (tab === 'image') {
      params.msgType = 'IMAGE';
    } else if (tab === 'file') {
      params.msgType = 'FILE';
    }
    if (this.searchKeyword) {
      params.msgContent = this.searchKeyword;
    }
    if (msgId) {
      params.msgId = msgId;
    }
    this.setLoadingState(tab, 1);
    getChatRoomHistoryMessagesApi(params)
      .then((response) => {
        if (getResponse(response)) {
          const { suppliersChatType } = this.props;
          // const responseList = response;
          const responseList = judgeMessageRecords(response, roomInfo, suppliersChatType);
          if (tab === 'all') {
            let messages = [];
            if (msgId) {
              messages = this.state.allMessages;
            }
            messages.push(...responseList);
            this.setState({ allMessages: messages });
          } else if (tab === 'image') {
            let messages = [];
            if (msgId) {
              messages = this.state.imageMessages;
            }
            messages.push(...responseList);
            this.setState({ imageMessages: messages });
          } else if (tab === 'file') {
            let messages = [];
            if (msgId) {
              messages = this.state.fileMessages;
            }
            messages.push(...responseList);
            this.setState({ fileMessages: messages });
          }
          this.setLoadingState(tab, responseList.length < pageSize ? 3 : 2);
        } else {
          this.setLoadingState(tab, 2);
        }
      })
      .catch(() => {
        this.setLoadingState(tab, 2);
      });
  };

  searchKeywordChanged = (nVal) => {
    if (this.searchKeyword === nVal) {
      return;
    }
    this.searchKeyword = nVal;
    this.setState({
      allLoadingState: 0,
      imageLoadingState: 0,
      fileLoadingState: 0,
    });
    this.loadMessage(this.state.currentTabKey);
  };

  render() {
    const {
      allMessages,
      imageMessages,
      fileMessages,
      allLoadingState,
      imageLoadingState,
      fileLoadingState,
    } = this.state;
    const { className, pageStyle, onClose, roomInfo } = this.props;
    const isRoomOpen = roomInfo?.state !== 'CLOSE';
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
          {isRoomOpen ? (
            <Tabs
              flex
              defaultActiveKey="all"
              onChange={this.tabChanged}
              style={{ width: '100%', height: '100%' }}
              tabBarStyle={{ padding: '0 20px' }}
            >
              <Tabs.TabPane
                tab={intl.get('smbl.chat.view.button.allMessageTab').d('全部')}
                key="all"
              >
                <MessageList
                  messages={allMessages}
                  loadingState={allLoadingState}
                  roomInfo={roomInfo}
                  onScroll={this.listScroll}
                />
              </Tabs.TabPane>
              <Tabs.TabPane
                tab={intl.get('smbl.chat.view.button.imageMessageTab').d('图片')}
                key="image"
              >
                <MessageList
                  messages={imageMessages}
                  loadingState={imageLoadingState}
                  roomInfo={roomInfo}
                  onScroll={this.listScroll}
                />
              </Tabs.TabPane>
              <Tabs.TabPane
                tab={intl.get('smbl.chat.view.button.fileMessageTab').d('文件')}
                key="file"
              >
                <MessageList
                  messages={fileMessages}
                  loadingState={fileLoadingState}
                  roomInfo={roomInfo}
                  onScroll={this.listScroll}
                />
              </Tabs.TabPane>
            </Tabs>
          ) : (
            <MessageList
              messages={allMessages}
              loadingState={allLoadingState}
              roomInfo={roomInfo}
              onScroll={this.listScroll}
            />
          )}
        </div>
      </div>
    );
  }
}

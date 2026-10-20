/* eslint-disable no-unused-expressions */
import React, { Fragment, Component } from 'react';
import uuid from 'uuid';
import intl from 'utils/intl';
import _ from 'lodash';
import { Icon } from 'choerodon-ui';
import { Modal, Button } from 'choerodon-ui/pro';
import formatterCollections from 'utils/intl/formatterCollections';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import {
  getChatRoomMessagesApi,
  sendMessageApi,
  recallMessageApi,
  addChatRoomMemberApi,
  removeChatRoomMemberApi,
  fetchFeedBackData,
} from '@/services/aiChatService';
import MessageHandler, { Messages } from '@/components/Chat/Message/message-handler';

import manager from '../DataManager';
import Header from './components/Header';
import MeEditor from './components/MeEditor';
import MessageLoading from './components/MessageLoading';
import MessageWrap from './components/MessageWrap';
// import RightClickMenu from './components/RightClickMenu';
import Announcement from './components/Announcement';
import MessageRecords from './components/MessageRecords';
import { judgeMessageRecords, downloadFile } from './functions/message';
import { dateFormat } from './functions';
// import { MSG_STATE } from './common/global';
import styles from './index.less';
import commonStyles from './common/index.less';
import Interval from '../DataManager/interval';

@formatterCollections({ code: ['smbl.chat'] })
export default class Chat extends Component {
  id = uuid();

  scrollRef = React.createRef(null);

  socket = null;

  announcementRef = null;

  contextMenuRef = null;

  editorRef = null;

  loadRoomStatus = {
    loading: false,
  };

  clearStatus = 0; // 0 状态可以滚动加载，1 状态为清屏状态

  constructor(props) {
    super(props);
    const { onRef, defaultSubType } = props;
    if (typeof onRef === 'function') {
      onRef(this);
    }

    this.state = {
      update: {},
      subType: defaultSubType, // 当前展示的副内容：member、history、info
      records: [],
      tipsBoard: false,
      unreadNum: 0,
      announcement: null,
      quoteMsg: null,
      // showCloseBtn: false,
      timeRefresh: null,
      thinking: false,
    };
  }

  componentDidMount() {
    this.handleInit();
  }

  componentWillUnmount() {
    this.handleDestroy();
  }

  componentDidUpdate(prevProps) {
    const { onClearInputMsg } = this.props;
    // 房间基础信息更新
    if (this.checkRoomRequiredParams(prevProps.roomParams)) {
      // this.onRoomChange(prevProps.roomParams);
      this.loadRoomInfo();
    }

    if (this.props.agentId !== prevProps.agentId) {
      this.resetMsgRecords();
    }

    if (this.props.defaultSendMsg && this.props.defaultSendMsg !== prevProps.defaultSendMsg) {
      this.sendMessage({
        msgContent: this.props.defaultSendMsg,
        msgType: 'TEXT',
      });

      if (onClearInputMsg && typeof onClearInputMsg === 'function') {
        onClearInputMsg();
      }
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.suppliersChatType !== nextProps.suppliersChatType) {
      const { records } = nextState; // roomInfo
      // const { suppliersChatType } = nextProps;
      this.setState({ records });
    }
    return true;
  }

  handleDestroy = () => {
    Interval.destory();
    manager.destroySocket(this.id);
  };

  handleInit = async () => {
    const { defaultSendMsg, onClearInputMsg } = this.props;
    Interval.add(this.update).start();
    this.socket = manager.createSocket(this.id, 'AI_PROCESSOR');
    this.registerSocketListener();
    this.loadRoomInfo();

    await this.loadMessage();
    if (defaultSendMsg) {
      this.sendMessage({
        msgContent: this.props.defaultSendMsg,
        msgType: 'TEXT',
      });
      if (onClearInputMsg && typeof onClearInputMsg === 'function') {
        onClearInputMsg();
      }
    }
  };

  // 切换类型 重置聊天记录 及消息列表
  resetMsgRecords = () => {
    this.handleDestroy();
    this.id = uuid(); // 更新 messageId
    this.setState({ records: [] }, () => {
      this.handleInit();
    });
  };

  // 检查获取房间必要参数是否改变
  checkRoomRequiredParams(originRoomParams) {
    const { roomParams: currentRoomParams } = this.props;
    if (!_.isObject(currentRoomParams)) return false; // 如果当前roomParams没有，不更新
    if (!_.isObject(originRoomParams)) return true; // 如果历史roomParams没有，当前roomParams有， 更新
    const checkParams = ['roomId', 'businessNo', 'businessCode', 'currentUser'];
    return checkParams.some(
      (param) => !_.isEqual(originRoomParams[param], currentRoomParams[param])
    );
  }

  // 加载房间信息入口
  loadRoomInfo = () => {
    const { roomParams } = this.props;
    this.socket.waitSocketConnectFinish(this.id, () => {
      this.loadRoomInfoIfNeed(roomParams);
    });
  };

  // 满足条件就去获取房间信息
  loadRoomInfoIfNeed = () => {
    if (this.loadRoomStatus.loading) {
      return false;
    }
  };

  // 组件更新
  update = () => {
    this.setState({ update: {} });
  };

  isExistUuid = (uid) => {
    const { records } = this.state;
    const ary = records.filter((e) => e.message_uuid === uid);
    return !!ary.length;
  };

  registerSocketListener = () => {
    const { agentId } = this.props;
    // 接收消息
    this.socket.registerMessageListener(this.id, 'aiMessage', (msg) => {
      const { onRoomMessage } = this.props;
      // 通知外层接收到消息
      onRoomMessage?.(msg);
      if (agentId !== msg?.skillConfigId) return;
      this.getNewMessage(msg);
    });
  };

  // 流式输出函数
  streamToPage = (text, delay = 60, uId) => {
    let index = 0;
    let allText = '';

    // 使用 setInterval 逐步输出字符
    const intervalId = setInterval(() => {
      if (index < text.length) {
        allText += text[index];
        this.updateMessage(uId, { msgContent: allText }, false);
        this.scrollToBottom();
        index++;
      } else {
        // 停止输出
        clearInterval(intervalId);
      }
    }, delay);
  };

  // 收到新消息
  getNewMessage = (msg) => {
    // 记录开始时的bottom状态
    const isBottom = this.isBottom();
    // 插入到数组最后面
    const { records } = this.state;
    const list = [...records];
    const msgUuid = uuid();

    const newMsg = {
      ...msg,
      msgContent: '',
      float: msg.sender === 'USER' ? 'right' : 'left',
      message_uuid: msgUuid,
      msgUuid,
    };

    const { msgContent = '' } = msg || {};

    const loadingIndex = list.findIndex((item) => item?.contextType === 'loading');
    if (loadingIndex !== -1) {
      list.splice(loadingIndex, 1, newMsg);
    } else {
      list.push(newMsg);
    }

    if (msgContent) {
      this.streamToPage(msgContent, 40, msgUuid);

      const newRecords = judgeMessageRecords(list);
      this.setState({ records: newRecords });
      this.onChangeThinkStatus(false);

      // MessageHandler.postParentMessage(Messages.sendUpdateChatRoomLastMessage, response);
      // 如果不在列表最下面，未读数+1；如果在最下面，则添加消息后滚动到最下面
      if (isBottom) {
        this.scrollToBottom();
      } else {
        let { unreadNum } = this.state;
        unreadNum += 1;
        this.setState({ unreadNum });
      }
    }
  };

  refreshOffset = () => {
    this.setState({
      timeRefresh: new Date().getTime(),
    });
  };

  // 打开聊天信息
  openGroupInfo = (force = false) => {
    if (force) {
      this.setState({ subType: 'info' }, () => {
        this.refreshOffset();
      });
      return;
    }
    const { subType } = this.state;
    if (subType === 'info') {
      this.setState({ subType: null }, () => {
        this.refreshOffset();
      });
    } else {
      this.setState({ subType: 'info' }, () => {
        this.refreshOffset();
      });
    }
  };

  // 打开消息记录
  openMessageRecords = () => {
    const { agentId } = this.props;
    let modal = null;

    const closeModal = () => {
      if (modal) {
        modal.close();
      }
    };

    modal = Modal.open({
      title: intl.get('smbl.chat.view.title.messageRecords').d('消息记录'),
      drawer: true,
      mask: true,
      children: <MessageRecords pageStyle="cover" agentId={agentId} onClose={closeModal} />,
      footer: (
        <Button color="primary" onClick={closeModal}>
          {intl.get('hzero.common.model.button.close').d('关闭')}
        </Button>
      ),
    });
  };

  // 关闭
  close = () => {
    if (typeof this.props.onClose === 'function') {
      this.props.onClose();
      this.refreshOffset();
    }
  };

  // 关闭子窗口
  closeSubtype = () => {
    this.setState({ subType: null }, () => {
      this.refreshOffset();
    });
  };

  // 加载历史消息
  loadMessage = (messageId) => {
    const { agentId } = this.props;
    if (!agentId) return;
    const pageSize = 20;
    this.setState({ msgLoadingState: 1 });
    const params = {
      size: pageSize,
      skillConfigId: agentId,
      tenantId: getCurrentOrganizationId(),
    };

    if (messageId) {
      params.lastMsgId = messageId;
    }
    return getChatRoomMessagesApi(params)
      .then((response) => {
        if (getResponse(response) && Array.isArray(response)) {
          this.clearStatus = 0;
          if (response.length) response.reverse();

          const el = this.scrollRef?.current;
          const lastScrollHeight = el ? el.scrollHeight - el.scrollTop : 0;
          const { records = [] } = this.state;
          const list = [];
          for (let i = 0; i <= response.length - 1; i++) {
            const element = response[i];
            list.push({
              ...element,
              float: element.sender === 'USER' ? 'right' : 'left',
              message_uuid: uuid(),
              msgType: 'TEXT',
            });
          }
          list.push(...records);

          const newRecords = judgeMessageRecords(list);
          this.setState({
            records: newRecords,
          });
          if (response.length < pageSize) {
            this.setState({ msgLoadingState: 3 });
          } else {
            this.setState({ msgLoadingState: 2 });
          }
          if (!messageId) {
            this.scrollToBottom();
          } else if (el) {
            // 保持内容位置
            el.scrollTop = el.scrollHeight - lastScrollHeight;
          }
        }
        return response;
      })
      .catch(() => {
        this.setState({ msgLoadingState: 2 });
      });
  };

  // 加载更多消息
  loadMoreMessage = () => {
    const { records } = this.state;

    if (records.length) {
      const lastMessage = records[0];
      const { outerMsgId } = lastMessage || {};
      if (outerMsgId) {
        this.loadMessage(outerMsgId);
      }
    } else {
      this.loadMessage();
    }
  };

  // 消息窗口滚动监听
  talkPanelScroll = (e) => {
    if (this.clearStatus === 1) {
      return;
    }

    if (this.contextMenuRef) this.contextMenuRef.dismiss();
    if (e.target.scrollTop < 5 && this.state.msgLoadingState === 2) {
      // 根据messageId加载更多
      this.loadMoreMessage();
      return;
    }
    const isBottom = this.isBottom();
    this.setState({ tipsBoard: !isBottom });
    if (isBottom) {
      this.setState({ unreadNum: 0 });
    }
  };

  // 消息窗滚动至底部
  scrollToBottom = () => {
    setTimeout(() => {
      const el = this.scrollRef?.current;
      if (!el) return;
      el.scrollTop = el.scrollHeight;
      // 隐藏“回到底部”按钮
      this.setState({ tipsBoard: false, unreadNum: 0 });
    });
  };

  // 判断当前滚动条是否在底部
  isBottom = () => {
    const el = this.scrollRef?.current;
    if (!el) return false;
    return (
      Math.ceil(el.scrollTop) + el.clientHeight >= el.scrollHeight - 5 // 增加5个像素误差允许
    );
  };

  onMeEditorRef = (ref) => {
    this.editorRef = ref;
  };

  // 发送消息
  sendMessage = async (message) => {
    const { agentId } = this.props;
    if (!agentId) return;

    if (this.announcementRef) this.announcementRef.foldAnnouncement();
    // 消息插入到列表中，并开始loading
    const msgUuid = uuid();
    const messageParams = {
      ...message,
      msgUuid,
      skillConfigId: agentId,
      tenantId: getCurrentOrganizationId(),
    };

    const { records } = this.state;
    const list = [...records];

    list.push({
      ...message,
      msgUuid,
      message_uuid: msgUuid,
      sendStatus: 1,
      creationDate: dateFormat(new Date(), 'YYYY-MM-dd HH:mm:ss'),
      float: 'right',
    });

    const msgUuid2 = uuid();
    list.push({
      msgUuid: msgUuid2,
      message_uuid: msgUuid2,
      creationDate: dateFormat(new Date(), 'YYYY-MM-dd HH:mm:ss'),
      contextType: 'loading',
      float: 'left',
    });

    this.setState({
      records: list,
    });
    this.scrollToBottom();
    const response = await sendMessageApi(messageParams);

    if (getResponse(response)) {
      this.updateMessage(msgUuid, { ...response, float: 'right', sendStatus: null }, false);
      MessageHandler.postParentMessage(Messages.sendUpdateChatRoomLastMessage, response);
    } else {
      this.removeMessageItem(msgUuid2);
      this.updateMessage(msgUuid, { sendStatus: 2 }, true);
    }
  };

  removeMessageItem = (msgUuid) => {
    const { records } = this.state;
    const originData = [...records];
    const index = records.findIndex((e) => e.message_uuid === msgUuid);
    if (index === -1) {
      return;
    }
    originData.splice(index, 1);
    this.setState({
      records: originData,
    });
  };

  // 根据msgUuid更新消息
  updateMessage = (msgUuid, content) => {
    const { records } = this.state;
    const index = records.findIndex((e) => e.message_uuid === msgUuid);
    if (index === -1) {
      return;
    }
    let item = records[index];
    item = {
      ...item,
      ...content,
    };
    records[index] = item;
    this.setState({
      records,
    });
  };

  updateRecallMessageById = (message) => {
    const { records } = this.state;
    const { outerMsgId } = message;
    const newRecords = records.map((e) => {
      if (e.outerMsgId === outerMsgId) {
        e.state = 1;
        return { ...e, originMsgContent: e.msgContent };
      }

      return e;
    });
    this.setState({
      records: newRecords,
    });
  };

  onRightClick = (e, record) => {
    if (e.preventDefault) {
      e.preventDefault();
    }
    const menuList = [];
    const creationDate = new Date(record.creationDate?.replace(/-/g, '/')).getTime();
    const currentDate = new Date().getTime();
    const showRecall = record.float === 'right' && currentDate - creationDate < 2 * 60 * 1000;
    if (showRecall) {
      menuList.push({
        key: 'revocation',
        title: intl.get('smbl.chat.view.button.revocation').d('撤回'),
        icon: 'revocation',
        onClick: () => {
          recallMessageApi({
            msgId: record.outerMsgId,
          }).then((res) => {
            if (getResponse(res)) {
              this.updateRecallMessageById(record);
            }
          });
        },
      });
    }
    menuList.push({
      key: 'quote',
      title: intl.get('smbl.chat.view.button.quote').d('引用'),
      icon: 'low_priority',
      onClick: () => {
        this.setState({
          quoteMsg: record,
        });
        this.editorRef.handleQuoteMsg(record);
      },
    });
    if (record.msgType === 'FILE') {
      menuList.push({
        key: 'download',
        title: intl.get('smbl.chat.view.button.download').d('下载'),
        icon: 'file_download_black-o',
        onClick: () => {
          downloadFile(record.fileUrl);
        },
      });
    }
    this.contextMenuRef?.show(e, menuList);
  };

  onEditorRecall = (record) => {
    if (this.editorRef) {
      this.editorRef.setInputContent(record.originMsgContent);
    }
  };

  // 删除引用消息
  onCloseQuoteMsg = (e) => {
    e.stopPropagation();
    this.setState({ quoteMsg: null });
    this.editorRef.setState({ sendTo: [] });
    this.editorRef.setInputContentByHtml('');
  };

  // 点击引用消息
  onClickQuoteMsg = (quoteMsg) => {
    const msgDom = document.getElementById(quoteMsg.outerMsgId);
    if (!msgDom) return;
    msgDom.scrollIntoView({ behavior: 'smooth', block: 'end' });
  };

  // 外部业务模块使用：添加聊天组成员
  addChatRoomMember = (params) => {
    return addChatRoomMemberApi(params);
  };

  // 外部业务模块使用：删除聊天组成员
  removeChatRoomMember = (params) => {
    return removeChatRoomMemberApi(params);
  };

  handleAtPeople = (record) => {
    if (this.editorRef) {
      const { handleListAt = () => {} } = this.editorRef;

      if (handleListAt) {
        handleListAt(record);
      }
    }
  };

  /**
   * 切换 loading 状态
   */
  onChangeThinkStatus = (status) => {
    this.setState({
      thinking: status,
    });
  };

  onClearWindowMsg = () => {
    this.clearStatus = 1;
    this.setState({
      msgLoadingState: 3,
      records: [],
    });
  };

  onRefreshMessageList = () => {
    this.setState(
      {
        records: [],
      },
      () => {
        this.loadMessage();
      }
    );
  };

  handleFeedback = (item, type) => {
    const { agentId } = this.props;
    if (!agentId) return;

    if (item && item.message_uuid) {
      const messageUuid = item.message_uuid;
      fetchFeedBackData({
        ...item,
        feedback: type,
        skillConfigId: agentId,
      }).then((res) => {
        if (getResponse(res)) {
          this.updateMessage(messageUuid, { item, feedback: type }, false);
        }
      });
    }
  };

  // 渲染主体内容
  renderContent() {
    const {
      // pageStyle = 'cover', // 页面显示样式：cover-覆盖在上层; right: 平铺在右侧
      businessCode = '', // 当前聊天室所在系统code
    } = this.props;

    const {
      update,
      // subType,
      msgLoadingState,
      records,
      tipsBoard,
      unreadNum,
      announcement,
      quoteMsg,
      timeRefresh,
      thinking,
    } = this.state;
    const isRoomOpen = true;
    // 聊天dom
    const chatContent = (
      <>
        {!!update && <div style={{ display: 'none' }} />}
        <div className={styles['smbl-chat-room-talk-panel']}>
          {announcement && <div className={styles['smbl-chat-room-announcement-back']} />}
          {announcement && (
            <Announcement
              onRef={(ref) => {
                this.announcementRef = ref;
              }}
              content={announcement}
            />
          )}

          <div className={styles['smbl-chat-room-talk-panel-top']}>
            <div
              className={`${styles['smbl-chat-room-talk-panel-messages']} ${commonStyles['smbl-talk-scrollbar']}`}
              ref={this.scrollRef}
              onScroll={this.talkPanelScroll}
            >
              {announcement && <div style={{ width: '100%', height: '52px' }} />}
              <MessageLoading loadingState={msgLoadingState} onLoadMore={this.loadMoreMessage} />
              {records.map((record) => {
                return (
                  <MessageWrap
                    onRightClick={this.onRightClick}
                    record={record}
                    key={record.message_uuid || record.outerMsgId}
                    onEditorRecall={this.onEditorRecall}
                    onFeedBack={this.handleFeedback}
                  />
                );
              })}
            </div>
            {tipsBoard && (
              <div className={styles['smbl-chat-room-back-bottom']} onClick={this.scrollToBottom}>
                <div className={styles['smbl-chat-room-back-bottom-content']}>
                  <Icon
                    style={{ fontSize: '12px', margin: '0 2px 2px 0', fontWeight: 600 }}
                    type="vertical_align_bottom"
                  />
                  {unreadNum > 0 && (
                    <span style={{ marginRight: '8px' }}>
                      {intl
                        .get('smbl.chat.view.message.unreadNum', { unreadNum })
                        .d(`新消息${unreadNum}条`)}
                    </span>
                  )}
                  {intl.get('smbl.chat.view.message.backToBottom').d('回到底部')}
                </div>
              </div>
            )}
          </div>
          <MeEditor
            businessCode={businessCode}
            quoteMsg={quoteMsg}
            timeRefresh={timeRefresh}
            thinking={thinking}
            onRef={this.onMeEditorRef}
            onSend={this.sendMessage}
            onOpenMessageRecords={this.openMessageRecords}
            onCloseQuote={this.onCloseQuoteMsg}
            onClickQuote={this.onClickQuoteMsg}
            onCallbackForThinking={this.onChangeThinkStatus}
            onMute={this.onMute}
            onClearWindowMsg={this.onClearWindowMsg}
            onRefreshMessageList={this.onRefreshMessageList}
          />
        </div>
      </>
    );

    // 历史记录dom
    // const messageRecords = <MessageRecords pageStyle="cover" onClose={this.closeSubtype} />;
    // 房间为开启状态， 显示聊天内容 + 信息 + 历史记录
    if (isRoomOpen) {
      return <>{chatContent}</>;
    }

    return <></>;
  }

  render() {
    const { contentClass, contentStyle = {}, showClose = false, pageTitle } = this.props;
    const contentClassAry = [styles['smbl-chat-room-content']];
    if (contentClass) {
      contentClassAry.push(contentClass);
    }

    return (
      <Fragment>
        <div className={contentClassAry.join(' ')} style={contentStyle}>
          <Header onClose={this.close} showClose={showClose} pageTitle={pageTitle} />
          <div
            className={styles['smbl-chat-room-content-wrap']}
            style={{ height: 'calc(100% - 64px)' }}
          >
            {this.renderContent()}
          </div>
        </div>
      </Fragment>
    );
  }
}

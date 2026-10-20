/* eslint-disable no-unused-expressions */
import React, { Fragment, Component } from 'react';
import uuid from 'uuid';
import intl from 'utils/intl';
import _ from 'lodash';
import { Icon } from 'choerodon-ui';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import { getResponse } from 'utils/utils';
import {
  getchatroomInfoApi,
  getchatroomBasicInfoApi,
  getChatRoomMessagesApi,
  sendMessageApi,
  queryRoomAnnouncementApi,
  recallMessageApi,
  muteChatRoomApi,
  addChatRoomMemberApi,
  removeChatRoomMemberApi,
  fetchBeforeInnerMsg,
} from '@/services/chatService';
import MessageHandler, { Messages } from '@/components/Chat/Message/message-handler';

import manager from '../DataManager';
import Header from './components/Header';
import GroupMember from './components/GroupMember';
import GroupInfo from './components/GroupInfo';
import MeEditor from './components/MeEditor';
import MessageLoading from './components/MessageLoading';
import MessageWrap from './components/MessageWrap';
import RightClickMenu from './components/RightClickMenu';
import Announcement from './components/Announcement';
import MessageRecords from './components/MessageRecords';
import { judgeMessageRecords, downloadFile } from './functions/message';
import { dateFormat } from './functions';
import { MSG_STATE, MSG_TYPE } from './common/global';
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

  constructor(props) {
    super(props);
    const { onRef, defaultSubType } = props;
    if (typeof onRef === 'function') {
      onRef(this);
    }

    this.state = {
      update: {},
      subType: defaultSubType, // 当前展示的副内容：member、history、info
      messageRecordsKey: 0, // 历史记录key
      records: [],
      roomInfo: null,
      tipsBoard: false,
      unreadNum: 0,
      announcement: null,
      quoteMsg: null,
      showCloseBtn: false,
      timeRefresh: null,
      memberLoading: false,
    };
  }

  componentDidMount() {
    const { integratedType = 'default' } = this.props;
    const processorMap = {
      jike: 'jike-chat-processor',
      default: 'chat-processor',
    };
    Interval.add(this.update).start();
    this.socket = manager.createSocket(this.id, processorMap[integratedType]);
    this.registerSocketListener();
    this.loadRoomInfo();
  }

  componentWillUnmount() {
    Interval.destory();
    manager.destroySocket(this.id);
  }

  componentDidUpdate(prevProps) {
    // 房间基础信息更新
    if (this.checkRoomRequiredParams(prevProps.roomParams)) {
      this.onRoomChange(prevProps.roomParams);
      this.loadRoomInfo();
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.suppliersChatType !== nextProps.suppliersChatType) {
      const { records, roomInfo } = nextState;
      const { suppliersChatType } = nextProps;
      this.setState({ records: judgeMessageRecords(records, roomInfo, suppliersChatType) });
    }
    return true;
  }

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

  // 房间更新
  onRoomChange = (roomInfo) => {
    const { onRoomChange, roomParams = {} } = this.props;
    const { quoteMsg } = this.state;
    const { drafts = {} } = roomParams;
    const inputDom = document.getElementById('smbl-me-editor-textarea-container');
    // 上一个房间草稿内容
    const beforeDrafts = {
      html: inputDom?.innerHTML,
      detail: this.editorRef?.getInputContent(),
      sendTo: this.editorRef?.state?.sendTo || [],
    };
    if (drafts.html) {
      // 恢复草稿
      this.editorRef?.setInputContentByHtml(drafts.html);
      this.editorRef?.setState({ sendTo: drafts.sendTo });
    } else {
      // 清空输入框
      this.editorRef?.setInputContent('');
      this.editorRef?.setState({ sendTo: [] });
    }
    if (quoteMsg) {
      this.setState({ quoteMsg: null });
    }
    this.editorRef?.setInputFocus();
    onRoomChange?.(roomInfo, beforeDrafts);
  };

  // 加载房间信息入口
  loadRoomInfo = () => {
    const { roomParams } = this.props;
    this.socket.waitSocketConnectFinish(this.id, () => {
      this.loadRoomInfoIfNeed(roomParams);
    });
  };

  // 满足条件就去获取房间信息
  loadRoomInfoIfNeed = (roomParams) => {
    if (this.loadRoomStatus?.loading) {
      return;
    }
    if (
      !roomParams ||
      !roomParams.businessNo ||
      !roomParams.businessCode ||
      !roomParams.currentUser
    ) {
      return;
    }
    this.getRoomInfo(roomParams);
  };

  // 获取房间信息
  getRoomInfo = (roomParams) => {
    const { integratedType = 'default' } = this.props;
    this.loadRoomStatus.loading = true;
    this.setState({ subType: null }, () => {
      getchatroomBasicInfoApi(roomParams).then((response) => {
        this.editorRef?.sendTargetRef?.clearSelect();
        this.loadRoomStatus.loading = false;
        if (getResponse(response)) {
          const keyMap = {
            jike: 'jikeRoomInMsgHandler',
            default: 'roomInMsgHandler',
          };
          this.queryRoomAnnouncement(response.roomId, response.currentUser?.companyId);
          this.setState(
            {
              roomInfo: response,
              records: [],
              messageRecordsKey: this.state.messageRecordsKey + 1,
              memberLoading: true,
            },
            () => {
              // 延缓查询人员列表信息
              getchatroomInfoApi(roomParams).then((res) => {
                const state = { memberLoading: false };
                if (getResponse(res) && res.roomId === this.state.roomInfo.roomId) {
                  state.roomInfo = res;
                }
                this.setState(state);
              });
            }
          );
          this.loadMessage();
          this.socket?.send?.({
            key: keyMap[integratedType] || 'roomInMsgHandler',
            message: {
              roomMemberId: response.currentUser?.roomMemberId,
            },
          });
        } else {
          this.setState({
            showCloseBtn: true,
          });
        }
      });
    });
  };

  // 重置房间信息
  resetRoom = () => {
    const { defaultSubType } = this.props;
    this.setState({
      subType: defaultSubType, // 当前展示的副内容：member、history、info
      msgLoadingState: 1,
      records: [],
      roomInfo: {},
      tipsBoard: false,
      unreadNum: 0,
      announcement: null,
      quoteMsg: null,
    });
  };

  // 组件更新
  update = () => {
    this.setState({ update: {} });
  };

  // 群公告
  queryRoomAnnouncement = async (roomId, companyId) => {
    const result = await queryRoomAnnouncementApi(roomId, companyId);
    if (getResponse(result)) {
      this.setState({ announcement: result.msgContent });
    }
  };

  isExistUuid = (uid) => {
    const { records } = this.state;
    const ary = records.filter((e) => e.msgUuid === uid);
    return !!ary.length;
  };

  registerSocketListener = () => {
    // 接收消息
    this.socket.registerMessageListener(this.id, 'NEW_MSG', (msg) => {
      const { onRoomMessage } = this.props;
      const { roomInfo = {} } = this.state;
      // 通知外层接收到消息
      onRoomMessage?.(msg);
      if (!roomInfo || msg.roomId !== roomInfo?.roomId) return; // 不是当前房间消息
      this.getNewMessage(msg, roomInfo);
    });
    // 聊天室成员上线
    this.socket.registerMessageListener(this.id, 'USER_ONLINE', (msg) => {
      const { roomInfo = {} } = this.state;
      if (!roomInfo || !msg || !msg.roomId?.includes(roomInfo?.roomId)) return; // 不是当前房间消息
      this.updateUserOnLineStatus(msg, true);
    });
    // 聊天室成员下线
    this.socket.registerMessageListener(this.id, 'USER_OFFLINE', (msg) => {
      const { roomInfo = {} } = this.state;
      if (!roomInfo || !msg || !msg.roomId?.includes(roomInfo?.roomId)) return; // 不是当前房间消息
      this.updateUserOnLineStatus(msg, false);
    });
    // 聊天室名字修改
    this.socket.registerMessageListener(this.id, 'RENAME_ROOM', (msg) => {
      const { onRoomInfoChange } = this.props;
      const { roomInfo = {} } = this.state;
      onRoomInfoChange?.(msg.roomId, { roomName: msg.businessTitle });
      if (!roomInfo || msg.roomId !== roomInfo?.roomId) return; // 不是当前房间消息
      this.roomNameChanged(msg.businessTitle);
    });
    // 聊天室公告
    this.socket.registerMessageListener(this.id, 'ANNOUNCEMENT', (msg) => {
      const { roomInfo = {} } = this.state;
      if (!roomInfo || msg.roomId !== roomInfo?.roomId) return; // 不是当前房间消息
      this.announcementChanged(msg.msgContent);
    });
    // 撤回消息
    this.socket.registerMessageListener(this.id, 'RECALL_MSG', (msg) => {
      const { onRoomMessage } = this.props;
      const { roomInfo = {} } = this.state;
      onRoomMessage?.({ ...msg, state: MSG_STATE.RECALL });
      // 不是当前房间消息
      if (!roomInfo || msg.roomId !== roomInfo?.roomId) return;
      this.updateRecallMessageById(msg);
    });
    // 聊天室开启禁言
    this.socket.registerMessageListener(this.id, 'MUTE', (msg) => {
      const { roomInfo = {} } = this.state;
      if (!roomInfo || msg.roomId !== roomInfo?.roomId) return; // 不是当前房间消息
      this.muteStateChange(0);
    });
    // 聊天室解除禁言
    this.socket.registerMessageListener(this.id, 'UNMUTE', (msg) => {
      const { roomInfo = {} } = this.state;
      if (!roomInfo || msg.roomId !== roomInfo?.roomId) return; // 不是当前房间消息
      this.muteStateChange(1);
    });
    // 聊天室成员变更
    this.socket.registerMessageListener(this.id, 'MEMBER_CHANGE', (msg) => {
      const { roomInfo = {} } = this.state;
      if (!roomInfo || msg.roomId !== roomInfo?.roomId) return; // 不是当前房间消息
      // 重新获取roomInfo房间信息
      this.refreshRoomInfo();
    });
    // 聊天室开启/关闭状态监听
    this.socket.registerMessageListener(this.id, 'ROOM_STATE_CHANGE', (msg) => {
      const { onRoomInfoChange } = this.props;
      const { roomInfo = {} } = this.state;
      onRoomInfoChange?.(msg.roomId, { state: msg.state });
      if (!roomInfo || msg.roomId !== roomInfo?.roomId) return; // 不是当前房间消息
      this.roomStateChange(msg.state);
    });
  };

  // 刷新房间信息
  refreshRoomInfo = () => {
    const { roomParams } = this.props;
    this.setState({ memberLoading: true });
    getchatroomInfoApi(roomParams).then((response) => {
      const state = { memberLoading: false };
      if (getResponse(response) && response.roomId === this.state.roomInfo.roomId) {
        state.roomInfo = response;
      }
      this.setState(state);
    });
  };

  // 禁言状态修改
  muteStateChange = (muteFlag) => {
    const { roomInfo } = this.state;
    roomInfo.muteState = muteFlag;
    this.setState({ roomInfo });
    this.scrollToBottom();
  };

  // 房间状态修改
  roomStateChange = (state) => {
    const { roomInfo } = this.state;
    roomInfo.state = state;
    this.setState({ roomInfo });
    // 发送目标切换为所有人
    if (state === 'FORBIDDEN_PRIVATE_MESSAGE') {
      this.editorRef?.sendTargetRef?.clearSelect();
      // 房间关闭, 关闭侧边框
    } else if (state === 'CLOSE') {
      this.closeSubtype();
    }
  };

  // 收到新消息
  getNewMessage = (msg, roomInfo) => {
    const userId = roomInfo.currentUser?.roomMemberId;
    const uid = msg.msgUuid || null;
    const isSendByMe = userId === msg.senderRoomMemberId;
    // 多端登录，发送时需过滤当前登录
    if (uid && isSendByMe && this.isExistUuid(uid)) {
      return;
    }
    // 记录开始时的bottom状态
    const isBottom = this.isBottom();
    // 插入到数组最后面
    const { records } = this.state;
    const { suppliersChatType } = this.props;
    const list = [...records];
    list.push({
      ...msg,
      float: userId === msg.senderRoomMemberId ? 'right' : 'left',
    });
    const newRecords = judgeMessageRecords(list, roomInfo, suppliersChatType);
    this.setState({ records: newRecords });
    // 如果不在列表最下面，未读数+1；如果在最下面，则添加消息后滚动到最下面
    if (isBottom) {
      this.scrollToBottom();
    } else {
      let { unreadNum } = this.state;
      unreadNum += 1;
      this.setState({ unreadNum });
    }
  };

  // 聊天室成员在线状态更新
  updateUserOnLineStatus = (data, isOnline) => {
    const { roomInfo } = this.state;
    if (!roomInfo) return;
    const onlineFormat = (member) => {
      if (
        member.userId === data.userId &&
        !data.stillOnlineRoomMemberIds?.includes(member.userRoomMemberId) &&
        (!data.companyId || member.companyId === data.companyId)
      ) {
        return {
          ...member,
          onlineFlag: isOnline,
        };
      }
      return member;
    };
    if (roomInfo.purchase && roomInfo.purchase.members?.length) {
      roomInfo.purchase.members = (roomInfo.purchase.members || []).map((m) => onlineFormat(m));
    }
    roomInfo.suppliers = (roomInfo.suppliers || []).map((tenant) => ({
      ...tenant,
      members: (tenant.members || []).map((m) => onlineFormat(m)),
    }));
    this.setState({ roomInfo });
  };

  refreshOffset = () => {
    this.setState({
      timeRefresh: new Date().getTime(),
    });
  };

  // 打开群组成员列表
  openGroupMember = (force = false) => {
    if (force) {
      this.setState({ subType: 'member' }, () => {
        // this.fetchFullRoomInfo();
        this.refreshOffset();
      });
      return;
    }
    const { subType } = this.state;
    if (subType === 'member') {
      this.setState({ subType: null }, () => {
        this.refreshOffset();
      });
    } else {
      this.setState({ subType: 'member' }, () => {
        // this.fetchFullRoomInfo();
        this.refreshOffset();
      });
    }
  };

  // fetchFullRoomInfo = () => {
  //   this.refreshRoomInfo();
  // };

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
  openMessageRecords = (force = false) => {
    if (force) {
      this.setState({ subType: 'history' }, () => {
        this.refreshOffset();
      });
      return;
    }
    const { subType } = this.state;
    if (subType === 'history') {
      this.setState({ subType: null }, () => {
        this.refreshOffset();
      });
    } else {
      this.setState({ subType: 'history' }, () => {
        this.refreshOffset();
      });
    }
  };

  // 关闭
  close = () => {
    if (typeof this.props.onClose === 'function') {
      this.props.onClose();
      this.setState({ showCloseBtn: false }, () => {
        this.refreshOffset();
      });
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
    const { roomInfo } = this.state;
    const { suppliersChatType } = this.props;
    if (!roomInfo) return;
    const pageSize = 20;
    this.setState({ msgLoadingState: 1 });
    const params = {
      roomId: roomInfo.roomId,
      size: pageSize,
    };
    params.companyId = roomInfo.currentUser?.companyId;
    if (messageId) {
      params.msgId = messageId;
    }
    getChatRoomMessagesApi(params)
      .then((response) => {
        if (getResponse(response)) {
          const userId = roomInfo.currentUser?.roomMemberId;
          const el = this.scrollRef?.current;
          const lastScrollHeight = el ? el.scrollHeight - el.scrollTop : 0;
          const { records = [] } = this.state;
          const list = [];
          for (let i = response.length - 1; i >= 0; i--) {
            const element = response[i];
            list.push({
              ...element,
              float: userId === element.senderRoomMemberId ? 'right' : 'left',
            });
          }
          list.push(...records);
          const newRecords = judgeMessageRecords(list, roomInfo, suppliersChatType);
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
      this.loadMessage(lastMessage.msgId);
    } else {
      this.loadMessage();
    }
  };

  // 消息窗口滚动监听
  talkPanelScroll = (e) => {
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
    const { hitTypes = [] } = message;

    // 验证 hitTypes 数组内字符串的一致性
    if (hitTypes.length > 1) {
      const firstType = hitTypes[0];
      const hasInconsistentTypes = hitTypes.some((type) => type !== firstType);
      if (hasInconsistentTypes) {
        notification.error({
          message: intl
            .get('smbl.chat.view.message.cannotatUserAndTenant')
            .d('不可同时@用户与公司'),
        });
        return;
      }
    }

    if (!this.state.roomInfo) return;
    if (this.announcementRef) this.announcementRef.foldAnnouncement();
    // 消息插入到列表中，并开始loading
    const msgUuid = uuid();
    const messageParams = {
      ...message,
      roomId: this.state.roomInfo.roomId,
      senderCompanyId: this.state.roomInfo.currentUser.companyId,
      msgUuid,
    };
    const { quoteMsg } = this.state;
    let localQuoteMsg = null;
    if (quoteMsg && message.msgType === MSG_TYPE.TEXT) {
      messageParams.quoteMsgId = quoteMsg.msgId;
      messageParams.quoteMsg = quoteMsg;
      localQuoteMsg = quoteMsg;
      this.setState({ quoteMsg: null });
    }
    const { records, roomInfo } = this.state;
    const { suppliersChatType } = this.props;
    const list = [...records];
    list.push({
      ...message,
      roomId: this.state.roomInfo.roomId,
      msgUuid,
      sendStatus: 1,
      creationDate: dateFormat(new Date(), 'YYYY-MM-dd HH:mm:ss'),
      float: 'right',
      quoteMsg: localQuoteMsg,
    });
    const newRecords = judgeMessageRecords(list, roomInfo, suppliersChatType);
    this.setState({
      records: newRecords,
    });
    this.scrollToBottom();
    const response = await sendMessageApi(messageParams);
    if (getResponse(response)) {
      this.updateMessage(msgUuid, { ...response, float: 'right', sendStatus: null }, false);
      MessageHandler.postParentMessage(Messages.sendUpdateChatRoomLastMessage, response);
    } else {
      this.updateMessage(msgUuid, { sendStatus: 2 }, true);
    }
  };

  // 根据msgUuid更新消息
  updateMessage = (msgUuid, content) => {
    const { records } = this.state;
    const index = records.findIndex((e) => e.msgUuid === msgUuid);
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
    const { msgId } = message;
    const newRecords = records.map((e) => {
      if (e.msgId === msgId) {
        e.state = 1;
        return { ...e, originMsgContent: e.msgContent };
      }
      if (e.quoteMsg && e.quoteMsg.msgId === msgId) {
        e.quoteMsg.state = 1;
      }
      return e;
    });
    this.setState({
      records: newRecords,
    });
  };

  roomNameChanged = (nVal) => {
    const { roomInfo } = this.state;
    const newRoomInfo = {
      ...roomInfo,
      roomName: nVal,
    };
    this.setState({ roomInfo: newRoomInfo });
  };

  announcementChanged = (nVal) => {
    this.setState({
      announcement: nVal,
    });
  };

  onRightClick = (e, record) => {
    const { roomInfo } = this.state;
    if (roomInfo.currentUser?.userState === 0) {
      return;
    }
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
            msgId: record.msgId,
            companyId: roomInfo.currentUser?.companyId,
            roomId: roomInfo.roomId,
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
    this.contextMenuRef.show(e, menuList);
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
    const msgDom = document.getElementById(quoteMsg.msgId);
    if (!msgDom) return;
    msgDom.scrollIntoView({ behavior: 'smooth', block: 'end' });
  };

  // 禁言
  onMute = async () => {
    const { roomInfo } = this.state;
    const currentState = roomInfo.muteState;
    const res = await muteChatRoomApi(currentState, roomInfo.roomId);
    if (getResponse(res)) {
      this.muteStateChange(!currentState);
    }
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
   * 加载入群前消息
   * @returns
   */
  handleLoadMessage = async () => {
    const { roomInfo } = this.state;
    if (!roomInfo) return;

    const params = {
      roomId: roomInfo.roomId,
      roomMemberId: roomInfo.currentUser?.roomMemberId,
    };

    await fetchBeforeInnerMsg(params);
    this.setState(
      {
        records: [],
      },
      () => {
        this.loadRoomInfo();
      }
    );
  };

  // 渲染主体内容
  renderContent() {
    const {
      suppliersChatType = 'single',
      pageStyle = 'right', // 页面显示样式：cover-覆盖在上层; right: 平铺在右侧
      groupSetting = true,
      businessCode = '', // 当前聊天室所在系统code
      supplierGroupSetting = false,
      purchaseGroupSetting = true,
    } = this.props;

    const {
      update,
      subType,
      msgLoadingState,
      messageRecordsKey,
      records,
      roomInfo,
      tipsBoard,
      unreadNum,
      announcement,
      quoteMsg,
      timeRefresh,
      memberLoading,
    } = this.state;
    const { purchaseFlag } = roomInfo || {};
    const isRoomOpen = roomInfo?.state !== 'CLOSE';
    const groupSettingEnable =
      groupSetting && (purchaseFlag ? purchaseGroupSetting : supplierGroupSetting);
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
                    roomInfo={roomInfo}
                    key={record.msgId || record.msgUuid}
                    onEditorRecall={this.onEditorRecall}
                  />
                );
              })}
              {!roomInfo.muteState && (
                <div className={styles['smbl-chat-room-shutup-tip']}>
                  {intl.get('smbl.chat.view.message.shutupTip').d('采购方已开启禁言')}
                </div>
              )}
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
          {roomInfo.currentUser?.userState !== 0 && (
            <MeEditor
              businessCode={businessCode}
              quoteMsg={quoteMsg}
              roomInfo={roomInfo}
              timeRefresh={timeRefresh}
              onRef={this.onMeEditorRef}
              onSend={this.sendMessage}
              onOpenMessageRecords={this.openMessageRecords}
              onCloseQuote={this.onCloseQuoteMsg}
              onClickQuote={this.onClickQuoteMsg}
              onMute={this.onMute}
              onLoadMessage={this.handleLoadMessage}
            />
          )}
        </div>
      </>
    );
    // 信息面板dom
    const infoPanel = (
      <>
        {subType === 'member' && (
          <GroupMember
            memberLoading={memberLoading}
            roomInfo={roomInfo}
            pageStyle={pageStyle}
            onClose={this.closeSubtype}
            onAtPeople={this.handleAtPeople}
          />
        )}
        {subType === 'info' && groupSettingEnable && (
          <GroupInfo
            roomInfo={roomInfo}
            pageStyle={pageStyle}
            announcement={announcement}
            onClose={this.closeSubtype}
          />
        )}
      </>
    );
    // 历史记录dom
    const messageRecords = (
      <>
        {!!messageRecordsKey && (
          <MessageRecords
            key={messageRecordsKey}
            pageStyle={pageStyle}
            onClose={this.closeSubtype}
            roomId={roomInfo.roomId}
            roomInfo={roomInfo}
            suppliersChatType={suppliersChatType}
          />
        )}
      </>
    );
    // 房间为开启状态， 显示聊天内容 + 信息 + 历史记录
    if (isRoomOpen) {
      return (
        <>
          {chatContent}
          {infoPanel}
          {subType === 'history' && messageRecords}
        </>
      );
    }
    // 房间为关闭状态，只显示历史记录
    return (
      <>
        {messageRecords}
        {infoPanel}
      </>
    );
  }

  render() {
    const {
      contentClass,
      contentStyle = {},
      showHeader = true, // 是否显示header
      memberCountType = 'company',
      roomNameJump,
      showClose = false,
      groupSetting = true,
      supplierGroupSetting = false,
      purchaseGroupSetting = true,
      groupMemberEnable = true,
    } = this.props;
    const { roomInfo, showCloseBtn } = this.state;
    const contentClassAry = [styles['smbl-chat-room-content']];
    if (contentClass) {
      contentClassAry.push(contentClass);
    }

    return (
      <Fragment>
        {!roomInfo ? (
          <>
            {showCloseBtn ? (
              <div className={styles['smbl-chat-room-header']}>
                <Icon
                  type="close"
                  className="smbl-chat-room-header-close"
                  style={{ cursor: 'pointer' }}
                  onClick={this.close}
                />
              </div>
            ) : null}
            <div className={contentClassAry.join(' ')} style={contentStyle}>
              <div className={styles['smbl-chat-room-empty']}>
                {intl.get('smbl.chat.view.message.chatRoomEmpty').d('正在加载房间信息...')}
              </div>
            </div>
          </>
        ) : (
          <div className={contentClassAry.join(' ')} style={contentStyle}>
            {showHeader && (
              <Header
                onGroupMemberClick={this.openGroupMember}
                onGroupInfoClick={this.openGroupInfo}
                onClose={this.close}
                roomNameJump={roomNameJump}
                memberCountType={memberCountType}
                roomInfo={roomInfo}
                showClose={showClose}
                groupSetting={groupSetting}
                supplierGroupSetting={supplierGroupSetting}
                purchaseGroupSetting={purchaseGroupSetting}
                groupMemberEnable={groupMemberEnable}
              />
            )}
            <div
              className={styles['smbl-chat-room-content-wrap']}
              style={{ height: showHeader ? 'calc(100% - 56px)' : '100%' }}
            >
              {this.renderContent()}
            </div>
          </div>
        )}
        <RightClickMenu
          onRef={(ref) => {
            this.contextMenuRef = ref;
          }}
        />
      </Fragment>
    );
  }
}

/**
 * 即刻3.0入口页
 * @author: sheng.yao <sheng.yao@going-link.com>
 * @date: 2024/02/21
 * @copyright: Copyright (c) 2024, Zhenyun
 */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-param-reassign */
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { compose, isArray } from 'lodash';
import CLN from 'classnames';
import intl from 'utils/intl';
import uuid from 'uuid';
import { Icon } from 'choerodon-ui';
import { ModalProvider, Button, Radio } from 'choerodon-ui/pro'; // TextArea
import { getResponse, getCurrentOrganizationId } from 'utils/utils';

import StreamingText from '@/components/StreamingText';
import ChatRoom from '@/components/Chat/Room';
import {
  topChatRoomApi,
  cancelTopChatRoomApi,
  getAssistantInfoApi,
  fetchAITypeList,
} from '@/services/chatHubService';
import formatterCollections from 'utils/intl/formatterCollections';
import withProps from 'utils/withProps';
import useLatest from '@/components/Chat/hooks/useLatest';
import { MSG_STATE } from '@/components/Chat/Room/common/global';
import MessageHandler, { Events, Messages } from '@/components/Chat/Message/message-handler';
import NLP_LOGO from '@/assets/icons/nlp_logo.png';
import CHAT_BI_LOGO from '@/assets/icons/chat-bi_logo.png';
import ASSISTANT_LOGO from '@/assets/icons/assistant_logo.png';
import AgentChatRoom from '@/components/AIChat/Room';
import logoAvatar from '@/assets/icons/logo.png';
import { getURLSearchParams } from '@/utils/utils';
import { sendMessageApi } from '@/services/aiChatService';

import manager from '@/components/AIChat/DataManager';
import Interval from '@/components/AIChat/DataManager/interval';

import { CHAT_PANEL_TYPE, CHAT_PANEL_CONTENT_TYPE, ASSISTANT_KEY_LIST } from './constant';
import AssistantPageList from './AssistantPageList';
import ChatList from './ChatList';
import EmptyPanel from './EmptyPanel';
import AssistantOpen from './AssistantOpen';
import styles from './index.less';

let tipsMap = {};
let socket = null;
let globalUuid = null;
let globalAiTypeList = [];
let defaultSendMsg = '';
// let inputMsg = '';

const ChatHubRoom = props => {
  const { href = '', location } = props;
  const [showContent, setShowContent] = useState(CHAT_PANEL_CONTENT_TYPE.EMPTY); // 当前显示的面板内容
  const [panelType, setPanelType] = useState(CHAT_PANEL_TYPE.MESSAGE); // 当前选择面板类型
  const [showAssistantPage, setShowAssistantPage] = useState(false); // 显示助手iframe
  const [roomList, setRoomList] = useState([]); // 房间列表，包含三个助手
  const [assistantList, setAssistantList] = useState([]); // 助手列表
  const [showChatOnline, setShowChatOnline] = useState(false); // 是否需要在线沟通列表
  const [activeRoomMemberId, setActiveRoomMemberId] = useState(null); // 当前在线沟通房间信息
  const [agentType, setAgentType] = useState(''); // 新 AI 助理，所选知识库类型
  const [selectedType, setSelectedType] = useState('');
  const [sending, setSending] = useState(false);
  const [typeTitle, setTypeTitle] = useState('');
  const [aiTypeList, setAiTypeList] = useState([]);
  const [agentId, setAgentId] = useState('');
  const [defaultAgentId, setDefaultAgentId] = useState('');
  const [update, setUpdate] = useState(false);
  const [suggestList, setSuggestList] = useState([]);
  const [exitBtnMsg, setExitBtnMsg] = useState('');

  const searchStr = href && href.indexOf('?') !== -1 ? href.substr(href.indexOf('?') + 1) : '';

  const { aiOpenFlag = '' } = getURLSearchParams(searchStr || (location?.search ?? ''));

  const ref = useRef();
  const roomRef = useRef();
  const editableRef = useRef(null);

  // 当前打开的聊天室
  const activeRoom = useMemo(() => {
    return roomList.find(room => room.userRoomMemberId === activeRoomMemberId) || {};
  }, [activeRoomMemberId, roomList]);

  // 防止闭包
  const latestRoomList = useLatest(roomList); // 房间列表最新值
  const latestActiveRoom = useLatest(activeRoom); // 当前打开的聊天室

  const {
    panelTypeChange,
    openChatRoom,
    resetPanel,
    getRoomRef,
    onClose,
    onSendLoadChatHub,
    onRoomMessage,
    onAssistantMessage,
    onSendPurchaseRobotLoaded,
    onSendMenu,
  } = useMemo(() => {
    const staticFunction = {};

    // 打开在线沟通聊天室
    staticFunction.openChatRoom = roomInfo => {
      const { serviceCode } = roomInfo;
      setShowContent(roomInfo.type || CHAT_PANEL_CONTENT_TYPE.CHAT_ROOM);
      setActiveRoomMemberId(roomInfo.userRoomMemberId);
      if (serviceCode === CHAT_PANEL_CONTENT_TYPE.NLP) {
        MessageHandler.postIframeMessage({ type: Messages.sendPurchaseRobotRoomInMessage });
      }
    };

    // 面板重置
    staticFunction.resetPanel = () => {
      setShowContent(CHAT_PANEL_CONTENT_TYPE.EMPTY);
      setActiveRoomMemberId(null);
      roomRef.current?.resetRoom();
    };

    // 面板类型修改
    staticFunction.panelTypeChange = _type => {
      setPanelType(_type);
      staticFunction.resetPanel();
    };

    // 房间ref
    staticFunction.getRoomRef = _ref => {
      roomRef.current = _ref;
    };

    // 关闭回调
    staticFunction.onClose = () => {
      MessageHandler.postParentMessage(Messages.closeChatHubIframe);
    };

    // 获取助手列表
    const getAssistantList = list => {
      const assistantBaseInfoMap = {
        [CHAT_PANEL_CONTENT_TYPE.NLP]: {
          roomName: () => intl.get('smbl.chatHub.view.roomName.nlp').d('采购助手'),
          description: () => intl.get('smbl.chatHub.view.description.nlp').d('采购助手描述'),
          urlExtra: '&roomInDelay=1',
          icon: NLP_LOGO,
          roomIcon: NLP_LOGO,
        },
        [CHAT_PANEL_CONTENT_TYPE.CHAT_BI]: {
          roomName: () => intl.get('smbl.chatHub.view.roomName.chatBi').d('数据助手'),
          description: () => intl.get('smbl.chatHub.view.description.chatBi').d('数据助手描述'),
          icon: CHAT_BI_LOGO,
          roomIcon: CHAT_BI_LOGO,
        },
        [CHAT_PANEL_CONTENT_TYPE.ASSISTANT]: {
          roomName: () => intl.get('smbl.chatHub.view.roomName.assistant').d('业务助手'),
          description: () => intl.get('smbl.chatHub.view.description.assistant').d('业务助手描述'),
          urlExtra: '&showCloseBtn=1',
          icon: ASSISTANT_LOGO,
          roomIcon: ASSISTANT_LOGO,
        },
      };
      const _assistantList = ASSISTANT_KEY_LIST.map(key => {
        const assistant = isArray(list) ? list.find(item => item.serviceCode === key) : null;
        const baseInfo = {
          topFlag: 10,
          userRoomMemberId: uuid(),
          ...assistantBaseInfoMap[key],
        };
        if (assistant) {
          const { lastMessage = {} } = assistant;
          try {
            lastMessage.purchaseRobotMsg = JSON.parse(lastMessage.purchaseRobotMsg);
          } catch (error) {
            console.warn('助手消息解析失败');
          }
          return {
            ...baseInfo,
            ...assistant,
            lastMessage,
            openFlag: 1,
            showDate: lastMessage?.creationDate,
            roomId: assistant.roomId || uuid(),
            type: assistant.serviceCode,
            roomName: assistant.appName,
            roomIcon: assistant.icon,
          };
        }
        return {
          ...baseInfo,
          openFlag: 0,
          roomId: uuid(),
          type: key,
        };
      });
      return _assistantList;
    };

    // 更新助手列表相关数据
    const updateAssistantListInfo = async () => {
      let _assistantList = await getAssistantInfoApi();
      if (!getResponse(_assistantList)) _assistantList = [];
      const newAssistantList = getAssistantList(_assistantList);
      const newRoomList = latestRoomList.current.filter(room => !room.serviceCode);
      setRoomList(newRoomList.concat(newAssistantList));
      setAssistantList(newAssistantList);
      // 助手iframe加载400的延迟是为了给助手动画预留时间，防止卡顿
      setTimeout(() => {
        setShowAssistantPage(true);
      }, 400);
    };

    // 收到第三方数据
    staticFunction.onSendLoadChatHub = data => {
      updateAssistantListInfo();
      setShowChatOnline(!!data.content?.hasBuyPurchase?.showChatOnline);
    };

    // 判断最新消息是否需要更新
    const checkLastMessageNeedUpdate = (message, room) => {
      const { roomId, messageId, roomMemberId } = message;
      // 不在该房间
      if (room.roomId !== roomId) return false;
      // 同一账号同一房间不同角色
      if (roomMemberId && room.userRoomMemberId !== roomMemberId) return false;
      // 最后一条消息以更新
      if (messageId && room?.lastMessage?.messageId === messageId) return false;
      return true;
    };

    // 接收到在线沟通消息
    staticFunction.onRoomMessage = message => {
      const { roomId, state, msgId, messageId, content, creationDate } = message;
      const _roomList = latestRoomList.current;
      const _activeRoom = latestActiveRoom.current;
      const newRoomList = _roomList.slice();
      const isCurrentRoom = roomId === _activeRoom.roomId;
      // 正常发送的消息
      if (Number(state) === MSG_STATE.RECEIVE) {
        newRoomList.forEach(room => {
          if (!checkLastMessageNeedUpdate(message, room)) return;
          room.lastMessage = message;
          // unreadMsgNum 可能为null
          room.unreadMsgNum = (room.unreadMsgNum || 0) + (isCurrentRoom ? 0 : 1);
          room.showDate = creationDate;
        });
        // 撤回的消息
      } else if (Number(state) === MSG_STATE.RECALL) {
        newRoomList.forEach(room => {
          const { lastMessage } = room;
          if (room.roomId !== roomId) return;
          if (msgId && lastMessage.msgId !== msgId) return;
          if (messageId && lastMessage.messageId !== messageId) return;
          room.lastMessage.state = MSG_STATE.RECALL;
          room.lastMessage.msgContent = content;
        });
      }
      setRoomList(newRoomList);
    };

    // 接收到助手消息
    staticFunction.onAssistantMessage = message => {
      const { content } = message;
      staticFunction.onRoomMessage(content);
    };

    // 接收助手加载完成消息
    staticFunction.onSendPurchaseRobotLoaded = async () => {
      const { serviceCode } = latestActiveRoom.current;
      if (serviceCode === CHAT_PANEL_CONTENT_TYPE.NLP) {
        MessageHandler.postIframeMessage({ type: Messages.sendPurchaseRobotRoomInMessage });
      }
    };

    // 接收助手获取菜单消息
    staticFunction.onSendMenu = message => {
      MessageHandler.postIframeMessage(message);
    };

    return staticFunction;
  }, []);

  // 更新房间列表中某个房间
  const updateRoomInfo = (roomMemberId, roomInfo) => {
    const _roomList = latestRoomList.current;
    const newRoomList = _roomList.slice();
    let updateList = [{ roomMemberId, roomInfo }];
    let updateFlag = false;
    if (isArray(roomMemberId)) {
      updateList = roomMemberId;
    }
    updateList.forEach(item => {
      const index = _roomList.findIndex(room => room.userRoomMemberId === item.roomMemberId);
      if (index === -1) return;
      updateFlag = true;
      newRoomList.splice(index, 1, { ..._roomList[index], ...item.roomInfo });
    });
    if (updateFlag) {
      setRoomList(newRoomList);
    }
  };

  // 设置房间是否置顶状态
  const setTopChatRoom = async room => {
    const { userRoomMemberId, roomId, topFlag } = room;
    let api = topChatRoomApi;
    // 如果已经置顶，则取消置顶
    if (topFlag) api = cancelTopChatRoomApi;
    const result = await api({ roomMemberId: userRoomMemberId, roomId });
    if (!getResponse(result)) return false;
    updateRoomInfo(userRoomMemberId, { topFlag: topFlag ? 0 : 1 });
  };

  // 在线沟通切换
  const onRoomChange = (roomInfo, drafts) => {
    const updateList = [
      { roomMemberId: roomInfo.userRoomMemberId, roomInfo: { drafts } },
      {
        roomMemberId: activeRoomMemberId,
        roomInfo: { drafts: { html: '', deatil: [] }, unreadMsgNum: 0 },
      },
    ];
    updateRoomInfo(updateList);
  };

  // 在线沟通房间信息修改
  const onRoomInfoChange = (roomId, roomInfo) => {
    const _roomList = latestRoomList.current;
    const updateList = _roomList
      .filter(room => room.roomId === roomId)
      .map(room => ({ roomMemberId: room.userRoomMemberId, roomInfo }));
    updateRoomInfo(updateList);
  };

  useEffect(() => {
    MessageHandler.on(Events.sendMenu, onSendMenu);
    MessageHandler.on(Events.sendCardMessage, onSendMenu);
    MessageHandler.on(Events.sendLoadChatHub, onSendLoadChatHub);
    MessageHandler.on(Events.sendPurchaseRobotLoaded, onSendPurchaseRobotLoaded);
    MessageHandler.on(Events.assistantMessage, onAssistantMessage).start();
    MessageHandler.postParentMessage(Messages.getChatHubInfo);
    // 开发环境模拟postmessage
    // onSendLoadChatHub({
    //   content: {
    //     hasBuyPurchase: { showChatOnline: true },
    //   },
    // });

    defaultSendMsg = '';
    if (aiOpenFlag === 'true') {
      getAITypeList();
      handleInitSocket();
    }

    return () => {
      handleDestroy();
      MessageHandler.destory();
      tipsMap = {};
      globalAiTypeList = [];
      // inputMsg = '';
      if (editableRef.current) {
        editableRef.current.innerHTML = '';
      }
      defaultSendMsg = '';
    };
  }, []);

  const handleInitSocket = () => {
    globalUuid = uuid();
    Interval.add(updateFun).start();
    socket = manager.createSocket(globalUuid, 'AI_PROCESSOR');
    registerSocketListener();
  };

  const handleDestroy = () => {
    Interval.destory();
    manager.destroySocket(globalUuid);
  };

  const registerSocketListener = () => {
    // 接收消息
    socket.registerMessageListener(globalUuid, 'aiNavigationMessage', msg => {
      getNewMessage(msg);
    });
  };

  /**
   * 接收消息
   * @param {*} msg
   */
  const getNewMessage = msg => {
    setSending(false);

    if (msg?.msgContent) {
      const agentItem = globalAiTypeList.find(item => item.skillCode === msg?.msgContent) ?? {};
      const { skillConfigId, skillAliasName, skillCode } = agentItem;

      defaultSendMsg = editableRef.current ? editableRef.current.innerHTML?.trim() ?? '' : '';
      setAgentId(skillConfigId);
      setTypeTitle(skillAliasName);
      setAgentType(skillCode);
    } else {
      defaultSendMsg = '';
    }
  };

  const sendMessage = async txt => {
    if (txt) {
      const messageParams = {
        msgContent: txt,
        msgType: 'TEXT',
        msgUuid: globalUuid,
        skillConfigId: defaultAgentId,
        tenantId: getCurrentOrganizationId(),
      };
      setSending(true);
      const res = await sendMessageApi(messageParams);

      if (getResponse(res)) {
        // onClearInputMsg();
      } else {
        setSending(false);
      }
    }
  };

  const updateFun = () => {
    setUpdate(!update);
  };

  const getAITypeList = async () => {
    const res = await fetchAITypeList({
      serviceType: 'AI_ASSISTANT',
    });

    if (getResponse(res) && Array.isArray(res) && res.length) {
      const filterList = res?.filter(item => item.navigationFlag !== 1);

      globalAiTypeList = [...filterList];
      formatTipsMap(res);
      setAiTypeList(filterList);
      setDefaultAgentId(res.find(item => item.navigationFlag === 1)?.skillConfigId ?? '');
    } else {
      setAiTypeList([]);
    }
  };

  const formatTipsMap = aiList => {
    if (aiList?.length) {
      aiList.forEach(item => {
        const qaList = item?.suggestion
          ? item.suggestion.split('@').filter(txt => txt !== '$')
          : [];
        tipsMap[item.skillCode] = qaList;
      });
    }
  };

  const onSelectAgentId = (value, pageTitle, aiType) => {
    setAgentId(value || defaultAgentId);
    setTypeTitle(pageTitle);
    setAgentType(aiType);
  };

  const onClearInputMsg = () => {
    defaultSendMsg = '';
    // inputMsg = '';
    setSelectedType('');
    setExitBtnMsg('');
    setSuggestList([]);
    const dom = editableRef.current;
    if (dom) {
      dom.innerHTML = '';
    }
  };

  /**
   * 发送消息
   */
  const handleSendMsg = () => {
    if (!defaultAgentId) return;
    const msgContent = editableRef.current?.innerHTML?.trim() ?? '';
    if (msgContent) {
      sendMessage(msgContent);
    }
  };

  const keydownEvent = e => {
    if (e.keyCode === 13) {
      e.preventDefault();
      handleSendMsg();
    }
  };

  const handleInput = () => {
    // const text = editableRef.current.textContent?.trim();
    // inputMsg = text;
    // setUpdate(!update);
  };

  const handleSelectType = value => {
    const agentItem = globalAiTypeList.find(item => item.skillCode === value) ?? {};
    const { skillAliasName = '' } = agentItem;

    // inputMsg = '';
    if (editableRef.current) {
      editableRef.current.innerHTML = '';
    }
    setSelectedType(value);
    setExitBtnMsg(skillAliasName);
    const list = tipsMap[value];
    setSuggestList(list);
  };

  const handleExit = e => {
    e.preventDefault();

    // inputMsg = '';
    if (editableRef.current) {
      editableRef.current.innerHTML = '';
    }
    handleFocus();
    setSelectedType('');
    setExitBtnMsg('');
    setSuggestList([]);
  };

  const handleSelectItem = value => {
    // inputMsg = value;
    if (editableRef.current) {
      editableRef.current.innerHTML = value;
    }
    handleFocus();
    setUpdate(!update);
  };

  const handleFocus = () => {
    // 聚焦并移动光标到末尾
    editableRef.current.focus();
    const range = document.createRange();
    range.selectNodeContents(editableRef.current);
    range.collapse(false);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  };

  return (
    <div className={styles['chat-hub']} ref={ref}>
      <ModalProvider getContainer={() => document.getElementById('root')}>
        <ChatList
          showChatOnline={showChatOnline}
          roomList={roomList}
          panelType={panelType}
          activeRoomMemberId={activeRoomMemberId}
          setRoomList={setRoomList}
          updateRoomInfo={updateRoomInfo}
          panelTypeChange={panelTypeChange}
          openChatRoom={openChatRoom}
          resetPanel={resetPanel}
          setTopChatRoom={setTopChatRoom}
          defaultAgentId={agentId}
          aiOpenFlag={aiOpenFlag}
          aiAgentTypeList={aiTypeList}
          onClearInputMsg={onClearInputMsg}
          onSelectAgent={onSelectAgentId}
        />
      </ModalProvider>
      <div className={styles['chat-hub-content']}>
        {panelType === CHAT_PANEL_TYPE.AI_ASSISTANT ? (
          <>
            {!agentType ? (
              <div className={styles['agent-welcome-page']}>
                <div className={styles['agent-welcome-page-header']}>
                  <Icon type="close" style={{ cursor: 'pointer' }} onClick={onClose} />
                </div>
                <div className={styles['agent-welcome-page-logo']}>
                  <img src={logoAvatar} alt="" style={{ width: '60px' }} />
                </div>
                <div className={styles['agent-welcome-page-welcome-msg']}>
                  <StreamingText
                    text={intl
                      .get('smbl.chatHub.view.message.zhenYunWelcomeMsg')
                      .d('您好！我是甄云科技AI助理，有什么可以帮你的吗？')}
                    speed={30}
                  />
                </div>
                <div className={styles['agent-welcome-page-textarea']}>
                  {/* <TextArea
                    rows={2}
                    style={{ width: '100%' }}
                    value={inputMsg}
                    disabled={sending}
                    placeholder={intl
                      .get('smbl.chatHub.view.message.welcomePlaceholder')
                      .d('请输入')}
                    onInput={handleInputValue}
                    onEnterDown={handleSendMsg}
                  /> */}

                  <div
                    ref={editableRef}
                    id="ambl-ai-agent-welcome-input"
                    contentEditable
                    onInput={handleInput}
                    onKeyDown={keydownEvent}
                    data-placeholder={intl
                      .get('smbl.chatHub.view.message.welcomePlaceholder')
                      .d('请输入')}
                    className={styles['agent-welcome-page-textarea-input']}
                    style={{
                      textIndent: selectedType ? `${(exitBtnMsg.length ?? 2) * 12 + 30}px` : '0px',
                    }}
                  />

                  {selectedType ? (
                    <>
                      <Button
                        color="primary"
                        icon="navigate_before"
                        onClick={handleExit}
                        style={{
                          position: 'absolute',
                          left: '30px',
                          top: '30px',
                          borderRadius: '10px',
                          height: 'unset',
                          padding: '2px 6px',
                        }}
                      >
                        {exitBtnMsg}
                      </Button>
                    </>
                  ) : null}

                  <Button
                    icon="send"
                    style={{
                      position: 'absolute',
                      bottom: '30px',
                      right: '30px',
                      borderRadius: '3px',
                      background: '#F2F3F5',
                      border: 'none',
                      zIndex: '10',
                    }}
                    disabled={sending}
                    loading={sending}
                    onClick={handleSendMsg}
                  />
                </div>
                <div className={styles['agent-welcome-page-tips-area']}>
                  {!(suggestList && suggestList.length) ? (
                    <div className={styles['agent-welcome-page-tips-selected-area']}>
                      {aiTypeList.map(item => {
                        return (
                          <Radio
                            mode="button"
                            name="base"
                            value={item?.skillCode}
                            checked={selectedType === item?.skillCode}
                            onChange={handleSelectType}
                            style={{ margin: '0 8px 8px 0px' }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              {/* <Icon type={item?.skillIcon} style={{ marginRight: '8px' }} />{' '} */}
                              {item?.skillAliasName}
                            </div>
                          </Radio>
                        );
                      })}
                    </div>
                  ) : null}

                  {suggestList && suggestList.length ? (
                    <div className={styles['agent-welcome-page-tips-list']}>
                      {(suggestList || [])?.map((item, index) => {
                        return (
                          <div
                            key={item}
                            className={styles['agent-welcome-page-tips-item']}
                            onClick={() => handleSelectItem(item)}
                          >
                            {`${index + 1}.${item}`}
                          </div>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              </div>
            ) : (
              <AgentChatRoom
                key={agentId}
                agentId={agentId}
                defaultSendMsg={defaultSendMsg}
                onClearInputMsg={onClearInputMsg}
                showClose
                onClose={onClose}
                pageTitle={typeTitle}
              />
            )}
          </>
        ) : (
          <>
            {/* 在线沟通聊天室 */}
            <ChatRoom
              contentClass={CLN(styles['content-item'], {
                [styles.hide]: !(
                  showContent === CHAT_PANEL_CONTENT_TYPE.CHAT_ROOM &&
                  panelType === CHAT_PANEL_TYPE.MESSAGE
                ),
              })}
              showClose
              showHeader
              groupSetting
              roomNameJump
              onlyLoadRoomOnce={false}
              integratedType="jike"
              businessCode="source-bidding"
              memberCountType="company"
              suppliersChatType="single"
              pageStyle="right"
              defaultSubType="none"
              roomParams={activeRoom}
              onRef={getRoomRef}
              onClose={onClose}
              onRoomChange={onRoomChange}
              onRoomInfoChange={onRoomInfoChange}
              onRoomMessage={onRoomMessage}
            />
            {/* 助手内容 */}
            {showAssistantPage && (
              <AssistantPageList
                panelType={panelType}
                showContent={showContent}
                assistantList={assistantList}
              />
            )}
            {/* 助手开通信息 */}
            {panelType === CHAT_PANEL_TYPE.ASSISTANT &&
              ASSISTANT_KEY_LIST.includes(showContent) && (
                <AssistantOpen
                  className={CLN(styles['content-item'])}
                  activeRoom={activeRoom}
                  setPanelType={setPanelType}
                  setShowContent={setShowContent}
                />
              )}
            {/* 空白面板 隐藏条件 - 显示内容不是空内容 */}
            {showContent === CHAT_PANEL_CONTENT_TYPE.EMPTY && (
              <EmptyPanel className={CLN(styles['content-item'])} showClose onClose={onClose} />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default compose(
  formatterCollections({
    code: ['spfm.certificateAuthority', 'smbl.chatHub', 'smbl.chat'],
  }),
  withProps(
    () => {
      return {};
    },
    { cacheState: true }
  )
)(ChatHubRoom);

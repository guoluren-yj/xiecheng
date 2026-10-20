/* eslint-disable no-param-reassign */
/**
 * 即刻3.0聊天列表/助手列表
 * @author: sheng.yao <sheng.yao@going-link.com>
 * @date: 2024/02/26
 * @copyright: Copyright (c) 2024, Zhenyun
 */
import React, { useEffect, useState, memo, useMemo, useRef, Fragment } from 'react';
import CLN from 'classnames';
import intl from 'utils/intl';
import { Icon } from 'choerodon-ui';
import { Spin, Button } from 'choerodon-ui/pro';
import VirtualList from 'rc-virtual-list';
import { queryFileList } from 'services/api';
import { getEnvConfig } from 'utils/iocUtils';
import { PRIVATE_BUCKET } from '_utils/config';

import { getChatRoomListApi } from '@/services/chatHubService';
import {
  filterNullValueObject,
  getResponse,
  getCurrentOrganizationId,
  getAccessToken,
} from 'utils/utils';
import useSize from '@/components/Chat/hooks/useSize';
import useUpdate from '@/components/Chat/hooks/useUpdate';
import useLatest from '@/components/Chat/hooks/useLatest';
import RightClickMenu from '@/components/Chat/Room/components/RightClickMenu';
import Interval from '@/components/Chat/DataManager/interval';
// import ExpandablePanel from '@/components/ExpandablePanel';

import { ASSISTANT_KEY_LIST, CHAT_PANEL_TYPE } from '../constant';
import PanelTypeList from './PanelTypeList';
import ChatItem from './ChatItem';
import ChatItemSearch from './ChatItemSearch';
import styles from './index.less';
import { isAssistatnt } from '../utils';

const { HZERO_FILE } = getEnvConfig();

const ChatList = (props) => {
  const {
    showChatOnline,
    roomList,
    panelType,
    activeRoomMemberId,
    setRoomList,
    panelTypeChange,
    openChatRoom,
    resetPanel,
    setTopChatRoom,
    defaultAgentId,
    aiOpenFlag,
    aiAgentTypeList = [],
    onSelectAgent = () => {},
    onClearInputMsg = () => {},
  } = props;
  const [loading, setLoading] = useState(false);
  const [isShowOpenRoom, setIsShowOpenRoom] = useState(true); // 是否显示已打开房间
  const [agentTypeList, setAgentList] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState('');
  const [agentImages, setAgentImages] = useState({});

  const listRef = useRef();
  const contextMenuRef = useRef();
  const listSize = useSize(listRef);
  const update = useUpdate();
  const latestRoomList = useLatest(roomList); // 房间列表最新值
  const isAssistantPanel = panelType === CHAT_PANEL_TYPE.ASSISTANT; // 当前是否助手面板
  const isMessagePanel = panelType === CHAT_PANEL_TYPE.MESSAGE; // 当前是否消息面板

  // 打开和关闭的房间列表
  const [openRoomList, closeRoomList, assistantList] = useMemo(() => {
    const list = roomList.slice();
    const _openRoomList = []; // 打开的群聊列表（包含开通的助手）
    const _closeRoomList = []; // 关闭的群聊列表
    const _assistantList = []; // 助手列表
    // 设置列表中最后一个置顶房间，标记lastTopFlag
    const markLastTopFlagPosition = (_roomList = []) => {
      [..._roomList, {}].forEach((room, index) => {
        const { topFlag } = room;
        if (index && !topFlag && _roomList[index - 1].topFlag) {
          _roomList[index - 1].lastTopFlag = 1;
        } else {
          room.lastTopFlag = 0;
        }
      });
    };
    // topFlag值，助手10，置顶1，非置顶0
    list.sort((a, b) => {
      const topFlagA = a.topFlag || 0;
      const topFlagB = b.topFlag || 0;
      // 置顶标记不同，比较置顶标记
      if (topFlagA !== topFlagB) {
        return topFlagB - topFlagA;
      }
      // 置顶标记相同，比较房间列表显示时间
      return +new Date(b.showDate) - +new Date(a.showDate);
    });
    list.forEach((room) => {
      const { type, openFlag } = room;
      if (ASSISTANT_KEY_LIST.includes(type)) {
        _assistantList.push(room);
        // 已开通的助手放入打开的聊天列表中
        if (openFlag) {
          _openRoomList.push(room);
        }
      } else if (room.state === 'CLOSE') {
        _closeRoomList.push(room);
      } else {
        _openRoomList.push(room);
      }
    });
    markLastTopFlagPosition(_openRoomList);
    markLastTopFlagPosition(_closeRoomList);
    return [_openRoomList, _closeRoomList, _assistantList];
  }, [roomList]);

  // 需要渲染的房间列表信息
  const renderRoomInfo = useMemo(() => {
    // 助手开通列表
    if (isAssistantPanel) {
      return { list: assistantList, label: null };
    }
    // 在线沟通列表
    return isShowOpenRoom
      ? {
          list: openRoomList,
          label: `${intl
            .get('smbl.chatHub.view.footer.closeRoom', { num: closeRoomList.length })
            .d(`已关闭的群聊（${closeRoomList.length}）`)}`,
        }
      : {
          list: closeRoomList,
          label: `${intl
            .get('smbl.chatHub.view.footer.openRoom', { num: openRoomList.length })
            .d(`已打开的群聊（${closeRoomList.length}）`)}`,
        };
  }, [roomList, isShowOpenRoom, panelType]);

  // 获取在线沟通列表
  const getChatRoomList = async () => {
    setLoading(true);
    const result = await getChatRoomListApi();
    setLoading(false);
    if (!getResponse(result)) return;
    let newRoomList = latestRoomList.current.slice();
    newRoomList.push(...result);
    newRoomList = newRoomList.map((room) => {
      const _room = filterNullValueObject(room);
      _room.showDate = room.creationDate;
      if (_room?.lastMessage?.creationDate) {
        _room.showDate = _room.lastMessage.creationDate;
      }
      return _room;
    });
    setRoomList(newRoomList);
  };

  // 点击聊天项
  const onChatItemClick = (room) => {
    openChatRoom(room);
  };

  // 打开菜单
  const onChatItemRightClick = (e, room) => {
    e.preventDefault();
    if (isAssistatnt(room)) return; // 助手不进行操作
    const menuList = [
      {
        key: 'pinned',
        title: room.topFlag
          ? intl.get('smbl.chatHub.view.button.cancelTop').d('取消置顶')
          : intl.get('smbl.chatHub.view.button.setTop').d('置顶'),
        onClick: () => {
          setTopChatRoom(room);
        },
      },
    ];
    contextMenuRef.current.show(e, menuList);
  };

  // 查找房间
  const findRoom = (list, info) => {
    const { serviceCode, userRoomMemberId } = info;
    return list.find((room) => {
      return (
        (serviceCode && room.serviceCode === serviceCode) ||
        (userRoomMemberId && room.userRoomMemberId === userRoomMemberId)
      );
    });
  };

  // 搜索项房间选择
  const onRoomSelect = (room) => {
    const openRoomItem = findRoom(openRoomList, room);
    const closeRoomItem = findRoom(closeRoomList, room);
    if (!openRoomItem && !closeRoomItem) {
      return;
    }
    if ((!isShowOpenRoom && openRoomItem) || (isShowOpenRoom && closeRoomItem)) {
      changeShowRoomType();
    }
    openChatRoom(openRoomItem || closeRoomItem);
  };

  // 列表滚动事件
  const onListScroll = () => {
    contextMenuRef.current.dismiss();
  };

  // 显示房间的状态切换
  const changeShowRoomType = () => {
    setIsShowOpenRoom((state) => !state);
    resetPanel();
  };

  // 加载房间列表
  const renderRoomList = () => {
    const { height = 600 } = listSize;
    if (loading) {
      return (
        <div className={CLN(styles['chat-list-loading'], 'flex flex-center')}>
          <Spin />
        </div>
      );
    }
    if (renderRoomInfo.list.length) {
      return (
        <VirtualList
          data={renderRoomInfo.list}
          height={height}
          itemHeight={64}
          itemKey="userRoomMemberId"
        >
          {(room) => (
            <ChatItem
              className={styles['chat-item']}
              roomInfo={room}
              isActive={activeRoomMemberId === room.userRoomMemberId}
              panelType={panelType}
              onClick={onChatItemClick}
              onRightClick={onChatItemRightClick}
            />
          )}
        </VirtualList>
      );
    }
    if (showChatOnline) {
      return (
        <div className={styles['chat-list-empty']}>
          {`${intl.get('smbl.chatHub.view.chat.empty').d('暂无联系人')}`}
        </div>
      );
    }
    return null;
  };

  useEffect(() => {
    // 显示在线沟通则获取房间列表
    if (showChatOnline) {
      getChatRoomList();
    }
  }, [showChatOnline]);

  useEffect(() => {
    if (defaultAgentId) {
      setSelectedAgent(defaultAgentId);
    }
  }, [defaultAgentId]);

  useEffect(() => {
    if (aiAgentTypeList?.length) {
      setAgentList(aiAgentTypeList);
    }
  }, [aiAgentTypeList]);

  useEffect(() => {
    // 定时更新最新时间，用来更新房间列表显示时间
    Interval.add(update).start();
    return () => {
      Interval.destory();
    };
  }, []);

  useEffect(() => {
    const loadAgentImages = async () => {
      const imagePromises = agentTypeList
        .filter((item) => item?.skillIcon)
        .map((item) => getImageSrc(item.skillIcon).then((imgSrc) => [item.skillConfigId, imgSrc]));

      const results = await Promise.all(imagePromises);
      const imageMap = Object.fromEntries(results);
      setAgentImages(imageMap);
    };

    if (agentTypeList.length > 0) {
      loadAgentImages();
    }
  }, [agentTypeList]);

  const getImageSrc = async (attachmentUuid) => {
    let fileUrl = '';
    if (attachmentUuid) {
      const fileList = await queryFileList({
        attachmentUUID: attachmentUuid,
      });
      if (getResponse(fileList) && fileList.length) {
        fileUrl = fileList[0]?.fileUrl;
      }
    }

    return fileUrl
      ? `${HZERO_FILE}/v1/${getCurrentOrganizationId()}/file-preview/by-url?url=${fileUrl}&bucketName=${PRIVATE_BUCKET}&access_token=${getAccessToken()}`
      : '';
  };

  // 加载房间列表
  const renderAgentList = () => {
    if (loading) {
      return (
        <div className={CLN(styles['chat-list-loading'], 'flex flex-center')}>
          <Spin />
        </div>
      );
    }
    if (agentTypeList.length) {
      const { height = 600 } = listSize;
      return (
        <div style={{ height }}>
          {agentTypeList.map((item) => (
            <div
              key={item.skillConfigId}
              className={styles['agent-type-list-item']}
              style={{
                background: selectedAgent === item.skillConfigId ? '#f3f4f5' : '#fff',
                color: selectedAgent === item.skillConfigId ? '#1D2129' : '#4e5769',
                fontWeight: selectedAgent === item.skillConfigId ? '500' : '400',
              }}
              onClick={() => {
                onSelectAgent(item.skillConfigId, item.skillAliasName, item.skillCode);
                setSelectedAgent(item.skillConfigId);
              }}
            >
              <img
                src={agentImages[item.skillConfigId] || ''}
                alt=""
                style={{ marginRight: '8px', width: '14px', height: '14px' }}
              />
              <div
                style={{
                  maxWidth: '188px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {item.skillAliasName}
              </div>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  /**
   * 新建对话
   */
  const handleCreateDialogue = () => {
    onSelectAgent('', '');
    setSelectedAgent('');
    onClearInputMsg();
  };

  return (
    <Fragment>
      <div className={CLN(styles['chat-list'], 'flex')}>
        <PanelTypeList
          panelType={panelType}
          aiOpenFlag={aiOpenFlag}
          panelTypeChange={panelTypeChange}
        />
        {panelType === CHAT_PANEL_TYPE.AI_ASSISTANT ? (
          // <ExpandablePanel>
          <div
            className={CLN(styles['chat-list-main-agent'], 'flex-column', styles['aiagent-header'])}
          >
            <div
              style={{
                marginTop: '20px',
                display: 'flex',
                justifyContent: 'center',
                padding: '0 20px',
              }}
            >
              <Button
                icon="add"
                onClick={handleCreateDialogue}
                style={{
                  width: '100%',
                  background: '#F7F8FA',
                  border: 'none',
                  borderRadius: '3px',
                }}
              >
                {intl.get('smbl.chatHub.view.chat.newDialogue').d('新建对话')}
              </Button>
            </div>
            <div
              className={CLN(styles['chat-list-ul'], { [styles.top]: isMessagePanel })}
              ref={listRef}
              style={{ marginTop: '20px', height: '800px' }}
              onScroll={onListScroll}
            >
              {renderAgentList()}
            </div>
          </div>
        ) : (
          // </ExpandablePanel>
          <div className={CLN(styles['chat-list-main'], 'flex-column')}>
            {isMessagePanel && (
              <ChatItemSearch
                className={styles['chat-item-search']}
                roomList={roomList}
                onRoomSelect={onRoomSelect}
              />
            )}
            <div
              className={CLN(styles['chat-list-ul'], { [styles.top]: isMessagePanel })}
              ref={listRef}
              onScroll={onListScroll}
            >
              {renderRoomList()}
            </div>
            {renderRoomInfo.label ? (
              <div
                className={CLN(styles['chat-list-footer'], 'flex flex-center')}
                onClick={changeShowRoomType}
              >
                <span>{renderRoomInfo.label}</span>
                <Icon type="navigate_next" style={{ fontSize: 14 }} />
              </div>
            ) : (
              <div className={styles['chat-list-footer-disabled']} />
            )}
          </div>
        )}
      </div>
      <RightClickMenu
        onRef={(ref) => {
          contextMenuRef.current = ref;
        }}
      />
    </Fragment>
  );
};

export default memo(ChatList);

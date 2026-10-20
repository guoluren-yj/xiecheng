/**
 * 即刻3.0搜索详情页
 * @author: sheng.yao <sheng.yao@going-link.com>
 * @date: 2024/02/26
 * @copyright: Copyright (c) 2024, Zhenyun
 */
import React, { useEffect, useState, memo } from 'react';
import intl from 'utils/intl';
import CLN from 'classnames';
import { getResponse } from 'utils/utils';
import { TextField, Icon, Button } from 'choerodon-ui/pro';
import { globalSearchApi } from '@/services/chatHubService';
import { getChatRoomHistoryMessagesApi } from '@/services/chatService';
import useDebounceFn from '@/components/Chat/hooks/useDebounceFn';
import useLatest from '@/components/Chat/hooks/useLatest';
import MessageList from '@/components/Chat/Room/components/MessageRecords/messageList';
import AssistantHistorys from '../AssistantHistorys';
import ListItem from '../ListItem';
import styles from './index.less';

const SearchDetail = (props) => {
  const {
    className,
    roomList,
    rooms: _rooms,
    messages: _messages,
    searchValue: _searchValue,
    message,
    modal,
    roomItemClick,
  } = props;
  const [tab, setTab] = useState('MESSAGES');
  const [searchValue, setSearchValue] = useState(_searchValue);
  const [assistantHistorysKeyword, setAssistantHistorysKeyword] = useState(_searchValue);
  const [rooms, setRooms] = useState(_rooms || []);
  const [messages, setMessages] = useState(_messages || []);
  const [activeMessage, setActiveMessage] = useState(message);
  const [records, setRecords] = useState([]);
  const [loadingState, setLoadingState] = useState(1);
  const [key, setKey] = useState(1);
  const lastActiveMessage = useLatest(activeMessage);
  const searchType = {
    ROOMS: {
      key: 'ROOMS',
      list: rooms,
      label: intl.get('smbl.chatHub.model.search.contacts').d('聊天室'),
    },
    MESSAGES: {
      key: 'MESSAGES',
      list: messages,
      label: intl.get('smbl.chatHub.model.search.chatRecords').d('聊天记录'),
    },
  };
  const isRooms = tab === searchType.ROOMS.key;

  // 聊天记录选择失去焦点
  const blurActiveMessage = () => {
    setActiveMessage({});
    setRecords([]);
  };

  // 清空选择列表
  const clearList = () => {
    setRooms([]);
    setMessages([]);
    blurActiveMessage();
  };

  // 查询记录
  const getSearchResult = useDebounceFn(async () => {
    if (!searchValue) return clearList();
    const result = await globalSearchApi(searchValue);
    if (!getResponse(result)) return clearList();
    const { chatOnline = [], purchaseRobot = [] } = result;
    const newRooms = [...(purchaseRobot?.rooms || []), ...(chatOnline?.rooms || [])];
    const newMessages = [...(purchaseRobot?.messages || []), ...(chatOnline?.messages || [])];
    setRooms(newRooms);
    setMessages(newMessages);
    blurActiveMessage();
  }, 200);

  // 获取聊天记录
  const getRecords = async (more = false) => {
    const { roomId, companyId, serviceCode } = lastActiveMessage.current;
    if (serviceCode || !searchValue || (more && loadingState === 3)) return;
    const pageSize = 20;
    const params = {
      companyId,
      roomId,
      msgContent: searchValue,
      size: pageSize,
    };
    if (more) {
      params.msgId = records[records.length - 1]?.msgId;
    } else {
      setRecords([]);
    }
    setLoadingState(1);
    const result = await getChatRoomHistoryMessagesApi(params);
    if (!getResponse(result)) return;
    setLoadingState(result.length < pageSize ? 3 : 2);
    setRecords(more ? records.concat(result) : result);
  };

  // 聊天记录滚动条滚动
  const onRecordScroll = useDebounceFn((event) => {
    if (event.target.scrollHeight - event.target.clientHeight - event.target.scrollTop > 10) {
      return;
    }
    getRecords(true);
  }, 200);

  const listItemClick = (room) => {
    if (isRooms) {
      modal.close();
      roomItemClick(room);
    } else {
      setKey((_key) => _key + 1);
      setActiveMessage(room);
      setTimeout(() => {
        getRecords();
        setAssistantHistorysKeyword(searchValue);
      }, 0);
    }
  };

  // 渲染分组内列表
  const renderGroupChild = () => {
    const list = searchType[tab]?.list;
    if (!list.length && isRooms) {
      return (
        <div className={styles['search-empty']}>
          {intl.get('smbl.chatHub.model.search.roomEmpty').d('没有更多聊天室')}
        </div>
      );
    }
    return list?.map((item) => {
      const { serviceCode, roomMemberId, userRoomMemberId } = item;
      const active =
        (serviceCode && serviceCode === activeMessage?.serviceCode) ||
        (roomMemberId && roomMemberId === activeMessage?.roomMemberId);
      return (
        <ListItem
          key={serviceCode || roomMemberId || userRoomMemberId}
          active={!isRooms && active}
          data={item}
          onClick={listItemClick}
        />
      );
    });
  };

  // 渲染聊天记录
  const renderRecords = () => {
    const { serviceCode, roomMemberId } = activeMessage;
    const activeRoom = roomList.find(
      (room) =>
        (serviceCode && room.serviceCode === serviceCode) ||
        (roomMemberId && room.userRoomMemberId === roomMemberId)
    );
    if (!activeRoom) {
      return null;
    }
    if (serviceCode) {
      const { url, roomId } = activeRoom;
      const historyUrl = `${url.replace(
        /purchaseRobot|assistant/g,
        'historys'
      )}&roomId=${roomId}&login=false&simplePanel=true&defaultKeyword=${assistantHistorysKeyword}&type=${serviceCode}`;
      return <AssistantHistorys key={url} url={historyUrl} />;
    } else if (roomMemberId) {
      return (
        <MessageList
          key={key}
          messages={records}
          loadingState={loadingState}
          roomInfo={{ currentUser: activeMessage }}
          onScroll={(event) => {
            onRecordScroll({ ...event });
          }}
        />
      );
    }
    return (
      <div className={styles['search-empty']}>
        {intl.get('smbl.chatHub.model.search.recordEmpty').d('请先选择聊天室')}
      </div>
    );
  };

  useEffect(() => {
    getRecords();
  }, []);

  return (
    <div className={CLN(styles['search-detail'], className)}>
      <div className={styles['search-detail-header']}>
        <TextField
          className={styles['search-detail-input']}
          placeholder={intl.get('smbl.chatHub.view.search.placeholder').d('搜索信息或昵称')}
          prefix={<Icon type="search" />}
          value={searchValue}
          onInput={(e) => {
            setSearchValue(e.target.value);
          }}
          onEnterDown={() => {
            getSearchResult();
          }}
        />
        <Icon className={styles.close} type="close" onClick={() => modal.close()} />
      </div>
      <div className={styles['search-detail-tab']}>
        {Object.keys(searchType).map((_key) => (
          <Button
            key={_key}
            funcType="flat"
            style={{ fontSize: 14 }}
            color={_key === tab ? 'primary' : 'dark'}
            onClick={() => setTab(_key)}
          >
            {searchType[_key].label}
          </Button>
        ))}
      </div>
      <div className={styles['search-detail-content']}>
        <div className={styles['search-detail-list']}>{renderGroupChild()}</div>
        {!isRooms && <div className={styles['search-detail-records']}>{renderRecords()}</div>}
      </div>
    </div>
  );
};

export default memo(SearchDetail);

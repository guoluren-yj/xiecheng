/**
 * 即刻3.0聊天名称/聊天记录搜索组件
 * @author: sheng.yao <sheng.yao@going-link.com>
 * @date: 2024/02/26
 * @copyright: Copyright (c) 2024, Zhenyun
 */
/* eslint-disable no-unused-expressions */
import React, { useState, useRef, memo } from 'react';
import intl from 'utils/intl';
import uuid from 'uuid';
import CLN from 'classnames';
import { TextField, Icon, useModal } from 'choerodon-ui/pro';
import { getResponse } from 'utils/utils';

import { globalSearchApi } from '@/services/chatHubService';
import useDebounceFn from '@/components/Chat/hooks/useDebounceFn';
import useClickAway from '@/components/Chat/hooks/useClickAway';

import ListItem from './ListItem';
import SearchDetail from './SearchDetail';
import styles from './index.less';

const ChatItemSearch = props => {
  const { className, roomList, onRoomSelect } = props;
  const [showList, setShowList] = useState(false);
  const [rooms, setRooms] = useState([]); // 联系人
  const [messages, setMessages] = useState([]); // 聊天室
  const ref = useRef(null);
  const cacheRef = useRef({ searchValue: '' });
  const Modal = useModal();
  const hasContent = rooms.length || messages.length;

  // 点击列表外，隐藏列表
  useClickAway(() => setShowList(false), ref);

  // 情况选择列表
  const clearList = () => {
    setRooms([]);
    setMessages([]);
  };

  // 查询记录
  const getSearchResult = useDebounceFn(async () => {
    const value = cacheRef.current.searchValue;
    if (!value) return clearList();
    const result = await globalSearchApi(value);
    if (!getResponse(result)) return clearList();
    const { chatOnline = [], purchaseRobot = [] } = result;
    const newRooms = [...(purchaseRobot?.rooms || []), ...(chatOnline?.rooms || [])];
    const newMessages = [...(purchaseRobot?.messages || []), ...(chatOnline?.messages || [])];
    setRooms(newRooms);
    setMessages(newMessages);
  }, 200);

  // 房间项点击
  const roomItemClick = room => {
    setShowList(false);
    onRoomSelect?.(room);
  };

  // 历史记录选择项点击
  const messageItemClick = message => {
    setShowList(false);
    Modal.open({
      key: uuid(),
      mask: false,
      children: (
        <SearchDetail
          rooms={rooms}
          roomList={roomList}
          messages={messages}
          message={message}
          searchValue={cacheRef.current.searchValue}
          roomItemClick={roomItemClick}
        />
      ),
      style: { top: '1px', zIndex: 99999, width: '700px' },
      bodyStyle: { padding: 0, height: '100%' },
      contentStyle: { height: '600px' },
      header: null,
      footer: null,
    });
  };

  // 渲染分组内列表
  const renderGroupChild = (list = [], isRoom = false) => {
    return list.map(item => {
      const { serviceCode, roomMemberId, userRoomMemberId } = item;
      return (
        <ListItem
          key={serviceCode || roomMemberId || userRoomMemberId}
          data={item}
          onClick={isRoom ? roomItemClick : messageItemClick}
        />
      );
    });
  };

  return (
    <div ref={ref} className={CLN(styles['chat-item-search'], className)}>
      <TextField
        placeholder={intl.get('smbl.chatHub.view.search.placeholder').d('搜索信息或昵称')}
        prefix={<Icon type="search" />}
        style={{ width: '100%' }}
        onInput={e => {
          cacheRef.current.searchValue = e.target.value;
          getSearchResult();
        }}
        onFocus={() => {
          setShowList(true);
        }}
      />
      <div className={CLN(styles['search-list'], { [styles.hide]: !showList || !hasContent })}>
        {!!rooms.length && (
          <>
            <div className={styles['search-list-group']}>
              {intl.get('smbl.chatHub.model.search.contacts').d('聊天室')}
            </div>
            {renderGroupChild(rooms, true)}
          </>
        )}
        {!!messages.length && (
          <>
            <div className={styles['search-list-group']}>
              {intl.get('smbl.chatHub.model.search.chatRecords').d('聊天记录')}
            </div>
            {renderGroupChild(messages)}
          </>
        )}
      </div>
    </div>
  );
};

export default memo(ChatItemSearch);

import React, { useRef, useCallback, useEffect, useMemo, useState } from 'react';
import { Dropdown, Menu, Spin } from 'choerodon-ui/pro';
import { Icon, Tag } from 'choerodon-ui';
import InfiniteScroll from 'react-infinite-scroller';
import { withRouter } from 'react-router-dom';
import classnames from 'classnames';
import { isNil } from 'lodash';

import intl from 'utils/intl';
import { openTab } from 'utils/menuTab';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import { getResponse, filterNullValueObject, getCurrentUser } from 'utils/utils';

import {
  fetchUnreadMessageCount,
  fetchUnreadMessageList,
  readAllUnreadMessage,
  readSingleMessage,
  readSingleNotice,
} from '@/services/srmMessageService';
import { getMessageType, getNoneMessageSvg, transformContentLink } from './store';
import styles from './index.less';

let timer;

const Message = ({ history }) => {
  const messageListRef = useRef();
  const loadMoreRef = useRef();
  const [state, setState] = useState({
    count: 0, // 消息总数
    messageList: [], // 消息列表
    listLoading: false, // 列表loading
    hasMore: true, // 是否加载更多
    page: 0, // 查询页数page
    messageType: 'all', // 消息类型
  });
  const messageTypeObj = useMemo(() => {
    const obj = {};
    getMessageType().forEach(type => {
      obj[type.code] = type.name;
    });
    return obj;
  }, []);

  useEffect(() => {
    queryUnReadMessageCount();
    queryUnreadMessageList({
      page: 0,
      size: 20,
      readFlag: 0,
    });
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, []);

  useEffect(() => {
    setState(preState => ({
      ...preState,
      hasMore: preState.count > preState.messageList.length,
    }));
  }, [state.count, state.messageList]);
  const queryUnreadMessageList = useCallback(params => {
    setState(preState => ({
      ...preState,
      listLoading: true,
    }));
    fetchUnreadMessageList(filterNullValueObject(params))
      .then(res => {
        if (getResponse(res)) {
          setState(preState => ({
            ...preState,
            messageList: res,
          }));
        }
      })
      .finally(() => {
        setState(preState => ({
          ...preState,
          listLoading: false,
        }));
      });
  }, []);

  const queryUnReadMessageCount = useCallback(() => {
    fetchUnreadMessageCount().then(res => {
      if (!isNil(getResponse(res))) {
        setState(preState => ({
          ...preState,
          count: res,
        }));
      }
    });
  }, []);

  const initTimer = useCallback(() => {
    clearTimer();
    timer = setInterval(() => {
      queryUnreadMessageList({});
      queryUnReadMessageCount();
    }, 300000); // 5分钟定时刷新
  }, [clearTimer, state.messageType, queryUnreadMessageList, queryUnReadMessageCount]);

  const clearTimer = useCallback(() => {
    if (timer) {
      clearInterval(timer);
    }
  }, []);

  const handleAllRead = useCallback(() => {
    setState(preState => ({
      ...preState,
      listLoading: true,
    }));
    readAllUnreadMessage({
      messageTypeFlag: state.messageType === 'all' ? null : state.messageType,
    })
      .then(res => {
        if (getResponse(res)) {
          notification.success();
          queryUnReadMessageCount();
          setState(preState => ({
            ...preState,
            messageList: [],
          }));
        }
      })
      .finally(() => {
        setState(preState => ({
          ...preState,
          listLoading: false,
        }));
      });
  }, [state.messageType, readAllUnreadMessage, queryUnReadMessageCount]);

  const handleClickReadOne = useCallback(
    (event, messageItem) => {
      event.stopPropagation();
      handleReadOne(messageItem);
    },
    [handleReadOne]
  );

  const handleReadOne = useCallback(messageItem => {
    const { messageTypeFlag, userMessageDTO, noticeInfoDTO } = messageItem;
    // 系统消息
    if (messageTypeFlag === 'S' && userMessageDTO) {
      setState(preState => ({
        ...preState,
        listLoading: true,
      }));
      readSingleMessage(userMessageDTO.userMessageId)
        .then(res => {
          if (getResponse(res)) {
            setState(preState => ({
              ...preState,
              count: preState.count - 1,
              messageList: preState.messageList.filter(
                i =>
                  !i.userMessageDTO ||
                  i.userMessageDTO.userMessageId !== userMessageDTO.userMessageId
              ),
            }));
          }
        })
        .finally(() => {
          setState(preState => ({
            ...preState,
            listLoading: false,
          }));
        });
    } else if (['C', 'P'].includes(messageTypeFlag) && noticeInfoDTO) {
      setState(preState => ({
        ...preState,
        listLoading: true,
      }));
      readSingleNotice({ type: messageTypeFlag, noticeIds: [noticeInfoDTO.noticeId] })
        .then(res => {
          if (getResponse(res)) {
            setState(preState => ({
              ...preState,
              count: preState.count - 1,
              messageList: preState.messageList.filter(
                i => !i.noticeInfoDTO || i.noticeInfoDTO.noticeId !== noticeInfoDTO.noticeId
              ),
            }));
            notification.success();
          }
        })
        .finally(() => {
          setState(preState => ({
            ...preState,
            listLoading: false,
          }));
        });
    }
  }, []);

  const handleLoadMoreMessage = useCallback(() => {
    if (state.count <= state.messageList.length) {
      return;
    }
    let lastMessageId;
    let lastNoticeId;
    let lastNoticeSiteId;
    for (let i = state.messageList.length - 1; i >= 0; i--) {
      const { messageTypeFlag, userMessageDTO, noticeInfoDTO } = state.messageList[i];
      // 系统消息
      if (
        messageTypeFlag === 'S' &&
        userMessageDTO &&
        !isNil(userMessageDTO.userMessageId) &&
        isNil(lastMessageId)
      ) {
        lastMessageId = userMessageDTO.userMessageId;
      } else if (
        messageTypeFlag === 'C' &&
        noticeInfoDTO &&
        !isNil(noticeInfoDTO.noticeId) &&
        isNil(lastNoticeId)
      ) {
        lastNoticeId = noticeInfoDTO.noticeId;
      } else if (
        messageTypeFlag === 'P' &&
        noticeInfoDTO &&
        !isNil(noticeInfoDTO.noticeId) &&
        isNil(lastNoticeSiteId)
      ) {
        lastNoticeSiteId = noticeInfoDTO.noticeId;
      }
    }
    const newPage = (state.page || 0) + 1;
    const params = {
      page: newPage,
      size: 20,
      readFlag: 0,
      messageTypeFlag: state.messageType === 'all' ? null : state.messageType,
      userMessageId: lastMessageId,
      noticeId: lastNoticeId,
      noticeSiteId: lastNoticeSiteId,
    };
    const newParams = JSON.stringify(params);
    // 由于自动处理省略号是异步的，有可能导致此处会重复调用，故此处增加参数判断，避免重复查询
    if (loadMoreRef.current === newParams) {
      return;
    } else {
      loadMoreRef.current = newParams;
    }
    setState(preState => ({
      ...preState,
      listLoading: true,
    }));
    fetchUnreadMessageList(filterNullValueObject(params))
      .then(res => {
        if (getResponse(res) && res && res.length > 0) {
          setState(preState => ({
            ...preState,
            page: newPage,
            messageList: preState.messageList.concat(res),
          }));
        }
      })
      .finally(() => {
        setState(preState => ({
          ...preState,
          listLoading: false,
        }));
      });
  }, [state.page, state.messageList, state.count]);

  const handleClickMessageItem = useCallback((e, messageTypeFlag, id, messageItem) => {
    handleReadOne(messageItem);
    if (messageTypeFlag === 'S') {
      history.push({
        pathname: `/hmsg/user-message/detail/message/${id}`,
      });
    } else if (['C', 'P'].includes(messageTypeFlag)) {
      openTab({
        title: 'spfm.notice.view.message.title.preview',
        key: `/spfm/notices/previewOnly/${id}`,
        path: `/spfm/notices/previewOnly/${id}`,
        icon: 'eye-o',
        closable: true,
      });
    }
  }, []);

  const renderMessageTypeTag = useCallback(
    type => {
      const color = {
        S: 'orange',
        C: 'blue',
        P: 'green',
      };
      return (
        <Tag color={color[type]} className={styles['message-list-item-tag']}>
          {messageTypeObj[type]}
        </Tag>
      );
    },
    [messageTypeObj]
  );

  const renderMessageItem = useCallback(
    messageItem => {
      const { messageTypeFlag, userMessageDTO, noticeInfoDTO } = messageItem;
      if (messageTypeFlag === 'S' && userMessageDTO) {
        const { userMessageId, subject, creationDate } = userMessageDTO;
        const date = (creationDate || '').split(' ')[0] || '';
        const time = (creationDate || '').split(' ')[1] || '';
        const text = transformContentLink(userMessageDTO);
        return (
          <div
            className={styles['message-list-item']}
            key={userMessageId}
            onClick={e => handleClickMessageItem(e, messageTypeFlag, userMessageId, messageItem)}
          >
            <div className={styles['message-list-item-header']}>
              <div className={styles['message-list-item-time']}>{time}</div>
              <div className={styles['message-list-item-divide-dot']}>
                <div />
              </div>
              <div className={styles['message-list-item-header-main']}>
                {renderMessageTypeTag(messageTypeFlag)}

                <span className={styles['message-list-item-name']}>{subject}</span>
                <span
                  className={styles['message-list-item-button']}
                  onClick={event => handleClickReadOne(event, messageItem)}
                >
                  <span>{intl.get('spfm.dashboard.view.button.read').d('已读')}</span>
                </span>
              </div>
            </div>
            <div className={styles['message-list-item-main']}>
              <div className={styles['message-list-item-date']}>{date}</div>
              <div className={styles['message-list-item-divide-line']} />
              <div className={styles['message-list-item-content']}>
                <div dangerouslySetInnerHTML={{ __html: text }} />
              </div>
            </div>
          </div>
        );
      } else if (['C', 'P'].includes(messageTypeFlag) && noticeInfoDTO) {
        const { title, noticeId, noticeBody, publishedDate } = noticeInfoDTO;
        const date = (publishedDate || '').split(' ')[0] || '';
        const time = (publishedDate || '').split(' ')[1] || '';
        const text = noticeBody || '';
        return (
          <div
            className={styles['message-list-item']}
            key={noticeId}
            onClick={e => handleClickMessageItem(e, messageTypeFlag, noticeId, messageItem)}
          >
            <div className={styles['message-list-item-header']}>
              <div className={styles['message-list-item-time']}>{time}</div>
              <div className={styles['message-list-item-divide-dot']}>
                <div />
              </div>
              <div className={styles['message-list-item-header-main']}>
                {renderMessageTypeTag(messageTypeFlag)}

                <span className={styles['message-list-item-name']}>{title}</span>
                <span
                  className={styles['message-list-item-button']}
                  onClick={event => handleClickReadOne(event, messageItem)}
                >
                  <span>{intl.get('spfm.dashboard.view.button.read').d('已读')}</span>
                </span>
              </div>
            </div>
            <div className={styles['message-list-item-main']}>
              <div className={styles['message-list-item-date']}>{date}</div>
              <div className={styles['message-list-item-divide-line']} />
              <div className={styles['message-list-item-content']}>
                <div dangerouslySetInnerHTML={{ __html: text }} />
              </div>
            </div>
          </div>
        );
      }
    },
    [renderMessageTypeTag, handleClickReadOne, handleClickMessageItem]
  );

  const renderEmptyContent = useCallback(() => {
    const { themeConfigVO = {} } = getCurrentUser();
    const { enableThemeConfig, colorCode } = themeConfigVO;
    const noneMessageSvg = getNoneMessageSvg(enableThemeConfig ? colorCode : undefined);
    return (
      <div className={styles['no-message-data']}>
        <div className={styles['no-message-data-img']}>{noneMessageSvg}</div>
        <div className={styles['no-message-data-text']}>
          {intl.get(`spfm.dashboard.model.common.NoUnReadData`).d('暂无未读消息')}
        </div>
      </div>
    );
  }, [state.messageType]);

  const renderMessageList = useCallback(() => {
    return state.messageList.map(renderMessageItem);
  }, [state.messageList, renderMessageItem]);

  const handleSelectType = useCallback(({ key }) => {
    // 切换类型时 设置滚动到顶部，防止触发滚动查询接口
    if (messageListRef.current) {
      messageListRef.current.scrollTop = 0;
    }
    // 清空数据，防止之前的数据残留
    setState(preState => ({
      ...preState,
      messageList: [],
      page: 0,
      messageType: key,
    }));
    const params = {
      messageTypeFlag: key === 'all' ? null : key,
      page: 0,
      size: 20,
      readFlag: 0,
    };
    queryUnreadMessageList(params);
  }, []);

  const messageTypeMenu = useMemo(() => {
    return (
      <Menu onClick={handleSelectType}>
        {getMessageType().map(type => (
          <Menu.Item key={type.code}>{type.name}</Menu.Item>
        ))}
      </Menu>
    );
  }, [handleSelectType]);
  return (
    <div
      className={styles['message-card']}
      onScroll={initTimer}
      onMouseDown={initTimer}
      onMouseEnter={initTimer}
      onMouseLeave={clearTimer}
    >
      <div className={styles['message-header']}>
        <div className={styles['message-header-title']}>
          {intl.get('spfm.dashboard.view.title.unReadMessage').d('未读消息')}(
          {state.count && state.count >= 99 ? '99+' : state.count})
        </div>
        <div className={styles['message-header-extra']}>
          <span
            onClick={handleAllRead}
            className={classnames({ [styles['disabled-span']]: state.listLoading })}
          >
            <Icon type="checklist" />
            <span>{intl.get('spfm.dashboard.view.title.allRead').d('全部已读')}</span>
          </span>
          <Dropdown
            overlay={state.listLoading ? undefined : messageTypeMenu}
            disabled={state.listLoading}
          >
            <span className={classnames({ [styles['disabled-span']]: state.listLoading })}>
              <span>{messageTypeObj[state.messageType]}</span>
              <Icon type="expand_more" />
            </span>
          </Dropdown>
        </div>
      </div>
      <div className={styles['message-content']}>
        <Spin spinning={state.listLoading}>
          {!state.listLoading && (!state.messageList || !state.messageList.length) ? (
            renderEmptyContent()
          ) : (
            <div className={styles['message-list']} ref={messageListRef}>
              <InfiniteScroll
                hasMore={state.hasMore}
                pageStart={0}
                initialLoad={false}
                useWindow={false}
                loadMore={handleLoadMoreMessage}
              >
                {renderMessageList()}
              </InfiniteScroll>
            </div>
          )}
        </Spin>
      </div>
    </div>
  );
};

export default withRouter(formatterCollections({ code: ['spfm.dashboard'] })(Message));

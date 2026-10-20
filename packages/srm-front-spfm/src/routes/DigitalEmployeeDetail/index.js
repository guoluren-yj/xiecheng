import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { Button, Modal, Icon, DataSet, Table, Spin, Pagination, Tooltip } from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';
import { get, isArray, isObject, isString, omit } from 'lodash';
import qs from 'querystring';
// import moment from 'moment';
import classNames from 'classnames';
import { observer } from 'mobx-react';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
// import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import notification from 'utils/notification';
import webSocket from 'utils/webSoket';
import formatterCollections from 'utils/intl/formatterCollections';
import {
  fetchDigitalEmployeeDetail,
  startDigitalEmployee,
  fetchDigitalEmployeeChatList,
  fetchDigitalEmployeeChatDetail,
  fetchDigitalEmployeeManualList,
} from '@/services/digitalEmployeeService';
import { ReactComponent as NoContent } from '@/assets/no_result.svg';
import { getDigitalEmployeeIcon } from '../DigitalEmployee';
import AgentButtonRoute from './AgentButtonRoute';
import styles from './index.less';

const WAIT_MANUAL_CONFIRM = 'WAIT_MANUAL_CONFIRM';

const transformJson = (jsonStr, defaultValue) => {
  if (!isString(jsonStr)) {
    return jsonStr;
  }
  try {
    return JSON.parse(jsonStr);
  } catch {
    return defaultValue || {};
  }
};

const useSessionManager = () => {
  const [, setCount] = useState(0);
  const sessionManager = useMemo(() => {
    return {
      allRecords: {},
      initials: new Set(),
      getRecords(key) {
        return this.allRecords[key] || [];
      },
      isInitialzed(key) {
        return this.initials.has(key);
      },
      setRecords(key, records) {
        this.allRecords[key] = records;
        this.initials.add(key);
        setCount(c => c + 1);
      },
      appendRecords(key, records) {
        const prev = this.getRecords(key);
        this.allRecords[key] = [...prev, ...records];
        setCount(c => c + 1);
      },
      getLastRecord(key) {
        const records = this.getRecords(key);
        return records[records.length - 1];
      },
      setLastRecord(key, record) {
        const records = this.getRecords(key);
        if (records.length) {
          records[records.length - 1] = record;
          setCount(c => c + 1);
        }
      },
    };
  }, []);
  return sessionManager;
};

const defaultPagination = { page: 1, pageSize: 10 };

const getDataByPagination = (data, { page, pageSize }) => {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  return data.slice(start, end);
};

const ManualNode = props => {
  const { params, getManualStatusTagProps } = props;
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState(defaultPagination);
  const dataSet = useMemo(
    () =>
      new DataSet({
        selection: false,
        paging: false,
        fields: [
          {
            name: 'handlerName',
            type: 'string',
            label: intl.get('spfm.digitalEmployee.view.handleUser').d('处理人'),
          },
          {
            name: 'handlerCode',
          },
          {
            name: 'totalNum',
            type: 'number',
            label: intl.get('spfm.digitalEmployee.view.totalNum').d('总数量'),
          },
          {
            name: 'handledNum',
            type: 'number',
            label: intl.get('spfm.digitalEmployee.view.processed').d('已处理'),
          },
          {
            name: 'status',
            type: 'string',
            label: intl.get('hzero.common.status').d('状态'),
          },
        ],
      }),
    []
  );

  const queryList = useCallback(async () => {
    setLoading(true);
    try {
      const result = getResponse(await fetchDigitalEmployeeManualList(params));
      if (result) {
        setData(result);
        setPagination(defaultPagination);
        dataSet.loadData(getDataByPagination(result, defaultPagination));
      }
    } finally {
      setLoading(false);
    }
  }, [params]);

  const handlePageChange = useCallback(
    (page, pageSize) => {
      const newPagination = (() => {
        if (pagination.pageSize !== pageSize) {
          return {
            page: 1,
            pageSize,
          };
        }
        return {
          page,
          pageSize,
        };
      })();
      setPagination(newPagination);
      dataSet.loadData(getDataByPagination(data, newPagination));
    },
    [data, pagination]
  );

  useEffect(() => {
    queryList();
  }, [params]);

  const columns = useMemo(() => {
    return [
      {
        name: 'handlerName',
        renderer({ value, record }) {
          if (value) {
            return `${value}(${record.get('handlerCode')})`;
          }
          return '-';
        },
      },
      {
        name: 'totalNum',
      },
      {
        name: 'handledNum',
      },
      {
        name: 'status',
        minWidth: 100,
        renderer({ value }) {
          if (value) {
            return <Tag {...getManualStatusTagProps(value)} className="digital-employee-tag" />;
          }
          return '-';
        },
      },
    ];
  }, [getManualStatusTagProps]);
  const spin = useMemo(() => {
    return {
      spinning: loading,
    };
  }, [loading]);
  const tableStyle = useMemo(() => {
    return { maxHeight: 'calc(100vh - 348px)' };
  }, []);
  return (
    <div className={styles['manual-table']}>
      <div className={styles['manual-table-operators']}>
        <Button color="primary" onClick={queryList}>
          {intl.get('hzero.common.button.search').d('查询')}
        </Button>
      </div>
      <Table spin={spin} dataSet={dataSet} columns={columns} style={tableStyle} />
      <Pagination
        className={styles['manual-table-pagination']}
        {...pagination}
        total={data.length}
        onChange={handlePageChange}
      />
    </div>
  );
};

const isSameSession = (prevId, nextId) => {
  return String(prevId) === String(nextId);
};

// ====== 主页面 ======

function DigitalEmployeeDetail(props) {
  const { digitalEmployeeInfoId, match, onClose, location } = props;
  const id = digitalEmployeeInfoId || get(match, 'params.digitalEmployeeInfoId');
  const { chatId: defaultChatId } = location ? qs.parse(location.search.slice(1)) : {};
  const [digitalEmployeeInfo, setDigitalEmployeeInfo] = useState({});
  const [digitalEmployeeSessions, setDigitalEmployeeSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState();
  const [agentCompInfo, setAgentCompInfo] = useState();
  const [fullscreen, setFullscreen] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [recordLoading, setRecordLoading] = useState(false);
  const sessionManager = useSessionManager();
  const waitUpdateChatIds = useMemo(() => new Set(), []);
  const sessionListRef = useRef(null);
  const hasInitialScrolled = useRef(false);

  const DEBOUNCE_DELAY = 300;
  const querySessionDetailRef = useRef();
  const debounceTimersRef = useRef(new Map());
  const pendingQueriesRef = useRef(new Map());

  const querySessions = async digitalEmployeeCode => {
    const result = getResponse(
      await fetchDigitalEmployeeChatList({ digitalEmployeeCode, page: -1 })
    );
    if (result) {
      const sessions = result.content || [];
      setDigitalEmployeeSessions(sessions);
      const defaultSession = defaultChatId
        ? sessions.find(f => isSameSession(f.chatId, defaultChatId))
        : sessions[0];
      setCurrentSession(defaultSession || sessions[0]);
    }
  };

  const querySessionDetail = useCallback(
    async (chatId, needLoading = true) => {
      if (needLoading) {
        setRecordLoading(true);
      }
      if (waitUpdateChatIds.has(chatId)) {
        waitUpdateChatIds.delete(chatId);
      }
      try {
        const result = getResponse(await fetchDigitalEmployeeChatDetail(chatId));
        if (result) {
          const sessionRecords = result.nodes || [];
          const sessionIndex = digitalEmployeeSessions.findIndex(f =>
            isSameSession(f.chatId, chatId)
          );
          if (sessionIndex !== -1) {
            digitalEmployeeSessions[sessionIndex] = {
              ...digitalEmployeeSessions[sessionIndex],
              ...result,
            };
          }
          const newSessionRecords = sessionRecords.reduce(
            (list, item) => {
              if (item.buttons) {
                const lastItem = list[list.length - 1];
                if (lastItem) {
                  lastItem.buttons = [...(lastItem.buttons || []), ...item.buttons];
                }
              } else {
                list.push(item);
              }
              return list;
            },
            [
              {
                nodeCode: 'start',
                nodeName: intl.get('spfm.digitalEmployee.view.flowStart').d('流程开始'),
                executionDetails: [
                  `${intl
                    .get('spfm.digitalEmployee.model.taskNum')
                    .d('任务号')}：${result.chatCode || '-'}`,
                  `${intl.get('hzero.common.creationDate').d('创建时间')}：${result.startTime ||
                    '-'}`,
                  `${intl
                    .get('hzero.common.creationName')
                    .d('创建人')}：${result.initiatorUserName || '-'}`,
                ],
              },
            ]
          );
          if (result.status === 'ERROR') {
            newSessionRecords.push({
              nodeCode: new Date().getTime(),
              nodeType: 'ERROR',
              nodeName: intl.get('spfm.digitalEmployee.view.flowError').d('流程异常'),
              executionDetails: result.errorMsg,
            });
          }
          sessionManager.setRecords(chatId, newSessionRecords);
        }
        return result;
      } finally {
        setRecordLoading(false);
      }
    },
    [digitalEmployeeSessions]
  );

  // 保持 ref 始终指向最新的 querySessionDetail，避免 debounce 闭包陈旧
  querySessionDetailRef.current = querySessionDetail;

  // 防抖 + 同步队列（按 chatId 隔离）
  const debouncedQuerySessionDetail = useCallback((chatId, needLoading = false) => {
    const timers = debounceTimersRef.current;
    const queries = pendingQueriesRef.current;

    // 获取或初始化该 chatId 的队列状态
    if (!queries.has(chatId)) {
      queries.set(chatId, { running: false, queued: null });
    }

    // 重置该 chatId 的防抖计时器
    if (timers.has(chatId)) {
      clearTimeout(timers.get(chatId));
    }

    timers.set(
      chatId,
      setTimeout(() => {
        const doQuery = async (qChatId, qLoading) => {
          const state = queries.get(qChatId);
          state.running = true;
          try {
            await querySessionDetailRef.current(qChatId, qLoading);
          } finally {
            state.running = false;
            // 当前请求完成后，检查该 chatId 是否有排队等待的新请求
            if (state.queued) {
              const prevQueued = state.queued;
              state.queued = null;
              doQuery(prevQueued.chatId, prevQueued.needLoading);
            }
          }
        };

        const state = queries.get(chatId);
        if (state.running) {
          // 有请求在执行，排队等待（替换之前的排队项）
          state.queued = { chatId, needLoading };
        } else {
          doQuery(chatId, needLoading);
        }
      }, DEBOUNCE_DELAY)
    );
  }, []);

  const initData = async () => {
    try {
      const result = getResponse(await fetchDigitalEmployeeDetail(id));
      if (result) {
        setDigitalEmployeeInfo(result);
        await querySessions(result.code);
      }
    } finally {
      setSessionLoading(false);
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  const handleChangeCurrent = session => {
    setCurrentSession(session);
  };

  const handleNewSession = () => {
    Modal.confirm({
      title: intl
        .get('spfm.digitalEmployee.view.startExecuteDigital', { name })
        .d(`开始执行${name}`),
      async onOk() {
        const { code, agentInfo } = digitalEmployeeInfo;
        const { appCode } = transformJson(agentInfo);
        const result = await startDigitalEmployee({
          agentCode: appCode,
          digitalEmployeeCode: code,
        });
        let chatId;
        try {
          chatId = getResponse(JSON.parse(result));
        } catch {
          chatId = result;
        }
        if (chatId && !isObject(chatId)) {
          notification.success();
          querySessionDetail(chatId).then(newSession => {
            if (newSession) {
              setDigitalEmployeeSessions(prev => {
                return [newSession, ...prev];
              });
              handleChangeCurrent(newSession);
              // 新建会话后滚动到列表顶部
              setTimeout(() => {
                if (sessionListRef.current) {
                  sessionListRef.current.scrollTop = 0;
                }
              }, 100);
            }
          });
        }
      },
    });
  };

  const toggleFullscreen = useCallback(() => {
    setFullscreen(f => !f);
  }, []);

  const handleCloseComp = useCallback(() => {
    setAgentCompInfo();
    setFullscreen(false);
  }, []);

  const handleAgentButtonClick = async (button, chatId) => {
    const { buttonUrl, buttonParameter } = button;
    if (!buttonUrl) return;
    const idList = transformJson(buttonParameter, buttonParameter) || [];
    setAgentCompInfo({ title: button.buttonName, path: buttonUrl, idList, chatId });
  };

  const getManualStatusTagProps = useCallback(status => {
    switch (status) {
      case 'UNPROCESSED':
        return {
          color: 'yellow',
          children: intl.get('spfm.digitalEmployee.view.unProcess').d('未处理'),
        };
      case 'RUNNING':
        return {
          color: 'yellow',
          children: intl.get('spfm.digitalEmployee.view.waitManualConfirm').d('待人工确认'),
        };
      case 'COMPLETED':
        return {
          color: 'green',
          children: intl.get('spfm.digitalEmployee.view.manualConfirmed').d('人工确认完成'),
        };
      case 'PROCESSING':
        return {
          color: 'blue',
          children: intl.get('spfm.digitalEmployee.view.statusProcessing').d('处理中'),
        };
      case 'PROCESSED':
        return {
          color: 'green',
          children: intl.get('spfm.digitalEmployee.view.processed').d('已处理'),
        };
      case 'NO_NEED':
        return {
          color: 'gray',
          children: intl.get('spfm.digitalEmployee.view.noProcess').d('无需处理'),
        };
      default:
        return {
          color: 'gray',
          children: status,
        };
    }
  }, []);

  const getHeaderStatusTagProps = () => {
    if (digitalEmployeeSessions.some(s => s.status === 'RUNNING')) {
      return {
        color: 'green',
        children: intl.get('spfm.digitalEmployee.view.statusRunning').d('运行中'),
      };
    }
    return {
      color: 'gray',
      children: intl.get('spfm.digitalEmployee.view.statusEmpty').d('空闲中'),
    };
  };

  const handleManualDetailClick = params => {
    Modal.open({
      loading: true,
      key: Modal.key(),
      title: intl.get('spfm.digitalEmployee.title.viewManualDetail').d('查看详情'),
      style: { width: 700 },
      border: true,
      destroyOnClose: true,
      closable: true,
      children: <ManualNode params={params} getManualStatusTagProps={getManualStatusTagProps} />,
      okCancel: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
    });
  };

  const handleSessionMessage = useCallback(
    data => {
      const { message } = data;
      if (message) {
        const {
          chatId,
          // answer,
          // event,
          // buttons,
          // handleDescription,
          // manualNodeCode,
          // manualNodeName,
          // errorMsg,
        } = transformJson(message);
        if (chatId) {
          // 记录需要更新的会话
          waitUpdateChatIds.add(chatId);
          // 当前会话更新直接刷新
          if (currentSession && isSameSession(chatId, currentSession.chatId)) {
            debouncedQuerySessionDetail(chatId, false);
          }
        }
        // 暂时注释ws推送的节点更新，改为接口请求
        // if (event === 'message_end') {
        //   sessionManager.appendRecords(chatId, [
        //     {
        //       nodeCode: 'end',
        //       nodeType: 'END',
        //       nodeName: intl.get('spfm.digitalEmployee.view.flowEnd').d('流程结束'),
        //       startTime: moment().format(DEFAULT_DATETIME_FORMAT),
        //     },
        //   ]);
        // } else if (event === 'button') {
        //   if (buttons) {
        //     const lastRecord = sessionManager.getLastRecord(chatId);
        //     if (lastRecord) {
        //       sessionManager.setLastRecord(chatId, {
        //         ...lastRecord,
        //         buttons: [
        //           ...(lastRecord.buttons || []),
        //           ...buttons.map((m) => ({
        //             buttonName: m.button_name,
        //             buttonCode: m.button_code,
        //             buttonUrl: m.button_url,
        //             buttonSeq: m.seq,
        //             buttonParameter: m.id_list,
        //           })),
        //         ],
        //       });
        //     }
        //   }
        // } else if (event === 'manual_node') {
        //   const records = sessionManager.getRecords(chatId);
        //   const manualRecordIndex = findLastIndex(records, (f) => f.nodeType === 'MANUAL_NODE');
        //   if (manualRecordIndex !== -1) {
        //     const manualRecord = records[manualRecordIndex];
        //     records[manualRecordIndex] = { ...manualRecord, manualNodeCode, handleDescription };
        //     sessionManager.setRecords(chatId, records);
        //   } else {
        //     sessionManager.appendRecords(chatId, [
        //       {
        //         nodeCode: new Date().getTime(),
        //         nodeType: 'MANUAL_NODE',
        //         nodeName: manualNodeName || manualNodeCode,
        //         handleDescription,
        //         manualNodeCode,
        //         status: 'RUNNING',
        //         startTime: moment().format(DEFAULT_DATETIME_FORMAT),
        //       },
        //     ]);
        //   }
        // } else if (event === 'error') {
        //   sessionManager.appendRecords(chatId, [
        //     {
        //       nodeCode: new Date().getTime(),
        //       nodeType: 'ERROR',
        //       nodeName: intl.get('spfm.digitalEmployee.view.flowError').d('流程异常'),
        //       executionDetails: errorMsg,
        //     },
        //   ]);
        // } else if (answer) {
        //   const { title, content } = transformJson(answer);
        //   sessionManager.appendRecords(chatId, [
        //     {
        //       nodeCode: new Date().getTime(),
        //       nodeType: 'DIRECT_REPLY',
        //       nodeName: title,
        //       executionDetails: content,
        //       startTime: moment().format(DEFAULT_DATETIME_FORMAT),
        //     },
        //   ]);
        // }
      }
    },
    [currentSession, debouncedQuerySessionDetail]
  );

  const handleSessionMessageRef = useRef(handleSessionMessage);
  handleSessionMessageRef.current = handleSessionMessage;

  useEffect(() => {
    if (id) {
      initData();
    }
    const handler = (...args) => handleSessionMessageRef.current(...args);
    webSocket.addListener('DIGITAL_EMPLOYEE_BUSINESS_MSG_KEY', handler);
    return () => {
      const timers = debounceTimersRef.current;
      timers.forEach(t => clearTimeout(t));
      timers.clear();
      waitUpdateChatIds.clear();
      webSocket.removeListener('DIGITAL_EMPLOYEE_BUSINESS_MSG_KEY', handler);
    };
  }, [id]);

  useEffect(() => {
    if (currentSession) {
      if (
        !sessionManager.isInitialzed(currentSession.chatId) ||
        waitUpdateChatIds.has(currentSession.chatId)
      ) {
        querySessionDetail(currentSession.chatId);
      }
    }
    handleCloseComp();
  }, [currentSession]);

  // 根据 defaultChatId 自动滚动到对应 session（如果不可见）
  useEffect(() => {
    if (hasInitialScrolled.current) return;
    if (!defaultChatId || !digitalEmployeeSessions.length) return;

    const timer = setTimeout(() => {
      const container = sessionListRef.current;
      if (!container) return;

      const el = container.querySelector(`[data-chat-id="${defaultChatId}"]`);
      if (el) {
        container.scrollTop +=
          el.getBoundingClientRect().top - container.getBoundingClientRect().top;
      }
      hasInitialScrolled.current = true;
    }, 100);

    return () => clearTimeout(timer);
  }, [digitalEmployeeSessions, defaultChatId]);

  const { name, icon, description } = digitalEmployeeInfo;

  const renderNodeDetails = node => {
    const { executionDetails } = node;
    if (isArray(executionDetails)) {
      return executionDetails.map(str => <div>{str}</div>);
    }
    return executionDetails;
  };

  const getSessionStatusTagProps = status => {
    switch (status) {
      case 'RUNNING':
        return {
          color: 'blue',
          children: intl.get('spfm.digitalEmployee.view.statusProcessing').d('处理中'),
        };
      case 'COMPLETED':
        return {
          color: 'green',
          children: intl.get('spfm.digitalEmployee.view.statusCompleted').d('完成'),
        };
      case 'ERROR':
        return {
          color: 'red',
          children: intl.get('spfm.digitalEmployee.view.statusError').d('异常'),
        };
      case WAIT_MANUAL_CONFIRM:
        return {
          color: 'yellow',
          children: intl.get('spfm.digitalEmployee.view.waitManualConfirm').d('待人工确认'),
        };
      default:
        return {
          color: 'gray',
          children: status,
        };
    }
  };

  const agentCompProps = useMemo(() => {
    if (agentCompInfo) {
      return omit(agentCompInfo, ['title']);
    }
  }, [agentCompInfo]);

  return (
    <div className={styles['digital-employee-wrapper']}>
      <Spin spinning={sessionLoading}>
        <div className={styles['digital-employee']}>
          <div className="digital-employee-sessions">
            <div className="digital-employee-info-wrapper">
              <div>
                <Tooltip title={intl.get('hzero.common.button.back').d('返回')}>
                  <Icon type="arrow_back" className="digital-employee-back" onClick={handleClose} />
                </Tooltip>
              </div>
              <div className="digital-employee-info">
                <div className="digital-employee-info-header">
                  <img
                    src={getDigitalEmployeeIcon(icon)}
                    alt=""
                    className="digital-employee-info-icon"
                  />
                  <span className="digital-employee-info-title" title={name}>
                    {name}
                  </span>
                  <Tag {...getHeaderStatusTagProps()} className="digital-employee-tag" />
                </div>
                {description && <div className="digital-employee-info-desc">{description}</div>}
              </div>
            </div>
            <div className="digital-employee-session-btn" onClick={handleNewSession}>
              <Icon type="add" className="digital-employee-session-btn-icon" />
              <span className="digital-employee-session-btn-text">
                {intl.get('spfm.digitalEmployee.button.newSession').d('新会话')}
              </span>
            </div>
            <div className="digital-employee-session-list-wrapper">
              <div className="digital-employee-session-list" ref={sessionListRef}>
                {digitalEmployeeSessions.map(m => {
                  const sessionStatus =
                    m.currentRunningNodeType === 'MANUAL_NODE' ? WAIT_MANUAL_CONFIRM : m.status;
                  const desc = (() => {
                    if (m.status === 'ERROR') {
                      return intl.get('spfm.digitalEmployee.view.flowError').d('流程异常');
                    }
                    const lastSessionRecord = sessionManager.getLastRecord(m.chatId);
                    return lastSessionRecord ? lastSessionRecord.nodeName : m.lastNodeName;
                  })();
                  return (
                    <div
                      key={m.chatId}
                      data-chat-id={m.chatId}
                      className={classNames('digital-employee-session-item', {
                        'digital-employee-session-item-active':
                          currentSession && m.chatId === currentSession.chatId,
                      })}
                      onClick={() => handleChangeCurrent(m)}
                    >
                      <div className="digital-employee-session-item-header">
                        <span className="digital-employee-session-item-text">{m.chatCode}</span>
                        <Tag
                          {...getSessionStatusTagProps(sessionStatus)}
                          className="digital-employee-tag digital-employee-session-item-tag"
                        />
                      </div>
                      <div className="digital-employee-session-item-desc">{desc}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          {currentSession ? (
            <div className="digital-employee-session-detail">
              <div className="digital-employee-session-detail-header">
                <span className="digital-employee-session-detail-title">
                  {`${intl.get('spfm.digitalEmployee.title.taskDetail').d('任务详情')}-${
                    currentSession.chatCode
                  }`}
                </span>
                {/* <Icon
                  type="close"
                  onClick={handleClose}
                  className="digital-employee-header-close"
                /> */}
              </div>
              <div className="digital-employee-session-detail-content">
                <div className="digital-employee-session-record-wrapper">
                  <div className="digital-employee-session-record">
                    <Spin spinning={recordLoading}>
                      <div className="digital-employee-session-record-inner">
                        {sessionManager.getRecords(currentSession.chatId).map(m => {
                          const isManualNode = m.nodeType === 'MANUAL_NODE';
                          const isErrorNode = m.nodeType === 'ERROR';
                          return (
                            <div key={m.nodeCode} className="digital-employee-session-record-item">
                              <span
                                className={classNames('digital-employee-session-record-check', {
                                  'digital-employee-session-record-error': isErrorNode,
                                })}
                              >
                                <Icon
                                  type={isErrorNode ? 'close' : 'check'}
                                  style={{ color: '#fff', fontSize: 10 }}
                                />
                              </span>
                              <div className="digital-employee-session-record-header">
                                <div className="digital-employee-session-record-start">
                                  <span className="digital-employee-session-record-title">
                                    {m.nodeName}
                                  </span>
                                  {isManualNode && m.status && (
                                    <Tag
                                      {...getManualStatusTagProps(m.status)}
                                      className="digital-employee-tag"
                                    />
                                  )}
                                </div>
                                <span className="digital-employee-session-record-time">
                                  {m.startTime}
                                </span>
                              </div>
                              <div className="digital-employee-session-record-content">
                                {isManualNode ? m.handleDescription : renderNodeDetails(m)}
                              </div>
                              {isManualNode && m.handleDescription && (
                                <div className="digital-employee-session-record-button">
                                  <Button
                                    color="primary"
                                    onClick={() =>
                                      handleManualDetailClick({
                                        chatId: currentSession.chatId,
                                        manualNodeCode: m.manualNodeCode,
                                      })
                                    }
                                  >
                                    {intl
                                      .get('spfm.digitalEmployee.button.viewManualDetail')
                                      .d('查看详情')}
                                  </Button>
                                </div>
                              )}
                              {m.buttons && (
                                <div className="digital-employee-session-record-button">
                                  {m.buttons.map(button => (
                                    <Button
                                      icon={button.buttonIcon}
                                      color="primary"
                                      onClick={() =>
                                        handleAgentButtonClick(button, currentSession.chatId)
                                      }
                                    >
                                      {button.buttonName}
                                    </Button>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </Spin>
                  </div>
                </div>
                {agentCompInfo && (
                  <div className="agent-button-comp-wrapper">
                    <div
                      className={classNames('agent-button-comp', {
                        'agent-button-comp-fullscreen': fullscreen,
                      })}
                    >
                      <div className="agent-button-comp-header">
                        <div className="agent-button-comp-title">{agentCompInfo.title}</div>
                        <div className="agent-button-comp-icons">
                          <Icon
                            type={fullscreen ? 'close_fullscreen' : 'open_in_full'}
                            onClick={toggleFullscreen}
                          />
                          <Icon type="close" onClick={handleCloseComp} />
                        </div>
                      </div>
                      <div className="agent-button-comp-content">
                        <AgentButtonRoute
                          path={agentCompInfo.path}
                          digitalEmployeeInfo={agentCompProps}
                        />
                      </div>
                      <div className="agent-button-comp-footer">
                        <Button onClick={handleCloseComp}>
                          {intl.get('hzero.common.button.close').d('关闭')}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="digital-employee-session-empty" hidden={sessionLoading}>
              <NoContent style={{ width: 136, height: 96 }} />
              <Button color="primary" onClick={handleClose}>
                {intl.get('hzero.common.button.back').d('返回')}
              </Button>
            </div>
          )}
        </div>
      </Spin>
    </div>
  );
}

export default formatterCollections({
  code: ['hzero.common', 'spfm.digitalEmployee'],
})(observer(DigitalEmployeeDetail));

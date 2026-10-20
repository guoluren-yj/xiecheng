/**
 * TodoWorkflow -采购方待办工作流
 * @date: 2019-02-26
 * @author YKK <kaikai.yang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import React from 'react';
import { connect } from 'dva';
import { isEmpty, size } from 'lodash';
import { Bind } from 'lodash-decorators';
import { Row, Col, Tabs, Timeline, Icon } from 'hzero-ui';
import InfiniteScroll from 'react-infinite-scroller';
import { withRouter, routerRedux } from 'dva/router';
// import { withRouter } from 'dva/router';
import { getDetailDispatchRouter } from '@/utils/utils';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { menuTabEventManager } from 'utils/menuTab';
import styles from './Cards.less';
// import temporarily from '../../assets/dashboard/temporarily-no-data.svg';
import temporarilyNoData from '../../assets/dashboard/temporarily-lang-no-data.svg';

@connect(({ srmCards, loading }) => ({
  srmCards,
  loading: loading.effects['srmCards/queryTodo'],
}))
@formatterCollections({ code: ['spfm.dashboard'] })
@withRouter
export default class TodoWorkflow extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // purchaserTodo: [], // 存储采购方数据
      // isPurchaserTodo: true, // 判断是否还有数据
      workflowList: [],
      isworkflowList: true,
      myCopyProcessList: [],
      isMyCopyProcess: true, // 我的抄送流程
    };
  }

  componentDidMount() {
    this.handleWorkflowSearch();
    this.handleMyCopyProcessSearch();
  }

  @Bind()
  getWindow() {
    if (window.parent === window) {
      return window;
    } else {
      return window.parent;
    }
  }

  /**
   * 工作流跳转
   */
  @Bind()
  changeDetail(record) {
    const { myCopyFlag = false } = record;
    const title = myCopyFlag
      ? `${record.processName}-${record.startUserName}`
      : `${record.processName}-${record.assigneeName}`;
    // const key = myCopyFlag
    //   ? `/hwfp/carbon-copy-task/detail/${record.id}`
    //   : `/hwfp/task/detail/${record.id}/${record.processInstanceId}`;
    const path = myCopyFlag
      ? `/hwfp/carbon-copy-task/detail/${record.id}`
      : `/hwfp/task/detail/${record.id}/${record.processInstanceId}`;

    const key = myCopyFlag
      ? `/hwfp/carbon-copy-task/detail/:id-${record.processDefinitionKey}`
      : `/hwfp/task/detail/:id/:processInstanceId-${record.processDefinitionKey}`;
    const menuValue = getDetailDispatchRouter();
    if (menuValue.approvalMenu) {
      const { dispatch } = this.props;
      dispatch(
        routerRedux.push({
          pathname: myCopyFlag
            ? `/hwfp/approval/carbon-copy-task/detail/${record.id}`
            : `/hwfp/approval/task/detail/${record.id}/${record.processInstanceId}`,
        })
      );
    } else {
      //   openTab({
      //     title,
      //     key,
      //     path,
      //     icon: 'edit',
      //     closable: true,
      //   });
      this.getWindow()
        .dvaApp._store.dispatch({
          type: 'global/removeTab',
          payload: key,
        })
        .then(() => {
          menuTabEventManager.emit('close', { key });
          this.getWindow().openTab({
            title,
            key,
            path,
            icon: 'edit',
            closable: true,
          });
        });
    }
  }

  /**
   * 查询工作流
   */
  @Bind()
  handleWorkflowSearch(currentPage = 0) {
    const { dispatch } = this.props;
    // const payload = { page: 0, size: 999999 };
    dispatch({
      type: 'srmCards/queryWorkflow',
      payload: {
        readFlag: 0,
        page: currentPage,
        size: 10,
      },
    }).then((res) => {
      const { workflowList = [] } = this.state;
      if (res && res.totalElements > size(workflowList)) {
        const data = workflowList.concat(res.content);
        this.setState({
          workflowList: data,
          isworkflowList: true,
        });
      } else {
        this.setState({
          isworkflowList: false,
        });
      }

      dispatch({
        type: 'srmCards/updateState',
        payload: { workflowLoading: false },
      });
    });
  }

  /**
   * 我的抄送流程
   */
  @Bind()
  handleMyCopyProcessSearch(currentPage = 0) {
    const { dispatch } = this.props;
    dispatch({
      type: 'srmCards/queryMyCopyProcess',
      payload: {
        type: 1,
        // code: 'SRM_TodoMyCopyProcess',
        page: currentPage,
        size: 10,
      },
    }).then((res = {}) => {
      const { myCopyProcessList = [] } = this.state;
      if (res && res.totalElements > size(myCopyProcessList)) {
        const data = myCopyProcessList
          .concat(res.content)
          .map((item) => ({ ...item, myCopyFlag: true }));
        this.setState({
          myCopyProcessList: data,
          isMyCopyProcess: true,
        });
      } else {
        this.setState({
          isMyCopyProcess: false,
        });
      }
    });
  }

  /**
   * 数据展示
   */
  @Bind()
  handleColor(item, key) {
    if (key % 4 === 0) {
      return (
        <Timeline.Item key={`system-item-${item.Id}`} color="#0687ff">
          <Row className={styles['message-row']}>
            <Col span={16} className={styles['message-title']}>
              <a onClick={() => this.changeDetail(item)}>{item.processName}</a>
            </Col>
            <Col span={8} className={styles['message-time']}>
              {item.createTime || item.startTime}
            </Col>
            <Col span={18} className={styles['message-list']}>
              {item.description}
            </Col>
            <Col span={6} className={styles['message-time']}>
              {`${intl
                .get(`spfm.dashboard.model.supplierTodoWorkflow.startUserName`)
                .d('申请人')}:${item.startUserName}`}
            </Col>
          </Row>
        </Timeline.Item>
      );
    } else if (key % 4 === 1) {
      return (
        <Timeline.Item key={`system-item-${item.Id}`} color="#cb38ad">
          <Row className={styles['message-row']}>
            <Col span={16} className={styles['message-title']}>
              <a onClick={() => this.changeDetail(item)}>{item.processName}</a>
            </Col>
            <Col span={8} className={styles['message-time']}>
              {item.createTime || item.startTime}
            </Col>
            <Col span={18} className={styles['message-list']}>
              {item.description}
            </Col>
            <Col span={6} className={styles['message-time']}>
              {`${intl
                .get(`spfm.dashboard.model.supplierTodoWorkflow.startUserName`)
                .d('申请人')}:${item.startUserName}`}
            </Col>
          </Row>
        </Timeline.Item>
      );
    } else if (key % 4 === 2) {
      return (
        <Timeline.Item key={`system-item-${item.Id}`} color="#ffbc00">
          <Row className={styles['message-row']}>
            <Col span={16} className={styles['message-title']}>
              <a onClick={() => this.changeDetail(item)}>{item.processName}</a>
            </Col>
            <Col span={8} className={styles['message-time']}>
              {item.createTime || item.startTime}
            </Col>
            <Col span={18} className={styles['message-list']}>
              {item.description}
            </Col>
            <Col span={6} className={styles['message-time']}>
              {`${intl
                .get(`spfm.dashboard.model.supplierTodoWorkflow.startUserName`)
                .d('申请人')}:${item.startUserName}`}
            </Col>
          </Row>
        </Timeline.Item>
      );
    } else if (key % 4 === 3) {
      return (
        <Timeline.Item key={`system-item-${item.Id}`} color="#f02b2b">
          <Row className={styles['message-row']}>
            <Col span={16} className={styles['message-title']}>
              <a onClick={() => this.changeDetail(item)}>{item.processName}</a>
            </Col>
            <Col span={8} className={styles['message-time']}>
              {item.createTime || item.startTime}
            </Col>
            <Col span={18} className={styles['message-list']}>
              {item.description}
            </Col>
            <Col span={6} className={styles['message-time']}>
              {`${intl
                .get(`spfm.dashboard.model.supplierTodoWorkflow.startUserName`)
                .d('申请人')}:${item.startUserName}`}
            </Col>
          </Row>
        </Timeline.Item>
      );
    }
  }

  /**
   * 刷新
   */
  handleCardRefresh = () => {
    // 由于之前代码中查询数据之后是直接将返回的数据加到state的list中，所以先将list置空
    this.setState({ workflowList: [], myCopyProcessList: [] });
    this.handleWorkflowSearch();
    this.handleMyCopyProcessSearch();
  };

  render() {
    const { workflowList = [], isworkflowList, myCopyProcessList, isMyCopyProcess } = this.state;
    const refreshButton = (
      <div style={{ paddingTop: '3px', paddingRight: '24px' }}>
        <a onClick={() => this.handleCardRefresh()}>
          {intl.get('spfm.dashboard.view.message.link.refresh').d('刷新')}
          <Icon type="reload" />
        </a>
      </div>
    );

    return (
      <Tabs
        size="large"
        tabBarGutter={0}
        className={styles.height}
        defaultActiveKey="workflow"
        tabBarExtraContent={refreshButton}
      >
        {/* <Tabs.TabPane
          tab={intl.get(`spfm.dashboard.model.supplierTodoWorkflow.tasksToHandle`).d('待处理业务')}
          key="todo"
          className={styles.todo}
        >
          {!isEmpty(purchaserTodo) && (
            <div className={styles['todo-overflow']}>
              <InfiniteScroll
                hasMore={isPurchaserTodo}
                pageStart={0}
                initialLoad={false}
                useWindow={false}
                loadMore={this.handleTodoSearch}
                loader={
                  <div style={{ textAlign: 'center' }}>
                    <Spin spinning={loading} />
                  </div>
                }
              >
                {purchaserTodo.map((item, index) => {
                  return (
                    <Row
                      // key={`todoList-item-${item.docStatisticsId}`}
                      type="flex"
                      justify="space-around"
                      align="middle"
                      className={styles['todo-row']}
                    >
                      <Col
                        className={
                          index % 4 === 0
                            ? styles['todo-background-0']
                            : index % 4 === 1
                            ? styles['todo-background-1']
                            : index % 4 === 2
                            ? styles['todo-background-2']
                            : styles['todo-background-3']
                        }
                      >
                        {item.docSubmitName && item.docSubmitName.length > 3 && (
                          <span
                            className={
                              index % 4 === 0
                                ? styles['todo-name-0']
                                : index % 4 === 1
                                ? styles['todo-name-1']
                                : index % 4 === 2
                                ? styles['todo-name-2']
                                : styles['todo-name-3']
                            }
                          >
                            {item.docSubmitName.substr(item.docSubmitName.length - 2, 3)}
                          </span>
                        )}
                        {item.docSubmitName && item.docSubmitName.length <= 3 && (
                          <span
                            className={
                              index % 4 === 0
                                ? styles['todo-name-0']
                                : index % 4 === 1
                                ? styles['todo-name-1']
                                : index % 4 === 2
                                ? styles['todo-name-2']
                                : styles['todo-name-3']
                            }
                          >
                            {item.docSubmitName}
                          </span>
                        )}
                      </Col>
                      <Col span={20}>
                        <Row style={{ marginBottom: '4px' }}>
                          <Col span={16}>
                            {(item.route === '/sslm/investigation-approval/list' ||
                              item.route === '/sslm/investigation-write/list') && (
                              <Link to={`${item.route}`} className={styles['todo-list']}>
                                {item.docRemark}
                              </Link>
                            )}
                            {item.route !== '/sslm/investigation-approval/list' &&
                              item.route !== '/sslm/investigation-write/list' && (
                                <Link
                                  to={`${item.route}/${item.docId}`}
                                  className={styles['todo-list']}
                                >
                                  {item.docRemark}
                                </Link>
                              )}
                          </Col>
                          <Col span={8} className={styles['todo-time']}>
                            {item.docSubmitDate}
                          </Col>
                        </Row>
                      </Col>
                    </Row>
                  );
                })}
              </InfiniteScroll>
            </div>
          )}
          {isEmpty(purchaserTodo) && (
            <div style={{ textAlign: 'center' }}>
              <img src={temporarilyNoData} alt="" style={{ marginTop: '35px' }} />
              <div className={styles.commonlyUsed}>
                <div className={styles['common-dashboard-no-data']}>
                  {intl.get(`spfm.dashboard.model.common.temporarilyNoData`).d('暂无相关信息')}
                </div>
              </div>
            </div>
          )}
        </Tabs.TabPane> */}
        <Tabs.TabPane
          tab={intl
            .get(`spfm.dashboard.model.supplierTodoWorkflow.workFlowToBeImplemented`)
            .d('工作流待办')}
          key="workflow"
          style={{ marginBottom: 0 }}
          className={styles.message}
        >
          {!isEmpty(workflowList) && (
            <Timeline
              className={styles['message-overflow']}
              style={{ padding: '10px 16px 10px 16px' }}
            >
              <InfiniteScroll
                hasMore={isworkflowList}
                pageStart={0}
                initialLoad={false}
                useWindow={false}
                loadMore={this.handleWorkflowSearch}
              >
                {workflowList.map((item, index) => {
                  return this.handleColor(item, index);
                })}
              </InfiniteScroll>
            </Timeline>
          )}
          {isEmpty(workflowList) && (
            <div style={{ textAlign: 'center' }}>
              <img src={temporarilyNoData} alt="" style={{ marginTop: '35px' }} />
              <div className={styles.commonlyUsed}>
                <div className={styles['common-dashboard-no-data']}>
                  {intl.get(`spfm.dashboard.model.common.temporarilyNoData`).d('暂无相关信息')}
                </div>
              </div>
            </div>
          )}
        </Tabs.TabPane>
        <Tabs.TabPane
          tab={intl
            .get(`spfm.dashboard.model.supplierTodoWorkflow.myCopyProcess`)
            .d('我的抄送流程')}
          key="myCopyProcess"
          style={{ marginBottom: 0 }}
          className={styles.message}
        >
          {!isEmpty(myCopyProcessList) && (
            <Timeline
              className={styles['message-overflow']}
              style={{ padding: '10px 16px 10px 16px' }}
            >
              <InfiniteScroll
                hasMore={isMyCopyProcess}
                pageStart={0}
                initialLoad={false}
                useWindow={false}
                loadMore={this.handleMyCopyProcessSearch}
              >
                {myCopyProcessList.map((item, index) => {
                  return this.handleColor(item, index);
                })}
              </InfiniteScroll>
            </Timeline>
          )}
          {isEmpty(myCopyProcessList) && (
            <div style={{ textAlign: 'center' }}>
              <img src={temporarilyNoData} alt="" style={{ marginTop: '35px' }} />
              <div className={styles.commonlyUsed}>
                <div className={styles['common-dashboard-no-data']}>
                  {intl.get(`spfm.dashboard.model.common.temporarilyNoData`).d('暂无相关信息')}
                </div>
              </div>
            </div>
          )}
        </Tabs.TabPane>
      </Tabs>
    );
  }
}

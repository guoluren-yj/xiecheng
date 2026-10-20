/**
 * SupplierTodoWorkflow -供应商待办工作流
 * @date: 2019-02-26
 * @author YKK <kaikai.yang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import React from 'react';
import { connect } from 'dva';
import { isEmpty, size } from 'lodash';
import { Bind } from 'lodash-decorators';
import { Row, Col, Tabs, Timeline } from 'hzero-ui';
import InfiniteScroll from 'react-infinite-scroller';
import intl from 'utils/intl';
import { openTab } from 'utils/menuTab';
import formatterCollections from 'utils/intl/formatterCollections';
import { Link } from 'dva/router';
import styles from './Cards.less';
// import temporarily from '../../assets/dashboard/temporarily-no-data.svg';
import temporarilyNoData from '../../assets/dashboard/temporarily-lang-no-data.svg';
@connect(({ srmCards, loading }) => ({
  srmCards,
  loading: loading.effects['srmCards/querySupplierTodo'],
}))
@formatterCollections({ code: ['spfm.dashboard'] })
export default class SupplierTodoWorkflow extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      purchaserTodo: [],
      isPurchaserTodo: true,
      workflowList: [],
      // isworkflowList: true,
    };
  }

  componentDidMount() {
    this.handleTodoSearch();
    this.handleWorkflowSearch();
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
    }).then(res => {
      const { workflowList = [] } = this.state;
      if (res && res.totalElements > size(workflowList)) {
        const data = workflowList.concat(res.content);
        this.setState({
          workflowList: data,
          // isworkflowList: true,
        });
      }
      //  else {
      //   this.setState({
      //     isworkflowList: false,
      //   });
      // }

      dispatch({
        type: 'srmCards/updateState',
        payload: { workflowLoading: false },
      });
    });
  }

  /**
   * 查询待办事项
   */
  @Bind()
  handleTodoSearch(currentPage = 0) {
    const { dispatch } = this.props;
    dispatch({
      type: 'srmCards/querySupplierTodo',
      payload: {
        type: 0,
        code: 'SRM_SupplierTodoWorkflow',
        page: currentPage,
        size: 10,
      },
    }).then((res = {}) => {
      const { purchaserTodo = [] } = this.state;
      if (res && res.totalElements > size(purchaserTodo)) {
        const data = purchaserTodo.concat(res.content);
        this.setState({
          purchaserTodo: data,
          isPurchaserTodo: true,
        });
      } else {
        this.setState({
          isPurchaserTodo: false,
        });
      }
    });
  }

  /**
   * 工作流跳转
   */
  @Bind()
  changeDetail(record) {
    openTab({
      title: `${record.processName}-${record.assigneeName}`,
      key: `/hwfp/task/detail/${record.id}/${record.processInstanceId}`,
      path: `/hwfp/task/detail/${record.id}/${record.processInstanceId}`,
      icon: 'edit',
      closable: true,
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
              {item.createTime}
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
              {item.createTime}
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
              {item.createTime}
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
              {item.createTime}
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

  render() {
    const { purchaserTodo, isPurchaserTodo } = this.state;
    return (
      <Tabs
        size="large"
        tabBarGutter={0}
        style={{ marginBottom: 0 }}
        className={styles.height}
        defaultActiveKey="todo"
      >
        <Tabs.TabPane
          tab={intl.get(`spfm.dashboard.model.supplierTodoWorkflow.task`).d('待办事项')}
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
                                  to={
                                    item.docCategory === 'RFX_PREQUAL_DOC_CATEGORY'
                                      ? item.route
                                      : `${item.route}/${item.docId}`
                                  }
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
        </Tabs.TabPane>
        {/* <Tabs.TabPane
          tab={intl.get(`spfm.dashboard.model.supplierTodoWorkflow.workFlow`).d('工作流')}
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
        </Tabs.TabPane> */}
      </Tabs>
    );
  }
}

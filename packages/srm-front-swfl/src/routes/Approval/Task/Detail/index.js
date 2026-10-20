/**
 *  待办事项列表-详情
 */

import React, { Fragment, Component } from 'react';
import { DataSet, Spin, Modal, Tooltip } from 'choerodon-ui/pro';
import { Card, Tabs, Icon } from 'choerodon-ui';
import classnames from 'classnames';
import uuid from 'uuid/v4';
import { Bind } from 'lodash-decorators';
import { isEmpty } from 'lodash';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import remote from 'hzero-front/lib/utils/remote';

import { searchDetailNew, fetchHistoryApproval, getForecastLists } from '@/services/taskService';
import { detailTableDS, detailApproveFormDS, getAssignApproveDs } from '@/stores/taskDS';
import { ERROR_CODE, errorProcessRender } from '@/utils/util';

import { HZERO_HWFP, API_HOST } from 'utils/config';
import request from 'utils/request';
import ApproveRecordNew from '_components/ApproveRecord';
import ApproveItem from '@/components/ApproveRecord/ApproveItem';
import FlowChart from '@/components/FlowChartDrawer/FlowChart';
import TaskMenuProvider from '@/components/TaskMenuProvider';
import styles from './index.less';
import ApproveForm from '../../../components/ApproveFormNew';
import {
  observerDrawerResize,
  TASK_TAB_DRAWER_ID,
  computeDrawerHeight,
} from '../../utils';
import Footer from './HeaderButtons';

const prefix = `${HZERO_HWFP}/v1`;
const modalKey = Modal.key();

const tenantId = getCurrentOrganizationId();
const { TabPane } = Tabs;

@remote({
  code: 'SWFL_APPROVAL_WORKBENCH_TASK_DETAIL',
  name: 'processRemote',
})
@formatterCollections({
  code: [
    'hwfp.task',
    'hwfp.common',
    'hzero.common',
    'hwfp.monitor',
    'entity.position',
    'entity.department',
    'entity.employee',
    'hpfm.organization',
  ],
})
@TaskMenuProvider({ initMenu: true })
export default class Task extends Component {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.flowChartDrawerRef = null;
    this.approveFormRef = null;
    this.headerButtonRef = null;
    this.elementFixRef = null;
    this.approvalRecordTableDs = new DataSet(detailTableDS());
    this.approvalHistoryTableDs = new DataSet(detailTableDS());
    this.approveFormDS = new DataSet(detailApproveFormDS());
    this.assignApproveDs = new DataSet(getAssignApproveDs());
    this.taskId = this.props.match.params.id;
    this.drawerResizeObserver = null;
    this.retryTimer = null;
    this.state = {
      errorCode: undefined, // 流程详情返回异常编码
      task: {},
      fetchDetailLoading: false,
      fetchHistoryApprovalLoading: false,
      approveLoading: false,
      historyApprovalRecords: [],
      forecastLoading: false,
      forecastLists: [],
      queryHistoryFlag: false,
      activeTab: 'approve-form',
      firstGoToId: true,
      forecastData: [],
      isReverse: true, // 若后期需要时间正序/倒序，设置值为true为倒叙（时间近到远），设置值为false为正序（时间远到近）
      queryFlowFlag: false, // 流程图查询flag
      queryFlowLoading: false,
      pageLoadTime: '', // 详情接口请求完成时间
      approveFormParams: props.approveFormParams,
      formId: uuid(),
    };
  }

  componentDidMount() {
    this.handleSearch();
    this.observerDetailHeight();
    window.addEventListener('resize', this.computeTabScroll);
    this.observerSize();
  }

  componentWillReceiveProps(nextProps) {
    if (this.taskId === nextProps.match.params.id) {
      return;
    }
    this.taskId = nextProps.match.params.id;
    this.setState({
      errorCode: undefined, // 流程详情返回异常编码
      task: {},
      fetchDetailLoading: false,
      fetchHistoryApprovalLoading: false,
      approveLoading: false,
      historyApprovalRecords: [],
      forecastLoading: false,
      forecastLists: [],
      queryHistoryFlag: false,
      activeTab: 'approve-form',
      firstGoToId: true,
      forecastData: [],
      isReverse: true,
      queryFlowFlag: false,
      queryFlowLoading: false,
    });
    this.handleSearch(true);
    // this.handleFlowChat();
    this.observerDetailHeight();
  }

  // 查询详情
  @Bind()
  handleSearch(isRefresh = false) {
    // 每次重新查询数据前，把上一个数据清空
    this.approveFormDS.reset();
    this.setState({ fetchDetailLoading: true });
    searchDetailNew(
      {
        tenantId,
        taskId: this.taskId,
        commentRecordFlag: 1,
      },
      (errorCode) => {
        if (errorCode && errorCode.name === 403) {
          this.setState({
            errorCode: ERROR_CODE.NO_MENU_PERMISSION,
          });
        }
      }
    ).then((res) => {
      if (res && [ERROR_CODE.PROCESSED, ERROR_CODE.NO_APPROVE_PERMISSION].includes(res.code)) {
        this.setState({
          errorCode: res.code,
        });
        return;
      }
      this.setState({ fetchDetailLoading: false, pageLoadTime: new Date().getTime() });
      const result = getResponse(res);
      if (result) {
        const {
          formKey,
          moduleForm,
          businessKey,
          formDefinitionCode,
          originFormKey,
          processDefinitionId,
          processDefinitionKey,
        } = result;
        this.setState({
          task: result,
          activeTab: result.formKey ? 'approve-form' : 'approve-record',
          approveFormParams: {
            businessKey,
            formDefinitionCode,
            formKey,
            moduleForm,
            originFormKey,
            processDefinitionId,
            processDefinitionKey,
          },
        });
        if (isRefresh) {
          this.setState({
            formId: uuid(),
          });
        }
        this.approveFormDS
          .getField('addCc')
          .setLovPara(
            'extraParam',
            JSON.stringify({ startUser: result.processInstance.startUserId })
          );
        this.approveFormDS
          .getField('delegate')
          .setLovPara(
            'extraParam',
            JSON.stringify({ startUser: result.processInstance.startUserId })
          );
        this.approveFormDS
          .getField('addSign')
          .setLovPara(
            'extraParam',
            JSON.stringify({ startUser: result.processInstance.startUserId })
          );

        this.approveFormDS.getField('addCc').setLovPara('tenantId', tenantId);
        this.approveFormDS.getField('delegate').setLovPara('tenantId', tenantId);
        this.approveFormDS.getField('addSign').setLovPara('tenantId', tenantId);
        // 加载审批记录
        this.approvalRecordTableDs.loadData(result.historicTaskExtList);
        // 如果表单和审批记录在同一页，或者没有审批表单，查询审批历史记录
        if (result.approvalFormMergeFlag || !result.formKey) {
          this.fetchHistoryRecord(result);
          this.fetchForecastLists(result);
        }
      }
    });
  }

  // 查询审批历史
  @Bind()
  fetchHistoryRecord(task) {
    const { businessKey, refuseJumpFlag } = task;
    if (businessKey) {
      this.setState({
        fetchHistoryApprovalLoading: true,
      });
      const needMergeObj = refuseJumpFlag
        ? { needMerge: true }
        : { currentProcessInstanceId: task.processInstanceId };
      fetchHistoryApproval({
        businessKey,
        commentRecordFlag: 1,
        ...needMergeObj,
      })
        .then((res) => {
          const result = getResponse(res);
          this.setState({
            historyApprovalRecords: result || [],
            queryHistoryFlag: true,
          });
        })
        .finally(() => {
          this.setState({
            fetchHistoryApprovalLoading: false,
          });
        });
    }
  }

  // 查询审批预测
  @Bind()
  fetchForecastLists(task) {
    const { processDefinitionId = '', processInstanceId } = task;
    if (processInstanceId) {
      this.setState({ forecastLoading: true });
      getForecastLists({
        tenantId,
        processInstanceId,
        processDefinitionId,
      })
        .then((res) => {
          if (getResponse(res)) {
            const { isReverse } = this.state;
            this.setState({ forecastLists: isReverse ? res.reverse() : res });
          }
        })
        .catch(() => {
          this.setState({ forecastLists: [] });
        })
        .finally(() => {
          this.setState({ forecastLoading: false });
        });
    } else {
      this.setState({ forecastLists: [] });
    }
  }

  handleFlowChat = () => {
    const {
      queryFlowFlag,
      task: { approvalFormMergeFlag },
    } = this.state;
    // 若流程图已查询过，不再查询
    if (queryFlowFlag) {
      // 若是上下布局，打开流程弹窗
      if (approvalFormMergeFlag) {
        this.openWorkFlowGraph();
      }
      return;
    }
    const { flowChatMatch } = this.props;
    this.setState({ queryFlowLoading: true });
    request(
      `${API_HOST}${prefix}/${tenantId}/process/instance/forecast/${flowChatMatch.params.processInstanceId}`,
      { method: 'GET' }
    )
      .then((res) => this.setState({ forecastData: res || [], queryFlowFlag: true }))
      .finally(() => {
        this.setState({ queryFlowLoading: false });
        if (approvalFormMergeFlag) {
          this.openWorkFlowGraph();
        }
      });
  };

  @Bind()
  getApproveFormRef() {
    return this.approveFormRef;
  }

  @Bind()
  taskAction(approveResult) {
    if (this.headerButtonRef) {
      this.headerButtonRef.taskAction(approveResult);
    }
  }

  @Bind()
  afterFormLoad(result) {
    // 传入true表示表单加载完成，可点击底部按钮
    if (typeof result === 'boolean') {
      if (this.retryTimer) {
        clearTimeout(this.retryTimer);
        this.retryTimer = null;
      }
      const callback = () => {
        if (this.headerButtonRef) {
          this.headerButtonRef.handleLoadFlag(result);
          return true;
        }
        return false;
      };
      callback();
      // 有可能表单先加载，调用了afterFormLoad,而此时headerbutton可能未加载，此处增加定时器进行重试。
      this.retryInterval(() => {
        return callback();
      });
    }
  }

  retryInterval = (callback) => {
    let times = 0;
    const maxTimes = 1000;
    const interval = 10;
    const retry = () => {
      const flag = callback();
      if (flag || times >= maxTimes) {
        // 成功或达到最大次数，终止重试
        this.retryTimer = null;
        return;
      }
      times++;
      this.retryTimer = setTimeout(retry, interval);
    };
    // 启动第一次重试
    this.retryTimer = setTimeout(retry, interval);
  }

  // 点击跳转至对应锚点
  goToId = (idValue) => {
    const anchorElement = document.getElementById(idValue);
    if (anchorElement && this.contaniner) {
      const elementTop = anchorElement.getBoundingClientRect().top;
      const containerTop = this.contaniner.getBoundingClientRect().top;
      this.contaniner.scrollTop = elementTop - containerTop;
    }
  };

  // 切换Tab
  changeTab = (key) => {
    const { task, queryHistoryFlag } = this.state;
    if (!queryHistoryFlag && key === 'approve-record') {
      // 未查询过审批记录，且当前tab为审批记录时，查询数据
      this.fetchHistoryRecord(task);
      this.fetchForecastLists(task);
    }
    if (key === 'flow-chat') {
      this.handleFlowChat();
    }
    this.setState({ activeTab: key, firstGoToId: false });
  };

  // 监听详情页高度变化
  observerDetailHeight = () => {
    // 获取tab初始高度
    this.elementFixRef = document.getElementById('element-fix');
    // 监听高度变化
    const detailContent = document.getElementById('detail-content');
    if (!detailContent) {
      return;
    }
    // 观察器的配置
    const config = { attributes: true, subtree: true };
    const callback = () => {
      this.handleDetailHeight();
    };
    this.observer = new MutationObserver(callback);
    this.observer.observe(detailContent, config);
  };

  // 监听弹窗尺寸变化
  observerSize = () => {
    this.drawerResizeObserver = observerDrawerResize(TASK_TAB_DRAWER_ID);
  };

  computeTabScroll = () => {
    const tabBarEl = this.elementFixRef;
    const detailContent = document.getElementById('detail-content');
    if (tabBarEl && tabBarEl.style && tabBarEl.style.position === 'fixed' && detailContent) {
      const { height } = detailContent.getBoundingClientRect();
      tabBarEl.style.top = `calc(100% - ${height}px - 3px)`;
    }
    computeDrawerHeight(TASK_TAB_DRAWER_ID);
  };

  handleDetailHeight = () => {
    const { firstGoToId } = this.state;
    if (!document.getElementById('detail-content')) {
      return;
    }
    // 比较内容区显示高度和总高度
    const modalBody = document.getElementById('content-container');
    const modalBodyContent = document.getElementById('content-container-main');
    if (
      firstGoToId &&
      modalBody &&
      modalBodyContent &&
      modalBodyContent.clientHeight > modalBody.clientHeight
    ) {
      this.goToId('approve-content');
      this.setState({ firstGoToId: false });
      if (this.observer) {
        this.observer.disconnect();
        this.observer.takeRecords();
        this.observer = null;
      }
    }
  };

  componentWillUnmount = () => {
    // 没有执行首次进入定位时，清空观察器
    if (this.observer) {
      this.observer.disconnect();
      this.observer.takeRecords();
      this.observer = null;
    }
    if (this.drawerResizeObserver) {
      this.drawerResizeObserver.unobserve(document.getElementById(TASK_TAB_DRAWER_ID));
    }
    window.removeEventListener('resize', this.computeTabScroll);
  };

  handleScroll = () => {
    setTimeout(() => {
      if (this.state.firstGoToId) return;
      const obj = this.elementFixRef;
      if (obj) {
        const detailContent = document.getElementById('detail-content');
        if (!detailContent) {
          return;
        }
        const { height } = detailContent.getBoundingClientRect();
        const top = document.getElementById('content-container')?.scrollTop || 0;
        const divTop = document.getElementById('approve-item')?.clientHeight || 0;
        const approveContent = document.getElementById('approve-content');
        if (approveContent) {
          // 顶部固定高度总和为138，approve-item元素一滚动完，就固定tab
          if (divTop < top) {
            approveContent.style.paddingTop = `${obj.clientHeight}px`;
            obj.style.position = 'fixed';
            obj.style.top = `calc(100% - ${height}px - 3px)`;
          } else {
            obj.style.position = 'static';
            approveContent.style.paddingTop = '0';
          }
        }
      }
    }, 300);
  };

  openWorkFlowGraph = () => {
    const { flowChatMatch } = this.props;
    const { forecastData, queryFlowLoading } = this.state;
    Modal.open({
      title: intl.get('hwfp.common.model.process.graph').d('流程图'),
      key: modalKey,
      destroyOnClose: true,
      drawer: true,
      closable: true,
      className: styles['workflow-graph-modal'],
      bodyStyle: { overflow: 'hidden' },
      resizable: true,
      children: (
        <FlowChart
          onRef={(ref) => {
            this.flowChartDrawerRef = ref;
          }}
          match={flowChatMatch}
          tenantId={tenantId}
          forecastData={forecastData}
          // tab模式下需要loading
          loading={queryFlowLoading}
          canMove
        />
      ),
      style: {
        minWidth: '60vw',
      },
      footer: null,
    });
  };

  @Bind()
  handleApproveRecords(isReverse, approveRecordData) {
    return isReverse ? approveRecordData.reverse() : approveRecordData;
  }

  renderApproveRecord = () => {
    const {
      task = {},
      fetchHistoryApprovalLoading = false,
      historyApprovalRecords = [],
      isReverse,
      forecastLoading,
      forecastLists = [],
    } = this.state;
    const { historicTaskExtList = [], processStatusForecast } = task;
    const { flowChatMatch, processRemote } = this.props;
    const currentTaskRecord = historicTaskExtList || [];
    const historyTaskRecord = historyApprovalRecords.map((item) => item.historicTaskExtList || []);
    const approveRecordData = fetchHistoryApprovalLoading
      ? []
      : [].concat(...historyTaskRecord).concat(currentTaskRecord);
    const approveRecords = this.handleApproveRecords(isReverse, [...approveRecordData]);
    const showForecastBtnFlag = processStatusForecast === 'APPROVAL';
    const approveRecordProps = {
      data: approveRecords,
      taskId: this.taskId,
      processInstanceId: flowChatMatch.params.processInstanceId,
      forecastData: forecastLists,
      forecastLoading,
      showForecastBtnFlag,
      hiddenEndEvent: true,
      currentTaskRecord,
      historyTaskRecord,
      loading: fetchHistoryApprovalLoading,
    };
    if (processRemote) {
      return processRemote.render(
        'SWFL_APPROVAL_WORKBENCH_TASK_DETAIL_APPROVAL_RECORD',
        <Spin spinning={fetchHistoryApprovalLoading}>
          <ApproveRecordNew {...approveRecordProps} />
        </Spin>,
        approveRecordProps
      );
    }
    return (
      <Spin spinning={fetchHistoryApprovalLoading}>
        <ApproveRecordNew {...approveRecordProps} />
      </Spin>
    );
  };

  render() {
    const {
      task = {},
      fetchDetailLoading = false,
      approveLoading = false,
      activeTab,
      forecastData,
      queryFlowLoading,
      errorCode,
      pageLoadTime,
      approveFormParams,
      formId,
    } = this.state;
    const { processInstance = {}, approvalFormMergeFlag, owner } = task;
    const { match, flowChatMatch, history, location, handleCancel, handleNextProcess } = this.props;
    const isAddSign =
      owner && (owner.startsWith('AddSign') || owner.startsWith('ApproveAndAddSign'));
    const { formKey } = approveFormParams || {};
    const approveFormProps = {
      ...approveFormParams,
      // detail: task,
      onRef: (ref) => {
        this.approveFormRef = ref;
      },
      key: formId,
      originRouterProps: {
        match,
        history,
        location,
      },
      onAction: this.taskAction,
      onFormLoaded: this.afterFormLoad,
      goToId: this.goToId,
    };
    if (errorCode) {
      return errorProcessRender({
        errorCode,
        showExtra: false,
      });
    }
    return (
      <Fragment>
        <div
          className={classnames(styles.content, 'swfl-approval-workbench-task-detail')}
          id="detail-content"
          onScroll={this.handleScroll}
        >
          <div
            className={styles['content-container']}
            id="content-container"
            ref={(ref) => {
              this.contaniner = ref;
            }}
          >
            <Spin
              spinning={fetchDetailLoading || approveLoading || isEmpty(task)}
              style={{ height: '100%' }}
            >
              <div
                className={classnames(styles['content-container-main'], styles['approve-content'])}
                id="content-container-main"
              >
                {approvalFormMergeFlag === 1 && (
                  <div className={styles['approve-merge-title']} style={{ marginTop: 0 }}>
                    <span>{intl.get('hwfp.common.model.approval.baseInfo').d('基本信息')}</span>
                  </div>
                )}
                <Card id="approve-item">
                  <ApproveItem
                    detail={{
                      ...task,
                      id: processInstance.id,
                      unitName: processInstance.unitName,
                      startUserName: processInstance.startUserName,
                    }}
                    processStatus={[]}
                    fromTask
                    code="HWFP.APPROVAL_FORM_UNIT_GROUP.NOT_APPROVED"
                  />
                </Card>
                <div id="approve-content">
                  <div
                    id="element-fix"
                    style={{
                      zIndex: 10,
                      background: '#fff',
                      width: '100%',
                    }}
                  >
                    {approvalFormMergeFlag === 0 && (
                      <Tabs
                        activeKey={activeTab}
                        onChange={this.changeTab}
                        className={styles['approve-content-tab']}
                      >
                        {formKey && (
                          <TabPane
                            tab={
                              <span>
                                {intl.get('hwfp.common.model.approval.form').d('审批表单')}
                                {isAddSign && (
                                  <Tooltip
                                    title={intl
                                      .get('hwfp.common.model.approval.form.help')
                                      .d('加签人无法编辑表单信息')}
                                  >
                                    <Icon
                                      type="help_outline"
                                      style={{
                                        verticalAlign: 'text-bottom',
                                        marginLeft: '4px',
                                        fontWeight: 400,
                                      }}
                                    />
                                  </Tooltip>
                                )}
                              </span>
                            }
                            key="approve-form"
                          />
                        )}
                        <TabPane
                          tab={intl.get('hwfp.common.model.approval.record').d('审批记录')}
                          key="approve-record"
                        />
                        <TabPane
                          tab={intl.get('hwfp.common.model.process.graph').d('流程图')}
                          key="flow-chat"
                        />
                      </Tabs>
                    )}
                  </div>
                  {approvalFormMergeFlag === 1 && formKey && (
                    <div className={styles['approve-merge-title']}>
                      <span>
                        {intl.get('hwfp.common.model.approval.form').d('审批表单')}
                        {isAddSign && (
                          <Tooltip
                            title={intl
                              .get('hwfp.common.model.approval.form.help')
                              .d('加签人无法编辑表单信息')}
                          >
                            <Icon
                              type="help_outline"
                              style={{
                                verticalAlign: 'text-bottom',
                                marginLeft: '4px',
                                fontWeight: 400,
                              }}
                            />
                          </Tooltip>
                        )}
                      </span>
                    </div>
                  )}
                  {formKey && (
                    <div
                      id="approve-form"
                      className="approve-form"
                      style={{
                        border: '1px solid #f5f5f5',
                        marginTop: '0.16rem',
                        display: activeTab === 'approve-form' ? 'block' : 'none',
                        // height: 'calc(100vh - 320px)',
                        // overflow: 'auto',
                      }}
                    >
                      <ApproveForm {...approveFormProps} />
                    </div>
                  )}
                  {approvalFormMergeFlag === 1 && (
                    <div className={styles['approve-merge-title']}>
                      <span>{intl.get('hwfp.common.model.approval.record').d('审批记录')}</span>
                      <a
                        // onClick={() => this.openWorkFlowGraph()}
                        onClick={this.handleFlowChat}
                        className={styles['graph-link']}
                      >
                        <Icon type="alt_route-o" />
                        {intl.get('hwfp.common.model.process.graph').d('流程图')}
                        <Spin spinning={queryFlowLoading} />
                      </a>
                    </div>
                  )}
                  {(activeTab === 'approve-record' || approvalFormMergeFlag === 1) && (
                    <div id="approve-record" style={{ marginTop: '0.16rem' }}>
                      {this.renderApproveRecord()}
                    </div>
                  )}
                  {activeTab === 'flow-chat' && (
                    <FlowChart
                      onRef={(ref) => {
                        this.flowChartDrawerRef = ref;
                      }}
                      match={flowChatMatch}
                      tenantId={tenantId}
                      forecastData={forecastData}
                      // tab模式下需要loading
                      loading={queryFlowLoading}
                    />
                  )}
                </div>
              </div>
            </Spin>
          </div>
          <div className={styles['content-footer']}>
            {!isEmpty(task) && (
              <Footer
                taskId={this.taskId}
                task={task}
                formDs={this.approveFormDS}
                assignApproveDs={this.assignApproveDs}
                onRef={(ref) => {
                  this.headerButtonRef = ref;
                }}
                approveFormRef={this.approveFormRef}
                handleCancel={handleCancel}
                handleNextProcess={handleNextProcess}
                match={flowChatMatch}
                refreshNumber={this.props.refreshNumber}
                getFormRef={this.getApproveFormRef}
                pageLoadTime={pageLoadTime}
              />
            )}
          </div>
        </div>
      </Fragment>
    );
  }
}

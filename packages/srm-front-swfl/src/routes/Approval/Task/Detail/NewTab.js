/**
 *  待办事项列表-详情
 */

import React, { Component } from 'react';
import { connect } from 'dva';
import classnames from 'classnames';
import { DataSet, Spin, Modal, Icon, Tooltip } from 'choerodon-ui/pro';
import { Card, Tabs } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import { isEmpty } from 'lodash';
import queryString, { stringify } from 'querystring';

import { Header } from 'components/Page';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import remote from 'hzero-front/lib/utils/remote';

import {
  searchDetailNew,
  fetchHistoryApproval,
  getForecastLists,
  getActionTooltipLists,
  getProcessDefineConfig,
} from '@/services/taskService';
import { queryQuickReply } from '@/services/quickReply';
import { detailTableDS, detailApproveFormDS, getAssignApproveDs } from '@/stores/taskDS';

import { HZERO_HWFP, API_HOST } from 'utils/config';
import request from 'utils/request';
import { updateTab, getActiveTabKey, closeTab } from 'utils/menuTab';
import ApproveRecordNew from '_components/ApproveRecord';
import FlowChart from '@/components/FlowChartDrawer/FlowChart';
import ApproveItem from '@/components/ApproveRecord/ApproveItem';
import { getDetailDispatchRouter, ERROR_CODE, errorProcessRender } from '@/utils/util';

import TaskMenuProvider from '@/components/TaskMenuProvider';
import styles from './index.less';
import ApproveForm from '../../../components/ApproveFormNew';
import Footer from './HeaderButtons';

const prefix = `${HZERO_HWFP}/v1`;

const tenantId = getCurrentOrganizationId();
const { TabPane } = Tabs;
const modalKey = Modal.key();

@remote({
  code: 'SWFL_APPROVAL_WORKBENCH_TASK_DETAIL_NEW_TAB',
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
@connect(({ task }) => ({
  newTask: task,
}))
@TaskMenuProvider({
  initMenu: true,
})
export default class NewTab extends Component {
  constructor(props) {
    super(props);
    // props.onRef(this);
    const { search = '' } = this.props.location || {};
    this.queryParams = queryString.parse(search.substr(1)) || {};
    this.flowChartDrawerRef = null;
    this.firstGoToId = true;
    this.approveFormRef = null;
    this.headerButtonRef = null;
    this.approvalRecordTableDs = new DataSet(detailTableDS());
    this.approvalHistoryTableDs = new DataSet(detailTableDS());
    this.approveFormDS = new DataSet(detailApproveFormDS());
    this.assignApproveDs = new DataSet(getAssignApproveDs());
    this.taskId = this.props.match.params.id;
    this.detailContent = null;
    this.retryTimer = null;
    this.state = {
      errorCode: undefined, // 流程详情返回异常编码
      task: {},
      forecastData: [], // 流程图
      // attachmentUuid: '',
      fetchDetailLoading: false,
      fetchHistoryApprovalLoading: false,
      approveLoading: false,
      historyApprovalRecords: [],
      forecastLoading: false,
      forecastLists: [],
      queryHistoryFlag: false,
      activeTab: this.queryParams.activeTab || 'approve-form',
      isReverse: true, // 若后期需要时间正序/倒序，设置值为true为倒叙（时间近到远），设置值为false为正序（时间远到近）
      activeTabKey: getActiveTabKey(),
      queryFlowFlag: false, // 流程图查询flag
      queryFlowLoading: false,
      pageLoadTime: '', // 详情接口请求完成时间
      stepRebutFlag: false,
    };
  }

  componentDidMount() {
    this.handleSearch();
    // this.handleFlowChat();
    // 非首屏需要的请求延迟请求
    // this.queryQuickReplyArr();
    this.getTooltip();
  }

  getTooltip = () => {
    const { dispatch } = this.props;
    // 查询按钮气泡提示
    getActionTooltipLists().then((res) => {
      if (getResponse(res)) {
        const newRes = {};
        // 全部转成小写，保证action统一
        Object.keys(res).forEach((item) => {
          newRes[item.toLocaleLowerCase()] = res[item];
        });
        dispatch({
          type: 'task/updateState',
          payload: { approvalActionTooltipMap: newRes },
        });
      }
    });
  };

  // 查询快捷回复
  queryQuickReplyArr = () => {
    const { dispatch } = this.props;
    queryQuickReply().then((res) => {
      const result = getResponse(res);
      if (result) {
        dispatch({
          type: 'task/updateQuickReplyArr',
          payload: result,
        });
      }
    });
  };

  // 查询详情
  @Bind()
  handleSearch() {
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
      if (res) {
        if (res.code === ERROR_CODE.PROCESSED) {
          getProcessDefineConfig().then((config) => {
            if (getResponse(config)) {
              this.setState({ linkToApproved: config && config.todoJumpApprovedFlag === 1 });
            }
            this.handleUpdateTabTitle();
            this.setState({
              errorCode: res.code,
            });
          });
          return;
        } else if (res.code === ERROR_CODE.NO_APPROVE_PERMISSION) {
          this.handleUpdateTabTitle();
          this.setState({
            errorCode: res.code,
          });
          return;
        }
      }
      this.setState({ fetchDetailLoading: false, pageLoadTime: new Date().getTime() });
      const result = getResponse(res);
      if (result) {
        this.setState(
          {
            task: result,
            activeTab:
              this.state.activeTab === 'approve-form' && !result.formKey
                ? 'approve-record'
                : this.state.activeTab || 'approve-form',
          },
          () => {
            this.handleUpdateTabTitle(result);
            this.observerDetailHeight();
            this.fetchProcessDefineConfig();
          }
        );
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

  fetchProcessDefineConfig = () => {
    getProcessDefineConfig().then((res) => {
      if (getResponse(res)) {
        this.setState({
          stepRebutFlag: res.stepRebutFlag === 1,
        });
      }
    });
  };

  // 更新tab标题
  handleUpdateTabTitle = (result) => {
    const { activeTabKey } = this.state;
    if (activeTabKey === '/swbh/role-workbench' || this.props.inEmbedPage) {
      return;
    }
    let title = intl.get('hwfp.common.model.process.detail').d('流程明细');
    if (result) {
      title = result.processInstance.startUserName
        ? `${result.processInstance.processDefinitionName}-${result.processInstance.startUserName}`
        : `${result.processInstance.processDefinitionName}`;
    } else {
      const {
        location: { search = '' },
      } = this.props;
      const { processName, startUserName } = queryString.parse(search.substr(1));
      if (processName) {
        title = startUserName ? `${processName}-${startUserName}` : `${processName}`;
      }
    }
    updateTab({
      key: getActiveTabKey(),
      title,
    });
  };

  // 查询审批历史
  @Bind()
  fetchHistoryRecord(task) {
    const { businessKey } = task;
    if (businessKey) {
      this.setState({
        fetchHistoryApprovalLoading: true,
      });
      fetchHistoryApproval({
        businessKey,
        commentRecordFlag: 1,
        currentProcessInstanceId: task.processInstanceId,
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
    const { match } = this.props;
    this.setState({ queryFlowLoading: true });
    request(
      `${API_HOST}${prefix}/${tenantId}/process/instance/forecast/${match.params.processInstanceId}`,
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
      this.headerButtonRef.taskAction(approveResult, this.headerButtonRef.handleCloseApprovalModal);
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
    if (this.detailContent) {
      const anchorElement = this.detailContent.querySelector(`#${idValue}`);
      if (anchorElement && this.contaniner) {
        const elementTop = anchorElement.getBoundingClientRect().top;
        const containerTop = this.contaniner.getBoundingClientRect().top;
        this.contaniner.scrollTop = elementTop - containerTop;
        this.firstGoToId = false;
      }
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
    this.firstGoToId = false;
    this.setState({ activeTab: key });
  };

  // 监听详情页高度变化
  observerDetailHeight = () => {
    if (!this.detailContent) {
      return;
    }
    // 观察器的配置
    const config = {
      childList: true,
      characterData: true,
      subtree: true,
    };
    const callback = () => {
      this.handleDetailHeight();
    };
    this.observer = new MutationObserver(callback);
    this.observer.observe(this.detailContent, config);
  };

  handleDetailHeight = () => {
    if (!this.detailContent) {
      return;
    }
    // 比较内容区显示高度和总高度
    const modalBody = this.detailContent.querySelector('#content-container');
    const modalBodyContent = this.detailContent.querySelector('#content-container-main');
    if (modalBodyContent.clientHeight === 0) {
      this.firstGoToId = false;
    }
    if (
      this.firstGoToId &&
      modalBody &&
      modalBodyContent &&
      modalBodyContent.clientHeight > modalBody.clientHeight
    ) {
      const { task = {} } = this.state;
      const { approvalFormMergeFlag } = task;
      this.goToId(approvalFormMergeFlag !== 1 ? 'approve-content' : this.state.activeTab);
    }
  };

  componentWillUnmount = () => {
    // 没有执行首次进入定位时，清空观察器
    if (this.observer) {
      this.observer.disconnect();
      this.observer.takeRecords();
      this.observer = null;
    }
  };

  openWorkFlowGraph = () => {
    const { match } = this.props;
    const { forecastData, queryFlowLoading } = this.state;
    Modal.open({
      title: intl.get('hwfp.common.model.process.graph').d('流程图'),
      key: modalKey,
      destroyOnClose: true,
      drawer: true,
      closable: true,
      className: styles['workflow-graph-modal'],
      children: (
        <FlowChart
          onRef={(ref) => {
            this.flowChartDrawerRef = ref;
          }}
          match={{ params: { id: match.params.processInstanceId } }}
          tenantId={tenantId}
          forecastData={forecastData}
          // tab模式下需要loading
          loading={queryFlowLoading}
          canMove
        />
      ),
      style: {
        minWidth: '50vw',
      },
      bodyStyle: { overflow: 'hidden' },
      footer: null,
    });
  };

  @Bind()
  handleBackWorkbench() {
    const { activeTabKey } = this.state;
    const { taskMenu: originTaskMenu } = this.props;
    const isRoleWorkbench = activeTabKey === '/swbh/role-workbench';
    const { approvalMenu, taskMenu } = getDetailDispatchRouter(originTaskMenu);
    if (approvalMenu) {
      this.props.history.push({
        pathname: isRoleWorkbench ? '/swbh/role-workbench' : `/hwfp/approval/list`,
      });
    } else if (taskMenu) {
      this.props.history.push({
        pathname: isRoleWorkbench ? '/swbh/role-workbench' : `/hwfp/task/list`,
        search: stringify({ from: 'TaskNew' }),
      });
    } else {
      this.props.history.push({
        pathname: isRoleWorkbench ? '/swbh/role-workbench' : `/workplace`,
      });
    }
    closeTab(activeTabKey);
  }

  handleClose = () => {
    const { onClose, modal } = this.props;
    if (modal && modal.close) {
      modal.close();
    }
    if (onClose) {
      onClose();
    }
  };

  renderHeader = () => {
    const { activeTabKey } = this.state;
    const { inEmbedPage, title, closable } = this.props;
    if (activeTabKey === '/swbh/role-workbench' || inEmbedPage) {
      return (
        <Header
          className={classnames({
            [styles['no-backBtn']]: inEmbedPage,
          })}
          title={title || intl.get('hwfp.common.model.process.detail').d('流程明细')}
          backPath={activeTabKey === '/swbh/role-workbench' ? '/swbh/role-workbench' : undefined}
        >
          {closable && (
            <div className={styles['close-icon']} onClick={this.handleClose}>
              <Icon type="close" />
            </div>
          )}
        </Header>
      );
    }
    return null;
  };

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
    const { match, processRemote } = this.props;
    const currentTaskRecord = historicTaskExtList || [];
    const historyTaskRecord = historyApprovalRecords.map((item) => item.historicTaskExtList || []);
    const approveRecordData = fetchHistoryApprovalLoading
      ? []
      : []
          .concat(...historyApprovalRecords.map((item) => item.historicTaskExtList || []))
          .concat(historicTaskExtList || []);
    const approveRecordProps = {
      taskId: this.taskId,
      processInstanceId: match.params.processInstanceId,
      data: isReverse ? approveRecordData.reverse() : approveRecordData,
      forecastData: forecastLists,
      forecastLoading,
      showForecastBtnFlag: processStatusForecast === 'APPROVAL',
      hiddenEndEvent: true,
      currentTaskRecord,
      historyTaskRecord,
      loading: fetchHistoryApprovalLoading,
    };
    if (processRemote) {
      return processRemote.render(
        'SWFL_APPROVAL_WORKBENCH_TASK_DETAIL_NEW_TAB_APPROVAL_RECORD',
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
      activeTabKey,
      linkToApproved,
      stepRebutFlag,
    } = this.state;
    const {
      formKey,
      moduleForm,
      processInstance = {},
      businessKey,
      formDefinitionCode,
      originFormKey,
      processDefinitionId,
      processDefinitionKey,
      approvalFormMergeFlag,
      owner,
    } = task;
    const {
      match,
      history,
      location,
      handleCancel,
      modal,
      taskMenu,
      taskMenuId,
      onSuccess,
      inEmbedPage,
      processRemote,
    } = this.props;
    const matchParams = (match || {}).params || {};
    const isAddSign =
      owner && (owner.startsWith('AddSign') || owner.startsWith('ApproveAndAddSign'));
    // eslint-disable-next-line
    const name = `${processInstance.startUserName ? `${processInstance.startUserName}` : ''}`;
    const approveFormProps = {
      businessKey,
      formDefinitionCode,
      formKey,
      moduleForm,
      originFormKey,
      processDefinitionId,
      processDefinitionKey,
      // detail: task,
      onRef: (ref) => {
        this.approveFormRef = ref;
      },
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
      const errorProcessRenderProps = {
        processInstanceId: matchParams.processInstanceId,
        errorCode,
        callback: this.props.history.push,
        taskMenu,
        showExtra: !inEmbedPage && activeTabKey !== '/swbh/role-workbench',
        processRemote,
        linkToApproved,
      };
      return (
        <div style={{ height: '100%' }} className="swfl-approval-workbench-task-new-tab">
          {this.renderHeader()}
          {errorCode === ERROR_CODE.PROCESSED && processRemote && processRemote.render
            ? processRemote.render(
                'SWFL_APPROVAL_WORKBENCH_TASK_DETAIL_NEW_TAB_PROCESS_RENDER',
                errorProcessRender(errorProcessRenderProps),
                {
                  processInstanceId: matchParams.processInstanceId,
                  callback: this.props.history.push,
                  taskMenu,
                  showExtra: !inEmbedPage && activeTabKey !== '/swbh/role-workbench',
                  processRemote,
                }
              )
            : errorProcessRender(errorProcessRenderProps)}
        </div>
      );
    }
    return (
      <div style={{ height: '100%' }} className="swfl-approval-workbench-task-new-tab">
        {this.renderHeader()}
        <div
          className={styles.content}
          ref={(ref) => {
            this.detailContent = ref;
          }}
          style={{
            margin: '8px 0',
            background: '#fff',
            height:
              this.state.activeTabKey === '/swbh/role-workbench' || inEmbedPage
                ? 'calc(100% - 60px)'
                : 'calc(100% - 16px)',
          }}
        >
          <div
            className={styles['content-container']}
            id="content-container"
            style={{ padding: '10px 8px', margin: '0 12px' }}
            ref={(ref) => {
              this.contaniner = ref;
            }}
          >
            <Spin
              spinning={fetchDetailLoading || approveLoading || isEmpty(task)}
              style={{ height: '100%' }}
            >
              <div id="content-container-main" className={styles['content-container-main']}>
                <div
                  className={styles['approve-content']}
                  style={{ overflow: approvalFormMergeFlag === 0 ? 'hidden' : 'auto' }}
                >
                  <Card id="approve-item">
                    {approvalFormMergeFlag === 1 && (
                      <div className={styles['approve-merge-title']} style={{ marginTop: 0 }}>
                        <span>{intl.get('hwfp.common.model.approval.baseInfo').d('基本信息')}</span>
                      </div>
                    )}
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
                    {approvalFormMergeFlag === 0 && (
                      <Tabs activeKey={activeTab} onChange={this.changeTab}>
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
                          >
                            <div
                              id="approve-form"
                              className="approve-form"
                              style={{ border: '1px solid #f5f5f5' }}
                            >
                              <ApproveForm {...approveFormProps} />
                            </div>
                          </TabPane>
                        )}
                        <TabPane
                          tab={intl.get('hwfp.common.model.approval.record').d('审批记录')}
                          key="approve-record"
                        >
                          <div id="approve-record" style={{ marginTop: '0.16rem' }}>
                            {this.renderApproveRecord()}
                          </div>
                        </TabPane>
                        <TabPane
                          tab={intl.get('hwfp.common.model.process.graph').d('流程图')}
                          key="flow-chat"
                        >
                          <FlowChart
                            onRef={(ref) => {
                              this.flowChartDrawerRef = ref;
                            }}
                            match={{ params: { id: match.params.processInstanceId } }}
                            tenantId={tenantId}
                            forecastData={forecastData}
                            // tab模式下需要loading
                            loading={queryFlowLoading}
                          />
                        </TabPane>
                      </Tabs>
                    )}
                  </div>
                  {approvalFormMergeFlag === 1 && formKey && (
                    <>
                      <div className={styles['approve-merge-title']} id="approve-form">
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
                      <div style={{ border: '1px solid #f5f5f5' }} className="approve-form">
                        <ApproveForm {...approveFormProps} />
                      </div>
                    </>
                  )}
                  {approvalFormMergeFlag === 1 && (
                    <>
                      <div className={styles['approve-merge-title']} id="approve-record">
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
                      <div>{this.renderApproveRecord()}</div>
                    </>
                  )}
                </div>
              </div>
            </Spin>
          </div>
          <div className={styles['content-footer']} style={{ background: '#fff' }}>
            {!isEmpty(task) && (
              <Footer
                taskId={this.taskId}
                task={task}
                formDs={this.approveFormDS}
                onRef={(ref) => {
                  this.headerButtonRef = ref;
                }}
                approveFormRef={this.approveFormRef}
                handleCancel={handleCancel}
                match={match}
                matchParams={matchParams}
                newTabFlag
                modal={modal}
                assignApproveDs={this.assignApproveDs}
                getFormRef={this.getApproveFormRef}
                pageLoadTime={pageLoadTime}
                taskMenu={taskMenu}
                taskMenuId={taskMenuId}
                inEmbedPage={inEmbedPage}
                onSuccess={onSuccess}
                stepRebutFlag={stepRebutFlag}
              />
            )}
          </div>
        </div>
      </div>
    );
  }
}

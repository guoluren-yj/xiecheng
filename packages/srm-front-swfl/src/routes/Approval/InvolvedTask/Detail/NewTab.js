/**
 * Detail - 我参与的流程/我发起的流程/我抄送的流程 明细
 * @date: 2018-4-18
 * @author: wangjiacheng <jiacheng.wang@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component, Fragment } from 'react';
import { Form, Spin } from 'hzero-ui';
import { Tabs } from 'choerodon-ui';
import { Icon, Modal as C7nModal } from 'choerodon-ui/pro';
import { Header } from 'components/Page';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import classNames from 'classnames';
import { isEmpty } from 'lodash';
import queryString from 'querystring';

import remote from 'hzero-front/lib/utils/remote';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { getCurrentOrganizationId, getResponse, getCurrentUser } from 'utils/utils';

import ApproveRecordNew from '_components/ApproveRecord';

import ApproveItem from '@/components/ApproveRecord/ApproveItem';
import FlowChart from '@/components/FlowChartDrawer/FlowChart';
import { HZERO_HWFP, API_HOST } from 'utils/config';
import { updateTab, getActiveTabKey } from 'utils/menuTab';
import request from 'utils/request';
import Footer from './HeaderButtons';
import ApproveForm from '../../../components/ApproveFormNew';

import styles from './index.less';

const prefix = `${HZERO_HWFP}/v1`;

const { TabPane } = Tabs;
const modalKey = C7nModal.key();
@remote({
  code: 'SWFL_APPROVAL_WORKBENCH_INVOLED_DETAIL_NEW_TAB',
  name: 'processRemote',
})
@Form.create({ fieldNameProp: null })
// TODO: 调整多语言
@formatterCollections({
  code: [
    'hwfp.involvedTask',
    'hwfp.common',
    'hzero.common',
    'hwfp.monitor',
    'entity.position',
    'entity.department',
    'hwfp.task',
    'hpfm.organization',
  ],
})
@connect(({ involvedTask, loading }) => ({
  involvedTask,
  fetchDetailLoading: loading.effects['involvedTask/fetchDetail'],
  forecastLoading: loading.effects['involvedTask/fetchForecast'],
  recallLoading: loading.effects['involvedTask/taskRecall'],
  fetchHistoryApprovalLoading: loading.effects['involvedTask/fetchHistoryApproval'],
  tenantId: getCurrentOrganizationId(),
}))
export default class InvolvedTaskDetail extends Component {
  constructor(props) {
    super(props);
    const { search = '' } = this.props.location || {};
    this.queryParams = queryString.parse(search.substr(1)) || {};
    this.headerButtonRef = null;
    this.taskId = this.props.match.params.id;
    this.fetchApprovalRecordFlag = false;
    this.detailContent = null;
    this.firstGoToId = true;
    this.state = {
      processInstanceId: props.match.params.id,
      activeTab: this.queryParams.activeTab || 'approve-form',
      forecastData: [],
      forecastLists: [],
      forecastLoading: false,
      isReverse: true,
      detailData: {},
      task: {},
      isGoldRaim: false, // 判断是否为金雨科技租户
    };
  }

  approveFormChildren;

  componentDidMount() {
    const { taskId } = this.state;
    const {
      dispatch,
      // involvedTask: { [processInstanceId]: { detail = {} } = {} },
    } = this.props;
    // const { formKey = null } = detail;
    // 清除缓存
    dispatch({
      type: 'involvedTask/updateDetailState',
      payload: { taskId, detail: {}, uselessParam: 'init' },
    });
    // 查询审批状态类型（单独查询而不用record上的状态是考虑未从表格点击进入详情页的情况）
    dispatch({ type: 'involvedTask/queryProcessStatus' });
    this.handleSearch();
    // 判断是否需要展示群聊按钮  然后判断展示创建群聊或者加入群聊
    const { tenantNum } = getCurrentUser();
    if(tenantNum === 'SRM-GOLDRAIN'){
      this.setState({
        isGoldRaim: true,
      });
    }
  }

  componentWillReceiveProps = (nextProps) => {
    if (this.taskId === nextProps.match.params.id) {
      return;
    }
    this.taskId = nextProps.match.params.id;
    this.headerButtonRef = null;
    this.firstGoToId = true;
    this.setState(
      {
        processInstanceId: nextProps.match.params.id,
        activeTab: 'approve-form',
        forecastData: [],
        isReverse: true,
      },
      () => {
        const { taskId } = this.state;
        const { dispatch } = this.props;
        // 清除缓存
        dispatch({
          type: 'startByTask/updateDetailState',
          payload: { taskId, detail: {}, uselessParam: 'init' },
        });
        this.handleSearch();
      }
    );
  };

  @Bind()
  handleSearch() {
    const { processInstanceId } = this.state;
    const { dispatch, tenantId } = this.props;
    // 获取详情
    dispatch({
      type: 'involvedTask/fetchDetail',
      payload: {
        tenantId,
        processInstanceId,
        type: 'involved',
        commentRecordFlag: 1,
      },
    }).then((res) => {
      if (res) {
        const activeTab =
          this.state.activeTab === 'approve-form' && !res.formKey
            ? 'approve-record'
            : this.state.activeTab || 'approve-form';
        this.setState(
          {
            task: res,
            activeTab,
            detailData: res,
          },
          () => {
            this.observerDetailHeight();
          }
        );
        this.handleUpdateTabTitle(res);
        if (res.approvalFormMergeFlag === 1 || activeTab === 'approve-record') {
          this.fetchHistoryRecord(res);
          this.fetchForecastLists(res);
        }
      }
    });
  }

  // 更新tab标题
  handleUpdateTabTitle = (result) => {
    updateTab({
      key: getActiveTabKey(),
      title: result.startUserName
        ? `${result.processName}-${result.startUserName}`
        : `${result.processName}`,
    });
  };

  // 查询审批历史
  @Bind()
  fetchHistoryRecord(currentDetailData) {
    const { businessKey } = currentDetailData;
    if (businessKey) {
      this.props
        .dispatch({
          type: 'involvedTask/fetchHistoryApproval',
          params: {
            businessKey,
            currentProcessInstanceId: currentDetailData.id,
            commentRecordFlag: 1,
          },
        })
        .then((res) => {
          if (res) {
            this.setState({
              historyApprovalRecords: res || [],
            });
          }
        });
    }
  }

  // 查询审批预测
  @Bind()
  fetchForecastLists(detail) {
    const { dispatch, tenantId } = this.props;
    const { processDefinitionId = '', id: processInstanceId, deleteReason = '' } = detail;
    if (processInstanceId && ['SUSPENDED', 'APPROVAL'].indexOf(deleteReason) > -1) {
      this.setState({ forecastLoading: true });
      dispatch({
        type: 'involvedTask/getForecastLists',
        payload: {
          tenantId,
          processInstanceId,
          processDefinitionId,
        },
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

  taskAction = (approveResult) => {
    this.headerButtonRef.taskAction(approveResult);
  };

  handleFlowChat = () => {
    const { tenantId, match } = this.props;
    request(`${API_HOST}${prefix}/${tenantId}/process/instance/forecast/${match.params.id}`, {
      method: 'GET',
    }).then((res) => this.setState({ forecastData: res || [] }));
  };

  // 点击跳转至对应锚点
  goToId = (idValue) => {
    if (this.detailContent) {
      const anchorElement = this.detailContent.querySelector(`#${idValue}`);
      if (anchorElement && this.detailContent && this.detailContent.parentNode) {
        const elementTop = anchorElement.getBoundingClientRect().top;
        const containerTop = this.detailContent.getBoundingClientRect().top;
        this.detailContent.parentNode.scrollTop = elementTop - containerTop;
        this.firstGoToId = false;
      }
    }
  };

  // 切换Tab
  changeTab = (key) => {
    if (key === 'approve-record' && !this.fetchApprovalRecordFlag) {
      this.fetchApprovalRecordFlag = true;
      const { detailData } = this.state;
      this.fetchHistoryRecord(detailData);
      this.fetchForecastLists(detailData);
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
      subtree: true,
    };
    const callback = () => {
      this.handleDetailHeight(this.detailContent);
    };
    this.observer = new MutationObserver(callback);
    this.observer.observe(this.detailContent, config);
  };

  handleDetailHeight = (detailContent) => {
    if (!this.detailContent) {
      return;
    }
    const modalBody = this.detailContent.parentNode;
    if (modalBody.clientHeight === 0) {
      this.firstGoToId = false;
    }
    if (
      this.firstGoToId &&
      detailContent &&
      modalBody &&
      detailContent.clientHeight > modalBody.clientHeight
    ) {
      const { processInstanceId } = this.state;
      const {
        involvedTask: { [processInstanceId]: { detail = {} } = {} },
      } = this.props;
      const { approvalFormMergeFlag } = detail;
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

  @Bind()
  openWorkFlowGraph = () => {
    const { processInstanceId, forecastData } = this.state;
    const {
      match,
      tenantId,
      involvedTask: { [processInstanceId]: { detail = {} } = {} } = {},
    } = this.props;
    C7nModal.open({
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
          match={match}
          tenantId={tenantId}
          detail={detail}
          uselessParam={match.params.id}
          forecastData={forecastData}
          autoRequest
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

  renderApproveRecord = () => {
    const {
      processInstanceId,
      historyApprovalRecords = [],
      forecastLists = [],
      forecastLoading,
      isReverse,
    } = this.state;
    const {
      fetchDetailLoading,
      involvedTask: { [processInstanceId]: { detail = {} } = {} },
      processRemote,
    } = this.props;

    const { processStatusForecast: processStatusValue } = detail;

    const approveRecordData = fetchDetailLoading
      ? []
      : []
          .concat(
            historyApprovalRecords[0] && historyApprovalRecords[0].historicTaskExtList
              ? historyApprovalRecords[0].historicTaskExtList
              : []
          )
          .concat(detail.historicTaskExtList ? detail.historicTaskExtList : []);

    const approveRecordProps = {
      taskId: this.taskId,
      processInstanceId,
      data: isReverse ? approveRecordData.reverse() : approveRecordData,
      forecastData: forecastLists,
      forecastLoading,
      showForecastBtnFlag: processStatusValue === 'APPROVAL',
      hiddenEndEvent: true,
      currentTaskRecord: detail.historicTaskExtList || [],
      historyTaskRecord: historyApprovalRecords.map((item) => item.historicTaskExtList || []),
      loading: fetchDetailLoading,
    };

    if (processRemote) {
      return processRemote.render(
        'SWFL_APPROVAL_WORKBENCH_INVOLED_DETAIL_NEW_TAB_APPROVAL_RECORD',
        <ApproveRecordNew {...approveRecordProps} />,
        approveRecordProps
      );
    }
    return <ApproveRecordNew {...approveRecordProps} />;
  };

  render() {
    const { processInstanceId, activeTab, forecastData, task, isGoldRaim } = this.state;
    const {
      fetchDetailLoading,
      match,
      tenantId,
      history,
      location,
      fetchHistoryApprovalLoading,
      involvedTask: { [processInstanceId]: { detail = {} } = {}, processStatus = [] },
    } = this.props;

    const {
      formKey = null,
      moduleForm,
      businessKey,
      formDefinitionCode,
      originFormKey,
      processDefinitionId,
      processDefinitionKey,
      approvalFormMergeFlag,
    } = detail;

    const formProps = {
      formKey,
      moduleForm,
      businessKey,
      formDefinitionCode,
      originFormKey,
      processDefinitionId,
      processDefinitionKey,
      // detail,
      onRef: (ref) => {
        this.approveFormChildren = ref;
      },
      onAction: this.taskAction,
      originRouterProps: {
        match,
        history,
        location,
      },
      goToId: this.goToId,
    };

    return (
      <Fragment>
        {isGoldRaim && (
          <Header title={intl.get('hwfp.common.model.process.detail').d('流程明细')}>
            <div className={styles['content-footer']}>
              {!isEmpty(task) && (
                <Footer
                  taskId={this.taskId}
                  processInstanceId={processInstanceId}
                  task={task}
                  onRef={(ref) => {
                    this.headerButtonRef = ref;
                  }}
                  match={match}
                />
              )}
            </div>
          </Header>
        )}
        <div
        className="swfl-approval-workbench-involved-task-new-tab"
        style={{ height: '100%', overflow: 'auto' }}
      >
        <div
          className={classNames(styles.content)}
          ref={(ref) => {
            this.detailContent = ref;
          }}
            style={{ margin: '8px 16px 16px', height: 'auto', padding: '16px' }}
          >
            <Spin spinning={fetchDetailLoading}>
              <div style={{ marginBottom: '20px' }}>
                {approvalFormMergeFlag === 1 && (
                <div className={styles['approve-merge-title']} style={{ marginTop: 0 }}>
                  <span>{intl.get('hwfp.common.model.approval.baseInfo').d('基本信息')}</span>
                </div>
              )}
                <ApproveItem
                  detail={detail}
                  processStatus={processStatus}
                  code="HWFP.APPROVAL_FORM_UNIT_GROUP.APPROVED"
                />
              </div>
              <div id="approve-content" style={{ marginTop: '18px' }}>
                {approvalFormMergeFlag === 0 && (
                <Tabs activeKey={activeTab} onChange={this.changeTab}>
                  {formKey && (
                    <TabPane
                      tab={intl.get('hwfp.common.model.approval.form').d('审批表单')}
                      key="approve-form"
                      className='approve-form'
                    >
                      <ApproveForm {...formProps} />
                    </TabPane>
                  )}
                  <TabPane
                    tab={intl.get('hwfp.common.model.approval.record').d('审批记录')}
                    key="approve-record"
                  >
                    <div style={{ marginTop: '0.16rem' }}>{this.renderApproveRecord()}</div>
                  </TabPane>
                  <TabPane
                    tab={intl.get('hwfp.common.model.process.graph').d('流程图')}
                    key="flow-chat"
                  >
                    <FlowChart
                      onRef={(ref) => {
                        this.flowChartDrawerRef = ref;
                      }}
                      match={match}
                      tenantId={tenantId}
                      detail={detail}
                      uselessParam={match.params.id}
                      forecastData={forecastData}
                      autoRequest
                      processInstanceId={match.params.id}
                    />
                  </TabPane>
                </Tabs>
              )}
              </div>
              {approvalFormMergeFlag === 1 && formKey && (
              <>
                <div id="approve-form" className={styles['approve-merge-title']}>
                  <span>{intl.get('hwfp.common.model.approval.form').d('审批表单')}</span>
                </div>
                <div style={{ border: '1px solid #f5f5f5' }} className='approve-form'>
                  <ApproveForm {...formProps} />
                </div>
              </>
            )}
              {approvalFormMergeFlag === 1 && (
              <>
                <div id="approve-record" className={styles['approve-merge-title']}>
                  <span>{intl.get('hwfp.common.model.approval.record').d('审批记录')}</span>
                  <a onClick={() => this.openWorkFlowGraph()} className={styles['graph-link']}>
                    <Icon type="alt_route-o" />
                    {intl.get('hwfp.common.model.process.graph').d('流程图')}
                  </a>
                </div>
                <div>
                  <Spin spinning={fetchHistoryApprovalLoading}>{this.renderApproveRecord()}</Spin>
                </div>
              </>
            )}
            </Spin>
          </div>
        </div>
      </Fragment>

    );
  }
}

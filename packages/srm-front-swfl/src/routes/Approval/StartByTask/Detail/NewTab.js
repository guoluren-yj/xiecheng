/**
 * Detail - 我参与的流程/我发起的流程/我抄送的流程 明细
 * @date: 2018-4-18
 * @author: wangjiacheng <jiacheng.wang@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Form, Spin } from 'hzero-ui';
import { Tabs } from 'choerodon-ui';
import { Modal, Icon } from 'choerodon-ui/pro';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import classNames from 'classnames';
import queryString from 'querystring';

import remote from 'hzero-front/lib/utils/remote';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';

import ApproveRecordNew from '_components/ApproveRecord';

import ApproveItem from '@/components/ApproveRecord/ApproveItem';
import FlowChart from '@/components/FlowChartDrawer/FlowChart';
import { HZERO_HWFP, API_HOST } from 'utils/config';
import { updateTab, getActiveTabKey } from 'utils/menuTab';
import request from 'utils/request';
import ApproveForm from '../../../components/ApproveFormNew';

import styles from './index.less';

const prefix = `${HZERO_HWFP}/v1`;
const modalKey = Modal.key();

const { TabPane } = Tabs;

@remote({
  code: 'SWFL_APPROVAL_WORKBENCH_START_DETAIL_NEW_TAB',
  name: 'processRemote',
})
@formatterCollections({
  code: [
    'hwfl.startByTask',
    'hwfl.common',
    'entity.position',
    'entity.department',
    'hwfp.common',
    'hzero.common',
    'hwfp.monitor',
    'hwfp.task',
    'hwfp.startByTask',
    'hpfm.organization',
  ],
})
@Form.create({ fieldNameProp: null })
// TODO: 调整多语言
@connect(({ startByTask, loading }) => ({
  startByTask,
  fetchDetailLoading: loading.effects['startByTask/fetchDetail'],
  forecastLoading: loading.effects['startByTask/fetchForecast'],
  revokeLoading: loading.effects['startByTask/taskRevoke'],
  fetchHistoryApprovalLoading: loading.effects['startByTask/fetchHistoryApproval'],
  tenantId: getCurrentOrganizationId(),
}))
export default class NewTab extends Component {
  constructor(props) {
    super(props);
    const { search = '' } = this.props.location || {};
    this.queryParams = queryString.parse(search.substr(1)) || {};
    this.headerButtonRef = null;
    this.firstGoToId = true;
    this.taskId = this.props.match.params.id;
    this.fetchApprovalRecordFlag = false;
    this.detailContent = null;
    this.approveFormChildren = null;
    this.state = {
      processInstanceId: props.match.params.id,
      activeTab: this.queryParams.activeTab || 'approve-form',
      forecastData: [],
      forecastLists: [],
      forecastLoading: false,
      isReverse: true,
    };
  }

  componentDidMount() {
    const { taskId } = this.state;
    const { dispatch } = this.props;
    // 清除缓存
    dispatch({
      type: 'startByTask/updateDetailState',
      payload: { taskId, detail: {}, uselessParam: 'init' },
    });
    // 查询审批状态类型（单独查询而不用record上的状态是考虑未从表格点击进入详情页的情况）
    dispatch({ type: 'startByTask/queryProcessStatus' });
    this.handleSearch();
  }

  @Bind()
  handleSearch() {
    const { processInstanceId } = this.state;
    const { dispatch, tenantId } = this.props;
    // 获取详情
    dispatch({
      type: 'startByTask/fetchDetail',
      payload: {
        tenantId,
        processInstanceId,
        type: 'startedBy',
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
          type: 'startByTask/fetchHistoryApproval',
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
        type: 'startByTask/getForecastLists',
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
    const anchorElement = this.detailContent.querySelector(`#${idValue}`);
    if (anchorElement && this.detailContent && this.detailContent.parentNode) {
      const elementTop = anchorElement.getBoundingClientRect().top;
      const containerTop = this.detailContent.getBoundingClientRect().top;
      this.detailContent.parentNode.scrollTop = elementTop - containerTop;
      this.firstGoToId = false;
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
    if (detailContent.clientHeight === 0) {
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
        startByTask: { [processInstanceId]: { detail = {} } = {} },
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
    const { forecastData } = this.state;
    const { match, tenantId, carbonCopyTask: { detail = {} } = {} } = this.props;
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
          match={match}
          tenantId={tenantId}
          detail={detail}
          uselessParam={match.params.id}
          forecastData={forecastData}
          autoRequest
          processInstanceId={match.params.id}
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
      fetchHistoryApprovalLoading,
      startByTask: { [processInstanceId]: { detail = {} } = {} },
      processRemote,
    } = this.props;
    const { processStatusForecast } = detail;

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
      showForecastBtnFlag: processStatusForecast === 'APPROVAL',
      hiddenEndEvent: true,
      currentTaskRecord: detail.historicTaskExtList || [],
      historyTaskRecord: historyApprovalRecords.map((item) => item.historicTaskExtList || []),
      loading: fetchDetailLoading,
    };

    if (processRemote) {
      return processRemote.render(
        'SWFL_APPROVAL_WORKBENCH_START_DETAIL_NEW_TAB_APPROVAL_RECORD',
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
    const { processInstanceId, activeTab, forecastData } = this.state;
    const {
      fetchDetailLoading,
      match,
      tenantId,
      history,
      location,
      fetchHistoryApprovalLoading,
      startByTask: { [processInstanceId]: { detail = {} } = {}, processStatus = [] },
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
      businessKey,
      formDefinitionCode,
      formKey,
      moduleForm,
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
      <div
        style={{ height: '100%', overflow: 'auto' }}
        className="swfl-approval-workbench-start-task-detail-new-tab"
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
                code="HWFP.APPROVAL_FORM_UNIT_GROUP.STARTEDBY"
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
                <div className={styles['approve-merge-title']} id="approve-form">
                  <span>{intl.get('hwfp.common.model.approval.form').d('审批表单')}</span>
                </div>
                <div style={{ border: '1px solid #f5f5f5' }} className='approve-form'>
                  <ApproveForm {...formProps} />
                </div>
              </>
            )}
            {approvalFormMergeFlag === 1 && (
              <>
                <div className={styles['approve-merge-title']} id="approve-record">
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
    );
  }
}

/**
 * Detail - 我参与的流程/我发起的流程/我抄送的流程 明细
 * @date: 2018-4-18
 * @author: wangjiacheng <jiacheng.wang@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Form, Modal, Spin } from 'hzero-ui';
import { Tabs, Icon } from 'choerodon-ui';
import { Modal as C7nModal } from 'choerodon-ui/pro';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import classNames from 'classnames';
import uuid from 'uuid/v4';

import remote from 'hzero-front/lib/utils/remote';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import { closeTab } from 'utils/menuTab';

import ApproveRecordNew from '_components/ApproveRecord';

import ApproveItem from '@/components/ApproveRecord/ApproveItem';
import FlowChart from '@/components/FlowChartDrawer/FlowChart';
import { HZERO_HWFP, API_HOST } from 'utils/config';
import request from 'utils/request';
import ApproveForm from '../../../components/ApproveFormNew';
import { observerDrawerResize, computeDrawerHeight, CC_TASK_TAB_DRAWER_ID } from '../../utils';
import styles from './index.less';

const prefix = `${HZERO_HWFP}/v1`;
const modalKey = C7nModal.key();

const { TabPane } = Tabs;

@remote({
  code: 'SWFL_APPROVAL_WORKBENCH_CC_DETAIL',
  name: 'processRemote',
})
@Form.create({ fieldNameProp: null })
// TODO: 调整多语言
@formatterCollections({
  code: [
    'hwfp.carbonCopyTask',
    'hwfp.common',
    'hzero.common',
    'hwfp.monitor',
    'entity.position',
    'entity.department',
    'hpfm.organization',
  ],
})
@connect(({ carbonCopyTask, loading }) => ({
  carbonCopyTask,
  fetchDetailLoading: loading.effects['carbonCopyTask/fetchDetail'],
  forecastLoading: loading.effects['carbonCopyTask/fetchForecast'],
  recallLoading: loading.effects['carbonCopyTask/taskRecall'],
  fetchHistoryApprovalLoading: loading.effects['carbonCopyTask/fetchHistoryApproval'],
  tenantId: getCurrentOrganizationId(),
}))
export default class CarbonCopyTaskDetail extends Component {
  headerButtonRef = null;

  elementFixRef = null;

  taskId = this.props.match.params.id;

  fetchApprovalRecordFlag = false;

  drawerResizeObserver = null;

  approveFormChildren;

  constructor(props) {
    super(props);
    this.state = {
      firstGoToId: true,
      forecastData: [],
      forecastLists: [],
      forecastLoading: false,
      isReverse: true,
      detailData: {},
      approveFormParams: props.approveFormParams,
      formId: uuid(),
    };
  }

  componentDidMount() {
    const {
      // carbonCopyTask: { detail = {} },
      dispatch,
    } = this.props;
    // const { formKey = null } = detail;
    dispatch({
      type: 'carbonCopyTask/updateState',
      payload: { detail: {}, forecast: [], uselessParam: 'init' },
    });
    this.handleSearch();
    this.observerDetailHeight();
    this.observerSize();
    window.addEventListener('resize', this.computeDrawerHeight);
  }

  componentWillReceiveProps = (nextProps) => {
    if (this.taskId === nextProps.match.params.id) {
      return;
    }
    this.taskId = nextProps.match.params.id;
    this.headerButtonRef = null;
    this.setState(
      {
        firstGoToId: true,
        forecastData: [],
        forecastLists: [],
        forecastLoading: false,
        isReverse: true,
      },
      () => {
        const { dispatch } = this.props;
        dispatch({
          type: 'carbonCopyTask/updateState',
          payload: { detail: {}, forecast: [], uselessParam: 'init' },
        });
        this.handleSearch(true);
        this.observerDetailHeight();
      }
    );
  };

  @Bind()
  handleSearch(isRefresh = false) {
    const { dispatch, match, tenantId } = this.props;
    // 获取详情
    dispatch({
      type: 'carbonCopyTask/fetchDetail',
      payload: {
        tenantId,
        id: match.params.id,
        type: 'carbonCopy',
        commentRecordFlag: 1,
      },
    }).then((res) => {
      if (res) {
        const {
          formKey,
          moduleForm,
          businessKey,
          formDefinitionCode,
          originFormKey,
          processDefinitionId,
          processDefinitionKey,
        } = res;
        this.setState({
          activeTab: res.formKey ? 'approve-form' : 'approve-record',
          detailData: res,
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
        if (res.approvalFormMergeFlag === 1 || !res.formKey) {
          this.fetchHistoryRecord(res);
          this.fetchForecastLists(res);
        }
      }
    });
  }

  // 查询审批历史
  @Bind()
  fetchHistoryRecord(currentDetailData) {
    const { businessKey } = currentDetailData;
    if (businessKey) {
      this.props
        .dispatch({
          type: 'carbonCopyTask/fetchHistoryApproval',
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
        type: 'carbonCopyTask/getForecastLists',
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

  @Bind()
  executeTaskAction() {
    const { tenantId, match, dispatch } = this.props;
    Modal.confirm({
      title: intl.get('hwfp.common.view.message.confirm').d('确认'),
      content: intl.get('hwfp.carbonCopyTask.view.message.title.confirmBack').d(`确认撤回吗?`),
      onOk: () => {
        const params = {
          type: 'carbonCopyTask/taskRecall',
          payload: {
            tenantId,
            processInstanceId: match.params.id,
          },
        };
        dispatch(params).then((res) => {
          if (res) {
            notification.success();
            this.props.history.push(`/hwfp/involved-task`);
            closeTab(`/hwfp/involved-task/detail/${match.params.id}`);
          }
        });
      },
    });
  }

  taskAction = (approveResult) => {
    this.headerButtonRef.taskAction(approveResult);
  };

  handleFlowChat = () => {
    const { flowProps } = this.props;
    request(
      `${API_HOST}${prefix}/${flowProps.tenantId}/process/instance/forecast/${flowProps.match.params.processInstanceId}`,
      { method: 'GET' }
    ).then((res) => this.setState({ forecastData: res || [] }));
  };

  // 点击跳转至对应锚点
  goToId = (idValue) => {
    const anchorElement = document.getElementById(idValue);
    setTimeout(() => {
      if (anchorElement && this.contaniner) {
        const elementTop = anchorElement.getBoundingClientRect()?.top || 0;
        const containerTop = this.contaniner.getBoundingClientRect()?.top || 0;
        this.contaniner.scrollTop = elementTop - containerTop;
      }
    }, 1000);
  };

  // 切换Tab
  changeTab = (key) => {
    if (key === 'approve-record' && !this.fetchApprovalRecordFlag) {
      this.fetchApprovalRecordFlag = true;
      const { detailData } = this.state;
      this.fetchHistoryRecord(detailData);
      this.fetchForecastLists(detailData);
    }
    this.setState({ activeTab: key, firstGoToId: false });
  };

  // 监听详情页高度变化
  observerDetailHeight = () => {
    // 获取tab初始高度
    this.elementFixRef = document.getElementById('element-fix');
    // 监听高度变化
    const detailContent = document.getElementById('content-container');
    if (!detailContent) {
      return;
    }
    // 观察器的配置
    const config = { attributes: true, subtree: true };
    const callback = () => {
      this.handleDetailHeight(detailContent);
    };
    this.observer = new MutationObserver(callback);
    this.observer.observe(detailContent, config);
  };

  handleDetailHeight = (detailContent) => {
    const { firstGoToId } = this.state;
    if (!document.getElementById('content-container')) {
      return;
    }
    if (firstGoToId && detailContent && detailContent.scrollHeight > detailContent.clientHeight) {
      this.goToId('approve-content');
      this.setState({ firstGoToId: false });
      if (this.observer) {
        this.observer.disconnect();
        this.observer.takeRecords();
        this.observer = null;
      }
    }
  };

  // 监听弹窗尺寸变化
  observerSize = () => {
    this.drawerResizeObserver = observerDrawerResize(CC_TASK_TAB_DRAWER_ID);
  };

  computeDrawerHeight = () => {
    computeDrawerHeight(CC_TASK_TAB_DRAWER_ID);
  };

  componentWillUnmount = () => {
    // 没有执行首次进入定位时，清空观察器
    if (this.observer) {
      this.observer.disconnect();
      this.observer.takeRecords();
      this.observer = null;
    }
    if (this.drawerResizeObserver) {
      this.drawerResizeObserver.unobserve(document.getElementById(CC_TASK_TAB_DRAWER_ID));
    }
    window.removeEventListener('resize', this.computeDrawerHeight);
  };

  handleScroll = () => {
    setTimeout(() => {
      const obj = this.elementFixRef;
      if (obj) {
        const top = document.getElementById('content-container')?.scrollTop || 0;
        const divTop = document.getElementById('approve-item')?.clientHeight || 0;
        const approveContent = document.getElementById('approve-content');
        if (approveContent) {
          // 顶部固定高度总和为138，approve-item元素一滚动完，就固定tab
          if (divTop < top) {
            approveContent.style.paddingTop = `${obj.clientHeight}px`;
            obj.style.position = 'fixed';
            obj.style.top = '137px';
          } else {
            obj.style.position = 'static';
            approveContent.style.paddingTop = '0';
          }
        }
      }
    }, 300);
  };

  filterList = (historyApprovalRecords, detail) => {
    const historyList = [].concat(
      ...historyApprovalRecords.map((item) => item.historicTaskExtList || [])
    );
    const detailList = detail.historicTaskExtList ? detail.historicTaskExtList : [];
    const list = historyList.concat(detailList);
    let result = [];
    if (historyList.length > 0 && detailList.length > 0) {
      // detail是要显示在顶部的记录 但是历史记录中会存在日期比detail晚的记录 要过滤掉
      let minStartTime = detailList[0].startTime || '';
      detailList.forEach((res) => {
        if (res.startTime) {
          if (minStartTime) {
            const currentTime = new Date(res.startTime);
            const minStartTimeD = new Date(minStartTime);
            if (currentTime < minStartTimeD) {
              minStartTime = res.startTime;
            }
          } else {
            minStartTime = res.startTime;
          }
        }
      });
      if (minStartTime) {
        const endTimeData = new Date(minStartTime);
        result = list.filter(
          (item, index) =>
            !(new Date(item.endTime) > endTimeData && index <= list.length - detailList.length) ||
            item.actType === 'CommentCarbonCopy'
        );
      } else {
        result = list;
      }
    } else {
      result = list;
    }
    return result;
  };

  openWorkFlowGraph = () => {
    const { flowProps } = this.props;
    const { forecastData } = this.state;
    C7nModal.open({
      title: intl.get('hwfp.common.model.process.graph').d('流程图'),
      key: modalKey,
      destroyOnClose: true,
      drawer: true,
      closable: true,
      className: styles['workflow-graph-modal'],
      resizable: true,
      children: (
        <FlowChart
          onRef={(ref) => {
            this.flowChartDrawerRef = ref;
          }}
          {...flowProps}
          forecastData={forecastData}
          autoRequest
          canMove
        />
      ),
      style: {
        minWidth: '60vw',
      },
      bodyStyle: { overflow: 'hidden' },
      footer: null,
    });
  };

  renderApproveRecord = () => {
    const {
      fetchDetailLoading,
      match,
      carbonCopyTask: { detail = {} },
      processRemote,
    } = this.props;
    const { processInstanceId } = match.params;
    const {
      historyApprovalRecords = [],
      isReverse,
      forecastLists = [],
      forecastLoading,
    } = this.state;
    const { processStatusForecast: processStatusValue } = detail;

    const approveRecordData = fetchDetailLoading
      ? []
      : this.filterList(historyApprovalRecords, detail);
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
        'SWFL_APPROVAL_WORKBENCH_CC_DETAIL_APPROVAL_RECORD',
        <ApproveRecordNew {...approveRecordProps} />,
        approveRecordProps
      );
    }
    return <ApproveRecordNew {...approveRecordProps} />;
  };

  render() {
    const {
      fetchDetailLoading,
      match,
      flowProps,
      history,
      location,
      carbonCopyTask: { detail = {}, processStatus = [] },
    } = this.props;
    const { activeTab, forecastData, approveFormParams, formId } = this.state;
    const { approvalFormMergeFlag } = detail;
    const { formKey } = approveFormParams || {};
    const formProps = {
      ...approveFormParams,
      // detail,
      key: formId,
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
      <>
        <div
          className={classNames(styles.content, 'swfl-approval-workbench-cc-task-detail')}
          id="content-container"
          onScroll={this.handleScroll}
          style={{ padding: '20px', overflow: 'auto' }}
          ref={(ref) => {
            this.contaniner = ref;
          }}
        >
          <Spin spinning={fetchDetailLoading}>
            <div style={{ marginBottom: '20px' }} id="approve-item">
              {approvalFormMergeFlag === 1 && (
                <div className={styles['approve-merge-title']} style={{ marginTop: 0 }}>
                  <span>{intl.get('hwfp.common.model.approval.baseInfo').d('基本信息')}</span>
                </div>
              )}
              <ApproveItem
                detail={detail}
                processStatus={processStatus}
                code="HWFP.APPROVAL_FORM_UNIT_GROUP.CARBON"
              />
            </div>
            <div id="approve-content" style={{ marginTop: '18px' }}>
              <div
                id="element-fix"
                style={{
                  zIndex: 10,
                  background: '#fff',
                  width: '100%',
                }}
              >
                {approvalFormMergeFlag === 0 && (
                  <Tabs activeKey={activeTab} onChange={this.changeTab}>
                    {formKey && (
                      <TabPane
                        tab={intl.get('hwfp.common.model.approval.form').d('审批表单')}
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
                  <span>{intl.get('hwfp.common.model.approval.form').d('审批表单')}</span>
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
                  <ApproveForm {...formProps} />
                </div>
              )}
              {approvalFormMergeFlag === 1 && (
                <div className={styles['approve-merge-title']}>
                  <span>{intl.get('hwfp.common.model.approval.record').d('审批记录')}</span>
                  <a onClick={() => this.openWorkFlowGraph()} className={styles['graph-link']}>
                    <Icon type="alt_route-o" />
                    {intl.get('hwfp.common.model.process.graph').d('流程图')}
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
                  {...flowProps}
                  forecastData={forecastData}
                  autoRequest
                />
              )}
            </div>
          </Spin>
        </div>
      </>
    );
  }
}

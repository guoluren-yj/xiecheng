/**
 * Detail - 我参与的流程/我发起的流程/我抄送的流程 明细
 * @date: 2018-4-18
 * @author: wangjiacheng <jiacheng.wang@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Form, Spin } from 'hzero-ui';
import { Tabs, Icon } from 'choerodon-ui';
import { Modal } from 'choerodon-ui/pro';
import { connect } from 'dva';
import { isArray } from 'lodash';
import { Bind } from 'lodash-decorators';
import classNames from 'classnames';
import uuid from 'uuid/v4';

import remote from 'hzero-front/lib/utils/remote';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';

import ApproveRecordNew from '_components/ApproveRecord';

import ApproveItem from '@/components/ApproveRecord/ApproveItem';
import FlowChart from '@/components/FlowChartDrawer/FlowChart';
import { HZERO_HWFP, API_HOST } from 'utils/config';
import request from 'utils/request';
import ApproveForm from '../../../components/ApproveFormNew';
import {
  observerDrawerResize,
  INVOLVED_TASK_TAB_DRAWER_ID,
  computeDrawerHeight,
} from '../../utils';
import styles from './index.less';

const prefix = `${HZERO_HWFP}/v1`;
const modalKey = Modal.key();

const { TabPane } = Tabs;

@remote({
  code: 'SWFL_APPROVAL_WORKBENCH_INVOLED_DETAIL',
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
    this.headerButtonRef = null;
    this.elementFixRef = null;
    this.taskId = this.props.match.params.id;
    this.fetchApprovalRecordFlag = false;
    this.drawerResizeObserver = null;
    this.state = {
      processInstanceId: props.match.params.id,
      activeTab: 'approve-form',
      firstGoToId: true,
      forecastData: [],
      forecastLists: [],
      forecastLoading: false,
      isReverse: true,
      selectHistoryApprovalFlag: false, // 已审批的审批记录只使用审批历史接口中的数据
      detailData: {},
      approveFormParams: props.approveFormParams,
      formId: uuid(),
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
        processInstanceId: nextProps.match.params.id,
        activeTab: 'approve-form',
        firstGoToId: true,
        forecastData: [],
        forecastLists: [],
        forecastLoading: false,
        isReverse: true,
        selectHistoryApprovalFlag: false,
      },
      () => {
        const { taskId } = this.state;
        const { dispatch } = this.props;
        // 清除缓存
        dispatch({
          type: 'startByTask/updateDetailState',
          payload: { taskId, detail: {}, uselessParam: 'init' },
        });
        this.handleSearch(true);
        this.observerDetailHeight();
      }
    );
  };

  @Bind()
  handleSearch(isRefresh = false) {
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
    const { businessKey, refuseJumpFlag = false } = currentDetailData;
    this.setState({ selectHistoryApprovalFlag: refuseJumpFlag });
    const params = refuseJumpFlag
      ? {
          businessKey,
          needMerge: true,
          commentRecordFlag: 1,
        }
      : {
          businessKey,
          currentProcessInstanceId: currentDetailData.id,
          commentRecordFlag: 1,
        };
    if (businessKey) {
      this.props
        .dispatch({
          type: 'involvedTask/fetchHistoryApproval',
          params,
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
    const { flowProps } = this.props;
    request(
      `${API_HOST}${prefix}/${flowProps.tenantId}/process/instance/forecast/${flowProps.match.params.processInstanceId}`,
      { method: 'GET' }
    ).then((res) => this.setState({ forecastData: res || [] }));
  };

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
    this.drawerResizeObserver = observerDrawerResize(INVOLVED_TASK_TAB_DRAWER_ID);
  };

  computeDrawerHeight = () => {
    computeDrawerHeight(INVOLVED_TASK_TAB_DRAWER_ID);
  };

  componentWillUnmount = () => {
    // 没有执行首次进入定位时，清空观察器
    if (this.observer) {
      this.observer.disconnect();
      this.observer.takeRecords();
      this.observer = null;
    }
    if (this.drawerResizeObserver) {
      this.drawerResizeObserver.unobserve(document.getElementById(INVOLVED_TASK_TAB_DRAWER_ID));
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

  // 过滤流程明细中的审批记录和审批记录接口返回的数据 并重新组装
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

  // selectHistoryApprovalFlag为true时 只取审批记录接口中的数据
  concatHistoryApproval = (list = []) => {
    let result = [];
    if (isArray(list)) {
      list.forEach((item) => {
        if (isArray(item.historicTaskExtList)) {
          result = result.concat(item.historicTaskExtList);
        }
      });
    }
    return result;
  };

  openWorkFlowGraph = () => {
    const { flowProps } = this.props;
    const { forecastData } = this.state;
    Modal.open({
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
      processInstanceId,
      historyApprovalRecords = [],
      forecastLists = [],
      forecastLoading,
      isReverse,
      selectHistoryApprovalFlag,
    } = this.state;
    const {
      fetchDetailLoading,
      involvedTask: { [processInstanceId]: { detail = {} } = {} },
      processRemote,
    } = this.props;

    const { processStatusForecast: processStatusValue } = detail;

    const approveRecordData = fetchDetailLoading
      ? []
      : selectHistoryApprovalFlag
      ? this.concatHistoryApproval(historyApprovalRecords)
      : this.filterList(historyApprovalRecords, detail);

    const approveRecordProps = {
      taskId: this.taskId,
      processInstanceId,
      data: isReverse ? approveRecordData.reverse() : approveRecordData,
      forecastData: forecastLists,
      forecastLoading,
      showForecastBtnFlag: processStatusValue === 'APPROVAL',
      hiddenEndEvent: true,
      currentTaskRecord: selectHistoryApprovalFlag ? [] : detail.historicTaskExtList || [],
      historyTaskRecord: historyApprovalRecords.map((item) => item.historicTaskExtList || []),
      loading: fetchDetailLoading,
    };

    if (processRemote) {
      return processRemote.render(
        'SWFL_APPROVAL_WORKBENCH_INVOLED_DETAIL_APPROVAL_RECORD',
        <ApproveRecordNew {...approveRecordProps} />,
        approveRecordProps
      );
    }
    return <ApproveRecordNew {...approveRecordProps} />;
  };

  render() {
    const { processInstanceId, activeTab, forecastData, approveFormParams, formId } = this.state;
    const {
      fetchDetailLoading,
      match,
      flowProps,
      history,
      location,
      involvedTask: { [processInstanceId]: { detail = {} } = {}, processStatus = [] },
    } = this.props;

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
          className={classNames(styles.content, 'swfl-approval-workbench-involved-task-detail')}
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
                code="HWFP.APPROVAL_FORM_UNIT_GROUP.APPROVED"
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

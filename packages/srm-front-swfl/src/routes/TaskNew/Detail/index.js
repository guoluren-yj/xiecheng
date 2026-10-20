/**
 *  待办事项列表-详情
 */

import React, { Fragment, Component } from 'react';
import { DataSet, Spin, Tooltip } from 'choerodon-ui/pro';
import { Row, Col, Card, Collapse, Tag, Icon } from 'choerodon-ui';
import { stringify } from 'querystring';
import { Bind } from 'lodash-decorators';
import { isEmpty } from 'lodash';

import { Header } from 'components/Page';
import intl from 'utils/intl';
import { updateTab, getActiveTabKey, closeTab } from 'utils/menuTab';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import { queryUUID, queryIdpValue } from 'services/api';
import remote from 'hzero-front/lib/utils/remote';

import {
  searchDetailNew,
  getJumpList,
  fetchForecast,
  fetchHistoryApproval,
  getProcessDefineConfig,
} from '@/services/taskService';
import { detailTableDS, detailApproveFormDS } from '@/stores/oldTaskDS';
import {
  processStatusRender,
  getDetailDispatchRouter,
  errorProcessRender,
  ERROR_CODE,
} from '@/utils/util';
import TaskMenuProvider from '@/components/TaskMenuProvider';

import styles from './index.less';
import FlowChartDrawer from './FlowChartDrawer';
import ApproveForm from '../../components/ApproveFormNew';
import ApproveRecordNew from './ApproveRecordNew';
import HeaderButtons from './HeaderButtons';

const tenantId = getCurrentOrganizationId();

@remote({
  code: 'SWFL_TASK_DETAIL',
  name: 'processRemote',
})
@formatterCollections({
  code: [
    'hwfp.task',
    'hwfp.common',
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
    this.flowChartDrawerRef = null;
    this.approveFormRef = null;
    this.headerButtonRef = null;
    this.approvalRecordTableDs = new DataSet(detailTableDS());
    this.approvalHistoryTableDs = new DataSet(detailTableDS());
    this.approveFormDS = new DataSet(detailApproveFormDS());
    this.taskId = this.props.match.params.id;
    this.state = {
      errorCode: undefined, // 流程详情返回异常编码
      task: {},
      forecast: [], // 流程图
      attachmentUuid: '',
      fetchDetailLoading: false,
      fetchHistoryApprovalLoading: false,
      approveLoading: false,
      historyApprovalRecords: [],
      processStatus: {},
      // 审批按钮disable flag
      footerBtnLoadFlag: false,
      pageLoadTime: '', // 详情接口请求完成时间
      formLoadTime: '', // 审批表单加载完成时间
    };
  }

  componentDidMount() {
    this.handleSearch();
    this.getJumpList();
    this.fetchUuid();
    this.fetchLovData();
    // 加载流程图
    this.loadForecastDiagram();
  }

  @Bind()
  checkErrorCode(res) {
    if (res && [ERROR_CODE.PROCESSED, ERROR_CODE.NO_APPROVE_PERMISSION].includes(res.code)) {
      this.setState({
        errorCode: res.code,
      });
      return false;
    }
    return true;
  }

  // 查询详情
  @Bind()
  async handleSearch() {
    this.setState({ fetchDetailLoading: true });
    const res = await searchDetailNew(
      {
        tenantId,
        taskId: this.taskId,
      },
      (errorCode) => {
        if (errorCode && errorCode.name === 403) {
          this.setState({
            errorCode: ERROR_CODE.NO_MENU_PERMISSION,
          });
        }
      }
    );
    if (res && res.code === ERROR_CODE.PROCESSED) {
      const config = await getProcessDefineConfig();
      if (getResponse(config)) {
        this.setState({ linkToApproved: !!config && config.todoJumpApprovedFlag === 1 });
      }
    }
    if (!this.checkErrorCode(res)) {
      return;
    }
    this.setState({ fetchDetailLoading: false, pageLoadTime: new Date().getTime() });
    const result = getResponse(res);
    if (result) {
      this.setState({
        task: result,
      });
      // 加载审批记录
      this.approvalRecordTableDs.loadData(result.historicTaskList);
      // 更新tab名(从工作台直接进入的)
      this.handleUpdateTab(result);
      // 查询审批历史记录
      this.fetchHistoryRecord(result);
    }
  }

  // 获取可跳转的节点
  @Bind()
  getJumpList() {
    getJumpList({
      tenantId,
      taskId: this.taskId,
    }).then((res) => {
      if (!this.checkErrorCode(res)) {
        return;
      }
      const result = getResponse(res);
      if (result) {
        this.setState({
          jumpList: result,
        });
      }
    });
  }

  @Bind()
  fetchUuid() {
    queryUUID({
      tenantId,
    }).then((res) => {
      const result = getResponse(res);
      if (result) {
        this.setState({
          attachmentUuid: result.content,
        });
      }
    });
  }

  @Bind()
  fetchLovData() {
    queryIdpValue('HWFP.PROCESS_APPROVE_STATUS').then((res) => {
      const result = getResponse(res);
      if (!isEmpty(result)) {
        const processStatus = {};
        result.forEach((item) => {
          processStatus[(item.value || '').toUpperCase()] = item.meaning;
        });
        this.setState({
          processStatus,
        });
      }
    });
  }

  // 加载流程图
  @Bind()
  loadForecastDiagram() {
    const {
      match: {
        params: { processInstanceId },
      },
    } = this.props;
    fetchForecast({
      tenantId,
      Id: processInstanceId,
    }).then((res) => {
      if (!this.checkErrorCode(res)) {
        return;
      }
      const result = getResponse(res);
      if (result) {
        this.setState({
          forecast: result,
        });
      }
    });
  }

  // 更新tab名title
  @Bind()
  handleUpdateTab(task = {}) {
    const { assigneeName, processInstance = {} } = task;
    const { processDefinitionName } = processInstance;
    if (processDefinitionName) {
      updateTab({
        key: getActiveTabKey(),
        title: assigneeName
          ? `${processDefinitionName}-${assigneeName}`
          : `${processDefinitionName}`,
      });
    }
  }

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
      }).then((res) => {
        const result = getResponse(res);
        this.setState({
          fetchHistoryApprovalLoading: false,
          historyApprovalRecords: result || [],
        });
      });
    }
  }

  @Bind()
  showProcessPic() {
    this.flowChartDrawerRef.handleToogleVisible();
  }

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
      this.setState({
        footerBtnLoadFlag: result,
        formLoadTime: result ? new Date().getTime() : '',
      });
    }
  }

  @Bind()
  handleBackWorkbench() {
    const activeKey = getActiveTabKey();
    const { taskMenu: originTaskMenu } = this.props;
    const isRoleWorkbench = activeKey === '/swbh/role-workbench';
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
    closeTab(activeKey);
  }

  render() {
    const {
      forecast,
      attachmentUuid,
      task = {},
      fetchDetailLoading = false,
      fetchHistoryApprovalLoading = false,
      approveLoading = false,
      historyApprovalRecords = [],
      jumpList = [],
      processStatus = {},
      footerBtnLoadFlag,
      errorCode,
      pageLoadTime,
      formLoadTime,
      linkToApproved,
    } = this.state;
    const {
      processInstance = {},
      mergeHistoryFlag = false,
      historicTaskList = [],
      processName,
      owner,
    } = task;
    const { match, history, location, taskMenu, taskMenuId, processRemote } = this.props;
    const matchParams = (match || {}).params || {};
    let { state: { approveFormParams = {} } = {} } = location || {};
    const isAddSign =
      owner && (owner.startsWith('AddSign') || owner.startsWith('ApproveAndAddSign'));
    // eslint-disable-next-line
    const approveRecordData = !mergeHistoryFlag
      ? historicTaskList
      : fetchHistoryApprovalLoading
      ? []
      : []
          .concat(...historyApprovalRecords.map((item) => item.historicTaskExtList || []))
          .concat(historicTaskList || []);
    const name = `${processInstance.startUserName ? `${processInstance.startUserName}` : ''}`;
    // 非列表进入详情页时，从详情接口获取moduleForm
    // 列表进入详情页时，直接从路由获取moduleForm
    if (!approveFormParams.formKey) {
      const {
        businessKey,
        formDefinitionCode,
        formKey,
        moduleForm,
        originFormKey,
        processDefinitionId,
        processDefinitionKey,
      } = task;
      approveFormParams = {
        ...approveFormParams,
        businessKey,
        formDefinitionCode,
        formKey,
        moduleForm,
        originFormKey,
        processDefinitionId,
        processDefinitionKey,
      };
    }
    const approveFromProps = {
      ...approveFormParams,
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
    };
    if (errorCode) {
      const errorProcessRenderProps = {
        processInstanceId: matchParams.processInstanceId,
        errorCode,
        callback: this.props.history.push,
        taskMenu,
        linkToApproved,
      };
      if (errorCode === ERROR_CODE.PROCESSED && processRemote && processRemote.render) {
        return processRemote.render(
          'SWFL_TASK_DETAIL_PROCESS_RENDER',
          errorProcessRender(errorProcessRenderProps),
          {
            processInstanceId: matchParams.processInstanceId,
            callback: this.props.history.push,
            taskMenu,
          }
        );
      }
      return errorProcessRender(errorProcessRenderProps);
    }
    return (
      <Fragment>
        <Header title={intl.get('hwfp.task.view.message.title.detail').d('待办明细')}>
          {!isEmpty(task) && (
            <HeaderButtons
              taskId={this.taskId}
              task={task}
              jumpList={jumpList}
              attachmentUuid={attachmentUuid}
              formDs={this.approveFormDS}
              onRef={(ref) => {
                this.headerButtonRef = ref;
              }}
              showProcessPic={this.showProcessPic}
              getApproveFormRef={this.getApproveFormRef}
              loadFlag={footerBtnLoadFlag}
              pageLoadTime={pageLoadTime}
              formLoadTime={formLoadTime}
              taskMenu={taskMenu}
              taskMenuId={taskMenuId}
            />
          )}
        </Header>
        <div className={styles.content}>
          <div className={styles['content-container']}>
            <Spin spinning={fetchDetailLoading || approveLoading} style={{ height: '100%' }}>
              <div className={styles['content-container-main']}>
                <div className={styles['approve-content']}>
                  <Card id="approve-item">
                    <div className={styles['label-col']}>
                      {intl.get('hwfp.common.model.approval.item').d('审批事项')}
                    </div>
                    <Row style={{ marginBottom: '16px', maxWidth: '900px' }}>
                      <Col span={8}>
                        <div style={{ color: '#999' }}>
                          {intl.get('hwfp.common.model.process.name').d('流程名称')}
                        </div>
                        <div className={styles['approve-item-content']}>{processName}</div>
                      </Col>
                      <Col span={8}>
                        <div style={{ color: '#999' }}>
                          {intl.get('hwfp.common.model.process.ID').d('流程标识')}
                        </div>
                        <div className={styles['approve-item-content']}>{processInstance.id}</div>
                      </Col>
                      <Col span={8}>
                        <div style={{ color: '#999' }}>
                          {intl.get('hwfp.common.model.apply.owner').d('申请人')}
                        </div>
                        <div className={styles['approve-item-content']}>
                          {name}
                          {task.employeeResign && (
                            <Tag color="#E5E7EC" className={styles['approve-content-tag']}>
                              {intl.get('hpfm.organization.model.position.leave').d('离职')}
                            </Tag>
                          )}
                        </div>
                      </Col>
                    </Row>
                    <Row style={{ maxWidth: '900px' }}>
                      <Col span={8}>
                        <div style={{ color: '#999' }}>
                          {intl.get('hwfp.common.model.apply.time').d('申请时间')}
                        </div>
                        <div className={styles['approve-item-content']}>{task.startTime}</div>
                      </Col>
                      <Col span={8}>
                        <div style={{ color: '#999' }}>
                          {intl.get('hwfp.common.model.process.description').d('流程描述')}
                        </div>
                        <div className={styles['approve-item-content']}>{task.description}</div>
                      </Col>
                      <Col span={8}>
                        <div style={{ color: '#999' }}>
                          {intl.get('hwfp.common.model.process.department').d('部门')}
                        </div>
                        <div className={styles['approve-item-content']}>
                          {processInstance.unitName}
                        </div>
                      </Col>
                    </Row>
                  </Card>
                  {approveFormParams.formKey && (
                    <Card id="approve-form">
                      <div className={styles['label-col']}>
                        {intl.get('hwfp.common.model.approval.form').d('审批表单')}
                        {isAddSign && (
                          <Tooltip
                            title={intl
                              .get('hwfp.common.model.approval.form.help')
                              .d('加签人无法编辑表单信息')}
                          >
                            <Icon
                              type="help_outline"
                              style={{ verticalAlign: 'text-bottom', fontWeight: 400 }}
                            />
                          </Tooltip>
                        )}
                      </div>
                      <ApproveForm {...approveFromProps} />
                    </Card>
                  )}
                  <Card id="approve-record">
                    <div className={styles['label-col']}>
                      {intl.get('hwfp.common.model.approval.record').d('审批记录')}
                    </div>
                    <Spin spinning={mergeHistoryFlag && fetchHistoryApprovalLoading}>
                      <ApproveRecordNew data={approveRecordData} />
                    </Spin>
                  </Card>
                  {!mergeHistoryFlag && (
                    <Spin
                      spinning={fetchHistoryApprovalLoading}
                      style={{
                        display: fetchHistoryApprovalLoading ? 'block' : 'none',
                        height: '50px',
                        backgroundColor: 'transparent',
                      }}
                    >
                      {historyApprovalRecords.length > 0 && (
                        <Card id="approve-history" className={styles['approve-history-card']}>
                          <div className={styles['label-col']}>
                            {intl.get('hwfp.common.model.approval.history').d('审批历史')}
                          </div>
                          <Collapse
                            bordered={false}
                            defaultActiveKey={historyApprovalRecords.map((record) => record.id)}
                            className={styles['approve-history-collapse']}
                          >
                            {historyApprovalRecords.map((record) => (
                              <Collapse.Panel
                                key={record.id}
                                header={
                                  <div className={styles['collapse-item-title']}>
                                    <span style={{ marginRight: 20 }}>
                                      {intl.get('hwfp.common.model.process.ID').d('流程标识')}:{' '}
                                      {record.id}
                                    </span>
                                    {processStatusRender(processStatus, record.processStatus)}
                                  </div>
                                }
                                extra={
                                  <div>
                                    {record.startTime}
                                    <span>~</span>
                                    {record.endTime}
                                  </div>
                                }
                              >
                                <ApproveRecordNew data={record.historicTaskExtList} />
                              </Collapse.Panel>
                            ))}
                          </Collapse>
                        </Card>
                      )}
                    </Spin>
                  )}
                </div>
              </div>
            </Spin>
          </div>
        </div>
        <FlowChartDrawer
          onRef={(ref) => {
            this.flowChartDrawerRef = ref;
          }}
          tenantId={tenantId}
          forecast={forecast}
          match={{ params: { id: match.params.processInstanceId } }}
        />
      </Fragment>
    );
  }
}

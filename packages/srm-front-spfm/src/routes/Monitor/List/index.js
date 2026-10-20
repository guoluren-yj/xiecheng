/**
 * List - 流程监控
 * @date: 2018-8-20
 * @author: LZY <zhuyan.luo@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { isUndefined, isEmpty } from 'lodash';
import moment from 'moment';
import ExcelExport from 'components/ExcelExport';
import { Button } from 'hzero-ui';
import { Modal } from 'choerodon-ui/pro';

import { Header } from 'components/Page';
import { HZERO_HWFP } from 'utils/config';
import { menuTabEventManager } from 'utils/menuTab';
import { getCurrentOrganizationId, filterNullValueObject, isTenantRoleLevel } from 'utils/utils';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';

import { exportDetail } from '@/services/monitorService';
import FilterForm from './FilterForm';
import ListTable from './ListTable';
import EmployeeDrawer from './EmployeeDrawer';
import ExceptionMsgDrawer from './ExceptionMsgDrawer';
import JumpNodeDrawer from './JumpNodeDrawer';
import LogDrawer from './LogDrawer';
import ExportInfo from './ExportInfo';
import AssignDrawer from './AssignDrawer';
import styles from './index.less';

/**
 * 流程监控组件
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {!Object} monitorSrm - 数据源
 * @reactProps {!Object} loading - 数据加载是否完成
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
const prefixIsSiteFlag = !isTenantRoleLevel();
const prefixTenantId = getCurrentOrganizationId();
const prefix = prefixIsSiteFlag ? `${HZERO_HWFP}/v1` : `${HZERO_HWFP}/v1/${prefixTenantId}`;

@connect(({ monitorSrm, loading }) => ({
  monitorSrm,
  fetchListLoading: loading.effects['monitorSrm/fetchMonitorList'],
  fetchEmployeeLoading: loading.effects['monitorSrm/fetchEmployeeList'],
  employeeLoading: loading.effects['monitorSrm/retryProcess'],
  jumpLoading: loading.effects['monitorSrm/jumpProcess'],
  fetchNodeLoading: loading.effects['monitorSrm/fetchValidNode'],
  logLoading: loading.effects['monitorSrm/fetchProcessException'],
  tenantId: getCurrentOrganizationId(),
  isSiteFlag: !isTenantRoleLevel(),
}))
@formatterCollections({
  code: [
    'hwfp.monitor',
    'entity.tenant',
    'entity.position',
    'entity.department',
    'entity.employee',
    'hwfp.common',
    'hpfm.organization',
    'spfm.monitor',
    'hwfp.task',
  ],
})
export default class List extends Component {
  form;

  tableRef;

  state = {
    drawerVisible: false, // 选择员工弹窗
    exceptionVisible: false, // 挂起详情弹窗
    jumpNodeVisible: false, // 挂起详情弹窗
    operationRecord: {},
    validNodeList: [], // 有效节点
    jumpSelected: {},
    exceptionLogVisible: false, // 异常查看标记
    retryData: {},
  };

  /**
   * render()调用后获取数据
   */
  componentDidMount() {
    const {
      monitorSrm: { pagination = {} },
      location: { state: { _back } = {} },
    } = this.props;
    // 校验是否从详情页返回
    const page = isUndefined(_back) ? {} : pagination;
    this.handleSearch(page);
    this.props.dispatch({ type: 'monitorSrm/queryProcessStatus' });
  }

  /**
   * 传递表单对象
   * @param {object} ref - FilterForm对象
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  @Bind()
  handleBindTableRef(ref = {}) {
    this.tableRef = ref;
  }

  @Bind()
  handleContinueProcess(id) {
    this.props
      .dispatch({
        type: 'monitorSrm/continueProcess',
        payload: {
          id,
        },
      })
      .then(res => {
        if (res) {
          notification.success({
            message: intl.get('hpfm.common.view.message.success').d('操作成功'),
          });
          this.handleSearch();
        }
      });
  }

  @Bind()
  handleExpandForm() {
    if (this.tableRef) {
      this.tableRef.handler();
    }
  }

  /**
   * 查询
   * @param {object} fields - 查询参数
   */
  @Bind()
  handleSearch(fields = {}) {
    const { dispatch } = this.props;
    const filterValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());

    const {
      processInstanceId,
      processDefinitionNameLike,
      startedBy,
      startedBefore,
      startedAfter,
      finishedBefore,
      finishedAfter,
      processStatus,
      ...others
    } = filterValues;

    let suspended = null;
    let finished = null;
    if (processStatus === 'PROCESSIONG') {
      finished = false;
    } else if (processStatus === 'OVER') {
      finished = true;
    } else if (processStatus === 'SUSPENDED') {
      suspended = true;
      finished = false;
    }

    dispatch({
      type: 'monitorSrm/fetchMonitorList',
      payload: {
        processInstanceId,
        processDefinitionNameLike,
        startedBy,
        startedBefore: startedBefore ? moment(startedBefore).format(DATETIME_MAX) : null,
        startedAfter: startedAfter ? moment(startedAfter).format(DATETIME_MIN) : null,
        finishedBefore: finishedBefore ? moment(finishedBefore).format(DATETIME_MAX) : null,
        finishedAfter: finishedAfter ? moment(finishedAfter).format(DATETIME_MIN) : null,
        suspended,
        finished,
        page: isEmpty(fields) ? {} : fields,
        ...others,
      },
    });
  }

  @Bind()
  getWindow() {
    if (window.parent === window) {
      return window;
    } else {
      return window.parent;
    }
  }

  @Bind()
  handleToDetail(record) {
    const {
      processName,
      encryptId,
      businessKey,
      formDefinitionCode,
      formKey,
      originFormKey,
      processDefinitionId,
      processDefinitionKey,
    } = record;
    const tabKey = `/hwfp/monitor-srm/detail/:id-${processDefinitionKey}`;
    this.getWindow()
      .dvaApp._store.dispatch({
        type: 'global/removeTab',
        payload: tabKey,
      })
      .then(() => {
        menuTabEventManager.emit('close', { tabKey });
        this.getWindow().openTab({
          title: processName,
          key: tabKey,
          path: `/hwfp/monitor-srm/detail/${encryptId}`,
          icon: 'edit',
          closable: true,
          state: {
            approveFormParams: {
              businessKey,
              formDefinitionCode,
              formKey,
              originFormKey,
              processDefinitionId,
              processDefinitionKey,
            },
          },
        });
      });
  }

  @Bind()
  handleSuspendedReason(processInstanceId) {
    const { dispatch, tenantId } = this.props;
    dispatch({
      type: 'monitorSrm/fetchExceptionDetail',
      payload: {
        tenantId,
        processInstanceId,
      },
    }).then(res => {
      if (res) {
        // notification.success();
        this.setState({ exceptionVisible: true });
      }
    });
  }

  @Bind()
  handleExceptionCancel() {
    this.setState({
      exceptionVisible: false,
    });
  }

  // 挂起、恢复、终止流程
  @Bind()
  handleOperateProcess(processInstanceId, dispatchType) {
    const {
      dispatch,
      tenantId,
      monitorSrm: { pagination },
    } = this.props;
    dispatch({
      type: `monitorSrm/${dispatchType}`,
      payload: {
        tenantId,
        processInstanceId,
      },
    }).then(res => {
      if (res) {
        notification.success();
        this.handleSearch(pagination);
      }
    });
  }

  // 指定审批人
  @Bind()
  handleRetry(record) {
    this.setState({
      // drawerVisible: true,
      assignVisible: true,
      retryData: record,
    });
    // this.handleSearchEmployee({
    //   tenantId: record.tenantId,
    //   lovCode: 'HPFM.EMPLOYEE',
    //   enabledFlag: 1,
    // });
  }

  // 转交
  @Bind()
  handleDelegate(record) {
    if (record.currentTasks && record.currentTasks.length === 1) {
      this.setState({
        drawerVisible: true,
        operationRecord: record,
      });
    } else {
      this.props.history.push(`/hwfp/delegate`);
    }
  }

  /**
   * 提交指定审批人
   * @param data 任务数据
   */
  @Bind()
  handleAction(data = {}) {
    const {
      dispatch,
      monitorSrm: { pagination },
    } = this.props;
    dispatch({
      type: 'monitorSrm/retryProcess',
      payload: data,
    }).then(res => {
      if (res) {
        notification.success();
        this.setState({
          drawerVisible: false,
        });
        this.handleSearch(pagination);
      }
    });
  }

  @Bind()
  handleCancel() {
    this.setState({
      drawerVisible: false,
    });
  }

  // 跳转节点TODO
  @Bind()
  handleJumpNode(record) {
    const { dispatch, tenantId } = this.props;
    dispatch({
      type: 'monitorSrm/fetchValidNode',
      payload: {
        tenantId,
        processInstanceId: record.id,
      },
    }).then(res => {
      if (res) {
        this.setState({
          jumpNodeVisible: true,
          operationRecord: record,
          validNodeList: res,
          jumpSelected: {},
        });
      }
    });
  }

  @Bind()
  handleExceptionLog(record) {
    const { dispatch } = this.props;
    dispatch({
      type: 'monitorSrm/fetchProcessException',
      payload: record,
    });
    this.setState({ exceptionLogVisible: true });
  }

  @Bind()
  handleLogCancel() {
    const { dispatch } = this.props;
    dispatch({
      type: 'monitorSrm/updateState',
      payload: { exceptionList: [] },
    });
    this.setState({ exceptionLogVisible: false });
  }

  @Bind()
  handleSelectNode(record) {
    this.setState({
      jumpSelected: record,
    });
  }

  @Bind()
  handleJumpSubmit() {
    const {
      tenantId,
      dispatch,
      monitorSrm: { pagination },
    } = this.props;
    const { jumpSelected, operationRecord } = this.state;
    if (jumpSelected.nodeId) {
      const currentTaskId = operationRecord.currentTasks[0].taskId;
      dispatch({
        type: 'monitorSrm/jumpProcess',
        payload: {
          tenantId,
          action: 'jump',
          currentTaskId,
          jumpTarget: jumpSelected.nodeId,
          jumpTargetName: jumpSelected.name,
          processInstanceId: operationRecord.id,
        },
      }).then(res => {
        if (res) {
          notification.success();
          this.setState({
            jumpNodeVisible: false,
          });
          this.handleSearch(pagination);
        }
      });
    } else {
      this.handleJumpCancel();
    }
  }

  @Bind()
  handleJumpCancel() {
    this.setState({
      jumpNodeVisible: false,
    });
  }

  @Bind()
  handleExportHistory() {
    let fileName = intl.get('hzero.common.export.hisroty').d('流程明细审批记录导出');
    let merge = true;
    const exportBtnFilterValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    const {
      startedBefore = null,
      startedAfter = null,
      finishedBefore = null,
      finishedAfter = null,
    } = exportBtnFilterValues;
    let timeFormatter = {
      startedBefore: startedBefore ? moment(startedBefore).format(DATETIME_MAX) : null,
      startedAfter: startedAfter ? moment(startedAfter).format(DATETIME_MIN) : null,
      finishedBefore: finishedBefore ? moment(finishedBefore).format(DATETIME_MAX) : null,
      finishedAfter: finishedAfter ? moment(finishedAfter).format(DATETIME_MIN) : null,
    };
    timeFormatter = filterNullValueObject(timeFormatter);
    Modal.open({
      title: intl.get('hzero.common.review.history').d('导出审批记录'),
      drawer: true,
      children: (
        <ExportInfo
          getFileName={v => {
            if (v) fileName = v;
          }}
          onChangeMerge={v => {
            merge = v !== 0;
          }}
        />
      ),
      okText: intl.get('hzero.common.button.export').d('导出'),
      onOk() {
        exportDetail(
          {
            ...exportBtnFilterValues,
            ...timeFormatter,
            fileName,
            tenantCompanyFlag: 1,
          },
          { merge }
        );
      },
    });
  }

  @Bind()
  handleSearchEmployee(data = {}) {
    const { dispatch } = this.props;
    dispatch({
      type: 'monitorSrm/fetchEmployeeList',
      payload: data,
    });
  }

  @Bind()
  handleClose() {
    this.setState({
      assignVisible: false,
    });
  }

  @Bind()
  handleSubmitAssign() {
    const {
      monitorSrm: { pagination },
    } = this.props;
    this.handleSearch(pagination);
  }

  render() {
    const {
      fetchListLoading,
      dispatch,
      employeeLoading,
      fetchNodeLoading,
      jumpLoading,
      fetchEmployeeLoading,
      logLoading,
      isSiteFlag,
      tenantId,
      monitorSrm,
      monitorSrm: {
        exceptionDetail,
        employeeList,
        employeePagination,
        list = [],
        pagination,
        processStatus = [],
        exceptionList = [],
      },
    } = this.props;
    const {
      drawerVisible,
      retryData,
      exceptionVisible,
      jumpNodeVisible,
      validNodeList,
      exceptionLogVisible,
      assignVisible,
    } = this.state;
    const filterProps = {
      isSiteFlag,
      processStatus,
      onSearch: this.handleSearch,
      onRef: this.handleBindRef,
      onExpandForm: this.handleExpandForm,
    };
    const listProps = {
      monitorSrm,
      tenantId,
      dispatch,
      pagination,
      isSiteFlag,
      processStatus,
      dataSource: list,
      loading: fetchListLoading,
      onDetail: this.handleToDetail, // 流程详情
      onSuspendedReason: this.handleSuspendedReason, // 挂起详情
      onStop: this.handleOperateProcess, // 终止流程
      onSuspend: this.handleOperateProcess, // 挂起节点
      onResume: this.handleOperateProcess, // 恢复流程
      onRetry: this.handleRetry, // 指定审批人
      onChange: this.handleSearch,
      onException: this.handleExceptionLog,
      onRef: this.handleBindTableRef,
      onContinue: this.handleContinueProcess,
    };

    const employeeProps = {
      employeeList,
      pagination: employeePagination,
      drawerVisible,
      dispatch,
      retryData,
      submitLoading: employeeLoading,
      loading: fetchEmployeeLoading,
      onSearch: this.handleSearchEmployee,
      onCancel: this.handleCancel,
      onAction: this.handleAction,
    };

    const assignProps = {
      employeeList,
      pagination: employeePagination,
      assignVisible,
      dispatch,
      retryData,
      submitLoading: employeeLoading,
      loading: fetchEmployeeLoading,
      // onSearch: this.handleSearchTask,
      onClose: this.handleClose,
      afterSubmit: this.handleSubmitAssign,
      // onAction: this.handleAction,
    };

    const exceptionMsgProps = {
      exceptionDetail,
      title: intl.get('hwfp.monitor.model.monitor.exceptionDetail').d('挂起详情'),
      visible: exceptionVisible,
      onCancel: this.handleExceptionCancel,
    };

    const jumpNodeProps = {
      validNodeList,
      fetchNodeLoading,
      jumpLoading,
      title: intl.get('hwfp.monitor.model.monitor.jumpNode').d('跳转节点'),
      visible: jumpNodeVisible,
      onSelectNode: this.handleSelectNode,
      onOk: this.handleJumpSubmit,
      onCancel: this.handleJumpCancel,
    };

    const logDrawerProps = {
      logLoading,
      exceptionList,
      visible: exceptionLogVisible,
      onCancel: this.handleLogCancel,
    };
    // 导出接口需要的传参
    const exportBtnFilterValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    const {
      startedBefore = null,
      startedAfter = null,
      finishedBefore = null,
      finishedAfter = null,
    } = exportBtnFilterValues;
    let timeFormatter = {
      startedBefore: startedBefore ? moment(startedBefore).format(DATETIME_MAX) : null,
      startedAfter: startedAfter ? moment(startedAfter).format(DATETIME_MIN) : null,
      finishedBefore: finishedBefore ? moment(finishedBefore).format(DATETIME_MAX) : null,
      finishedAfter: finishedAfter ? moment(finishedAfter).format(DATETIME_MIN) : null,
    };
    timeFormatter = filterNullValueObject(timeFormatter);
    return (
      <>
        <Header title={intl.get('hwfp.monitor.view.message.title').d('流程监控')}>
          {isTenantRoleLevel() && (
            <>
              <ExcelExport
                buttonText={intl.get('hzero.common.process.list').d('导出流程列表')}
                otherButtonProps={{ icon: 'export' }}
                requestUrl={`${prefix}/process-srm/instance/monitor/query-export`}
                queryParams={{
                  ...exportBtnFilterValues,
                  ...timeFormatter,
                  async: 'true',
                  tenantCompanyFlag: 1,
                }}
                method="GET"
                exportAsync
                disabledAsync
                requestMode="ASYNC"
              />
              <Button icon="export" onClick={this.handleExportHistory}>
                {intl.get('hzero.common.review.history').d('导出流程明细')}
              </Button>
            </>
          )}
        </Header>
        <div className={styles.content}>
          <div className="table-list-search">
            <FilterForm {...filterProps} />
          </div>
          <div className={styles.list}>
            <ListTable {...listProps} />
          </div>
        </div>
        <EmployeeDrawer {...employeeProps} />
        {assignVisible && <AssignDrawer {...assignProps} />}
        <ExceptionMsgDrawer {...exceptionMsgProps} />
        <JumpNodeDrawer {...jumpNodeProps} />
        {exceptionLogVisible && <LogDrawer {...logDrawerProps} />}
      </>
    );
  }
}

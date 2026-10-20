/**
 * List - 流程监控
 * @date: 2018-8-20
 * @author: LZY <zhuyan.luo@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { connect } from 'dva';
import { Bind, Debounce } from 'lodash-decorators';
import { isUndefined, isEmpty } from 'lodash';
import moment from 'moment';
import { Alert } from 'choerodon-ui';
import ExcelExport from 'components/ExcelExport';

import remote from 'hzero-front/lib/utils/remote';
import { Header } from 'components/Page';
import { HZERO_HWFP } from 'utils/config';
import { menuTabEventManager } from 'utils/menuTab';
import { getCurrentOrganizationId, filterNullValueObject, isTenantRoleLevel } from 'utils/utils';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';

import { Modal } from 'choerodon-ui/pro';
import Button from 'hzero-ui/lib/button';
import { exportDetail } from '@/services/monitorService';
import FilterForm from './FilterForm';
import ListTable from './ListTable';
import AssignDrawer from './AssignDrawer';
import ExceptionMsgDrawer from './ExceptionMsgDrawer';
import JumpNodeDrawer from './JumpNodeDrawer';
import LogDrawer from './LogDrawer';
import ExportInfo from './ExportInfo';
import ProcessVariableDrawer from './ProcessVariableDrawer';
import styles from './index.less';

/**
 * 流程监控组件
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {!Object} monitor - 数据源
 * @reactProps {!Object} loading - 数据加载是否完成
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
const prefixIsSiteFlag = !isTenantRoleLevel();
const prefixTenantId = getCurrentOrganizationId();
const prefix = prefixIsSiteFlag ? `${HZERO_HWFP}/v1` : `${HZERO_HWFP}/v1/${prefixTenantId}`;

@remote({
  code: 'SWFL_MONITOR',
  name: 'processRemote',
})
@connect(({ monitor, loading }) => ({
  monitor,
  fetchListLoading: loading.effects['monitor/fetchMonitorList'],
  fetchEmployeeLoading: loading.effects['monitor/fetchEmployeeList'],
  employeeLoading: loading.effects['monitor/retryProcess'],
  jumpLoading: loading.effects['monitor/jumpProcess'],
  fetchNodeLoading: loading.effects['monitor/fetchValidNode'],
  logLoading: loading.effects['monitor/fetchProcessException'],
  processVariableLoading: loading.effects['monitor/fetchProcessVariable'],
  batchSuspendLoading: loading.effects['monitor/batchSuspend'],
  batchRestoreLoading: loading.effects['monitor/batchRestore'],
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
  ],
})
export default class List extends Component {
  form;

  tableRef = null;

  state = {
    linkLoading: false,
    currentProcessId: '',
    assignVisible: false, // 指定人弹窗
    exceptionVisible: false, // 挂起详情弹窗
    jumpNodeVisible: false, // 挂起详情弹窗
    operationRecord: {},
    validNodeList: [], // 有效节点
    jumpSelected: {},
    exceptionLogVisible: false, // 异常查看标记
    retryData: {},
    processVariableVisible: false,
    currentRecord: {},
    selectedRowKeys: [],
    selectedRows: [],
  };

  /**
   * render()调用后获取数据
   */
  componentDidMount() {
    const {
      monitor: { pagination = {} },
      location: { state: { _back } = {} },
    } = this.props;
    // 校验是否从详情页返回
    const page = isUndefined(_back) ? {} : pagination;
    // 租户级或者从详情页返回，才查询表格数据
    if (!prefixIsSiteFlag || !isUndefined(_back)) {
      this.handleSearch(page);
    }
    this.props.dispatch({ type: 'monitor/queryProcessStatus' });
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
  handleSelectRows(rowKeys, rows) {
    this.setState({
      selectedRowKeys: rowKeys,
      selectedRows: rows,
    });
  }

  @Bind()
  handleContinueProcess(record) {
    this.setState({ linkLoading: true, currentProcessId: record.encryptId });
    this.props
      .dispatch({
        type: 'monitor/continueProcess',
        payload: {
          id: record.id,
        },
      })
      .then((res) => {
        if (res) {
          notification.success({
            message: intl.get('hpfm.common.view.message.success').d('操作成功'),
          });
          this.handleSearch();
        }
      })
      .finally(() => {
        this.setState({ linkLoading: false, currentProcessId: '' });
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
    this.setState({
      selectedRowKeys: [],
      selectedRows: [],
    });
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
      ...others
    } = filterValues;
    try {
      dispatch({
        type: 'monitor/fetchMonitorList',
        payload: {
          processInstanceId,
          processDefinitionNameLike,
          startedBy,
          startedBefore: startedBefore ? moment(startedBefore).format(DATETIME_MAX) : null,
          startedAfter: startedAfter ? moment(startedAfter).format(DATETIME_MIN) : null,
          finishedBefore: finishedBefore ? moment(finishedBefore).format(DATETIME_MAX) : null,
          finishedAfter: finishedAfter ? moment(finishedAfter).format(DATETIME_MIN) : null,
          page: isEmpty(fields) ? {} : fields,
          oldTotalElements: fields.total ? fields.total : '',
          ...others,
        },
      }).then((res) => {
        if (res) {
          dispatch({
            type: 'monitor/fetchMonitorListPage',
            payload: {
              processInstanceId,
              processDefinitionNameLike,
              startedBy,
              startedBefore: startedBefore ? moment(startedBefore).format(DATETIME_MAX) : null,
              startedAfter: startedAfter ? moment(startedAfter).format(DATETIME_MIN) : null,
              finishedBefore: finishedBefore ? moment(finishedBefore).format(DATETIME_MAX) : null,
              finishedAfter: finishedAfter ? moment(finishedAfter).format(DATETIME_MIN) : null,
              page: isEmpty(fields) ? {} : fields,
              oldTotalElements: fields.total ? fields.total : '',
              needCountFlag: res.needCountFlag,
              ...others,
            },
          });
        }
      });
    } catch (error) {
      console.log(error);
    }
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
      tenantId,
    } = record;
    const tabKey = `/hwfp/monitor/detail/:id-${processDefinitionKey}`;
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
          path: `/hwfp/monitor/detail/${encryptId}`,
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
              tenantId,
            },
          },
        });
      });
    // openTab({
    //   title: processName,
    //   key: `/hwfp/monitor/detail/${encryptId}`,
    //   path: `/hwfp/monitor/detail/${encryptId}`,
    //   icon: 'edit',
    //   closable: true,
    //   state: {
    //     approveFormParams: {
    //       businessKey,
    //       formDefinitionCode,
    //       formKey,
    //       originFormKey,
    //       processDefinitionId,
    //       processDefinitionKey,
    //     },
    //   },
    // });
  }

  @Bind()
  handleSuspendedReason(processInstanceId) {
    const { dispatch, tenantId } = this.props;
    dispatch({
      type: 'monitor/fetchExceptionDetail',
      payload: {
        tenantId,
        processInstanceId,
      },
    }).then((res) => {
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
  handleOperateProcess(processInstanceId, dispatchType, comment, record) {
    if (['stopProcess', 'suspendProcess', 'resumeProcess'].indexOf(dispatchType) > -1) {
      this.setState({ linkLoading: true, currentProcessId: processInstanceId });
    }
    const {
      dispatch,
      monitor: { pagination },
    } = this.props;
    dispatch({
      type: `monitor/${dispatchType}`,
      payload: {
        tenantId: record.tenantId,
        processInstanceId,
        comment,
      },
    }).then((res) => {
      if (res) {
        notification.success();
        this.handleSearch(pagination);
      }
      if (['stopProcess', 'suspendProcess', 'resumeProcess'].indexOf(dispatchType) > -1) {
        this.setState({ linkLoading: false, currentProcessId: '' });
      }
    });
  }

  // 指定审批人
  @Bind()
  handleRetry(record) {
    this.setState({
      assignVisible: true,
      retryData: record,
    });
  }

  /**
   * 提交指定审批人
   * @param data 任务数据
   */
  @Bind()
  handleAction(data = {}) {
    const {
      dispatch,
      monitor: { pagination },
    } = this.props;
    dispatch({
      type: 'monitor/retryProcess',
      payload: data,
    }).then((res) => {
      if (res) {
        notification.success();
        this.setState({
          assignVisible: false,
        });
        this.handleSearch(pagination);
      }
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
      monitor: { pagination },
    } = this.props;
    this.handleSearch(pagination);
  }

  // 跳转节点TODO
  @Bind()
  handleJumpNode(record) {
    const { dispatch, tenantId } = this.props;
    dispatch({
      type: 'monitor/fetchValidNode',
      payload: {
        tenantId,
        processInstanceId: record.id,
      },
    }).then((res) => {
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
      type: 'monitor/fetchProcessException',
      payload: record,
    });
    this.setState({ exceptionLogVisible: true });
  }

  // 流程监控列表中查询流程变量按钮
  @Bind()
  handleProcessVariable(record) {
    this.setState({ currentRecord: record });
    const { isSiteFlag } = this.props;
    const { processDefinitionKey, id } = record;
    let queryParams = { procDefKey: processDefinitionKey, procInstId: id };
    if (isSiteFlag && record.tenantId) {
      queryParams = { ...queryParams, tenantId: record.tenantId };
    }
    this.queryProcessVariable(queryParams);
    this.setState({ processVariableVisible: true });
  }

  // 查询流程变量接口
  @Bind()
  queryProcessVariable(params) {
    const { dispatch } = this.props;
    dispatch({
      type: 'monitor/fetchProcessVariable',
      payload: { record: params },
    });
  }

  @Bind()
  handleProcessVariableCancel() {
    const { dispatch } = this.props;
    dispatch({
      type: 'monitor/updateState',
      payload: { processVariableList: [], processVariablePagination: {} },
    });
    this.setState({ processVariableVisible: false });
  }

  @Bind()
  handleLogCancel() {
    const { dispatch } = this.props;
    dispatch({
      type: 'monitor/updateState',
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
      monitor: { pagination },
    } = this.props;
    const { jumpSelected, operationRecord } = this.state;
    if (jumpSelected.nodeId) {
      const currentTaskId = operationRecord.currentTasks[0].taskId;
      dispatch({
        type: 'monitor/jumpProcess',
        payload: {
          tenantId,
          action: 'jump',
          currentTaskId,
          jumpTarget: jumpSelected.nodeId,
          jumpTargetName: jumpSelected.name,
          processInstanceId: operationRecord.id,
        },
      }).then((res) => {
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
  handleSearchTask(data = {}) {
    const { dispatch } = this.props;
    dispatch({
      type: 'monitor/fetchEmployeeList',
      payload: data,
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
          getFileName={(v) => {
            if (v) fileName = v;
          }}
          onChangeMerge={(v) => {
            merge = v !== 0;
          }}
        />
      ),
      okText: intl.get('hzero.common.button.export').d('导出'),
      onOk() {
        exportDetail({ ...exportBtnFilterValues, ...timeFormatter, fileName }, { merge });
      },
    });
  }

  @Bind()
  handleListChange(fields) {
    if (this.form) {
      this.form.validateFields((err, values) => {
        if (!err) {
          if (isEmpty(filterNullValueObject(values))) {
            notification.warning({
              message: intl
                .get('hwfp.monitor.message.tip.query.atLeast.one.condition')
                .d('请至少使用一个查询条件进行查询'),
            });
          } else {
            this.handleSearch(fields);
          }
        }
      });
    } else {
      this.handleSearch(fields);
    }
  }

  renderExtraButton = () => {
    const { processRemote } = this.props;
    if (processRemote && processRemote.render) {
      return processRemote.render('SWFL_MONITOR_HEADER_BUTTONS_RENDER', null, {
        intlCode: 'hwfp.monitor',
      });
    }
    return null;
  };

  @Debounce(200)
  @Bind()
  handleBatchSuspend() {
    const { selectedRows, selectedRowKeys } = this.state;
    if (
      !selectedRows.length ||
      selectedRows.some((r) => r.processStatus && r.processStatus !== 'APPROVAL')
    ) {
      return;
    }
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示?'),
      children: intl
        .get('hwfp.common.view.option.batchSuspend.confirm', { num: selectedRows.length })
        .d(`确认挂起${selectedRows.length}个流程吗`),
      onOk: () => {
        const { dispatch } = this.props;
        dispatch({
          type: 'monitor/batchSuspend',
          payload: selectedRowKeys,
        })
          .then((res) => {
            if (res) {
              notification.success({});
            }
          })
          .finally(() => {
            this.handleSearch();
          });
      },
    });
  }

  @Debounce(200)
  @Bind()
  handleBatchRestore() {
    const { selectedRows, selectedRowKeys } = this.state;
    if (!selectedRows.length || selectedRows.some((r) => r.processStatus !== 'SUSPENDED')) {
      return;
    }
    const { dispatch } = this.props;
    dispatch({
      type: 'monitor/batchRestore',
      payload: selectedRowKeys,
    })
      .then((res) => {
        if (res) {
          notification.success({});
        }
      })
      .finally(() => {
        this.handleSearch();
      });
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
      processVariableLoading,
      batchSuspendLoading,
      batchRestoreLoading,
      isSiteFlag,
      monitor: {
        exceptionDetail,
        employeeList,
        employeePagination,
        list = [],
        pagination,
        processStatus = [],
        exceptionList = [],
        processVariableList = [],
        processVariablePagination,
        variableTypes = [],
        sourceTypes = [],
      },
    } = this.props;
    const {
      assignVisible,
      retryData,
      exceptionVisible,
      jumpNodeVisible,
      validNodeList,
      exceptionLogVisible,
      linkLoading,
      currentProcessId,
      processVariableVisible,
      currentRecord,
      selectedRowKeys,
      selectedRows,
    } = this.state;
    const filterProps = {
      isSiteFlag,
      processStatus,
      onSearch: this.handleSearch,
      onRef: this.handleBindRef,
      onExpandForm: this.handleExpandForm,
    };
    const listProps = {
      pagination,
      isSiteFlag,
      processStatus,
      dataSource: list,
      loading: fetchListLoading,
      linkLoading,
      currentProcessId,
      onDetail: this.handleToDetail, // 流程详情
      onSuspendedReason: this.handleSuspendedReason, // 挂起详情
      onStop: this.handleOperateProcess, // 终止流程
      onSuspend: this.handleOperateProcess, // 挂起节点
      onResume: this.handleOperateProcess, // 恢复流程
      onRetry: this.handleRetry, // 指定审批人
      onChange: this.handleSearch,
      handleListChange: this.handleListChange,
      onException: this.handleExceptionLog,
      onProcessVariable: this.handleProcessVariable,
      onRef: this.handleBindTableRef,
      selectedRowKeys,
      onSelectRows: this.handleSelectRows,
      onContinue: this.handleContinueProcess,
    };

    const employeeProps = {
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

    const processVariableDrawerProps = {
      isSiteFlag,
      currentRecord,
      pagination: processVariablePagination,
      processVariablePagination,
      processVariableLoading,
      processVariableList,
      visible: processVariableVisible,
      variableTypes,
      sourceTypes,
      onCancel: this.handleProcessVariableCancel,
      onSearch: this.queryProcessVariable,
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
          {/* <Button icon="sync" onClick={() => this.handleSearch()}>
            {intl.get('hzero.common.button.reload').d('刷新')}
          </Button> */}
          {isTenantRoleLevel() && (
            <>
              <ExcelExport
                buttonText={intl.get('hzero.common.process.list').d('导出流程列表')}
                otherButtonProps={{ icon: 'export' }}
                requestUrl={`${prefix}/process/instance/monitor/query-export`}
                queryParams={{
                  ...exportBtnFilterValues,
                  ...timeFormatter,
                  async: 'true',
                }}
                method="GET"
                exportAsync
                disabledAsync
                requestMode="ASYNC"
              />
              <Button icon="export" onClick={this.handleExportHistory}>
                {intl.get('hzero.common.review.history').d('导出流程明细')}
              </Button>
              <Button
                disabled={
                  !selectedRows.length ||
                  selectedRows.some((r) => r.processStatus && r.processStatus !== 'APPROVAL')
                }
                loading={batchSuspendLoading}
                onClick={this.handleBatchSuspend}
              >
                {intl.get('hwfp.common.view.option.batchSuspend').d('批量挂起')}
              </Button>
              <Button
                disabled={
                  !selectedRows.length || selectedRows.some((r) => r.processStatus !== 'SUSPENDED')
                }
                loading={batchRestoreLoading}
                onClick={this.handleBatchRestore}
              >
                {intl.get('hwfp.common.view.option.batchRestore').d('批量恢复')}
              </Button>
            </>
          )}
          {this.renderExtraButton()}
        </Header>
        <div className={styles.content}>
          <div style={{ marginBottom: '16px' }}>
            <Alert
              message={intl
                .get('hwfp.monitor.message.query.atLeast.one.condition')
                .d('请至少使用一个查询条件进行查询')}
              type="info"
              closable
              showIcon
              className={styles.alert}
            />
          </div>
          <FilterForm {...filterProps} />
          <div className={styles.list}>
            <ListTable {...listProps} />
          </div>
        </div>
        {assignVisible && <AssignDrawer {...employeeProps} />}
        <ExceptionMsgDrawer {...exceptionMsgProps} />
        <JumpNodeDrawer {...jumpNodeProps} />
        {exceptionLogVisible && <LogDrawer {...logDrawerProps} />}
        {processVariableVisible && <ProcessVariableDrawer {...processVariableDrawerProps} />}
      </>
    );
  }
}

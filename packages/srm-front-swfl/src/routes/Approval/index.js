/*
 * @Descripttion:审批工作台：整合了原来的【我的待办事项】，【我发起的流程】，【我参与的流程】，【我的抄送流程】
 * @Date: 2021-05-12 14:34:34
 * @Author: xshen <xia.shen@going-link.com>
 * @version:
 * @copyright: Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import { isFunction, omit, isEmpty } from 'lodash';
import { Button } from 'hzero-ui';
import { Tabs } from 'choerodon-ui';
import { DataSet, Modal, notification as c7nNotification } from 'choerodon-ui/pro';

import remote from 'hzero-front/lib/utils/remote';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import {
  getResponse,
  getCurrentOrganizationId,
  filterNullValueObject,
  getCurrentLanguage,
} from 'utils/utils';
import { HZERO_HWFP } from 'utils/config';
import notification from 'utils/notification';
import withProps from 'utils/withProps';
import { Button as ButtonPermission } from 'components/Permission';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import {
  fetchNewTaskCategoryList,
  fetchFavorStatus,
  updateFavorStatus,
  getProcessDefineConfig,
} from '@/services/taskService';
import { fetchNewInvolvedTaskCategoryList } from '@/services/involvedTaskService';
import {
  fetchNewStartByTaskCategoryList,
  fetchProcessRushFlag,
} from '@/services/startByTaskService';
import {
  fetchNewCarbonCopyTaskCategoryList,
  exportApproveTask,
  exportToDoTask,
} from '@/services/carbonCopyTaskService';

import { listTableDS } from '@/stores/startByTaskDS';
import ExcelExportApproval from './ExcelExportApproval';
import styles from './index.less';
import Task from './Task/List';
import InvolvedTask from './InvolvedTask/List';
import CarbonCopyTask from './CarbonCopyTask/List';
import StartByTask from './StartByTask/List';
import ApproveSetting from './ApproveSetting';

const prefix = `${HZERO_HWFP}/v1`;
const { TabPane, TabGroup } = Tabs;

@remote({
  code: 'SWFL_APPROVAL_WORKBENCH',
  name: 'processRemote',
})
@connect(({ approval, global, task, involvedTask, startByTask }) => ({
  approval,
  global,
  task,
  involvedTask,
  startByTask,
}))
@formatterCollections({
  code: [
    'hwfp.task',
    'hwfp.common',
    'hpfm.organization',
    'hwfp.automaticProcess',
    'hwfp.delegate',
    'hwfp.carbonCopyTask',
    'hwfp.involvedTask',
    'swfl.common',
  ],
})
@withProps((props) => {
  const dsProps = listTableDS();
  const remoteDsProps = props.remote
    ? props.remote.process('SWFL_APPROVAL_WORKBENCH_BASE_LIST_TABLE', dsProps, {})
    : dsProps;
  const tableDs = new DataSet(remoteDsProps);
  return { tableDs };
}, {})
@withCustomize({
  unitCode: [
    'HWFP.APPROVAL_TABLE_UNIT_GROUP.NOT_APPROVED',
    'HWFP.APPROVAL_TABLE_UNIT_GROUP.APPROVED',
    'HWFP.APPROVAL_TABLE_UNIT_GROUP.CC',
    'HWFP.APPROVAL_TABLE_UNIT_GROUP.STARTEDBY',
  ],
})
export default class Approval extends Component {
  constructor(props) {
    super(props);
    this.taskRef = null;
    this.involvedRef = null;
    this.ccCopyRef = null;
    this.startByRef = null;
    this.state = {
      titleSelected: 'task', // task--待审批（默认选中），involved--已审批，carbonCopy--抄送
      taskCount: null,
      taskDocument: [],
      involvedCount: null,
      involvedDocument: [],
      carbonCopyCount: null,
      carbonCopyDocument: [],
      startByCount: null,
      startByDocument: [],
      containerRef: null,
      rushFlag: true,
      rushDisabled: true,
      exportLoading: false,
      activeKey: 'task',
      autoQueryParas: {},
      urlActiveKey: '',
      defaultDocumentId: '',
      processModelId: '',
      autoOpenNextObj: { autoOpenNextItemFlag: 1 },
      exportSelectFlag: false, // 导出按钮的显示
      remote: props.processRemote,
    };
  }

  // base64解码
  getDecodeObj = (str) => {
    let result = {};
    try {
      if (str) {
        const decodeString = window.decodeURIComponent(
          escape(window.atob(window.decodeURIComponent(str)))
        );
        result = JSON.parse(decodeString);
      }
    } catch (error) {
      console.log(error);
      result = {};
    }
    return result;
  };

  queryToObj = (str) => {
    if (!str) {
      return {};
    }
    const result = {};
    const strToArray = str.split('&');
    strToArray.map((v) => {
      const [key, value] = v.split('=');
      result[key] = value;
      return v;
    });
    return result;
  };

  componentDidMount = () => {
    // 有ref值时，赋值
    this.setState({ containerRef: this.containerRef });
    this.queryTableNum();
    this.props.tableDs.addEventListener('select', this.handleProcessSelect);
    this.props.tableDs.addEventListener('unSelect', this.handleProcessSelect);
    this.props.tableDs.addEventListener('selectAll', this.handleProcessSelect);
    this.props.tableDs.addEventListener('unSelectAll', this.handleProcessSelect);
    fetchFavorStatus()
      .then((obj) => {
        this.setState({
          autoOpenNextObj: { ...obj, autoOpenNextItemFlag: obj.autoOpenNextItemFlag ?? 1 },
        });
      })
      .catch((error) => console.log(error));
    const {
      location: { search = '' },
    } = this.props;
    if (search) {
      const {
        defaultTabIndex = '',
        defaultFilters = '',
        defaultDocumentId = '',
        defaultProcessModelId = '',
      } = this.queryToObj(search.substr(1));
      const urlParams = filterNullValueObject({
        defaultTabIndex,
        defaultFilters,
        defaultDocumentId,
        defaultProcessModelId,
      });
      this.queryUrlFilterParas(urlParams);
    }
    // 查询流程配置
    this.fetchProcessDefineConfig();
  };

  componentWillReceiveProps = (nextProps) => {
    const {
      location: { search = '' },
    } = this.props;
    const {
      location: { search: nextSearch = '' },
    } = nextProps;
    if (nextSearch) {
      const { uselessParam = '' } = this.queryToObj(search.substr(1));
      const {
        defaultTabIndex = '',
        defaultFilters = '',
        uselessParam: nextUselessParam = '',
        defaultDocumentId = '',
        defaultProcessModelId = '',
      } = this.queryToObj(nextSearch.substr(1));
      if (uselessParam !== nextUselessParam) {
        const urlParams = filterNullValueObject({
          defaultTabIndex,
          defaultFilters,
          defaultDocumentId,
          defaultProcessModelId,
        });
        this.queryUrlFilterParas(urlParams);
      }
    }
  };

  // 查询按钮气泡提示
  fetchProcessDefineConfig = () => {
    const { dispatch } = this.props;
    getProcessDefineConfig().then((res) => {
      if (getResponse(res)) {
        const {
          approvalActionSeqDataMap,
          approvalActionTooltipMap: approvalActionTooltipMapTmp,
          labelConfList,
          msgTabCloseFlag,
          stepRebutFlag,
        } = res;
        const currentLang = getCurrentLanguage();
        let approvalActionSeqMap = {};
        const approvalActionTooltipMap = {};
        if (approvalActionSeqDataMap) {
          Object.keys(approvalActionSeqDataMap).forEach((item) => {
            // 全部转成小写，保证action统一
            approvalActionSeqMap[item.toLocaleLowerCase()] = Number(approvalActionSeqDataMap[item]);
          });
        } else {
          approvalActionSeqMap = {
            approved: 1,
            rejected: 2,
            more: 3,
          };
        }
        if (approvalActionTooltipMapTmp) {
          Object.keys(approvalActionTooltipMapTmp).forEach((item) => {
            // 全部转成小写，保证action统一
            if (
              approvalActionTooltipMapTmp[item] &&
              approvalActionTooltipMapTmp[item][currentLang]
            );
            approvalActionTooltipMap[item.toLocaleLowerCase()] =
              approvalActionTooltipMapTmp[item][currentLang];
          });
        }
        dispatch({
          type: 'task/updateState',
          payload: {
            approvalActionSeqMap,
            approvalActionTooltipMap,
            processTag: labelConfList,
            msgTabCloseFlag,
            stepRebutFlag: stepRebutFlag === 1,
          },
        });
        dispatch({
          type: 'startByTask/updateState',
          payload: { approvalActionTooltipMap },
        });
        dispatch({
          type: 'involvedTask/updateState',
          payload: { approvalActionTooltipMap },
        });
      }
    });
  };

  queryUrlFilterParas = (urlParams) => {
    if (!isEmpty(urlParams)) {
      if (urlParams.defaultTabIndex) {
        this.setState({
          activeKey: urlParams.defaultTabIndex,
          urlActiveKey: urlParams.defaultTabIndex,
          defaultDocumentId: urlParams.defaultDocumentId,
          processModelId: urlParams.defaultProcessModelId,
        });
      }
      if (!isEmpty(urlParams.defaultFilters)) {
        const autoQueryParas = this.getDecodeObj(urlParams.defaultFilters);
        this.setState({ autoQueryParas });
      }
    }
  };

  queryTableTaskNum = () => {
    fetchNewTaskCategoryList().then((res) => {
      const result = getResponse(res);
      let taskSum = 0;
      let taskDocument = [];
      if (res && res.length) {
        taskDocument = res;
        result.map((item) => {
          taskSum += item.count;
          return taskSum;
        });
      }
      this.setState({ taskDocument, taskCount: taskSum });
    });
  };

  queryTableStartByNum = () => {
    fetchNewStartByTaskCategoryList().then((res) => {
      const result = getResponse(res);
      let startByDocument = [];
      let taskSum = 0;
      if (res && res.length) {
        startByDocument = res;
        result.map((item) => {
          taskSum += item.count;
          return taskSum;
        });
      }
      this.setState({ startByDocument, startByCount: taskSum });
    });
  };

  queryTableInvolvedNum = () => {
    fetchNewInvolvedTaskCategoryList().then((res) => {
      const result = getResponse(res);
      let taskSum = 0;
      let involvedDocument = [];
      if (res && res.length) {
        involvedDocument = res;
        result.map((item) => {
          taskSum += item.count;
          return taskSum;
        });
      }
      this.setState({ involvedDocument, involvedCount: taskSum });
    });
  };

  queryTableCarbonCopyNum = () => {
    fetchNewCarbonCopyTaskCategoryList().then((res) => {
      const result = getResponse(res);
      let taskSum = 0;
      let carbonCopyDocument = [];
      if (res && res.length) {
        carbonCopyDocument = res;
        result.map((item) => {
          taskSum += item.count;
          return taskSum;
        });
      }
      this.setState({ carbonCopyDocument, carbonCopyCount: taskSum });
    });
  };

  queryTableNum = (key = '') => {
    if (key === 'involved') {
      // 已审批树目录查询
      this.queryTableInvolvedNum();
    } else if (key === 'carbonCopy') {
      // 抄送我树目录查询
      this.queryTableCarbonCopyNum();
    } else if (key === 'startBy') {
      // 我发起树目录查询
      this.queryTableStartByNum();
    } else if (key === 'task') {
      // 待审批树目录查询
      this.queryTableTaskNum();
    } else {
      this.queryTableInvolvedNum();
      this.queryTableCarbonCopyNum();
      this.queryTableStartByNum();
      this.queryTableTaskNum();
    }
  };

  changeStatus = async (newStatus) => {
    const { autoOpenNextObj } = this.state;
    const autoOpenNextItemFlag = newStatus ? 1 : 0;
    const res = await updateFavorStatus({ ...autoOpenNextObj, autoOpenNextItemFlag });
    if (getResponse(res)) {
      const response = await fetchFavorStatus();
      if (getResponse(response) && response) {
        notification.success();
        this.setState({
          autoOpenNextObj: { ...response, autoOpenNextItemFlag },
        });
      }
    }
  };

  // 打开审批设置
  openApproveSetting = () => {
    const { autoOpenNextObj } = this.state;
    const modal = Modal.open({
      title: `${intl.get('hwfp.common.view.title.approve_setting').d('审批设置')}`,
      closable: true,
      maskClosable: true,
      distroyOnClose: true,
      drawer: true,
      footer: null,
      children: (
        <ApproveSetting
          handleCancel={handleCancel}
          status={autoOpenNextObj?.autoOpenNextItemFlag ?? 1}
          onChange={this.changeStatus}
        />
      ),
      className: 'setting-drawer',
    });

    function handleCancel() {
      modal.close();
    }
  };

  handleTabGroup = (key, oldKey) => {
    const keyObj = {
      task: 'taskRef',
      involved: 'involvedRef',
      carbonCopy: 'ccCopyRef',
      startBy: 'startByRef',
    };
    if (this[keyObj[key]]) {
      // 切换tab时查询表格数据
      this[keyObj[key]].handleSearch();
    }
    // 切换tab关闭详情页
    if (this[keyObj[oldKey]]) {
      this[keyObj[oldKey]].handleCloseModal();
    }
    this.setState({ titleSelected: key });
  };

  // 我发起勾选流程时判断按钮显示加急还是取消加急，以及是否可选
  handleProcessSelect = ({ dataSet }) => {
    const selectedRows = dataSet.selected;
    let selectedFlag = '';
    if (selectedRows.length === 0) {
      // 未勾选，禁用
      this.setState({ rushDisabled: true });
      this.changeExportSelectFlag(false);
    } else {
      this.setState({ rushDisabled: false });
      this.changeExportSelectFlag(true);
    }
    for (const item of selectedRows) {
      const newRushFlag = item.get('rushFlag');
      if (selectedFlag === '') {
        selectedFlag = newRushFlag;
      } else if (selectedFlag !== newRushFlag) {
        // 加急未加急同时勾选时，按钮禁用
        this.setState({ rushDisabled: true });
        return;
      }
    }
    this.setState({ rushFlag: selectedFlag === '' || !selectedFlag });
  };

  handleRushFlag = () => {
    const { rushFlag } = this.state;
    const selectedRows = this.props.tableDs.selected;
    const processArr = [];
    selectedRows.map((item) => processArr.push(item.get('id')));
    const params = { rushFlag: rushFlag ? 1 : 0, processId: processArr };
    fetchProcessRushFlag(params).then((res) => {
      const result = getResponse(res);
      if (result) {
        notification.success();
        this.startByRef.handleSearch();
      }
    });
  };

  updateNumber = (key) => {
    if (key === 'involved') {
      if (this.involvedRef && isFunction(this.involvedRef.refreshNumber)) {
        this.involvedRef.refreshNumber();
      }
    } else if (key === 'carbonCopy') {
      if (this.ccCopyRef && isFunction(this.ccCopyRef.refreshNumber)) {
        this.ccCopyRef.refreshNumber();
      }
    } else if (key === 'startBy') {
      if (this.startByRef && isFunction(this.startByRef.refreshNumber)) {
        this.startByRef.refreshNumber();
      }
    } else if (key === 'task') {
      if (this.taskRef && isFunction(this.taskRef.refreshTreeNumber)) {
        this.taskRef.refreshTreeNumber();
      }
    }
  };

  /**
   * 导出
   */
  exportApproveList = ({ fileName: customizeFileName = '', merge }) => {
    const { titleSelected } = this.state;
    this.setState({
      exportLoading: true,
    });
    const startByDs = this.props.tableDs;
    const involvedDS = this.involvedRef && this.involvedRef.props && this.involvedRef.props.tableDs;
    const taskDS = this.taskRef && this.taskRef.props && this.taskRef.props.tableDs;
    const carbonCopyDS = this.ccCopyRef && this.ccCopyRef.props && this.ccCopyRef.props.tableDs;
    let emptyFlag = false; // 当前ds是否为空
    let processInstanceIds; // 导出数据ids
    let queryFrom; // 查询form表单
    let fileName = customizeFileName; // 导出文件名
    if (titleSelected === 'startBy') {
      const startBySelected = startByDs.selected || [];
      processInstanceIds = startBySelected.map((record) => record.get('id'));
      queryFrom = startByDs.getQueryParameter('queryParams');
      queryFrom.startedByFlag = true;
      emptyFlag = startByDs.toData() && startByDs.toData().length === 0;
      if (!fileName) {
        fileName = intl
          .get('hwfp.common.model.initiate.process.instance.export')
          .d('我发起流程实例数据导出');
      }
    } else if (titleSelected === 'involved') {
      const involvedSelected = involvedDS.selected || [];
      processInstanceIds = involvedSelected.map((record) => record.get('id'));
      queryFrom = involvedDS.getQueryParameter('queryParams');
      emptyFlag = involvedDS.toData() && involvedDS.toData().length === 0;
      if (!fileName) {
        fileName = intl
          .get('hwfp.common.model.approved.process.instance.export')
          .d('已审批流程实例数据导出');
      }
    } else if (titleSelected === 'task') {
      const taskSelected = taskDS.selected || [];
      processInstanceIds = taskSelected.map((record) => record.get('processInstanceId'));
      queryFrom = taskDS.getQueryParameter('queryParams');
      emptyFlag = taskDS.toData() && taskDS.toData().length === 0;
      if (!fileName) {
        fileName = intl
          .get('hwfp.common.model.task.process.instance.export')
          .d('待审批流程实例数据导出');
      }
    } else if (titleSelected === 'carbonCopy') {
      const carbonCopySelected = carbonCopyDS.selected || [];
      processInstanceIds = carbonCopySelected.map((record) => record.get('id'));
      queryFrom = carbonCopyDS.getQueryParameter('queryParams');
      emptyFlag = carbonCopyDS.toData() && carbonCopyDS.toData().length === 0;
      if (!fileName) {
        fileName = intl
          .get('hwfp.common.model.carbonCopy.process.instance.export')
          .d('抄送我流程实例数据导出');
      }
    } else {
      processInstanceIds = [];
      queryFrom = {};
      emptyFlag = false;
    }
    if (emptyFlag) {
      this.setState({
        exportLoading: false,
      });
      c7nNotification.error({
        message: intl.get('hwfp.common.view.notice.error.export').d('当前无数据可导出'),
      });
    } else {
      if (titleSelected === 'task') {
        // 待审批导出接口
        exportToDoTask({
          processInstanceIds,
          fileName,
          exportType: 'DATA',
          queryFrom: omit(queryFrom, ['page']),
          merge,
        })
          .then((res) => {
            if (getResponse(res)) {
              c7nNotification.success({
                message: intl.get('hzero.common.notification.success').d('操作成功'),
              });
            }
          })
          .finally(() => {
            this.setState({
              exportLoading: false,
            });
          });
      } else {
        const customizeUnitCodeMap = {
          startedBy:
            'HWFP.APPROVAL_TABLE_UNIT_GROUP.STARTEDBY,HWFP.APPROVAL_WORKBENCH_LIST.STARTEDBY.FILTER',
          involved:
            'HWFP.APPROVAL_TABLE_UNIT_GROUP.APPROVED,HWFP.APPROVAL_WORKBENCH_LIST.INVOLVED_TASK.FILTER',
          carbonCopy: 'HWFP.APPROVAL_TABLE_UNIT_GROUP.CC,HWFP.APPROVAL_WORKBENCH_LIST.CC_FILTER',
        };
        const type = titleSelected === 'startBy' ? 'startedBy' : titleSelected;
        exportApproveTask({
          [type]: true,
          processInstanceIds,
          fileName,
          exportType: 'DATA',
          queryFrom: omit(queryFrom, ['page']),
          customizeUnitCode: customizeUnitCodeMap[type],
          merge,
        })
          .then((res) => {
            if (getResponse(res)) {
              c7nNotification.success({
                message: intl.get('hzero.common.notification.success').d('操作成功'),
              });
            }
          })
          .finally(() => {
            this.setState({
              exportLoading: false,
            });
          });
      }
      return true;
    }
  };

  // 用于导出按钮显示是否已经勾选table
  changeExportSelectFlag = (value) => {
    this.setState({ exportSelectFlag: value });
  };

  exportButtonText = () => {
    const { exportSelectFlag } = this.state;
    if (exportSelectFlag) {
      return intl.get('hzero.common.button.exportSelect').d('勾选导出');
    } else {
      return intl.get('hzero.common.export').d('导出');
    }
  };

  renderExtraButton = () => {
    const { activeKey } = this.state;
    const { processRemote } = this.props;
    if (processRemote && processRemote.render) {
      return processRemote.render('SWFL_APPROVAL_WORKBENCH_HEADER_BUTTONS_RENDER', null, {
        activeKey,
        intlCode: 'hwfp.task',
      });
    }
    return null;
  };

  renderFooterExtraButtons = () => {
    const { activeKey } = this.state;
    const { processRemote } = this.props;
    const refMap = {
      task: this.taskRef,
      involved: this.involvedRef,
      carbonCopy: this.ccCopyRef,
      startBy: this.startByRef,
    };
    const currentTabRef = refMap[activeKey];
    if (processRemote && processRemote.render) {
      return processRemote.render('SWFL_APPROVAL_WORKBENCH_FOOTER_BUTTONS_RENDER', null, {
        activeKey,
        intlCode: 'hwfp.task',
        tabRef: currentTabRef,
      });
    }
    return null;
  };

  handleTreeNodeSelect = (params) => {
    const {
      processRemote: { event },
    } = this.props;
    const eventProps = {
      /* 需要传递的自定义事件属性 */
      ...params,
    };
    console.log('clickTreeNodeChange', this.props);
    event.fireEvent('clickTreeNodeChange', eventProps);
  };

  render() {
    const {
      titleSelected,
      taskCount,
      involvedCount,
      carbonCopyCount,
      startByCount,
      containerRef,
      rushFlag,
      rushDisabled,
      exportLoading,
      activeKey,
      autoQueryParas,
      urlActiveKey,
      defaultDocumentId = '',
      processModelId = '',
      carbonCopyDocument,
      involvedDocument,
      startByDocument,
      taskDocument,
    } = this.state;
    const { match, location, tableDs, customizeTable, custConfig, processRemote } = this.props;

    return (
      <div
        ref={(ref) => {
          this.containerRef = ref;
        }}
        className="swfl-approval-workbench"
        style={{
          height: '100%',
          // height: 'calc(100vh - 0.35rem - 0.48rem)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Header title={intl.get('hwfp.common.view.title.approve_workbench').d('审批工作台')}>
          <Button
            icon="setting"
            onClick={() => this.openApproveSetting()}
            className={styles['approve-setting']}
          >
            {intl.get('hwfp.common.view.title.approve_setting').d('审批设置')}
          </Button>
          {titleSelected === 'startBy' && (
            <ButtonPermission
              type="c7n-pro"
              className={styles['approve-setting']}
              permissionList={[
                {
                  code: `${match.path}.button.rush_process`,
                  type: 'button',
                  meaning: '我发起的流程加急',
                },
              ]}
              funcType="raised"
              color="default"
              icon={rushFlag ? 'flash_on' : 'flash_off'}
              onClick={this.handleRushFlag}
              disabled={rushDisabled}
            >
              {rushFlag
                ? intl.get('hwfp.common.view.title.rush.process').d('流程加急')
                : intl.get('hwfp.common.view.title.cancel.rush').d('取消加急')}
            </ButtonPermission>
          )}
          {titleSelected === 'task' && (
            <ButtonPermission
              style={{ border: 'none', paddingLeft: 0, paddingRight: 0 }}
              loading={false}
              permissionList={[
                {
                  code: `hzero.wp.self.approval-workbenck.button.task_export`,
                  type: 'button',
                },
              ]}
            >
              <ExcelExportApproval
                requestUrl={`${prefix}/${getCurrentOrganizationId()}/activiti/task/todo-proc/export?exportType=COLUMN&customizeUnitCode=HWFP.APPROVAL_TABLE_UNIT_GROUP.NOT_APPROVED`}
                unMergeRequestUrl={`${prefix}/${getCurrentOrganizationId()}/activiti/task/todo-proc/export/un-merge?exportType=COLUMN&customizeUnitCode=HWFP.APPROVAL_TABLE_UNIT_GROUP.NOT_APPROVED`}
                method="POST"
                handleExport={this.exportApproveList}
                otherButtonProps={{
                  loading: exportLoading,
                  style: {
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    letterSpacing: 'normal',
                    margin: 0,
                  },
                }}
                buttonText={this.exportButtonText()}
              />
            </ButtonPermission>
          )}
          {titleSelected === 'involved' && (
            <ButtonPermission
              style={{ border: 'none', paddingLeft: 0, paddingRight: 0 }}
              loading={false}
              permissionList={[
                {
                  code: `hzero.wp.self.approval-workbenck.button.involved_export`,
                  type: 'button',
                },
              ]}
            >
              <ExcelExportApproval
                requestUrl={`${prefix}/${getCurrentOrganizationId()}/process/instance/export?exportType=COLUMN&customizeUnitCode=HWFP.APPROVAL_TABLE_UNIT_GROUP.APPROVED`}
                unMergeRequestUrl={`${prefix}/${getCurrentOrganizationId()}/process/instance/export/un-merge?exportType=COLUMN&customizeUnitCode=HWFP.APPROVAL_TABLE_UNIT_GROUP.APPROVED`}
                method="POST"
                handleExport={this.exportApproveList}
                otherButtonProps={{
                  loading: exportLoading,
                  style: {
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    letterSpacing: 'normal',
                    margin: 0,
                  },
                }}
                buttonText={this.exportButtonText()}
              />
            </ButtonPermission>
          )}
          {titleSelected === 'carbonCopy' && (
            <ButtonPermission
              style={{ border: 'none', paddingLeft: 0, paddingRight: 0 }}
              loading={false}
              permissionList={[
                {
                  code: `hzero.wp.self.approval-workbenck.button.carbonCopy_export`,
                  type: 'button',
                },
              ]}
            >
              <ExcelExportApproval
                requestUrl={`${prefix}/${getCurrentOrganizationId()}/process/instance/export?exportType=COLUMN&customizeUnitCode=HWFP.APPROVAL_TABLE_UNIT_GROUP.CC`}
                unMergeRequestUrl={`${prefix}/${getCurrentOrganizationId()}/process/instance/export/un-merge?exportType=COLUMN&customizeUnitCode=HWFP.APPROVAL_TABLE_UNIT_GROUP.CC`}
                method="POST"
                handleExport={this.exportApproveList}
                otherButtonProps={{
                  loading: exportLoading,
                  style: {
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    letterSpacing: 'normal',
                    margin: 0,
                  },
                }}
                buttonText={this.exportButtonText()}
              />
            </ButtonPermission>
          )}
          {titleSelected === 'startBy' && (
            <ButtonPermission
              style={{ border: 'none', paddingLeft: 0, paddingRight: 0 }}
              loading={false}
              permissionList={[
                {
                  code: `hzero.wp.self.approval-workbenck.button.startBy_export`,
                  type: 'button',
                },
              ]}
            >
              <ExcelExportApproval
                requestUrl={`${prefix}/${getCurrentOrganizationId()}/process/instance/export?exportType=COLUMN&customizeUnitCode=HWFP.APPROVAL_TABLE_UNIT_GROUP.STARTEDBY`}
                unMergeRequestUrl={`${prefix}/${getCurrentOrganizationId()}/process/instance/export/un-merge?exportType=COLUMN&customizeUnitCode=HWFP.APPROVAL_TABLE_UNIT_GROUP.STARTEDBY`}
                method="POST"
                handleExport={this.exportApproveList}
                otherButtonProps={{
                  loading: exportLoading,
                  style: {
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    letterSpacing: 'normal',
                    margin: 0,
                  },
                }}
                buttonText={this.exportButtonText()}
              />
            </ButtonPermission>
          )}
          {/* {(titleSelected === 'involved' || titleSelected === 'startBy') && (
            <Button
              icon="export"
              loading={exportLoading}
              className={styles['approve-setting']}
              onClick={() => this.exportApproveList()}
            >
              {intl.get('hzero.common.button.export').d('导出')}
            </Button>
          )} */}
          {this.renderExtraButton()}
        </Header>
        <Content wrapperClassName={styles['content-wrapper']}>
          <div className={styles.content}>
            <div className={styles['content-container']}>
              <div className={styles['double-tabs']}>
                <Tabs
                  flex
                  keyboard={false}
                  activeKey={activeKey}
                  tabPosition="top"
                  onChange={(key) => {
                    this.setState({ activeKey: key });
                    this.handleTabGroup(key, titleSelected);
                    this.queryTableNum(key);
                    this.changeExportSelectFlag(false);
                  }}
                  customizable
                  customizedCode="SWFL.APPROVAL_WORKBENCH.HEADER"
                >
                  <TabGroup
                    tab={intl.get('hwfp.common.view.title.approval').d('我审批的')}
                    node="approval"
                  >
                    <TabPane
                      tab={intl.get('hwfp.common.view.title.pending').d('待审批')}
                      key="task"
                      count={taskCount}
                    >
                      <Task
                        match={match}
                        location={location}
                        onRef={(ref) => {
                          this.taskRef = ref;
                        }}
                        customizeTable={customizeTable}
                        containerRef={containerRef}
                        queryTableNum={this.queryTableTaskNum}
                        autoQueryParas={autoQueryParas}
                        urlActiveKey={urlActiveKey}
                        defaultDocumentId={defaultDocumentId}
                        processModelId={processModelId}
                        // 是否自动处理下一任务
                        handleNext={this?.state?.autoOpenNextObj?.autoOpenNextItemFlag}
                        changeExportSelectFlag={this.changeExportSelectFlag}
                        custConfig={custConfig}
                        document={taskDocument}
                        handleTreeNodeSelect={this.handleTreeNodeSelect}
                        remote={this.state.remote}
                        renderFooterExtraButtons={this.renderFooterExtraButtons}
                      />
                    </TabPane>
                    <TabPane
                      tab={intl.get('hwfp.common.view.title.approved').d('已审批')}
                      key="involved"
                      count={involvedCount}
                    >
                      <InvolvedTask
                        match={match}
                        location={location}
                        onRef={(ref) => {
                          this.involvedRef = ref;
                        }}
                        customizeTable={customizeTable}
                        containerRef={containerRef}
                        autoQueryParas={autoQueryParas}
                        urlActiveKey={urlActiveKey}
                        defaultDocumentId={defaultDocumentId}
                        processModelId={processModelId}
                        changeExportSelectFlag={this.changeExportSelectFlag}
                        custConfig={custConfig}
                        document={involvedDocument}
                        handleTreeNodeSelect={this.handleTreeNodeSelect}
                        remote={this.state.remote}
                      />
                    </TabPane>
                    <TabPane
                      tab={intl.get('hwfp.common.view.title.cc_process').d('抄送我')}
                      key="carbonCopy"
                      count={carbonCopyCount}
                    >
                      <CarbonCopyTask
                        match={match}
                        location={location}
                        onRef={(ref) => {
                          this.ccCopyRef = ref;
                        }}
                        customizeTable={customizeTable}
                        containerRef={containerRef}
                        autoQueryParas={autoQueryParas}
                        urlActiveKey={urlActiveKey}
                        defaultDocumentId={defaultDocumentId}
                        processModelId={processModelId}
                        changeExportSelectFlag={this.changeExportSelectFlag}
                        custConfig={custConfig}
                        document={carbonCopyDocument}
                        handleTreeNodeSelect={this.handleTreeNodeSelect}
                        remote={this.state.remote}
                      />
                    </TabPane>
                  </TabGroup>
                  <TabGroup
                    tab={intl.get('hwfp.common.view.title.createdByYou').d('我发起的')}
                    node="startBy"
                  >
                    <TabPane
                      tab={intl.get('hwfp.common.view.title.initiated').d('我发起')}
                      key="startBy"
                      count={startByCount}
                    >
                      <StartByTask
                        match={match}
                        location={location}
                        onRef={(ref) => {
                          this.startByRef = ref;
                        }}
                        customizeTable={customizeTable}
                        containerRef={containerRef}
                        tableDs={tableDs}
                        autoQueryParas={autoQueryParas}
                        urlActiveKey={urlActiveKey}
                        defaultDocumentId={defaultDocumentId}
                        processModelId={processModelId}
                        custConfig={custConfig}
                        document={startByDocument}
                        processRemote={processRemote}
                        handleTreeNodeSelect={this.handleTreeNodeSelect}
                      />
                    </TabPane>
                  </TabGroup>
                </Tabs>
              </div>
            </div>
          </div>
        </Content>
      </div>
    );
  }
}

/* eslint-disable no-param-reassign */
import React, { PureComponent } from 'react';
import { Tag } from 'hzero-ui';
import {
  Modal,
  Button,
  DataSet,
  TextArea,
  Form,
  notification as C7nNotification,
  Tooltip,
} from 'choerodon-ui/pro';
import { Text, Popover, Icon } from 'choerodon-ui';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { isEmpty, isNil } from 'lodash';

import { dateTimeRender } from 'utils/renderer';
import notification from 'utils/notification';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { openTab } from 'utils/menuTab';
import { getCurrentOrganizationId } from 'utils/utils';
import ApprovalReply from 'srm-front-boot/lib/components/ApprovalReply';
import ContactLov from 'srm-front-boot/lib/components/ContactLov';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import MultipleTextSplitInput from 'srm-front-boot/lib/components/MultipleTextSplitInput';

import { processStatusRender, isJSON, ResignedDisplay } from '@/utils/util';
import { setCarbonCopy } from '@/services/involvedTaskService';
import Store from '@/components/UpdateModal/Store';
import Detail from '../Detail';
import styles from './index.less';
import { INVOLVED_TASK_TAB_DRAWER_ID } from '../../utils';

const tenantId = getCurrentOrganizationId();
const modalKey = Modal.key();

/**
 * 参与流程数据列表
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} onChange - 分页查询
 * @reactProps {Boolean} loading - 数据加载完成标记
 * @reactProps {Array} dataSource - Table数据源
 * @reactProps {Object} pagination - 分页器
 * @reactProps {Number} pagination.current - 当前页码
 * @reactProps {Number} pagination.pageSize - 分页大小
 * @reactProps {Number} pagination.total - 数据总量
 * @return React.element
 */
@connect(({ involvedTask, loading }) => ({
  involvedTask,
  forecastLoading: loading.effects['involvedTask/fetchForecast'],
}))
@formatterCollections({
  code: [
    'hwfp.involvedTask',
    'hwfp.common',
    'hzero.common',
    'entity.position',
    'entity.department',
    'hwfp.task',
    'hpfm.organization',
  ],
})
export default class ListTable extends PureComponent {
  static contextType = Store;

  constructor(props) {
    super(props);
    props.onRef(this);
    this.flowChartDrawerRef = null;
    this.state = {
      tableAggregation: true,
    };
  }

  @Bind()
  onSetCarbonCopy(ds, record, resolve) {
    const id = record.get('id');
    ds.validate().then((response) => {
      if (response) {
        const { addCc = [], appendComment } = ds.current
          ? ds.current.get(['addCc', 'appendComment'])
          : {};
        const employeeNum = [];
        addCc.forEach((item) => {
          employeeNum.push(item.code);
        });
        setCarbonCopy({
          processInstanceId: id,
          employees: employeeNum,
          appendComment,
          type: 'involved',
        })
          .then((res) => {
            if (isEmpty(res)) {
              notification.success();
              resolve(true);
            } else {
              if (isJSON(res)) {
                const { message } = JSON.parse(res);
                C7nNotification.warning({
                  message,
                });
              } else {
                C7nNotification.warning({
                  message: res,
                });
              }
              resolve(true);
            }
          })
          .catch(() => {
            resolve(false);
          });
      } else {
        resolve(false);
      }
    });
  }

  @Bind()
  openCirculateModal(record) {
    const startUserId = record.get('startUserId');
    const carbonCopyDs = new DataSet({
      autoCreate: true,
      paging: false,
      autoQuery: false,
      fields: [
        {
          name: 'addCc',
          type: 'object',
          lovCode: 'HPFM.HR.UNIT_EMPLOYEE_CODE_TREE',
          multiple: true,
          label: intl.get('hwfp.common.view.piece.checkEmployee').d('选择传阅人'),
          ignore: 'always',
          required: true,
          lovPara: {
            tenantId: getCurrentOrganizationId(),
            extraParam: JSON.stringify({ startUser: startUserId }),
            employeeResign: true,
          },
        },
        {
          name: 'appendComment',
          type: 'string',
          label: intl.get('hwfp.common.model.process.appendComment').d('传阅意见'),
          maxLength: 3500,
        },
      ],
    });
    Modal.open({
      key: modalKey,
      drawer: true,
      style: {
        width: '380px',
      },
      title: intl.get('hzero.common.record.circulate').d('传阅'),
      children: (
        <Form dataSet={carbonCopyDs} labelLayout="float">
          <ContactLov
            className={styles['contact-lov-select-multiple']}
            dataSet={carbonCopyDs}
            name="addCc"
            viewMode="drawer"
            modalProps={{
              style: { width: 900, maxWidth: 900 },
            }}
            selectionProps={{
              placeholder: intl.get('hzero.common.select.people').d('请从左侧选择人员'),
            }}
          >
            {intl.get('hzero.common.record.circulate').d('传阅')}
          </ContactLov>
          <TextArea
            name="appendComment"
            placeholder={intl.get('hwfp.common.view.placeholder.maxLength').d('最大支持3500字')}
          />
        </Form>
      ),
      onOk: () => new Promise((resolve) => this.onSetCarbonCopy(carbonCopyDs, record, resolve)),
    });
  }

  /**
   * 详情
   * @param {object} record - 头数据
   */
  changeDetail(record) {
    openTab({
      title: `${record.processName}`,
      key: `/hwfp/involved-task/detail/${record.encryptId}`,
      path: `/hwfp/involved-task/detail/${record.encryptId}`,
      icon: 'edit',
      closable: true,
    });
  }

  @Bind()
  handleComment(processInstanceId) {
    Modal.open({
      title: intl.get('hwfp.task.button.comment').d('评论'),
      footer: null,
      drawer: true,
      bodyStyle: {
        padding: 0,
        background: '#F8F9FB',
      },
      closable: true,
      children: <ApprovalReply processInstanceId={processInstanceId} />,
    });
  }

  // 详情页抽屉
  showDetailModal = (currentRecord) => {
    const record = currentRecord.toData();
    const { openModal, handleClose } = this.context;
    const {
      match,
      forecastLoading = false,
      involvedTask: { [record.id]: { uselessParam } = {}, approvalActionTooltipMap },
      tableDs,
      processStatus = [],
    } = this.props;
    match.params.id = record.id;
    match.params.processInstanceId = record.encryptId;
    const flowProps = {
      match,
      tenantId,
      uselessParam,
      loading: forecastLoading,
    };
    tableDs.getField('addCc').setLovPara('tenantId', tenantId);
    tableDs
      .getField('addCc')
      .setLovPara('extraParam', JSON.stringify({ startUser: record.startUserId }));
    const processStatusObj = {};
    processStatus.forEach((item) => {
      processStatusObj[item.value] = item.meaning;
    });
    let message = null;
    if (record.processStatus === 'SUSPENDED' && record.processExceptionInformation) {
      if (record.processExceptionInformation) {
        message = record.processExceptionInformation.messageHead;
      }
    }
    const title = (
      <>
        {record.startUserName
          ? `${record.id}-${record.processName}-${record.startUserName}`
          : `${record.id}-${record.processName}`}
        <span style={{ marginLeft: '10px' }}>
          <Tooltip title={message}>
            {processStatusRender(processStatusObj, record.processStatus, record)}
          </Tooltip>
        </span>
      </>
    );
    const {
      businessKey,
      formDefinitionCode,
      formKey,
      moduleForm,
      originFormKey,
      processDefinitionId,
      processDefinitionKey,
    } = record;
    const approveFormParams = {
      businessKey,
      formDefinitionCode,
      formKey,
      moduleForm,
      originFormKey,
      processDefinitionId,
      processDefinitionKey,
    };
    const modalObj = {
      title,
      mask: false,
      distroyOnClose: true,
      drawer: true,
      closable: true,
      closeOnLocationChange: false,
      resizable: true,
      style: {
        minWidth: '50vw',
      },
      customizable: true,
      customizedCode: 'APPROVAL_INVOLVED_DETAIL',
      children: (
        <Detail match={match} flowProps={flowProps} approveFormParams={approveFormParams} />
      ),
      footer: () => {
        const operators = [];
        if (record.recall) {
          operators.push({
            key: 'recall',
            ele: approvalActionTooltipMap.recall ? (
              <Tooltip title={approvalActionTooltipMap.recall}>
                <Button
                  style={{
                    float: 'left',
                    color: '#F56349',
                    borderColor: '#F56349',
                  }}
                  type="primary"
                  onClick={() => this.executeTaskAction(record.id)}
                  tooltip="none"
                >
                  {intl.get('hwfp.common.view.message.recall').d('撤回')}
                </Button>
              </Tooltip>
            ) : (
              <Button
                style={{
                  float: 'left',
                  color: '#F56349',
                  borderColor: '#F56349',
                }}
                type="primary"
                onClick={() => this.executeTaskAction(record.id)}
                tooltip="none"
              >
                {intl.get('hwfp.common.view.message.recall').d('撤回')}
              </Button>
            ),
          });
        }
        operators.push({
          key: 'carbonCopy',
          ele: approvalActionTooltipMap.carboncopy ? (
            <Tooltip title={approvalActionTooltipMap.carboncopy}>
              <Button onClick={() => this.openCirculateModal(currentRecord || {})} tooltip="none">
                {intl.get('hzero.common.record.circulate').d('传阅')}
              </Button>
            </Tooltip>
          ) : (
            <Button onClick={() => this.openCirculateModal(currentRecord || {})} tooltip="none">
              {intl.get('hzero.common.record.circulate').d('传阅')}
            </Button>
          ),
        });
        if (record.commentReplyFlag === 1) {
          operators.push({
            key: 'comment',
            ele: (
              <Button
                funcType="raised"
                color="default"
                onClick={() => this.handleComment(record.id)}
              >
                {intl.get('hwfp.task.button.comment').d('评论')}
              </Button>
            ),
          });
        }
        return (
          <div className={styles['modal-footer-buttons']}>{operators.map((item) => item.ele)}</div>
        );
      },
      onClose: handleClose,
      className: 'detail-drawer swfl-approval-workbench-involved-task-detail-modal',
      id: INVOLVED_TASK_TAB_DRAWER_ID,
    };
    openModal(modalObj);
  };

  // 关闭详情页
  handleModalClose = () => {
    const { handleClose } = this.context;
    handleClose();
  };

  executeTaskAction = (processInstanceId) => {
    const { tableDs, dispatch } = this.props;
    Modal.confirm({
      title: intl.get('hwfp.common.view.message.confirm').d('确认'),
      content: intl.get('hwfp.involvedTask.view.message.title.confirmBack').d(`确认撤回吗?`),
      onOk: () => {
        const params = {
          type: 'involvedTask/taskRecall',
          payload: {
            tenantId,
            processInstanceId,
          },
        };
        dispatch(params).then((res) => {
          if (res) {
            notification.success();
            this.handleModalClose();
            tableDs.query();
          }
        });
      },
    });
  };

  // 表格操作：撤回
  taskRecall = (processInstanceId) => {
    const { tableDs, dispatch } = this.props;
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示?'),
      children: intl.get('hwfp.involvedTask.view.message.title.confirmBack').d(`是否确认撤回?`),
      onOk: () => {
        const params = {
          type: 'involvedTask/taskRecall',
          payload: {
            tenantId,
            processInstanceId,
          },
        };
        dispatch(params).then((res) => {
          if (res) {
            notification.success();
            tableDs.query();
          }
        });
      },
    });
  };

  getColumns = () => {
    const {
      processStatus = [],
      tableDs,
      involvedTask: { approvalActionTooltipMap },
      processRemote,
    } = this.props;
    const processStatusObj = {};
    processStatus.forEach((item) => {
      processStatusObj[item.value] = item.meaning;
    });
    const { tableAggregation } = this.state;
    return [
      {
        tooltip: 'none',
        name: 'operator',
        width: 150,
        renderer: ({ record }) => {
          const { commentReplyFlag, recall, id, startUserId } = record.get([
            'commentReplyFlag',
            'recall',
            'id',
            'startUserId',
          ]);
          tableDs.getField('addCc').setLovPara('tenantId', tenantId);
          tableDs
            .getField('addCc')
            .setLovPara('extraParam', JSON.stringify({ startUser: startUserId }));
          let operators = [];
          if (recall) {
            operators.push({
              key: 'recall',
              ele: (
                <Button
                  funcType="link"
                  onClick={() => this.taskRecall(id)}
                  className={styles['operator-btn']}
                  style={{
                    display: tableAggregation ? 'block' : 'inline-flex',
                    marginRight: '8px',
                  }}
                >
                  {approvalActionTooltipMap.recall ? (
                    <Tooltip title={approvalActionTooltipMap.recall}>
                      {intl.get('hwfp.common.view.message.recall').d('撤回')}
                    </Tooltip>
                  ) : (
                    intl.get('hwfp.common.view.message.recall').d('撤回')
                  )}
                </Button>
              ),
            });
          }
          operators.push({
            key: 'carbonCopy',
            ele: (
              <Button
                funcType="link"
                onClick={() => this.openCirculateModal(record || {})}
                className={styles['operator-btn']}
                style={{ display: tableAggregation ? 'block' : 'inline-flex', marginRight: '8px' }}
              >
                {approvalActionTooltipMap.carboncopy ? (
                  <Tooltip title={approvalActionTooltipMap.carboncopy}>
                    {intl.get('hzero.common.record.circulate').d('传阅')}
                  </Tooltip>
                ) : (
                  intl.get('hzero.common.record.circulate').d('传阅')
                )}
              </Button>
            ),
          });
          if (commentReplyFlag === 1) {
            operators.push({
              key: 'comment',
              ele: (
                <Button
                  funcType="link"
                  color="default"
                  className={styles['operator-btn']}
                  style={{
                    marginLeft: 0,
                    display: tableAggregation ? 'block' : 'inline-flex',
                  }}
                  onClick={() => this.handleComment(id)}
                >
                  {intl.get('hwfp.task.button.comment').d('评论')}
                </Button>
              ),
            });
          }
          if (processRemote) {
            operators = processRemote.process(
              'SWFL_APPROVAL_WORKBENCH_INVOLVED_LIST_ACTIONS',
              operators,
              {
                operators,
                data: record,
              }
            );
          }
          return <div>{operators.map((item) => item.ele)}</div>;
        },
      },
      {
        name: 'processStatus',
        width: 150,
        renderer: ({ value, record }) => {
          let message = null;
          if (value === 'SUSPENDED' && record.get('processExceptionInformation')) {
            const processExceptionInformation = record.get('processExceptionInformation');
            if (processExceptionInformation) {
              message = processExceptionInformation.messageHead;
            }
          }
          return (
            <div style={{ overflow: 'hidden' }} className={styles['process-status-tag']}>
              <Tooltip title={message}>
                {processStatusRender(processStatusObj, value, record.toData())}
              </Tooltip>
            </div>
          );
        },
      },
      {
        key: 'processDetail',
        width: 320,
        aggregation: true,
        aggregationLimit: 5,
        align: 'left',
        header: intl.get('hwfp.common.model.process.detail').d('流程明细'),
        children: [
          {
            name: 'process',
            width: 240,
            renderer: ({ record }) => {
              const { id, processName } = record.get(['id', 'processName']);
              return (
                <a onClick={() => this.showDetailModal(record || {})}>
                  {id}
                  {` - ${processName}`}
                </a>
              );
            },
          },
          {
            name: 'startUserName',
            width: 200,
            renderer: ({ value, record }) => {
              const employeeResign = record.get('employeeResign');
              return (
                <span style={{ display: 'inline-flex', alignItems: 'center', width: '100%' }}>
                  <Text>{value}</Text>
                  {employeeResign ? (
                    <Tag color="#E5E7EC" className={styles['task-info-content-tag']}>
                      <span style={{ color: '#4E5769' }}>
                        {intl.get('hpfm.organization.model.position.leave').d('离职')}
                      </span>
                    </Tag>
                  ) : null}
                </span>
              );
            },
          },
          {
            name: 'startUserUnitName',
            width: 200,
          },
          {
            name: 'startTime',
            width: 200,
            renderer: ({ value }) => dateTimeRender(value) || '-',
          },
        ],
      },
      {
        key: 'currentStage',
        width: 220,
        aggregation: true,
        aggregationLimit: 4,
        align: 'left',
        header: intl.get('hwfp.common.view.message.current.stage').d('当前节点'),
        help: intl
          .get('hwfp.common.view.title.currentStageTooltip')
          .d('正在审批中的流程节点名称及对应审批人'),
        children: [
          {
            name: 'taskName',
            width: 200,
            header: tableAggregation
              ? intl.get('hwfp.common.model.apply.nodeName').d('节点名称')
              : undefined,
          },
          {
            name: 'currentApprover',
            width: 120,
            header: intl.get('hwfp.common.model.apply.approver').d('审批人'),
            renderer: ({ value }) => {
              const currentApprover = value ? value.replace(/,/g, ', ') : '-';
              return <ResignedDisplay value={currentApprover} />;
            },
          },
          {
            name: 'modelStandardTime',
            width: 120,
          },
        ],
      },
      {
        key: 'preStage',
        width: 220,
        aggregation: true,
        aggregationLimit: 4,
        align: 'left',
        header: intl.get('hwfp.common.view.message.current.preStage').d('上一节点'),
        help: intl
          .get('hwfp.common.view.title.preStageTooltip')
          .d('上一已完成节点参与审批人员及存在审批拒绝/驳回意见集合'),
        children: [
          {
            name: 'previousNodeName',
            width: 200,
            header: tableAggregation
              ? intl.get('hwfp.common.model.apply.nodeName').d('节点名称')
              : undefined,
          },
          {
            name: 'previousApprover',
            width: 120,
            header: tableAggregation
              ? intl.get('hwfp.common.model.apply.approver').d('审批人')
              : undefined,
            renderer: ({ value }) => {
              const previousApprover = value ? value.replace(/,/g, ', ') : '-';
              return <ResignedDisplay value={previousApprover} />;
            },
          },
          {
            name: 'previousComment',
            width: 200,
            header: tableAggregation
              ? intl.get('hwfp.common.model.apply.approveComment').d('审批意见')
              : undefined,
          },
        ],
      },
      {
        name: 'empLastApprovalTime',
        width: 150,
        help: intl
          .get('hwfp.common.view.title.approvalTimeTooltip')
          .d('该流程中，用户最后审批时间'),
        renderer: ({ value }) => dateTimeRender(value) || '-',
      },
      {
        name: 'endTime',
        width: 150,
        renderer: ({ value }) => dateTimeRender(value) || '-',
      },
      {
        name: 'description',
        width: 350,
        renderer: ({ text }) => {
          if (!text) {
            return '-';
          }
          return tableAggregation ? (
            text.split('\n').map((t) => (
              <div>
                <Text>{t}</Text>
              </div>
            ))
          ) : (
            <Text>{text}</Text>
          );
        },
      },
    ];
  };

  handleAggregationChange = (value) => {
    this.setState({ tableAggregation: value });
  };

  beforeQuery = ({ params }) => {
    const { tableDs } = this.props;
    if (!tableDs.queryDataSet) {
      tableDs.queryDataSet = new DataSet();
    }
    const {
      startedUserList,
      startedUserUnitList,
      processStatusList,
      practicalApprovalFlag,
    } = params;
    if (startedUserList) {
      params.startedUserList = startedUserList.split(',');
    }
    if (startedUserUnitList) {
      params.startedUserUnitList = startedUserUnitList.split(',');
    }
    if (processStatusList) {
      params.processStatusList = processStatusList.split(',');
    }
    if (!isNil(practicalApprovalFlag)) {
      params.practicalApprovalFlag = Number(practicalApprovalFlag);
    }
    tableDs.setState('queryState', 'ready');
    tableDs.queryDataSet.loadData([params]);
    return true;
  };

  handleQuery = () => {
    const { onSearch } = this.props;
    onSearch();
  };

  renderTableRight = () => {
    const { tableAggregation } = this.state;
    return (
      <div className={styles['table-layout']}>
        <Popover content={intl.get('hwfp.common.table.flatTableView').d('平铺表视图')}>
          <div
            className={styles[!tableAggregation ? 'isActive' : 'isNormal']}
            onClick={() => this.handleAggregationChange(false)}
          >
            <Icon type="reorder" className={styles['icon-font']} />
          </div>
        </Popover>
        <Popover content={intl.get('hwfp.common.table.aggregateTableView').d('聚合表视图')}>
          <div
            className={styles[tableAggregation ? 'isActive' : 'isNormal']}
            onClick={() => this.handleAggregationChange(true)}
          >
            <Icon type="view_day" className={styles['icon-font']} />
          </div>
        </Popover>
      </div>
    );
  };

  /**
   * render
   * @returns React.element
   */
  render() {
    const { tableAggregation } = this.state;
    const { tableDs, customizeTable = () => {} } = this.props;
    return (
      <div className={styles['list-table']}>
        {customizeTable(
          { code: 'HWFP.APPROVAL_TABLE_UNIT_GROUP.APPROVED' },
          <SearchBarTable
            searchCode="HWFP.APPROVAL_WORKBENCH_LIST.INVOLVED_TASK.FILTER"
            highLightRow="click"
            dataSet={tableDs}
            columns={this.getColumns()}
            selectionMode="rowbox"
            pagination={false}
            aggregation={tableAggregation}
            onAggregationChange={this.handleAggregationChange}
            autoHeight={{
              type: 'maxHeight',
              diff: -80,
            }}
            className={styles['list-table-head']}
            searchBarConfig={{
              beforeQuery: this.beforeQuery,
              onQuery: this.handleQuery,
              autoQuery: false,
              fieldProps: {
                startedUserList: {
                  lovPara: {
                    tenantId: getCurrentOrganizationId(),
                    empStatus: 'ALL',
                  },
                },
                assignee: {
                  lovPara: {
                    tenantId: getCurrentOrganizationId(),
                    empStatus: 'ALL',
                  },
                },
              },
              left: {
                render: (_, ds) => (
                  <MultipleTextSplitInput
                    dataSet={ds}
                    style={{ width: '300px' }}
                    name="processSearch"
                    placeholder={intl
                      .get('hwfp.common.model.apply.queryKeyName')
                      .d('请输入流程描述、名称、标识查询')}
                  />
                ),
              },
              right: {
                render: this.renderTableRight,
              },
            }}
            searchBarRef={(ref) => {
              this.searchBarRef = ref;
            }}
            tableRef={(ref) => {
              this.tableRef = ref;
            }}
          />
        )}
      </div>
    );
  }
}

/* eslint-disable no-param-reassign */
import React, { PureComponent } from 'react';
import { Tag } from 'hzero-ui';
import {
  Modal,
  Button,
  TextArea,
  Form,
  DataSet,
  notification as C7nNotification,
} from 'choerodon-ui/pro';
import { Icon, Tooltip, Dropdown, Menu, Text, Popover } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import { connect } from 'dva';
import { isEmpty, isNil, isFunction } from 'lodash';

import { dateTimeRender } from 'utils/renderer';
import notification from 'utils/notification';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { openTab } from 'utils/menuTab';
import { getCurrentOrganizationId } from 'utils/utils';
import ApprovalReply from 'srm-front-boot/lib/components/ApprovalReply';

import { processStatusRender, isJSON, ResignedDisplay } from '@/utils/util';

import ContactLov from 'srm-front-boot/lib/components/ContactLov';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import MultipleTextSplitInput from 'srm-front-boot/lib/components/MultipleTextSplitInput';
import { setCarbonCopy } from '@/services/involvedTaskService';

import Store from '@/components/UpdateModal/Store';
import Detail from '../Detail';
import styles from './index.less';
import { START_TASK_TAB_DRAWER_ID } from '../../utils';

const tenantId = getCurrentOrganizationId();

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

const modalKey = Modal.key();
@connect(({ startByTask, loading }) => ({
  startByTask,
  forecastLoading: loading.effects['startByTask/fetchForecast'],
}))
@formatterCollections({
  code: [
    'hwfl.startByTask',
    'hwfl.common',
    'entity.position',
    'entity.department',
    'hwfp.common',
    'hzero.common',
    'hwfp.task',
    'hwfp.startByTask',
    'hpfm.organization',
    'hwfp.involvedTask',
  ],
})
export default class ListTable extends PureComponent {
  static contextType = Store;

  constructor(props) {
    super(props);
    props.onRef(this);
    this.flowChartDrawerRef = null;
    this.state = {
      activeRecord: {},
      revokeLoading: false,
      tableAggregation: true,
    };
  }

  /**
   * 详情
   * @param {object} record - 头数据
   */
  changeDetail(record) {
    openTab({
      title: `${record.processName}`,
      key: `/hwfp/start-by-task/detail/${record.encryptId}`,
      path: `/hwfp/start-by-task/detail/${record.encryptId}`,
      icon: 'edit',
      closable: true,
    });
  }

  taskRevoke(record) {
    const { onRevoke = (e) => e } = this.props;
    onRevoke(record);
    this.setState({ activeRecord: record });
  }

  @Bind()
  taskRemind(record) {
    const { onRemind = (e) => e } = this.props;
    onRemind(record);
    this.setState({ activeRecord: record });
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
      startByTask: { [record.id]: { uselessParam } = {}, approvalActionTooltipMap },
      tableDs,
      processRemote,
      processStatus = [],
    } = this.props;
    // 卫龙埋点
    const { handleFooterButton = undefined } = processRemote?.props?.process || {};
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
      customizedCode: 'APPROVAL_STARTBY_DETAIL',
      children: (
        <Detail match={match} flowProps={flowProps} approveFormParams={approveFormParams} />
      ),
      footer: () => {
        return (
          <div className={styles['modal-footer-buttons']}>
            {record.displayRevoke &&
              (approvalActionTooltipMap.revoke ? (
                <Tooltip title={approvalActionTooltipMap.revoke}>
                  <Button
                    style={{
                      float: 'left',
                      color: '#F56349',
                      borderColor: '#F56349',
                      margin: '0 10px 0 0',
                    }}
                    type="primary"
                    onClick={() => this.executeTaskAction(record.id)}
                    loading={this.state.revokeLoading}
                    tooltip="none"
                  >
                    {intl.get('hzero.common.status.revoke').d('撤销')}
                  </Button>
                </Tooltip>
              ) : (
                <Button
                  style={{
                    float: 'left',
                    color: '#F56349',
                    borderColor: '#F56349',
                    margin: '0 10px 0 0',
                  }}
                  type="primary"
                  onClick={() => this.executeTaskAction(record.id)}
                  loading={this.state.revokeLoading}
                  tooltip="none"
                >
                  {intl.get('hzero.common.status.revoke').d('撤销')}
                </Button>
              ))}
            {record.remind &&
              (approvalActionTooltipMap.remind ? (
                <Tooltip title={approvalActionTooltipMap.remind}>
                  <Button
                    style={{
                      margin: '0 10px 0 0',
                    }}
                    onClick={() => this.remindTaskAction(record)}
                    tooltip="none"
                  >
                    {intl.get('hwfp.common.view.message.remind').d('催办')}
                  </Button>
                </Tooltip>
              ) : (
                <Button
                  style={{
                    margin: '0 10px 0 0',
                  }}
                  onClick={() => this.remindTaskAction(record)}
                  tooltip="none"
                >
                  {intl.get('hwfp.common.view.message.remind').d('催办')}
                </Button>
              ))}
            {approvalActionTooltipMap.carboncopy ? (
              <Tooltip title={approvalActionTooltipMap.carboncopy}>
                <Button
                  onClick={() => this.openCirculateModal(currentRecord)}
                  tooltip="none"
                  style={{
                    margin: '0 10px 0 0',
                  }}
                >
                  {intl.get('hzero.common.record.circulate').d('传阅')}
                </Button>
              </Tooltip>
            ) : (
              <Button
                onClick={() => this.openCirculateModal(currentRecord)}
                tooltip="none"
                style={{
                  margin: '0 10px 0 0',
                }}
              >
                {intl.get('hzero.common.record.circulate').d('传阅')}
              </Button>
            )}
            {record.commentReplyFlag === 1 && (
              <Button
                funcType="raised"
                color="default"
                style={{
                  margin: '0 10px 0 0',
                }}
                onClick={() => this.handleComment(record.id)}
              >
                {intl.get('hwfp.task.button.comment').d('评论')}
              </Button>
            )}
            {isFunction(handleFooterButton) ? handleFooterButton(record, { ...this.props }) : null}
          </div>
        );
      },
      onClose: handleClose,
      className: 'detail-drawer swfl-approval-workbench-start-task-detail-modal',
      id: START_TASK_TAB_DRAWER_ID,
    };
    openModal(modalObj);
  };

  // 关闭详情页
  handleModalClose = () => {
    const { handleClose } = this.context;
    handleClose();
  };

  executeTaskAction = (processInstanceId) => {
    this.setState({ revokeLoading: true });
    const { handleClose } = this.context;
    const { tableDs, dispatch } = this.props;
    Modal.open({
      title: intl.get('hwfp.startByTask.view.message.title.confirmBack').d(`确认撤回吗?`),
      closable: true,
      autoCenter: true,
      okFirst: true,
      children: (
        <div>
          <p>{intl.get('hwfp.task.view.message.backComment').d('撤销意见')}</p>
          <TextArea
            style={{ width: '100%' }}
            ref={(el) => {
              this.comment = el;
            }}
          />
        </div>
      ),
      onOk: () => {
        const params = {
          type: 'startByTask/taskRevoke',
          payload: {
            tenantId,
            id: processInstanceId,
            comment: this.comment && this.comment.value ? this.comment.value : '',
          },
        };
        dispatch(params)
          .then((res) => {
            if (res) {
              notification.success();
              handleClose();
              this.setState({ revokeLoading: false });
              tableDs.query(tableDs.currentPage);
            }
          })
          .catch(() => {
            this.setState({ revokeLoading: false });
          });
      },
      onCancel: () => {
        this.setState({ revokeLoading: false });
      },
    });
  };

  remindTaskAction = (record) => {
    const { handleClose } = this.context;
    const { tableDs, dispatch } = this.props;
    dispatch({
      type: 'startByTask/beforeTaskRemind',
      payload: {
        tenantId,
        id: record.encryptId,
      },
    }).then((response) => {
      if (response && response.failed) {
        Modal.open({
          title: intl.get('hwfp.common.process.remind').d('流程催办'),
          closable: true,
          okCancel: true,
          destroyOnClose: true,
          children: response.message,
          footer: (okBtn) => okBtn,
          okText: intl.get('hwfp.common.hold.on').d('再等等'),
        });
      } else {
        Modal.confirm({
          title: intl.get('hwfp.common.process.remind').d('流程催办'),
          children: intl.get('hwfp.startByTask.view.message.title.confirmRemind').d(`确认催办吗?`),
          onOk: () => {
            const params = {
              type: 'startByTask/taskRemind',
              payload: {
                tenantId,
                id: record.encryptId,
              },
            };
            dispatch(params).then((res) => {
              if (res && res.failed) {
                Modal.open({
                  title: intl.get('hwfp.common.process.remind').d('流程催办'),
                  closable: true,
                  okCancel: true,
                  destroyOnClose: true,
                  children: res.message,
                  footer: (okBtn) => okBtn,
                  okText: intl.get('hzero.common.button.ok').d('确定'),
                });
              } else {
                notification.success();
                handleClose();
                tableDs.query(tableDs.currentPage);
              }
            });
          },
        });
      }
    });
  };

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
          type: 'startedBy',
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

  getColumns = () => {
    const { activeRecord, tableAggregation } = this.state;
    const {
      tableDs,
      processStatus = [],
      revokeLoading = false,
      remindLoading = false,
      startByTask: { approvalActionTooltipMap },
      processRemote,
    } = this.props;
    const processStatusObj = {};
    processStatus.forEach((item) => {
      processStatusObj[item.value] = item.meaning;
    });
    return [
      {
        name: 'operator',
        width: 150,
        renderer: ({ record }) => {
          const commentReplyFlag = record.get('commentReplyFlag');
          const displayRevoke = record.get('displayRevoke');
          const id = record.get('id');
          const remind = record.get('remind');
          const startUserId = record.get('startUserId');
          let operators = [];
          if (displayRevoke && displayRevoke === true) {
            if (revokeLoading && id === activeRecord.id) {
              operators.push({
                key: 'loading',
                ele: (
                  <Button
                    loading
                    funcType="flat"
                    style={{
                      display: tableAggregation ? 'block' : 'inline-flex',
                      marginLeft: 0,
                      marginRight: '8px',
                    }}
                    className={styles['operator-btn-loading']}
                  />
                ),
                len: 3,
              });
            } else {
              operators.push({
                key: 'revoke',
                ele: (
                  <Button
                    funcType="link"
                    style={{
                      display: tableAggregation ? 'block' : 'inline-flex',
                      marginRight: '8px',
                    }}
                    className={styles['operator-btn']}
                    onClick={() => this.taskRevoke(record.toData() || {})}
                  >
                    {approvalActionTooltipMap.revoke ? (
                      <Tooltip title={approvalActionTooltipMap.revoke}>
                        {intl.get('hzero.common.status.revoke').d('撤销')}
                      </Tooltip>
                    ) : (
                      intl.get('hzero.common.status.revoke').d('撤销')
                    )}
                  </Button>
                ),
                len: 3,
                title: intl.get('hzero.common.status.revoke').d('撤销'),
              });
            }
          }
          if (remind) {
            if (!(remindLoading && id === activeRecord.id)) {
              operators.push({
                key: 'remind',
                ele: (
                  <Button
                    funcType="link"
                    className={styles['operator-btn']}
                    style={{
                      display: tableAggregation ? 'block' : 'inline-flex',
                      marginRight: '8px',
                    }}
                    onClick={() => this.taskRemind(record.toData() || {})}
                  >
                    {approvalActionTooltipMap.remind ? (
                      <Tooltip title={approvalActionTooltipMap.remind}>
                        {intl.get('hwfp.common.view.message.remind').d('催办')}
                      </Tooltip>
                    ) : (
                      intl.get('hwfp.common.view.message.remind').d('催办')
                    )}
                  </Button>
                ),
                len: 3,
                title: intl.get('hwfp.common.view.message.remind').d('催办'),
              });
            } else {
              operators.push({
                key: 'loading2',
                ele: (
                  <Button
                    loading
                    funcType="flat"
                    style={{
                      display: tableAggregation ? 'block' : 'inline-flex',
                      marginLeft: 0,
                      marginRight: '8px',
                    }}
                    className={styles['operator-btn-loading']}
                  />
                ),
                len: 3,
              });
            }
          }
          tableDs.getField('addCc').setLovPara('tenantId', tenantId);
          tableDs
            .getField('addCc')
            .setLovPara('extraParam', JSON.stringify({ startUser: startUserId }));
          operators.push({
            key: 'carbonCopy',
            ele: (
              <Button
                funcType="link"
                style={{ display: tableAggregation ? 'block' : 'inline-flex', marginRight: '8px' }}
                className={styles['operator-btn']}
                onClick={() => this.openCirculateModal(record || {})}
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
            title: intl.get('hzero.common.record.circulate').d('传阅'),
          });
          if (commentReplyFlag === 1) {
            operators.push({
              key: 'comment',
              ele: (
                <Button
                  funcType="link"
                  className={styles['operator-btn']}
                  onClick={() => this.handleComment(id)}
                  style={{
                    display: tableAggregation ? 'block' : 'inline-flex',
                    height: '20px',
                    lineHeight: '20px',
                    paddingTop: '3px',
                    marginRight: '8px',
                  }}
                >
                  {intl.get('hwfp.task.button.comment').d('评论')}
                </Button>
              ),
              title: intl.get('hwfp.task.button.comment').d('评论'),
            });
          }
          if (processRemote) {
            operators = processRemote.process(
              'SWFL_APPROVAL_WORKBENCH_STARTBY_LIST_ACTIONS',
              operators,
              {
                operators,
                data: record,
              }
            );
          }
          return (
            <div>
              {operators.length > 3 ? (
                <>
                  {operators[0].ele}
                  {operators[1].ele}
                  <Dropdown
                    overlay={
                      <Menu>
                        {operators.slice(2).map((item) => (
                          <Menu.Item
                            key={item.key}
                            style={{ color: '#29BECE' }}
                            className={styles['drop-down-menu-item']}
                          >
                            {item.ele}
                          </Menu.Item>
                        ))}
                      </Menu>
                    }
                  >
                    <Button
                      funcType="link"
                      className={styles['operator-btn']}
                      style={{
                        whiteSpace: 'nowrap',
                        display: tableAggregation ? 'block' : 'inline-flex',
                        marginRight: '8px',
                      }}
                    >
                      {intl.get('hzero.common.button.more').d('更多')}
                      <Icon
                        type="expand_more"
                        style={{
                          fontSize: '14px',
                          verticalAlign: 'text-top',
                          marginLeft: '4px',
                        }}
                      />
                    </Button>
                  </Dropdown>
                </>
              ) : (
                operators.map((item) => item.ele)
              )}
            </div>
          );
        },
      },
      {
        name: 'processStatus',
        width: 140,
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
            header: intl.get('hwfp.common.model.process.process').d('流程'),
            renderer: ({ record }) => {
              const { id, processName, rushFlag } = record.get(['id', 'processName', 'rushFlag']);
              return (
                <a onClick={() => this.showDetailModal(record || {})}>
                  {id}
                  {` - ${processName}`}
                  {rushFlag ? (
                    <Tooltip
                      title={intl
                        .get('hwfp.common.view.title.rush.process.remind')
                        .d('流程加急，请尽快审批')}
                    >
                      <span className={styles['task-info-rush-icon']}>
                        <Icon type="priority" />
                      </span>
                    </Tooltip>
                  ) : (
                    ''
                  )}
                </a>
              );
            },
          },
          {
            name: 'startUserName',
            width: 200,
            header: intl.get('hwfp.common.model.apply.owner').d('申请人'),
            renderer: ({ record }) => {
              const { startUserName, employeeResign } = record.get([
                'startUserName',
                'employeeResign',
              ]);
              return (
                <>
                  {startUserName}
                  {employeeResign && (
                    <Tag color="#E5E7EC" className={styles['task-info-content-tag']}>
                      <span style={{ color: '#4E5769' }}>
                        {intl.get('hpfm.organization.model.position.leave').d('离职')}
                      </span>
                    </Tag>
                  )}
                </>
              );
            },
          },
          {
            name: 'startUserUnitName',
            width: 200,
            header: intl.get('hwfp.common.model.apply.startUserUnitName').d('申请部门'),
          },
          {
            name: 'startTime',
            width: 200,
            header: intl.get('hwfp.common.model.apply.time').d('申请时间'),
            renderer: ({ value }) => dateTimeRender(value) || '-',
          },
        ],
      },
      {
        key: 'currentStage',
        aggregation: true,
        aggregationLimit: 4,
        align: 'left',
        header: intl.get('hwfp.common.view.message.current.stage').d('当前节点'),
        width: 220,
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
            width: 200,
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
    const { assigneeList, assigneeUnitList, processStatusList, rushFlag } = params;
    if (assigneeList) {
      params.assigneeList = assigneeList.split(',');
    }
    if (assigneeUnitList) {
      params.assigneeUnitList = assigneeUnitList.split(',');
    }
    if (processStatusList) {
      params.processStatusList = processStatusList.split(',');
    }
    if (!isNil(rushFlag)) {
      params.rushFlag = Number(rushFlag);
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
          { code: 'HWFP.APPROVAL_TABLE_UNIT_GROUP.STARTEDBY' },
          <SearchBarTable
            searchCode="HWFP.APPROVAL_WORKBENCH_LIST.STARTEDBY.FILTER"
            highLightRow="click"
            dataSet={tableDs}
            columns={this.getColumns()}
            pagination={false}
            aggregation={tableAggregation}
            onAggregationChange={this.handleAggregationChange}
            autoHeight={{
              type: 'maxHeight',
              diff: -80,
            }}
            searchBarConfig={{
              beforeQuery: this.beforeQuery,
              onQuery: this.handleQuery,
              autoQuery: false,
              fieldProps: {
                assigneeList: {
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

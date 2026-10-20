import React, { Component } from 'react';
import { Table, Popconfirm, Tag } from 'hzero-ui';
import { Modal, TextArea } from 'choerodon-ui/pro';

import { dateTimeRender, operatorRender } from 'utils/renderer';
import intl from 'utils/intl';
import { tableScrollWidth, getResponse } from 'utils/utils';
import { checkPermission } from 'services/api';
import notification from 'utils/notification';

import { processStatusRender, ResignedDisplay } from '@/utils/utils';
import AutoRestHeight from '@/components/AutoRestHeight';

const PermissionCode = {
  stop: 'hzero.wp.setup.process-monitor-company.button.stop',
  resume: 'hzero.wp.setup.process-monitor-company.button.resumeProcess',
  designated: 'hzero.wp.setup.process-monitor-company.button.designatedApprover',
  suspend: 'hzero.wp.setup.process-monitor-company.button.suspend',
};

/**
 * 监控流程数据列表
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
export default class ListTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      canStop: false,
      canResume: false,
      canDesignated: false,
      canSuspend: false,
    };
  }

  componentDidMount() {
    checkPermission([
      PermissionCode.stop,
      PermissionCode.resume,
      PermissionCode.designated,
      PermissionCode.suspend,
    ]).then(data => {
      if (getResponse(data) && data && data.length > 0) {
        const permissionMap = {};
        data.forEach(p => {
          permissionMap[p.code] = p.approve;
        });
        this.setState({
          canStop: permissionMap[PermissionCode.stop],
          canResume: permissionMap[PermissionCode.resume],
          canDesignated: permissionMap[PermissionCode.designated],
          canSuspend: permissionMap[PermissionCode.suspend],
        });
      }
    });
  }

  handleStopModal = id => {
    Modal.open({
      title: intl.get('hzero.common.message.confirm.stopProcess').d('是否终止此条记录'),
      closable: true,
      autoCenter: true,
      okFirst: true,
      children: (
        <div>
          <p>{intl.get('hwfp.task.view.message.stopComment').d('终止意见')}</p>
          <TextArea
            style={{ width: '100%' }}
            ref={el => {
              this.comment = el;
            }}
          />
        </div>
      ),
      onOk: () =>
        this.handleStopProcess(id, this.comment && this.comment.value ? this.comment.value : ''),
    });
  };

  handleStopProcess = async (processInstanceId, comment) => {
    const {
      dispatch,
      tenantId,
      onChange,
      monitorSrm: { pagination },
    } = this.props;
    const res = await dispatch({
      type: 'monitorSrm/stopProcess',
      payload: {
        tenantId,
        processInstanceId,
        comment,
      },
    });
    if (res) {
      notification.success();
      onChange(pagination);
      return true;
    }
    return false;
  };

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      loading,
      dataSource = [],
      pagination = {},
      onChange,
      onDetail,
      onSuspendedReason,
      onSuspend,
      onResume,
      onRetry,
      isSiteFlag,
      onException = e => e,
      processStatus = [],
      onRef,
      onContinue,
    } = this.props;
    const { canStop, canResume, canDesignated, canSuspend } = this.state;
    const processStatusObj = {};
    processStatus.forEach(item => {
      processStatusObj[item.value] = item.meaning;
    });
    const columns = [
      isSiteFlag && {
        title: intl.get('hzero.common.model.tenantName').d('租户'),
        dataIndex: 'tenantName',
        width: 200,
      },
      {
        title: intl.get('spfm.monitor.model.process.ID').d('流程标识'),
        dataIndex: 'id',
        width: 100,
      },
      {
        title: intl.get('hwfp.common.model.process.approvalStatus').d('审批状态'),
        dataIndex: 'processStatus',
        width: 160,
        render: val => processStatusRender(processStatusObj, val),
      },
      {
        title: intl.get('hwfp.common.model.process.name').d('流程名称'),
        dataIndex: 'processName',
        width: 200,
      },
      {
        title: intl.get('spfm.monitor.model.process.description').d('流程描述'),
        dataIndex: 'description',
        width: 200,
      },
      {
        title: intl.get('hwfp.common.model.process.definition.key').d('流程定义编码'),
        dataIndex: 'processDefinitionKey',
        width: 200,
      },
      {
        title: intl.get('hwfp.common.model.process.definition.processVersion').d('流程定义版本'),
        dataIndex: 'currentProcessVersion',
        width: 120,
        align: 'right',
      },
      {
        title: intl.get('hwfp.common.view.message.current.stage').d('当前节点'),
        dataIndex: 'taskName',
        width: 150,
        render: val => val && val.replace(/,/g, ', '),
      },
      {
        title: intl.get('hwfp.common.model.apply.owner').d('申请人'),
        dataIndex: 'startUserName',
        width: 150,
        render: (val, record) => (
          <span>
            {val}({record.startUserId})
            {record.startUserResign && (
              <Tag
                color="#E5E7EC"
                style={{
                  lineHeight: '18px',
                  height: '18px',
                  border: 'none',
                  padding: '0 4px',
                  cursor: 'default',
                  marginLeft: '4px',
                  marginRight: 0,
                  transform: 'scale(0.84)',
                  color: '#4E5769',
                }}
              >
                {intl.get('hpfm.organization.model.position.leave').d('离职')}
              </Tag>
            )}
          </span>
        ),
      },
      {
        title: intl.get('hwfp.common.view.message.handler').d('当前处理人'),
        dataIndex: 'currentApprover',
        width: 150,
        render: val => <ResignedDisplay value={val && val.replace(/,/g, ', ')} />,
      },
      {
        title: intl.get('hwfp.monitor.model.monitor.startTime').d('创建时间'),
        dataIndex: 'startTime',
        width: 160,
        render: dateTimeRender,
      },
      {
        title: intl.get('hwfp.monitor.model.monitor.endTime').d('结束时间'),
        dataIndex: 'endTime',
        width: 160,
        render: dateTimeRender,
      },
      {
        title: intl.get('hwfp.monitor.model.monitor.exceptionMsgHead').d('挂起原因'),
        dataIndex: 'exceptionMsgHead',
        width: 250,
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        dataIndex: 'operator',
        width: 240,
        fixed: 'right',
        render: (_, record) => {
          const actions = [
            {
              key: 'detail',
              ele: (
                <a onClick={() => onDetail(record)}>
                  {intl.get('hwfp.common.view.message.detail').d('详情')}
                </a>
              ),
              len: 2,
              title: intl.get('hwfp.common.view.message.detail').d('详情'),
            },
          ];
          if (record.processStatus === 'BLOCKING') {
            return operatorRender(actions, record);
          }
          if (record.hasException) {
            actions.push({
              key: 'jumpNode',
              ele: (
                <a
                  onClick={() => {
                    onException(record);
                  }}
                >
                  {intl.get('hwfp.monitor.view.option.jumpNode').d('异常信息')}
                </a>
              ),
              len: 4,
              title: intl.get('hwfp.monitor.view.option.jumpNode').d('异常信息'),
            });
          }
          if (record.endTime === null) {
            if (canStop) {
              actions.push({
                key: 'stop',
                ele: (
                  <a onClick={() => this.handleStopModal(record.id, 'stopProcess')}>
                    {intl.get('hwfp.monitor.view.option.stop').d('终止流程')}
                  </a>
                ),
                len: 4,
                title: intl.get('hwfp.monitor.view.option.stop').d('终止流程'),
              });
            }
            if (record.suspended) {
              if (canResume) {
                actions.push({
                  key: 'resume',
                  ele: (
                    <a
                      onClick={() => {
                        onResume(record.id, 'resumeProcess');
                      }}
                    >
                      {intl.get('hwfp.monitor.view.option.resume').d('恢复流程')}
                    </a>
                  ),
                  len: 4,
                  title: intl.get('hwfp.monitor.view.option.resume').d('恢复流程'),
                });
              }
              actions.push({
                key: 'suspendedDetail',
                ele: (
                  <a
                    onClick={() => {
                      onSuspendedReason(record.id);
                    }}
                  >
                    {intl.get('hwfp.monitor.view.option.suspendedDetail').d('挂起详情')}
                  </a>
                ),
                len: 4,
                title: intl.get('hwfp.monitor.view.option.suspendedDetail').d('挂起详情'),
              });
              if (canDesignated) {
                actions.push({
                  key: 'retry',
                  ele: (
                    <a
                      onClick={() => {
                        onRetry(record);
                      }}
                    >
                      {intl.get('hwfp.monitor.view.option.retry').d('指定审批人')}
                    </a>
                  ),
                  len: 5,
                  title: intl.get('hwfp.monitor.view.option.retry').d('指定审批人'),
                });
              }
            } else if (canSuspend && status !== 'BLOCKED') {
              actions.push({
                key: 'suspend',
                ele: (
                  <Popconfirm
                    placement="topRight"
                    title={intl.get('hzero.common.message.confirm.suspend').d('是否挂起此条记录')}
                    onConfirm={() => onSuspend(record.id, 'suspendProcess')}
                  >
                    <a>{intl.get('hwfp.common.view.option.suspend').d('挂起')}</a>
                  </Popconfirm>
                ),
                len: 2,
                title: intl.get('hwfp.common.view.option.suspend').d('挂起'),
              });
            }
          }
          if (!isSiteFlag && record.processStatus === 'BLOCKED') {
            actions.push({
              key: 'activate',
              ele: (
                <a
                  onClick={() => {
                    onContinue(record.id);
                  }}
                >
                  {intl.get('hwfp.monitor.view.option.continue').d('继续执行')}
                </a>
              ),
              len: 3,
              title: intl.get('hwfp.monitor.view.option.continue').d('继续执行'),
            });
          }

          return operatorRender(actions, record);
        },
      },
    ].filter(Boolean);
    return (
      <AutoRestHeight topSelector=".ant-spin-container" type="hzero-ui" onRef={onRef}>
        <Table
          bordered
          scroll={{ x: tableScrollWidth(columns, 100) }}
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={dataSource}
          pagination={pagination}
          onChange={onChange}
        />
      </AutoRestHeight>
    );
  }
}

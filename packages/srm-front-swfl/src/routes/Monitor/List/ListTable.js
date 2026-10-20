import React, { PureComponent } from 'react';
import { Table, Popconfirm, Tag } from 'hzero-ui';
import { Modal, TextArea, Spin, DataSet, notification } from 'choerodon-ui/pro';

import { dateTimeRender, operatorRender } from 'utils/renderer';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { tableScrollWidth, getResponse } from 'utils/utils';

import { processStatusRender, ResignedDisplay } from '@/utils/util';
import { fixProcessStatus } from '@/services/monitorService';
import AutoRestHeight from '@/components/AutoRestHeight';
import UpdateStatusModal from './UpdateStatusModal';
import styles from './index.less';

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

@formatterCollections({
  code: ['hwfp.task', 'hwfp.common', 'hpfm.organization', 'hwfp.automaticProcess'],
})
export default class ListTable extends PureComponent {
  /**
   * render
   * @returns React.element
   */

  // constructor(props) {
  //   super(props);
  //   const { loginName } = getCurrentUser() || {};
  //   const isAdmin = loginName === 'admin';
  //   this.state = {
  //     isAdmin,
  //   };
  // }

  handleStopModal = (id, type, record) => {
    const { onStop } = this.props;
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
            ref={(el) => {
              this.comment = el;
            }}
          />
        </div>
      ),
      onOk: () =>
        onStop(id, type, this.comment && this.comment.value ? this.comment.value : '', record),
    });
  };

  openUpdateStatusModal = (record, processStatusObj) => {
    const { onChange } = this.props;
    const formDs = new DataSet({
      fields: [
        {
          name: 'procIds',
        },
        {
          name: 'procStatus',
          label: intl.get('hwfp.monitor.view.label.changedStatus').d('更改后状态'),
          required: true,
          lookupCode: 'HWFP.PROCESS_APPROVE_STATUS',
        },
        {
          name: 'comment',
          label: intl.get('hwfp.task.view.message.changeComment').d('更改意见'),
        },
      ],
    });
    const { id, processStatus, tenantId } = record;
    const text = `${processStatusObj[processStatus || 'APPROVAL']}-${id}`;
    const formRecord = formDs.create({ procIds: id, tenantId });
    Modal.open({
      title: intl.get('hwfp.monitor.view.title.processStatusUpdate').d('流程状态更改'),
      closable: true,
      autoCenter: true,
      okFirst: true,
      children: <UpdateStatusModal text={text} formRecord={formRecord} />,
      onOk: async () => {
        const flag = await formDs.validate();
        if (!flag) {
          return false;
        }
        const data = formRecord.get(['procIds', 'procStatus', 'tenantId', 'comment']);
        const res = await fixProcessStatus(data);
        if (getResponse(res)) {
          notification.success();
          onChange();
          return true;
        }
        return false;
      },
    });
  };

  render() {
    // const { isAdmin } = this.state;
    const {
      loading,
      dataSource = [],
      pagination = {},
      handleListChange,
      onDetail,
      onSuspendedReason,
      onSuspend,
      onResume,
      onRetry,
      isSiteFlag,
      processStatus = [],
      onException = (e) => e,
      onProcessVariable = (e) => e,
      linkLoading,
      currentProcessId,
      onRef,
      selectedRowKeys,
      onSelectRows,
      onContinue,
    } = this.props;
    const processStatusObj = {};
    processStatus.forEach((item) => {
      processStatusObj[item.value] = item.meaning;
    });
    const rowSelection = {
      selectedRowKeys,
      onChange: (rowKeys, rows) => {
        onSelectRows(rowKeys, rows);
      },
    };
    const columns = [
      isSiteFlag && {
        title: intl.get('hzero.common.model.tenantName').d('租户'),
        dataIndex: 'tenantName',
        width: 200,
      },
      {
        title: intl.get('hwfp.monitor.model.process.ID').d('流程标识'),
        dataIndex: 'id',
        width: 100,
      },
      {
        title: intl.get('hwfp.common.model.process.approvalStatus').d('审批状态'),
        dataIndex: 'processStatus',
        width: 160,
        render: (val) => processStatusRender(processStatusObj, val),
      },
      {
        title: intl.get('hwfp.common.model.process.name').d('流程名称'),
        dataIndex: 'processName',
        width: 200,
      },
      {
        title: intl.get('hwfp.monitor.model.process.description').d('流程描述'),
        dataIndex: 'description',
        width: 400,
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
        render: (val) => val && val.replace(/,/g, ', '),
      },
      {
        title: intl.get('hwfp.common.model.apply.owner').d('申请人'),
        dataIndex: 'startUserName',
        width: 150,
        render: (val, record) => (
          <span>
            {val}
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
        render: (val) => <ResignedDisplay value={val && val.replace(/,/g, ', ')} />,
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
          const { processStatus: status, hasException, endTime, encryptId } = record;
          const actions = [
            {
              key: 'detail',
              ele: (
                <a onClick={() => onDetail(record)}>
                  {intl.get('hzero.common.button.detail').d('详情')}
                </a>
              ),
              len: 3,
              title: intl.get('hzero.common.button.detail').d('详情'),
            },
            {
              key: 'processVariable',
              ele: (
                <a
                  onClick={() => {
                    onProcessVariable(record);
                  }}
                >
                  {intl.get('hwfp.common.view.option.processVariable').d('查询变量')}
                </a>
              ),
              len: 4,
              title: intl.get('hwfp.common.view.option.processVariable').d('查询变量'),
            },
          ];
          if (status === 'BLOCKING') {
            return operatorRender(actions, record);
          }
          if (hasException) {
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
          if (endTime === null || !endTime) {
            actions.push({
              key: 'stop',
              ele: (
                <a
                  onClick={() => {
                    if (!(linkLoading && currentProcessId === encryptId)) {
                      this.handleStopModal(encryptId, 'stopProcess', record);
                    }
                  }}
                >
                  {linkLoading && currentProcessId === encryptId && <Spin size="small" />}
                  {intl.get('hwfp.monitor.view.option.stop').d('终止流程')}
                </a>
              ),
              len: 4,
              title: intl.get('hwfp.monitor.view.option.stop').d('终止流程'),
            });
            if (status === 'SUSPENDED') {
              actions.push({
                key: 'resume',
                ele: (
                  <a
                    onClick={() => {
                      if (!(linkLoading && currentProcessId === encryptId)) {
                        onResume(encryptId, 'resumeProcess', undefined, record);
                      }
                    }}
                  >
                    {linkLoading && currentProcessId === encryptId && <Spin size="small" />}
                    {intl.get('hwfp.monitor.view.option.resume').d('恢复流程')}
                  </a>
                ),
                len: 4,
                title: intl.get('hwfp.monitor.view.option.resume').d('恢复流程'),
              });
              actions.push({
                key: 'suspendedDetail',
                ele: (
                  <a
                    onClick={() => {
                      onSuspendedReason(encryptId);
                    }}
                  >
                    {intl.get('hwfp.monitor.view.option.suspendedDetail').d('挂起详情')}
                  </a>
                ),
                len: 4,
                title: intl.get('hwfp.monitor.view.option.suspendedDetail').d('挂起详情'),
              });
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
            } else if (status !== 'BLOCKED') {
              actions.push({
                key: 'suspend',
                ele: (
                  <>
                    {!(linkLoading && currentProcessId === encryptId) ? (
                      <Popconfirm
                        placement="topRight"
                        title={intl
                          .get('hzero.common.message.confirm.suspend')
                          .d('是否挂起此条记录')}
                        onConfirm={() => {
                          if (!(linkLoading && currentProcessId === encryptId)) {
                            onSuspend(encryptId, 'suspendProcess', undefined, record);
                          }
                        }}
                      >
                        <a>{intl.get('hwfp.common.view.option.suspend').d('挂起')}</a>
                      </Popconfirm>
                    ) : (
                      <a>
                        {linkLoading && currentProcessId === encryptId && <Spin size="small" />}
                        {intl.get('hwfp.common.view.option.suspend').d('挂起')}
                      </a>
                    )}
                  </>
                ),
                len: 3,
                title: intl.get('hwfp.common.view.option.suspend').d('挂起'),
              });
            }
          }
          if (!status || ['APPROVAL', 'SUSPENDED'].includes(status)) {
            actions.push({
              key: 'stop',
              ele: (
                <a
                  onClick={() => {
                    this.openUpdateStatusModal(record, processStatusObj);
                  }}
                >
                  {intl.get('hwfp.monitor.view.option.changeStatus').d('流程状态更改')}
                </a>
              ),
              len: 6,
              title: intl.get('hwfp.monitor.view.option.changeStatus').d('流程状态更改'),
            });
          }
          if (!isSiteFlag && status === 'BLOCKED') {
            actions.push({
              key: 'activate',
              ele: (
                <a
                  onClick={() => {
                    if (!(linkLoading && currentProcessId === encryptId)) {
                      onContinue(record);
                    }
                  }}
                >
                  {linkLoading && currentProcessId === encryptId && <Spin size="small" />}
                  {intl.get('hwfp.monitor.view.option.continue').d('继续执行')}
                </a>
              ),
              len: 6,
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
          scroll={{ x: tableScrollWidth(columns, 100), y: 600 }}
          rowKey="id"
          className={styles['list-table']}
          loading={loading}
          columns={columns}
          dataSource={dataSource}
          pagination={pagination}
          onChange={handleListChange}
          rowSelection={rowSelection}
        />
      </AutoRestHeight>
    );
  }
}

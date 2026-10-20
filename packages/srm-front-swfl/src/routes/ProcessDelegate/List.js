import React, { Component } from 'react';
import { Table } from 'hzero-ui';
import { Tag } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';

import { dateTimeRender } from 'utils/renderer';
// import { tableScrollWidth } from 'utils/utils';
import intl from 'utils/intl';

import { processStatusRender } from '@/utils/util';

export default class List extends Component {
  @Bind()
  handleChange(pagination = {}) {
    this.props.handleChange({
      page: pagination,
    });
  }

  getApprovalColumns() {
    const { processStatus = [] } = this.props;
    const processStatusObj = {};
    processStatus.forEach((item) => {
      processStatusObj[item.value] = item.meaning;
    });
    return [
      {
        title: intl.get('hwfp.common.model.process.approvalStatus').d('审批状态'),
        dataIndex: 'suspended',
        width: 180,
        render: (val) => <div>{processStatusRender(processStatusObj, val ? 'SUSPENDED' : '')}</div>,
      },
      {
        title: intl.get('hwfp.common.model.process.ID').d('流程标识'),
        dataIndex: 'processInstanceId',
        width: 100,
      },
      {
        title: intl.get('hwfp.common.model.process.name').d('流程名称'),
        dataIndex: 'processName',
        width: 250,
      },
      {
        title: intl.get('hwfp.common.model.process.description').d('流程描述'),
        dataIndex: 'description',
        width: 250,
      },
      {
        title: intl.get('hwfp.common.view.message.current.stage').d('当前节点'),
        dataIndex: 'name',
        width: 150,
      },
      {
        title: intl.get('hwfp.common.view.message.handler').d('当前处理人'),
        dataIndex: 'assigneeName',
        width: 200,
        render: (val, record) => {
          return (
            <>
              <span>{val && val.replace(',', '，')}</span>
              {record.employeeResign && (
                <Tag
                  color="#f50"
                  style={{
                    lineHeight: '18px',
                    height: '18px',
                    border: 'none',
                    padding: '0 4px',
                    cursor: 'default',
                    marginLeft: '4px',
                    marginRight: 0,
                  }}
                >
                  {intl.get('hpfm.organization.model.position.leave').d('离职')}
                </Tag>
              )}
            </>
          );
        },
      },
      {
        title: intl.get('hwfp.common.model.apply.owner').d('申请人'),
        dataIndex: 'startUserName',
        width: 200,
        render: (val, record) => (
          <>
            <span>{val}</span>
            {record.submitEmpResign && (
              <Tag
                color="#f50"
                style={{
                  lineHeight: '18px',
                  height: '18px',
                  border: 'none',
                  padding: '0 4px',
                  cursor: 'default',
                  marginLeft: '4px',
                  marginRight: 0,
                }}
              >
                {intl.get('hpfm.organization.model.position.leave').d('离职')}
              </Tag>
            )}
          </>
        ),
      },
      {
        title: intl.get('hwfp.task.model.task.creationTime').d('创建时间'),
        dataIndex: 'startTime',
        width: 160,
        render: dateTimeRender,
      },
    ];
  }

  getApplicantColumns() {
    const { processStatus = [] } = this.props;
    const processStatusObj = {};
    processStatus.forEach((item) => {
      processStatusObj[item.value] = item.meaning;
    });
    return [
      {
        title: intl.get('hwfp.common.model.process.ID').d('流程标识'),
        dataIndex: 'processInstanceId',
        width: 100,
      },
      {
        title: intl.get('hwfp.common.model.apply.owner').d('申请人'),
        dataIndex: 'startUserName',
        width: 200,
        render: (val, record) => (
          <>
            <span>{val}</span>
            {record.submitEmpResign && (
              <Tag
                color="#f50"
                style={{
                  lineHeight: '18px',
                  height: '18px',
                  border: 'none',
                  padding: '0 4px',
                  cursor: 'default',
                  marginLeft: '4px',
                  marginRight: 0,
                }}
              >
                {intl.get('hpfm.organization.model.position.leave').d('离职')}
              </Tag>
            )}
          </>
        ),
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
        width: 250,
      },
      {
        title: intl.get('hwfp.common.model.process.description').d('流程描述'),
        dataIndex: 'description',
        width: 250,
      },
      {
        title: intl.get('hwfp.common.view.message.current.stage').d('当前节点'),
        dataIndex: 'name',
        width: 150,
      },
      {
        title: intl.get('hwfp.common.view.message.handler').d('当前处理人'),
        dataIndex: 'taskAssigneeList',
        render: (val) => {
          if (!Array.isArray(val)) {
            return null;
          }
          return val.map((v, i) => (
            <span>
              <span>{v.assigneeName}</span>
              {v.employeeResign && (
                <Tag
                  color="#f50"
                  style={{
                    lineHeight: '18px',
                    height: '18px',
                    border: 'none',
                    padding: '0 4px',
                    cursor: 'default',
                    marginLeft: '4px',
                    marginRight: 0,
                  }}
                >
                  {intl.get('hpfm.organization.model.position.leave').d('离职')}
                </Tag>
              )}
              {i < val.length - 1 && ','}
            </span>
          ));
        },
      },
      {
        title: intl.get('hwfp.task.model.task.creationTime').d('创建时间'),
        dataIndex: 'startTime',
        width: 160,
        render: dateTimeRender,
      },
    ];
  }

  render() {
    const {
      dataSource = [],
      loading,
      pagination,
      selectedRows = [],
      onSelectRows,
      tabKey,
      rowKey,
    } = this.props;
    const selectedRowKeys = selectedRows.map((item) => item[rowKey]);
    const isApproverTab = tabKey === 'approver';
    const columns = isApproverTab ? this.getApprovalColumns() : this.getApplicantColumns();
    return (
      <Table
        rowKey={rowKey}
        loading={loading}
        dataSource={dataSource}
        pagination={pagination}
        columns={columns}
        onChange={this.handleChange}
        // scroll={{ x: tableScrollWidth(this.columns), y: 600 }}
        rowSelection={{
          selectedRowKeys,
          onChange: (_, rows) => {
            onSelectRows(rows);
          },
        }}
      />
    );
  }
}

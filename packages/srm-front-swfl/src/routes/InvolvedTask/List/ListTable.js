import React, { Component } from 'react';
import { Table, Tag } from 'hzero-ui';
import { Tooltip } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import { dateTimeRender, operatorRender } from 'utils/renderer';
import { tableScrollWidth } from 'utils/utils';
import { menuTabEventManager } from 'utils/menuTab';

import { processStatusRender, ResignedDisplay } from '@/utils/util';
import AutoRestHeight from '@/components/AutoRestHeight';

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
export default class ListTable extends Component {
  @Bind()
  getWindow() {
    if (window.parent === window) {
      return window;
    } else {
      return window.parent;
    }
  }

  /**
   * 详情
   * @param {object} record - 头数据
   */
  changeDetail(record) {
    const {
      processName,
      encryptId,
      businessKey,
      formDefinitionCode,
      formKey,
      moduleForm,
      originFormKey,
      processDefinitionId,
      processDefinitionKey,
    } = record;
    const tabKey = `/hwfp/involved-task/detail/:id-${processDefinitionKey}`;
    this.getWindow()
      .dvaApp._store.dispatch({
        type: 'global/removeTab',
        payload: tabKey,
      })
      .then(() => {
        menuTabEventManager.emit('close', { tabKey });
        this.getWindow().openTab({
          title: `${processName}`,
          key: tabKey,
          path: `/hwfp/involved-task/detail/${encryptId}`,
          icon: 'edit',
          closable: true,
          state: {
            approveFormParams: {
              businessKey,
              formDefinitionCode,
              formKey,
              moduleForm,
              originFormKey,
              processDefinitionId,
              processDefinitionKey,
            },
          },
        });
      });
    // openTab({
    //   title: `${processName}`,
    //   key: `/hwfp/involved-task/detail/${encryptId}`,
    //   path: `/hwfp/involved-task/detail/${encryptId}`,
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
      processStatus = [],
      onRef,
    } = this.props;
    const processStatusObj = {};
    processStatus.forEach((item) => {
      processStatusObj[item.value] = item.meaning;
    });
    const columns = [
      {
        title: intl.get('hwfp.common.model.process.ID').d('流程标识'),
        dataIndex: 'id',
        width: 100,
      },
      {
        title: intl.get('hwfp.common.model.process.approvalStatus').d('审批状态'),
        dataIndex: 'processStatus',
        width: 180,
        render: (val) => processStatusRender(processStatusObj, val),
      },
      {
        title: intl.get('hwfp.common.model.process.name').d('流程名称'),
        dataIndex: 'processName',
        width: 200,
      },
      {
        title: intl.get('hwfp.common.model.process.description').d('流程描述'),
        dataIndex: 'description',
        width: 200,
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
            {record.employeeResign && (
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
        title: intl.get('hwfp.common.view.message.previousComment').d('上一环节审批意见'),
        dataIndex: 'previousComment',
        width: 250,
        render: (val) => (
          <Tooltip
            title={<pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{val}</pre>}
            placement="topLeft"
          >
            {val}
          </Tooltip>
        ),
      },
      {
        title: intl.get('hwfp.common.view.message.empLastApprovalTime').d('审批时间'),
        dataIndex: 'empLastApprovalTime',
        width: 160,
        render: dateTimeRender,
      },
      {
        title: intl.get('hwfp.involvedTask.model.involvedTask.startTime').d('创建时间'),
        dataIndex: 'startTime',
        width: 160,
        render: dateTimeRender,
      },
      {
        title: intl.get('hwfp.involvedTask.model.involvedTask.endTime').d('结束时间'),
        dataIndex: 'endTime',
        width: 160,
        render: dateTimeRender,
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        dataIndex: 'operator',
        width: 100,
        align: 'center',
        fixed: 'right',
        render: (_, record) => {
          const operators = [
            {
              key: 'detail',
              ele: (
                <a onClick={() => this.changeDetail(record)}>
                  {intl.get('hzero.common.button.detail').d('详情')}
                </a>
              ),
              len: 4,
              title: intl.get('hzero.common.button.detail').d('详情'),
            },
          ];
          return operatorRender(operators, record);
        },
      },
    ];
    return (
      <AutoRestHeight topSelector=".ant-spin-container" type="hzero-ui" onRef={onRef}>
        <Table
          bordered
          //  rowKey="id"
          loading={loading}
          dataSource={dataSource}
          pagination={pagination}
          onChange={onChange}
          columns={columns}
          scroll={{ x: tableScrollWidth(columns) }}
        />
      </AutoRestHeight>
    );
  }
}

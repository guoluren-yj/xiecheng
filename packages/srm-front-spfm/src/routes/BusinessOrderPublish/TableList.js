/**
 * TableList - 外箱条码列表
 * @date: 2020-2-24
 * @version: 1.0.0
 * @author: zjx <jingxi.zhang@hand-china.com>
 * @copyright Copyright (c) 2020, Hand
 */

import React, { Component } from 'react';
import { Table } from 'hzero-ui';
import { Link } from 'dva/router';
import { Bind } from 'lodash-decorators';
import { dateTimeRender } from 'utils/renderer'; //日期时间格式化
import { Button as PermissionButton } from 'components/Permission';
import intl from 'utils/intl';
import { tableScrollWidth } from 'utils/utils';
import SignStatusList from './SignStatusList';

export default class TableList extends Component {
  state = {
    notificationId: '',
  };

  /**
   * 绑定供应商ref
   */
  @Bind()
  handleBindSignRef(ref = {}) {
    this.signRecord = ref;
  }

  @Bind()
  handleSignStatusList(record = {}) {
    const { notificationId } = record;
    this.setState(
      {
        notificationId,
      },
      () => {
        this.signRecord.handleOperatedModal();
      }
    );
  }

  renderTableColumns() {
    const {
      approvaFlags = {},
      operationFlags = {},
      handleRevoke,
      handleWorkflowApprove,
      remote,
    } = this.props;
    const columns = [
      {
        title: intl.get(`spfm.businessOrder.model.businessOrder.notificationNum`).d('通知单编号'),
        width: 150,
        dataIndex: 'notificationNum',
        render: (val, record) => {
          return (
            <Link to={`/spfm/business-order-publish/detail/${record.notificationId}`}>{val}</Link>
          );
        },
      },
      {
        title: intl.get('hzero.common.status').d('状态'),
        width: 100,
        dataIndex: 'notificationStatuMeaning',
      },
      {
        title: intl.get(`spfm.businessOrder.model.businessOrder.notificationTitle`).d('通知单名称'),
        dataIndex: 'notificationTitle',
      },
      {
        title: intl.get(`spfm.businessOrder.model.businessOrder.signDetail`).d('签收明细'),
        dataIndex: 'signDetail',
        width: 120,
        render: (_, record) => {
          const { receivedNum, receiveTotal } = record;
          return (
            <a onClick={() => this.handleSignStatusList(record)}>
              {`${receivedNum}/${receiveTotal}`}
            </a>
          );
        },
      },
      {
        title: intl.get('entity.company.tag').d('公司'),
        dataIndex: 'companyName',
        width: 200,
      },
      {
        title: intl.get(`hzero.common.entity.creator`).d('创建人'),
        dataIndex: 'realName',
        width: 100,
      },
      {
        title: intl.get(`hzero.common.date.creation`).d('创建日期'),
        dataIndex: 'creationDate',
        render: (val) => dateTimeRender(val),
        width: 120,
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        dataIndex: 'operator',
        width: 200,
        fixed: 'right',
        render: (val, record) => {
          const { workflowBusinessKey } = record || {};
          return (
            <span className="action-link">
              {approvaFlags[workflowBusinessKey] && (
                <PermissionButton
                  type="c7n-pro"
                  onClick={() => handleWorkflowApprove(record)}
                  funcType="link"
                  wait={500}
                  permissionList={[
                    {
                      code: 'srm.bg.manager.portal.business-order-publish.button.workflowApprove',
                      type: 'button',
                    },
                  ]}
                >
                  {intl.get('hzero.common.button.approval').d('审批')}
                </PermissionButton>
              )}
              {operationFlags[workflowBusinessKey]?.REVOKE && (
                <PermissionButton
                  type="c7n-pro"
                  onClick={() => handleRevoke(record)}
                  funcType="link"
                  wait={500}
                  permissionList={[
                    {
                      code: 'srm.bg.manager.portal.business-order-publish.button.revoke',
                      type: 'button',
                    },
                  ]}
                >
                  {intl.get('hzero.common.button.revokeApproval').d('撤销审批')}
                </PermissionButton>
              )}
            </span>
          );
        },
      },
      {
        title: intl.get(`hzero.common.button.operating`).d('操作记录'),
        dataIndex: 'actionHistory',
        width: 120,
        render: (_, record) => {
          return (
            <a onClick={() => this.props.showOperate(record)}>
              {intl.get(`hzero.common.button.operating`).d('操作记录')}
            </a>
          );
        },
      },
    ];
    return remote ? remote.process('SPFM_BUSINESS_ORDER_PUBLISH_PROCESS_TABLE_LIST_COLUMNS', columns) : columns;
  }

  render() {
    const {
      pagination,
      dataSource = [],
      fetchDataLoading,
      onHandleChange,
      lineRowSelection = {},
      customizeTable,
    } = this.props;
    const { notificationId } = this.state;
    const columns = this.renderTableColumns();
    const scrollX = tableScrollWidth(columns);
    const signProps = {
      notificationId,
      onRef: this.handleBindSignRef,
    };
    return (
      <React.Fragment>
        {customizeTable(
          {
            code: 'SPFM.PORTAL.BUSINESSORDER.PUBLISH.TABLELIST',
          },
          <Table
            bordered
            rowKey="notificationId"
            loading={fetchDataLoading}
            columns={columns}
            rowSelection={lineRowSelection}
            scroll={{ x: scrollX }}
            dataSource={dataSource}
            pagination={pagination}
            onChange={(page) => onHandleChange(page)}
          />
        )}
        <SignStatusList {...signProps} />
      </React.Fragment>
    );
  }
}

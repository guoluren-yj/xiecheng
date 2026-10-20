/**
 * index- 需求取消 - list
 * @date: 2019-01-21
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Table, Tooltip, Tag } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import { tableScrollWidth } from 'utils/utils';
import { dateTimeRender, yesOrNoRender } from 'utils/renderer';
import urgentImg from '@/assets/icon-expedited.svg';
import styles from './index.less';
// import { dateRender } from 'utils/renderer.js';
// import OperationRecord from '../components/OperationRecord/OperationRecord';

// 设置sprm国际化前缀 - message
const commonPrompt = 'sprm.common.model.common';
// const messagePrompt = 'sprm.purchaseRequisitionCancel.view.message';

/**
 * 需求取消列表组件
 * @export
 * @class List - 列表组件
 * @extends {Component} -React.Component
 * @reactProps {boolean} loading - table数据加载状态
 * @reactProps {object[]} tableData - table 数据源
 * @reactProps {object} pagination - table 分页信息
 * @reactProps {object} rowSelection - 选择行对象
 * @returns React.element
 */
export default class List extends Component {
  @Bind()
  protocolType(record, flag) {
    const { onHandleToDetail } = this.props;
    onHandleToDetail(record, flag);
  }

  onCell() {
    return {
      style: {
        overflow: 'hidden',
        maxWidth: 120,
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      },
      onClick: e => {
        const { target } = e;
        if (target.style.whiteSpace === 'normal') {
          target.style.whiteSpace = 'nowrap';
        } else {
          target.style.whiteSpace = 'normal';
        }
      },
    };
  }

  render() {
    const {
      loading,
      pagination,
      dataSource,
      onChange,
      onHide = e => e,
      customizeTable,
      isNewTeant = false,
      srmChangeFlag,
      erpChangeFlag,
    } = this.props;
    const columns = [
      {
        title: intl.get(`hzero.common.status`).d('状态'),
        dataIndex: 'prStatusMeaning',
        width: 100,
        fixed: 'left',
      },
      {
        title: intl.get(`${commonPrompt}.title`).d('标题'),
        width: 150,
        dataIndex: 'title',
        fixed: 'left',
      },
      {
        title: intl.get(`${commonPrompt}.prNum`).d('采购申请编号'),
        dataIndex: 'displayPrNum',
        width: 150,
        fixed: 'left',
        sorter: true,
        render: (val, record) => (
          <div className={styles['row-agent-column']}>
            <a onClick={() => this.protocolType(record)}>{val}</a>
            {record.urgentFlag === 1 ? (
              <Tooltip title={intl.get(`${commonPrompt}.urgent`).d('申请加急')}>
                <img src={urgentImg} alt="img" />
              </Tooltip>
            ) : null}
          </div>
        ),
      },
      {
        title: intl.get(`hzero.common.button.action`).d('操作'),
        width: 80,
        dataIndex: 'prStatusCode',
        // 多语言
        render: (val, record) =>
          (val === 'REJECTED' || val === 'APPROVED') &&
          ((record.prSourcePlatform === 'SRM' && srmChangeFlag === 1) ||
            (erpChangeFlag === 1 && record.prSourcePlatform === 'ERP')) ? (
              <a onClick={() => this.protocolType(record, true)}>
                {intl.get(`sprm.purchasePlatform.view.button.actionChange`).d('变更')}
              </a>
          ) : null,
      },
      {
        title: intl.get(`${commonPrompt}.changedFlag`).d('变更中'),
        dataIndex: 'changedFlag',
        width: 150,
        render: yesOrNoRender,
      },
      {
        title: intl.get(`entity.roles.creator`).d('创建人'),
        dataIndex: 'createByName',
        width: 150,
      },
      {
        title: intl.get(`${commonPrompt}.creationTime`).d('创建时间'),
        dataIndex: 'creationDate',
        width: 150,
        sorter: true,
        render: dateTimeRender,
        onCell: this.onCell,
      },
      {
        title: intl.get(`${commonPrompt}.unitName`).d('所属部门'),
        dataIndex: 'unitName',
        sorter: true,
        width: 120,
      },
      {
        title: intl.get(`${commonPrompt}.prSourcePlatform`).d('单据来源'),
        dataIndex: 'prSourcePlatformMeaning',
        width: 120,
      },
      {
        title: intl.get(`${commonPrompt}.applyExplain`).d('申请说明'),
        dataIndex: 'remark',
        width: 150,
        onCell: this.onCell,
        render: text => <Tooltip title={text}>{text}</Tooltip>,
      },
      {
        title: intl.get(`hzero.common.button.operating`).d('操作记录'),
        width: 90,
        dataIndex: 'operatorRecord',
        render: (_, record) => (
          <a onClick={() => onHide(record)}>
            {intl.get(`hzero.common.button.operating`).d('操作记录')}
          </a>
        ),
      },
      {
        title: intl.get(`spfm.configServer.model.order.recordFlag`).d('变更记录'),
        width: 90,
        dataIndex: 'updateOperatorRecord',
        render: (_, record) =>
          ['SRM', 'ERP'].includes(record.prSourcePlatform) ? (
            <a onClick={() => onHide(record, true)}>
              {intl.get(`sprm.purchaseRequisitionInquiry.model.common.changeLog`).d('变更日志')}
            </a>
          ) : null,
      },
    ];
    if (isNewTeant) {
      columns.splice(0, 0, {
        title: intl.get(`${commonPrompt}.operable`).d('可操作类型'),
        width: 120,
        dataIndex: 'operable',
        render: (_, record) => {
          const { prHeaderCancelledFlag, prHeaderClosedFlag } = record;
          return (
            <span>
              {prHeaderCancelledFlag === 1 ? (
                <Tag color="blue">{intl.get(`${commonPrompt}.cancellable`).d('可取消')}</Tag>
              ) : null}
              {prHeaderClosedFlag === 1 ? (
                <Tag color="blue">{intl.get(`${commonPrompt}.closable`).d('可关闭')}</Tag>
              ) : null}
            </span>
          );
        },
      });
    }
    const scrollX = tableScrollWidth(columns);
    return (
      <React.Fragment>
        {customizeTable(
          {
            code: 'SPRM.PURCHASE_REQUISITION_CANCEL.LIST.WHOLE',
          },
          <Table
            bordered
            dataSource={dataSource}
            loading={loading}
            columns={columns}
            pagination={pagination}
            scroll={{ x: scrollX }} //  y: 'calc(100vh - 320px)' todo页面增加固定头
            rowKey="prHeaderId"
            onChange={onChange}
          />
        )}
      </React.Fragment>
    );
  }
}

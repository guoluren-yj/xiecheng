/**
 * list - 非ERP采购申请需求审批
 * @date: 2019-07-15
 * @author: zhutian <tian.zhu@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */
import React, { Component } from 'react';
import { Table, Tooltip } from 'hzero-ui';

import { dateTimeRender, yesOrNoRender } from 'utils/renderer';
import intl from 'utils/intl';
import { tableScrollWidth } from 'utils/utils';
import urgentImg from '@/assets/icon-expedited.svg';

import styles from './index.less';

const commonPrompt = 'sprm.common.model.common';

export default class List extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const {
      rowSelection,
      loading,
      pagination,
      dataSource,
      onChange,
      onShow,
      onDetail,
      customizeTable,
    } = this.props;
    const columns = [
      {
        title: intl.get(`${commonPrompt}.prNum`).d('采购申请编号'),
        width: 150,
        dataIndex: 'displayPrNum',
        sorter: true,
        render: (val, record) => (
          <div className={styles['row-agent-column']}>
            <a onClick={() => onDetail(record)}>{val}</a>
            {record.urgentFlag === 1 ? (
              <Tooltip title={intl.get(`${commonPrompt}.urgent`).d('申请加急')}>
                <img src={urgentImg} alt="img" />
              </Tooltip>
            ) : null}
          </div>
        ),
      },
      {
        title: intl.get(`${commonPrompt}.changedFlag`).d('变更中'),
        dataIndex: 'changedFlag',
        width: 150,
        render: yesOrNoRender,
      },
      {
        title: intl.get(`hzero.common.button.status`).d('状态'),
        width: 150,
        dataIndex: 'approvalPendingStatus',
        render: (_, record) => <span>{record.approvalPendingStatusMeaning}</span>,
      },
      {
        title: intl.get(`${commonPrompt}.title`).d('标题'),
        width: 150,
        dataIndex: 'title',
      },
      {
        title: intl.get(`entity.roles.creator`).d('创建人'),
        onCell: this.onCell,
        dataIndex: 'createByName',
        width: 150,
      },
      {
        title: intl.get(`${commonPrompt}.creationTime`).d('创建时间'),
        width: 140,
        dataIndex: 'creationDate',
        sorter: true,
        render: dateTimeRender,
      },
      {
        title: intl.get(`${commonPrompt}.unitName`).d('所属部门'),
        dataIndex: 'unitName',
        sorter: true,
        width: 120,
      },
      {
        title: intl.get(`${commonPrompt}.applyExplain`).d('申请说明'),
        onCell: this.onCell,
        dataIndex: 'remark',
        width: 250,
        render: (text) => <Tooltip title={text}>{text}</Tooltip>,
      },
      {
        title: intl.get(`${commonPrompt}.prSourcePlatform`).d('单据来源'),
        dataIndex: 'prSourcePlatformMeaning',
        width: 120,
      },
      {
        title: intl.get(`hzero.common.button.operating`).d('操作记录'),
        width: 120,
        dataIndex: 'operatorRecord',
        render: (_, record) => (
          <a onClick={() => onShow(record)}>
            {intl.get(`hzero.common.button.operating`).d('操作记录')}
          </a>
        ),
      },
    ];
    const tableProps = {
      loading,
      columns,
      dataSource,
      rowSelection,
      pagination,
      onChange,
      resizable: true,
      bordered: true,
      rowKey: 'prHeaderId',
      scroll: { x: tableScrollWidth(columns) }, //  y: 'calc(100vh - 320px)' todo页面增加固定头.
    };
    return customizeTable(
      { code: 'SRPM.PURCHAE_REQUISITION_APPROVE.LIST.GRID' },
      <Table {...tableProps} />
    );
  }
}

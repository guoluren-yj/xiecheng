/**
 * ClarificationTable - 查看澄清函table
 * @date: 2019-6-14
 * @author: LXM <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */

import React from 'react';
import { Table, Popover } from 'hzero-ui';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';

const promptCode = 'ssrc.supplierBid';

export default class ClarificationTable extends React.Component {
  /**
   * 渲染操作
   */
  @Bind()
  actionRender(record) {
    let mean = '';
    switch (record.replyStatus) {
      case 'PENDING':
        mean = (
          <a onClick={() => this.jumpPendingReplay(record)}>
            {intl.get(`${promptCode}.view.message.button.paending`).d('待回复')}
          </a>
        );
        break;
      case 'ANSWERED':
        mean = (
          <a onClick={() => this.jumpReplied(record)}>
            {intl.get(`${promptCode}.view.message.button.answered`).d('已回复')}
          </a>
        );
        break;
      case 'DEADLINE':
        mean = <span>{intl.get(`${promptCode}.view.message.button.deadline`).d('已超时')}</span>;
        break;
      default:
        break;
    }
    return mean;
  }

  @Bind()
  jumpPendingReplay(record) {
    const { onJumpPendingReplay } = this.props;
    onJumpPendingReplay(record);
  }

  @Bind()
  jumpReplied(record) {
    const { onJumpReplied } = this.props;
    onJumpReplied(record);
  }

  render() {
    const { loading, dataSource, pagination, onChange, onClickNum } = this.props;
    const columns = [
      {
        title: intl.get(`${promptCode}.model.supplierBid.clarifyNotifyNum`).d('澄清通知编号'),
        dataIndex: 'clarifyNotifyNum',
        width: 120,
        render: (val, record) => <a onClick={() => onClickNum(record)}>{val}</a>,
      },
      {
        title: intl.get(`${promptCode}.model.supplierBid.clarifyNotifyTitle`).d('标题'),
        dataIndex: 'clarifyNotifyTitle',
        width: 150,
        render: val => <Popover content={val}>{val}</Popover>,
      },
      {
        title: intl.get(`${promptCode}.model.supplierBid.replyStatus`).d('回复状态'),
        dataIndex: 'replyStatus',
        width: 80,
        render: (_, record) => this.actionRender(record),
      },
      {
        title: intl.get(`${promptCode}.model.supplierBid.customer`).d('客户'),
        dataIndex: 'companyName',
        width: 150,
        render: val => <Popover content={val}>{val}</Popover>,
      },
      {
        title: intl.get(`${promptCode}.model.supplierBid.clarificationSubmitDate`).d('提交时间'),
        dataIndex: 'submittedDate',
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.model.supplierBid.replyEndDate`).d('回复截止时间'),
        dataIndex: 'replyEndDate',
        width: 150,
      },
    ];
    return (
      <Table
        bordered
        rowKey="clarifyNotifyId"
        columns={columns}
        loading={loading}
        onChange={onChange}
        dataSource={dataSource}
        pagination={pagination}
      />
    );
  }
}

/**
 * MaintainTable - 澄清维护table
 * @date: 2019-6-16
 * @author: HZL <zili.hou@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */

import React from 'react';
import { Table, Popover } from 'hzero-ui';
import intl from 'utils/intl';
import { valueMapMeaning } from 'utils/renderer';

export default class MaintainTable extends React.Component {
  render() {
    const {
      Loading,
      onChange,
      onClarfDetail,
      clarifyStatus = [],
      fetchMaintainList,
      maintainListPagination,
    } = this.props;
    const columns = [
      {
        title: intl.get(`ssrc.bidHall.view.question.questionNo`).d('澄清单号'),
        dataIndex: 'clarifyNum',
        width: 100,
        render: (val, record) => <a onClick={() => onClarfDetail(record)}>{val}</a>,
      },
      {
        title: intl.get(`ssrc.bidHall.view.question.questionState`).d('状态'),
        dataIndex: 'clarifyStatus',
        width: 80,
        render: val => valueMapMeaning(clarifyStatus, val),
      },
      {
        title: intl.get(`ssrc.bidHall.view.question.questionDescription`).d('标题'),
        dataIndex: 'title',
        width: 200,
        render: val => <Popover content={val}>{val}</Popover>,
      },
      {
        title: intl.get(`ssrc.bidHall.view.question.questionType`).d('发布人'),
        dataIndex: 'submittedByUserName',
        width: 100,
      },
      {
        title: intl.get(`ssrc.bidHall.view.question.publishDate`).d('发布时间'),
        dataIndex: 'submittedDate',
        width: 150,
      },
      {
        title: intl.get('ssrc.common.company').d('公司'),
        dataIndex: 'companyName',
        width: 100,
      },
    ];
    return (
      <Table
        bordered
        rowKey="clarifyId"
        columns={columns}
        dataSource={fetchMaintainList}
        pagination={maintainListPagination}
        loading={Loading}
        onChange={page => onChange(page)}
      />
    );
  }
}

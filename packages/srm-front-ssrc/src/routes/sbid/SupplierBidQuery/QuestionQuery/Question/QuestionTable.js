/**
 * QuestionTable - 问题维护table
 * @date: 2019-6-14
 * @author: LXM <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */

import React from 'react';
import { Table, Popover } from 'hzero-ui';
import intl from 'utils/intl';
import { valueMapMeaning } from 'utils/renderer';

const promptCode = 'ssrc.supplierBidQuery';

export default class QuestionTable extends React.Component {
  render() {
    const {
      dataSource = [],
      pagination = {},
      onChange,
      rowKey,
      loading,
      handleQuestionDetails,
      handleClarificationDetails,
      code: { issueLineStatus = [], clarifyType = [] },
    } = this.props;
    const columns = [
      {
        title: intl.get(`${promptCode}.model.supplierBidQuery.questionNo`).d('问题编号'),
        dataIndex: 'issueFinalNum',
        width: 120,
        render: (val, record) => <a onClick={() => handleQuestionDetails(record)}>{val}</a>,
      },
      {
        title: intl.get(`${promptCode}.model.supplierBidQuery.clarifyStatus`).d('状态'),
        dataIndex: 'issueLineStatus',
        width: 80,
        render: (val, record) =>
          val === 'CLARIFIED' ? (
            <a onClick={() => handleClarificationDetails(record)}>
              {valueMapMeaning(issueLineStatus, val)}
            </a>
          ) : (
            <a onClick={() => handleQuestionDetails(record)}>
              {valueMapMeaning(issueLineStatus, val)}
            </a>
          ),
      },
      {
        title: intl.get(`${promptCode}.model.supplierBidQuery.questionType`).d('澄清类型'),
        dataIndex: 'clarifyType',
        width: 80,
        render: val => valueMapMeaning(clarifyType, val),
      },
      {
        title: intl.get(`${promptCode}.model.supplierBidQuery.queDes`).d('问题描述'),
        dataIndex: 'description',
        width: 200,
        render: val => <Popover content={val}>{val}</Popover>,
      },
      {
        title: intl.get(`${promptCode}.model.supplierBidQuery.submitDate`).d('提交时间'),
        dataIndex: 'submittedDate',
        width: 100,
      },
      {
        title: intl.get('ssrc.common.company').d('公司'),
        dataIndex: 'supplierCompanyName',
        width: 80,
        render: val => <Popover content={val}>{val}</Popover>,
      },
      {
        title: intl.get(`${promptCode}.model.supplierBidQuery.submitters`).d('提交人'),
        dataIndex: 'submittedByUserName',
        width: 80,
      },
    ];
    return (
      <Table
        bordered
        loading={loading}
        rowKey={rowKey}
        onChange={onChange}
        columns={columns}
        dataSource={dataSource}
        pagination={pagination}
      />
    );
  }
}

/**
 * MaintainTable - 问题维护table
 * @date: 2019-6-14
 * @author: LXM <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */

import React from 'react';
import { Table, Popover } from 'hzero-ui';
import intl from 'utils/intl';
import { valueMapMeaning } from 'utils/renderer';

const promptCode = 'ssrc.supplierBid';

export default class MaintainTable extends React.Component {
  render() {
    const {
      dataSource = [],
      pagination = {},
      onChange,
      rowKey,
      loading,
      handleDetails,
      handleCreate,
      handleMaintainDetails,
      code: { clarifyType = [] },
    } = this.props;
    const columns = [
      {
        title: intl.get(`${promptCode}.model.supplierBid.questionNo`).d('问题编号'),
        dataIndex: 'issueFinalNum',
        width: 120,
        render: (val, record) =>
          record.issueLineStatus === 'NEW' ? (
            <a onClick={() => handleCreate(record)}>{val}</a>
          ) : (
            <a onClick={() => handleDetails(record)}>{val}</a>
          ),
      },
      {
        title: intl.get(`${promptCode}.model.supplierBid.questionState`).d('状态'),
        dataIndex: 'issueLineStatusMeaning',
        width: 80,
        render: (val, record) =>
          record.issueLineStatus === 'CLARIFIED' ? (
            <a onClick={() => handleMaintainDetails(record)}>{val}</a>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${promptCode}.model.supplierBid.questionType`).d('澄清类型'),
        dataIndex: 'clarifyType',
        width: 80,
        render: val => valueMapMeaning(clarifyType, val),
      },
      {
        title: intl.get(`${promptCode}.model.supplierBid.questionDescription`).d('问题描述'),
        dataIndex: 'description',
        width: 200,
        render: val => <Popover content={val}>{val}</Popover>,
      },
      {
        title: intl.get(`${promptCode}.model.supplierBid.questionSubmitDate`).d('提交时间'),
        dataIndex: 'submittedDate',
        width: 100,
        render: val => <Popover content={val}>{val}</Popover>,
      },
      {
        title: intl.get('ssrc.common.company').d('公司'),
        dataIndex: 'supplierCompanyName',
        width: 80,
        render: val => <Popover content={val}>{val}</Popover>,
      },
      {
        title: intl.get(`${promptCode}.model.supplierBid.questionSubmitter`).d('提交人'),
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

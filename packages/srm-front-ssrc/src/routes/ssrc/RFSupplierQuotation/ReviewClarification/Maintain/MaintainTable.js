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

const promptCode = 'ssrc.supplierQuotation';

export default class MaintainTable extends React.Component {
  render() {
    const {
      sourceFrom,
      dataSource = [],
      pagination = {},
      onChange,
      rowKey,
      loading,
      handleDetails,
      handleCreate,
      handleMaintainDetails,
    } = this.props;
    const columns = [
      {
        title: intl.get(`${promptCode}.model.supQuo.questionNo`).d('问题编号'),
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
        title: intl.get('hzero.common.status').d('状态'),
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
        title: intl.get(`${promptCode}.model.supQuo.questionType`).d('澄清类型'),
        dataIndex: 'clarifyTypeMeaning',
        width: 80,
      },
      {
        title: intl.get(`${promptCode}.model.supQuo.questionDescription`).d('问题描述'),
        dataIndex: 'description',
        width: 200,
        render: (val) => <Popover content={val}>{val}</Popover>,
      },
      {
        title: intl.get(`${promptCode}.model.supQuo.questionSubmitDate`).d('提交时间'),
        dataIndex: 'submittedDate',
        width: 150,
        render: (val) => <Popover content={val}>{val}</Popover>,
      },
      {
        title: intl.get(`${promptCode}.model.supQuo.questionSupplier`).d('供应商'),
        dataIndex: 'supplierCompanyName',
        width: 80,
        render: (val) => <Popover content={val}>{val}</Popover>,
      },
      {
        title: intl.get(`${promptCode}.model.supQuo.questionSubmitter`).d('提交人'),
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
        columns={
          sourceFrom === 'RFX'
            ? columns
            : columns.filter((ele) => ele.dataIndex !== 'clarifyTypeMeaning')
        }
        dataSource={dataSource}
        pagination={pagination}
      />
    );
  }
}

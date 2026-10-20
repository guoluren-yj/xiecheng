/**
 * Update - 价格库-手工创建&更新价格-物料价格信息维护table
 * @date: 2020-2-12
 * @author: zhijian.li@hand-china.com
 * @version: 1.0.0
 * @copyright Copyright (c) 2019, Hand
 */

import React, { PureComponent } from 'react';
import { Table } from 'hzero-ui';
import intl from 'utils/intl';

export default class ApprovalInfoTable extends PureComponent {
  render() {
    const {
      scrollWidth,
      priceChangePagination,
      Loading,
      handleSearch,
      priceChangeList = [],
      linkToDetail,
    } = this.props;
    const columns = [
      {
        title: intl.get('ssrc.priceLibrary.model.library.status').d('状态'),
        dataIndex: 'docStatusMeaning',
        width: 100,
      },
      {
        title: intl.get('ssrc.priceLibrary.model.library.applyOrderNum').d('申请单号'),
        dataIndex: 'docNum',
        width: 150,
        render: (val, record) => <a onClick={() => linkToDetail(record)}> {val} </a>,
      },
      {
        title: intl.get('ssrc.priceLibrary.model.library.submitter').d('提交人'),
        dataIndex: 'realName',
        width: 100,
      },
      {
        title: intl.get('ssrc.priceLibrary.model.library.approvalType').d('审批方式'),
        dataIndex: 'approvalTypeMeaning',
        width: 120,
      },
      {
        title: intl.get('ssrc.priceLibrary.model.library.creationDateTime').d('创建时间'),
        dataIndex: 'creationDate',
        width: 150,
      },
      {
        title: intl.get('ssrc.priceLibrary.model.library.approvalDateTime').d('审批时间'),
        dataIndex: 'approvalDate',
        width: 150,
      },
    ];
    const scrollWidthX = scrollWidth(columns, 120);
    return (
      <Table
        scroll={{ x: scrollWidthX }}
        dataSource={priceChangeList}
        pagination={priceChangePagination}
        rowKey="priceLibraryId"
        loading={Loading}
        columns={columns}
        bordered
        onChange={(page) => handleSearch(page)}
      />
    );
  }
}

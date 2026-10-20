/**
 * MaintainTable - 澄清维护table
 * @date: 2019-11-13
 * @author: jing.chen05@hand-china.com
 * @version: 1.0.0
 * @copyright Copyright (c) 2019, Hand
 */
import React from 'react';
import { Table, Popover } from 'hzero-ui';

import intl from 'utils/intl';

export default class MaintainTable extends React.Component {
  render() {
    const {
      Loading,
      onChange,
      onClarfDetail,
      // clarifyStatus = [],
      fetchMaintainList,
      maintainListPagination,
      customizeTable,
      // sourceKey,
      bidFlag,
    } = this.props;

    const columns = [
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.questionNo`).d('澄清单号'),
        dataIndex: 'clarifyNum',
        width: 100,
        render: (val, record) => <a onClick={() => onClarfDetail(record)}>{val}</a>,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.questionState`).d('状态'),
        dataIndex: 'clarifyStatusMeaning',
        width: 80,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.questionDescription`).d('标题'),
        dataIndex: 'title',
        width: 200,
        render: (val) => <Popover content={val}>{val}</Popover>,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.questionUser`).d('发布人'),
        dataIndex: 'submittedByUserName',
        width: 100,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.publishDate`).d('发布时间'),
        dataIndex: 'submittedDate',
        width: 150,
      },
      {
        title: intl.get('ssrc.common.company').d('公司'),
        dataIndex: 'companyName',
        width: 100,
      },
    ];

    const table = (
      <Table
        bordered
        rowKey="clarifyId"
        columns={columns}
        dataSource={fetchMaintainList}
        pagination={maintainListPagination}
        loading={Loading}
        onChange={(page) => onChange(page)}
      />
    );

    return customizeTable
      ? customizeTable(
          {
            code: bidFlag
              ? 'SSRC.BID_HALL.NEW_CLARIFY.LIST_CLARIFICATION'
              : 'SSRC.INQUIRY_HALL.NEW_CLARIFY.LIST_CLARIFICATION',
            readOnly: true,
          },
        <Table
          bordered
          rowKey="clarifyId"
          columns={columns}
          dataSource={fetchMaintainList}
          pagination={maintainListPagination}
          loading={Loading}
          onChange={(page) => onChange(page)}
        />
        )
      : table;
  }
}

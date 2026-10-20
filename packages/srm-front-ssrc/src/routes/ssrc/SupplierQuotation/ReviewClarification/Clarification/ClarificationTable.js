/**
 * ClarificationTable - 查看澄清函table
 * @date: 2019-6-14
 * @author: LXM <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */

import React from 'react';
import { Table, Popover, Badge } from 'hzero-ui';
import intl from 'utils/intl';
import styles from '../index.less';

const promptCode = 'ssrc.supplierQuotation';

export default class ClarificationTable extends React.Component {
  render() {
    const {
      rowKey,
      loading,
      dataSource,
      pagination,
      onChange,
      onClick,
      customizeTable,
      bidFlag,
    } = this.props;
    const columns = [
      {
        title: intl.get(`${promptCode}.model.supQuo.clarificationNo`).d('澄清单号'),
        dataIndex: 'clarifyNum',
        width: 120,
        // unreadIssueSize
        render: (val, record) => {
          return (
            <>
              <a onClick={() => onClick(record)}>{val}</a>
              <Badge count={record?.unreadIssueSize} className={styles['badge-item']} />
            </>
          );
        },
      },
      {
        title: intl.get(`${promptCode}.model.supQuo.title`).d('标题'),
        dataIndex: 'title',
        width: 200,
        render: (val) => <Popover content={val}>{val}</Popover>,
      },
      {
        title: intl.get('ssrc.common.company').d('公司'),
        dataIndex: 'companyName',
        width: 200,
      },
      {
        title: intl.get(`${promptCode}.model.supQuo.submittedByUserName`).d('发布人'),
        dataIndex: 'submittedByUserName',
        width: 80,
      },
      {
        title: intl.get(`${promptCode}.model.supQuo.submittedDate`).d('发布时间'),
        dataIndex: 'submittedDate',
        width: 100,
      },
    ];

    const table = (
      <Table
        bordered
        rowKey={rowKey}
        columns={columns}
        loading={loading}
        onChange={onChange}
        dataSource={dataSource}
        pagination={pagination}
      />
    );

    return customizeTable
      ? customizeTable(
          {
            code: `SSRC.${!bidFlag ? '' : 'BID_'}SUPPLIER_CLARIFICATION.CLARIFICATION_VIEW`,
            readOnly: true,
          },
          table
        )
      : table;
  }
}

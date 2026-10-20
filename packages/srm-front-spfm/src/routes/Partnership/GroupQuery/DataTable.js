/**
 * DataTable -集团查询表格页面
 * @date: 2018-8-8
 * @author dengtingmin <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { Table, Form } from 'hzero-ui';
import classnames from 'classnames';
import moment from 'moment';

import intl from 'utils/intl';
import { enableRender } from 'utils/renderer';
import { getDateTimeFormat } from 'utils/utils';

import styles from '../index.less';

@Form.create({ fieldNameProp: null })
export default class DataTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sortedInfo: null,
    };
  }

  /**
   * 集团编辑
   * @param {*object} record
   */
  groupTableEdit(record) {
    const { onHandleEditGroup } = this.props;
    onHandleEditGroup(record);
  }

  render() {
    const { sortedInfo } = this.state;
    const {
      groupDataSource,
      onHandleStandardTableChange,
      loading,
      groupPagination = {},
    } = this.props;
    const columns = [
      {
        title: intl.get('entity.group.code').d('集团编码'),
        dataIndex: 'groupNum',
        align: 'left',
        width: 120,
        sorter: (a, b) => this.selectSort(a, b),
        sortOrder: sortedInfo === 'groupNum' && sortedInfo.order,
      },
      {
        title: intl.get('entity.group.name').d('集团名称'),
        dataIndex: 'groupName',
        width: 200,
        align: 'left',
      },
      {
        title: intl.get('spfm.partnership.model.group.creationDate').d('注册时间'),
        dataIndex: 'creationDate',
        width: 150,
        sorter: (a, b) => a.time - b.time,
        sortOrder: sortedInfo === 'creationDate' && sortedInfo.order,
        render: (text) => {
          return <span>{moment(text).format(getDateTimeFormat())}</span>;
        },
      },
      {
        title: intl.get('hzero.common.status').d('状态'),
        width: 80,
        dataIndex: 'enabledFlag',
        render: enableRender,
      },
      {
        title: intl.get('spfm.partnership.model.group.coreFlag').d('核心企业'),
        width: 100,
        dataIndex: 'coreFlag',
        render: (val) => {
          return val === 1
            ? intl.get('hzero.common.status.yes')
            : intl.get('hzero.common.status.no');
        },
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 80,
        dataIndex: 'error',
        render: (val, record) => (
          <a onClick={() => this.groupTableEdit(record)}>
            {intl.get('hzero.common.button.edit').d('编辑')}
          </a>
        ),
      },
    ];
    return (
      <Table
        bordered
        className={classnames(styles.table)}
        columns={columns}
        loading={loading}
        dataSource={groupDataSource.content || []}
        onChange={onHandleStandardTableChange}
        pagination={groupPagination}
      />
    );
  }
}

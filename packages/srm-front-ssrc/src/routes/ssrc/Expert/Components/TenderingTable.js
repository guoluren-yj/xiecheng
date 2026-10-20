/**
 * TenderingTable - 参与历史寻源
 * @date: 2019-01-21
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
// import { isEmpty } from 'lodash';
// import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
// import { getCurrentOrganizationId } from 'utils/utils';
import EditTable from 'components/EditTable';

const promptCode = 'ssrc.expert';

/**
 * 参与历史招标
 * @extends {Component} - PureComponent
 * @reactProps {String} organizationId - 租户Id
 * @return React.element
 */

export default class TenderingTable extends PureComponent {
  state = {
    // selectedRows: [],
    rowKey: 'expertAchvReqId',
  };

  // componentDidMount() {
  //   const { onClearRows } = this.props;
  //   if (onClearRows) onClearRows(this.handleClearSelectedRows);
  // }

  /**
   * 将selectedRows置空
   */
  // @Bind()
  // handleClearSelectedRows() {
  //   this.setState({ selectedRows: [] });
  // }

  /**
   * 保存选中的行
   * @param {*} selectedRowKeys
   * @param {Array} selectedRows 行数据
   */
  // @Bind()
  // onSelectChange(selectedRowKeys, selectedRows) {
  //   this.setState({ selectedRows });
  // }

  render() {
    const { dataSource = [] } = this.props;
    const { rowKey } = this.state;
    const columns = [
      {
        title: intl.get(`${promptCode}.model.expert.test1`).d('寻源编号'),
        dataIndex: 'test1',
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.model.expert.test2`).d('申请名称'),
        dataIndex: 'test2',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.model.expert.test3`).d('申请公司'),
        dataIndex: 'test3',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.model.expert.test4`).d('参与日期从'),
        dataIndex: 'test4',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.model.expert.test5`).d('参与日期至'),
        dataIndex: 'test5',
        width: 120,
      },
      {
        title: intl.get('hzero.common.status').d('状态'),
        dataIndex: 'test6',
        width: 75,
      },
      {
        title: intl.get(`${promptCode}.model.expert.test6`).d('评标组长'),
        dataIndex: 'test7',
        width: 100,
      },
    ];
    const rowSelection = {
      onChange: this.onSelectChange,
      getCheckboxProps: record => ({
        disabled: record._status === 'create',
      }),
    };
    return (
      <React.Fragment>
        <EditTable
          bordered
          rowKey={rowKey}
          dataSource={dataSource}
          columns={columns}
          pagination={false}
          rowSelection={rowSelection}
        />
      </React.Fragment>
    );
  }
}

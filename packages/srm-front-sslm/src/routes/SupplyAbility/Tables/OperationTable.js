/**
 * OperationTable
 * @date: 2018-10-10
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Table } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { createPagination } from 'utils/utils';
import intl from 'utils/intl';
import { dateTimeRender } from 'utils/renderer';
import formatterCollections from 'utils/intl/formatterCollections';

// const promptCode = 'sslm.supplyAbility';

/**
 * 操作记录
 * @extends {PureComponent} - React.PureComponent
 * @return React.element
 */

@formatterCollections({
  code: ['sslm.supplyAbility'],
})
export default class OperationTable extends PureComponent {
  /**
   * 列表分页函数
   * @param {Number} [params.page = 0] - 数据页码
   * @param {Number} [params.size = 10] - 分页大小
   */
  @Bind()
  handleTableChange(pagination) {
    this.props.onTableChange(pagination);
  }

  render() {
    const { dataSource = {}, loading } = this.props;
    const { content = [] } = dataSource;
    const columns = [
      {
        title: intl.get('sslm.supplyAbility.model.supplyAbility.processUserName').d('操作人'),
        dataIndex: 'processUserName',
        width: 160,
      },
      {
        title: intl.get('sslm.supplyAbility.model.supplyAbility.processTime').d('操作时间'),
        dataIndex: 'processDate',
        width: 160,
        render: dateTimeRender,
      },
      {
        title: intl.get('sslm.supplyAbility.model.supplyAbility.processStatusMeans').d('动作'),
        dataIndex: 'processStatusMeaning',
        width: 140,
      },
      {
        title: intl.get('sslm.supplyAbility.model.supplyAbility.processRemark').d('说明'),
        dataIndex: 'processRemark',
      },
    ];
    return (
      <Table
        rowKey="recordId"
        bordered
        loading={loading}
        columns={columns}
        dataSource={content}
        pagination={createPagination(dataSource)}
        onChange={this.handleTableChange}
      />
    );
  }
}

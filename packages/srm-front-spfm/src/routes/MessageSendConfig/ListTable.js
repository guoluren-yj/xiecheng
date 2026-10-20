import React, { PureComponent, Fragment } from 'react';
import { Table } from 'hzero-ui';
import intl from 'utils/intl';
import { enableRender } from 'utils/renderer';

/**
 * 消息发送配置数据展示列表
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} onSearch - 分页查询
 * @reactProps {Boolean} loading - 数据加载完成标记
 * @reactProps {Array} dataSource - Table数据源
 * @reactProps {Object} pagination - 分页器
 * @reactProps {Number} pagination.current - 当前页码
 * @reactProps {Number} pagination.pageSize - 分页大小
 * @reactProps {Number} pagination.total - 数据总量
 * @return React.element
 */
export default class ListTable extends PureComponent {
  /**
   * render
   * @returns React.element
   */
  render() {
    const { loading, dataSource, pagination, onSearch, onEdit } = this.props;
    const columns = [
      {
        title: intl.get('entity.tenant.tag').d('租户'),
        dataIndex: 'tenantName',
        width: 200,
      },
      {
        title: intl.get('spfm.messageSendConfig.model.receiver.messageName').d('消息名称'),
        dataIndex: 'messageName',
      },
      {
        title: intl.get('spfm.messageSendConfig.model.receiver.receiverType').d('接收者类型'),
        dataIndex: 'receiverTypeName',
        width: 200,
      },
      {
        title: intl.get('hzero.common.status').d('状态'),
        dataIndex: 'enabledFlag',
        width: 150,
        render: enableRender,
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        dataIndex: 'operator',
        width: 150,
        render: (val, record) => (
          <a onClick={() => onEdit(record)}>{intl.get('hzero.common.button.edit').d('编辑')}</a>
        ),
      },
    ];
    return (
      <Fragment>
        <Table
          bordered
          rowKey="relationId"
          loading={loading}
          columns={columns}
          dataSource={dataSource}
          pagination={pagination}
          onChange={page => onSearch(page)}
        />
      </Fragment>
    );
  }
}

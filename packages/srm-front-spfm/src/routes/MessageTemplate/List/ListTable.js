import React, { PureComponent, Fragment } from 'react';
import { Table } from 'hzero-ui';
import { enableRender } from 'utils/renderer';
import intl from 'utils/intl';
// import styles from './index.less';

/**
 * 消息模板数据展示列表
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} onChange - 分页查询
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
   * 明细维护
   * @param {object} record - 消息模板对象
   */
  changeDetail(record) {
    this.props.onMaintain(record);
  }

  /**
   * 编辑
   * @param {object} record - 消息模板对象
   */
  changeEdit(record) {
    this.props.onEdit(record);
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const { loading, dataSource, pagination, onChange } = this.props;
    const columns = [
      {
        title: intl.get(`spfm.messageTemplate.model.template.tenantId`).d('租户'),
        dataIndex: 'tenantName',
        width: 200,
      },
      {
        title: intl.get(`spfm.messageTemplate.model.template.code`).d('消息模板代码'),
        dataIndex: 'templateCode',
        width: 200,
      },
      {
        title: intl.get(`spfm.messageTemplate.model.template.name`).d('消息模板名称'),
        dataIndex: 'templateName',
      },
      {
        title: intl.get(`hzero.common.remark`).d('备注'),
        dataIndex: 'remark',
      },
      {
        title: intl.get('hzero.common.status').d('状态'),
        dataIndex: 'enabledFlag',
        width: 100,
        render: enableRender,
      },
      {
        title: intl.get('spfm.messageTemplate.view.option.maintain').d('明细维护'),
        dataIndex: 'maintain',
        width: 100,
        render: (val, record) => (
          <a onClick={() => this.changeDetail(record)} style={{ cursor: 'pointer' }}>
            {intl.get('spfm.messageTemplate.view.option.maintain').d('明细维护')}
          </a>
        ),
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        dataIndex: 'operator',
        width: 100,
        render: (val, record) => (
          <a onClick={() => this.changeEdit(record)}>
            {intl.get('hzero.common.status.edit').d('编辑')}
          </a>
        ),
      },
    ];
    return (
      <Fragment>
        <Table
          bordered
          rowKey="templateId"
          loading={loading}
          columns={columns}
          dataSource={dataSource}
          pagination={pagination}
          onChange={onChange}
        />
      </Fragment>
    );
  }
}

import React, { PureComponent } from 'react';
import { Table, Popover } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import { dateTimeRender, valueMapMeaning } from 'utils/renderer';

/**
 * 数据列表
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
export default class TableList extends PureComponent {
  /**
   *跳转到澄清详情页面
   *
   */
  @Bind()
  clarification(record) {
    const { onClarification } = this.props;
    onClarification(record);
  }

  /**
   * 渲染columns
   * @returns {*}
   */
  renderColumns() {
    const { clarifyStatus = [] } = this.props;
    const columns = [
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.clarifyNum`).d('澄清单号'),
        dataIndex: 'clarifyNum',
        width: 150,
        render: (val, record) => <a onClick={() => this.clarification(record)}>{val}</a>,
      },
      {
        title: intl.get('hzero.common.status').d('状态'),
        dataIndex: 'clarifyStatus',
        width: 100,
        render: val => valueMapMeaning(clarifyStatus, val),
      },
      {
        title: intl.get('hzero.common.button.title').d('标题'),
        dataIndex: 'title',
        width: 150,
        render: val => <Popover content={val}>{val}</Popover>,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.submittedByUserName`).d('发布人'),
        dataIndex: 'submittedByUserName',
        width: 150,
      },
      {
        title: intl.get('hzero.common.date.release').d('发布时间'),
        dataIndex: 'submittedDate',
        width: 150,
        render: dateTimeRender,
      },
      {
        title: intl.get('ssrc.common.company').d('公司'),
        dataIndex: 'companyName',
        width: 150,
      },
    ];
    return columns;
  }

  render() {
    const { loading, dataSource = [], clarifyViewPagination, onChange } = this.props;

    return (
      <Table
        bordered
        rowKey="clarifyId"
        loading={loading}
        columns={this.renderColumns()}
        dataSource={dataSource}
        pagination={clarifyViewPagination}
        onChange={page => onChange(page)}
      />
    );
  }
}

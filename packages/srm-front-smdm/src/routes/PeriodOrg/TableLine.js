import React, { PureComponent, Fragment } from 'react';
import { Table } from 'hzero-ui';
import intl from 'utils/intl';
import { dateRender } from 'utils/renderer';

/**
 * 租户期间查询数据展示组件
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} onChange - 分页查询
 * @reactProps {Array} dataSource - table数据源
 * @reactProps {String} pagination - 分页器
 * @reactProps {Number} [pagination.current] - 当前页码
 * @reactProps {Number} [pagination.pageSize] - 分页大小
 * @reactProps {Number} [pagination.total] - 数据总量
 * @return React.element
 */
export default class ListTable extends PureComponent {
  /**
   * render
   * @returns React.element
   */
  render() {
    const { loading, dataSource, pagination, onSearch } = this.props;
    const columns = [
      {
        title: intl.get('smdm.period.model.period.periodSetCode').d('会计期编码'),
        dataIndex: 'periodSetCode',
        width: 150,
      },
      {
        title: intl.get('smdm.period.model.period.periodSetName').d('会计期名称'),
        dataIndex: 'periodSetName',
        width: 200,
      },
      {
        title: intl.get('smdm.period.model.period.periodTotalCount').d('期间总数'),
        dataIndex: 'periodTotalCount',
        width: 100,
        align: 'left',
      },
      {
        title: intl.get('smdm.period.model.period.periodName').d('期间'),
        dataIndex: 'periodName',
        width: 100,
        align: 'left',
      },
      {
        title: intl.get('smdm.period.model.period.periodYear').d('年'),
        dataIndex: 'periodYear',
        width: 100,
        align: 'left',
      },
      {
        title: intl.get('smdm.period.model.period.startDate').d('期间从'),
        dataIndex: 'startDate',
        width: 100,
        align: 'left',
        render: dateRender,
      },
      {
        title: intl.get('smdm.period.model.period.endDate').d('期间至'),
        dataIndex: 'endDate',
        width: 100,
        align: 'left',
        render: dateRender,
      },
      {
        title: intl.get('smdm.period.model.period.periodQuarter').d('季度'),
        dataIndex: 'periodQuarter',
        width: 100,
        align: 'left',
      },
    ];
    return (
      <Fragment>
        <Table
          bordered
          rowKey="periodId"
          loading={loading}
          columns={columns}
          dataSource={dataSource}
          pagination={pagination}
          onChange={(page) => onSearch(page)}
        />
      </Fragment>
    );
  }
}

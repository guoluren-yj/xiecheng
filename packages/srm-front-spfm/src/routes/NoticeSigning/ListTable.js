import React, { PureComponent } from 'react';
import { Table } from 'hzero-ui';
import intl from 'utils/intl';
import { sum } from 'lodash';
import { dateTimeRender } from 'utils/renderer'; //日期时间格式化

/**
 * 8D创建- 列表展示
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
   * render
   * @returns React.element
   */
  render() {
    const { customizeTable, loading, dataSource, pagination, onDetail, onSearch } = this.props;
    const columns = [
      {
        title: intl.get(`hzero.common.status`).d('状态'),
        dataIndex: 'notificationStatusMeaning',
        width: 80,
      },
      {
        title: intl.get(`spfm.common.model.noticeCode`).d('通知单编号'),
        dataIndex: 'notificationNum',
        width: 120,
        render: (val, record) => <a onClick={() => onDetail(record)}>{val}</a>,
      },
      {
        title: intl.get(`spfm.common.model.noticeName`).d('通知单名称'),
        dataIndex: 'notificationTitle',
        width: 120,
      },
      {
        title: intl.get(`spfm.common.model.noticeType`).d('通知单类型'),
        dataIndex: 'notificationTypeMeaning',
        width: 120,
      },
      {
        title: intl.get(`entity.customer.name`).d('客户名称'),
        dataIndex: 'companyName',
        width: 120,
      },
      {
        title: intl.get(`entity.company.name`).d('公司名称'),
        dataIndex: 'supplierCompanyName',
        width: 100,
      },
      {
        title: intl.get(`spfm.common.model.signDate`).d('签收日期'),
        dataIndex: 'receiveDate',
        render: (val) => dateTimeRender(val),
        width: 100,
      },
      {
        title: intl.get(`spfm.common.model.createDate`).d('创建时间'),
        dataIndex: 'creationDate',
        width: 100,
        render: (val) => dateTimeRender(val),
      },
      {
        title: intl.get(`entity.roles.creator`).d('创建人'),
        dataIndex: 'realName',
        width: 100,
      },
    ];
    return customizeTable(
      {
        code: 'SPFM.PORTAL.NOTICESIGN.PUBLISH.LIST.TB',
      }, <Table
      rowKey="notificationReceiveId"
      bordered
      scroll={{ x: sum(columns.map((n) => n.width)) + 300 }}
      loading={loading}
      columns={columns}
      dataSource={dataSource}
      pagination={pagination}
      onChange={(page) => onSearch(page)}
    />
    );
  }
}

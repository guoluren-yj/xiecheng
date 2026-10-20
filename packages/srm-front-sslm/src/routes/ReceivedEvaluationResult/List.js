import React, { Component } from 'react';
import { Table } from 'hzero-ui';
import intl from 'utils/intl';
import { dateRender, dateTimeRender } from 'utils/renderer';
import formatterCollections from 'utils/intl/formatterCollections';

/**
 * 考评结果数据列表
 * @extends {Component} - React.Component
 * @reactProps {Boolean} loading - 数据加载是否完成
 * @reactProps {Object} dataSource - Table数据源
 * @reactProps {Function}  viewDetail - 跳转到详情页面
 * @reactProps {Object} pagination - 分页器
 * @return React.element
 */

@formatterCollections({ code: ['sslm.common'] })
export default class List extends Component {
  /**
   * render
   * @return React.element
   */
  render() {
    const {
      loading,
      pagination,
      viewDetail,
      dataSource,
      rowSelection,
      onChange,
      customizeTable,
    } = this.props;

    const columns = [
      {
        title: intl.get(`sslm.common.model.archive.status`).d('档案状态'),
        dataIndex: 'evalStatusMeaning',
        width: 100,
      },
      {
        title: intl.get(`sslm.common.model.archive.num`).d('档案编码'),
        dataIndex: 'evalNum',
        render: (val, record) => <a onClick={() => viewDetail(record)}>{val}</a>,
        width: 140,
      },
      {
        title: intl.get(`sslm.common.model.archive.describe`).d('档案描述'),
        dataIndex: 'evalName',
        width: 150,
      },
      {
        title: intl.get(`sslm.common.model.evaluation.cycle`).d('考评周期'),
        dataIndex: 'evalCycleMeaning',
        width: 150,
      },
      {
        title: intl.get(`sslm.common.model.evaluation.date.after`).d('考评日期从'),
        dataIndex: 'evalDateFrom',
        render: dateRender,
        width: 120,
      },
      {
        title: intl.get(`sslm.common.model.evaluation.date.before`).d('考评日期至'),
        dataIndex: 'evalDateTo',
        render: dateRender,
        width: 120,
      },
      {
        title: intl.get(`sslm.common.model.dimension.value`).d('维度值'),
        dataIndex: 'evalDimensionValueMeaning',
        width: 150,
      },
      {
        title: intl.get(`sslm.common.model.evaluation.charger`).d('考评负责人'),
        dataIndex: 'processUserName',
        width: 150,
      },
      {
        title: intl.get(`sslm.common.model.evaluation.createdUserName`).d('创建人'),
        dataIndex: 'createdUserName',
        width: 150,
      },
      {
        title: intl.get(`sslm.common.model.archive.create.time`).d('建档时间'),
        dataIndex: 'creationDate',
        width: 150,
        render: dateTimeRender,
      },
    ];
    return customizeTable(
      { code: 'SSLM.EVALUATION_RECEIVED_LIST.LIST' },
      <Table
        bordered
        loading={loading}
        rowKey="evalHeaderId"
        columns={columns}
        dataSource={dataSource}
        pagination={pagination}
        rowSelection={rowSelection}
        onChange={onChange}
      />
    );
  }
}

import React, { Component } from 'react';
import { Table } from 'hzero-ui';
import { isNumber, sum } from 'lodash';
import intl from 'utils/intl';
import { dateRender, dateTimeRender, valueMapMeaning } from 'utils/renderer';

/**
 * 已填制考评档案列表组件
 * @extends {Component} - React.element
 * @reactProps {Object} dataSource - table数据源
 * @reactProps {Boolean} loading - 数据加载是否完成
 * @reactProps {Function} viewDetail - 查看详细方法
 * @reactProps {Object} pagination - 分页器
 * @returns React.element
 */
export default class List extends Component {
  /**
   * render
   * @returns React.element
   * @memberof List
   */
  render() {
    const {
      loading,
      pagination,
      viewDetail,
      dataSource,
      onChange,
      methodValue,
      customizeTable,
    } = this.props;

    const columns = [
      {
        title: intl.get(`sslm.supplierDocManage.model.docManage.evalStatus`).d('档案状态'),
        dataIndex: 'evalStatusMeaning',
        width: 120,
      },
      {
        title: intl.get(`sslm.common.model.archiveFilled.completeFlag`).d('评分状态'),
        dataIndex: 'scoreStatusMeaning',
        width: 120,
      },
      {
        title: intl.get('sslm.common.model.archive.fileCode').d('档案编码'),
        dataIndex: 'evalNum',
        render: (val, record) => <a onClick={() => viewDetail(record)}>{val}</a>,
        width: 160,
      },
      {
        title: intl.get(`sslm.common.model.archive.fileDescribe`).d('档案描述'),
        dataIndex: 'evalName',
        width: 200,
      },
      {
        title: intl.get(`sslm.common.model.archive.evaluation.template`).d('考评模板'),
        dataIndex: 'evalTplName',
        width: 200,
      },
      {
        title: intl.get(`sslm.common.model.archive.evaluation.evalTplType`).d('模板类型'),
        dataIndex: 'evalTplTypeMeaning',
        width: 200,
      },
      {
        title: intl.get(`sslm.common.model.archive.kpiMethod`).d('考评方式'),
        dataIndex: 'kpiMethod',
        width: 120,
        render: val => valueMapMeaning(methodValue, val),
      },
      {
        title: intl.get(`sslm.common.model.archive.evaluation.cycle`).d('考评周期'),
        dataIndex: 'evalCycleMeaning',
        width: 150,
      },
      {
        title: intl.get(`sslm.common.model.archive.evaluation.dateFrom`).d('考评日期从'),
        dataIndex: 'evalDateFrom',
        render: dateRender,
        width: 120,
      },
      {
        title: intl.get(`sslm.common.model.archive.evaluation.dateTo`).d('考评日期至'),
        dataIndex: 'evalDateTo',
        render: dateRender,
        width: 120,
      },
      {
        title: intl.get(`sslm.common.model.archive.evaluation.dimension`).d('考评维度'),
        dataIndex: 'evalDimensionMeaning',
        width: 120,
      },
      {
        title: intl.get(`sslm.common.model.archive.evaluation.dimensionValue`).d('维度值'),
        dataIndex: 'evalDimensionValueMeaning',
      },
      {
        title: intl.get(`sslm.common.model.archive.evaluation.charger`).d('考评负责人'),
        dataIndex: 'processUserName',
        width: 150,
      },
      {
        title: intl.get(`sslm.common.model.archive.evaluation.createdUserName`).d('创建人'),
        dataIndex: 'createdUserName',
        width: 150,
      },
      {
        title: intl.get(`sslm.common.model.archive.create.time`).d('建档时间'),
        dataIndex: 'creationDate',
        render: dateTimeRender,
        width: 150,
      },
    ];

    const scrollX = sum(columns.map(n => (isNumber(n.width) ? n.width : 150))) + 150;
    return customizeTable(
      {
        code: 'SSLM.ARCHIVE_FILLED_LIST.LIST',
      },
      <Table
        bordered
        loading={loading}
        rowKey="evalHeaderId"
        columns={columns}
        scroll={{ x: scrollX, y: 'calc(100vh - 339px)' }}
        dataSource={dataSource}
        pagination={pagination}
        onChange={onChange}
      />
    );
  }
}

import React, { Component } from 'react';
import { Table } from 'hzero-ui';
import { isNumber, sum } from 'lodash';
import intl from 'utils/intl';
import { dateRender, dateTimeRender, valueMapMeaning } from 'utils/renderer';

/**
 * 年度考评结果列表
 * @extends {Component} - React.Component
 * @reactProps {Object} dataSource - 数据源
 * @reactProps {Boolean} loading - 加载状态
 * @reactProps {Object} pagination - 分页器
 * @return React.element
 */
export default class List extends Component {
  /**
   * @returns React.element
   */
  render() {
    const {
      dataSource,
      pagination,
      viewDetail,
      loading,
      rowSelection,
      onChange,
      methodValue,
      customizeTable,
      custLoading,
    } = this.props;

    const columns = [
      {
        title: intl.get(`sslm.evaluationQuery.model.archive.status`).d('档案状态'),
        dataIndex: 'evalStatusMeaning',
        width: 120,
      },
      {
        title: intl.get(`sslm.evaluationQuery.model.archive.num`).d('档案编码'),
        dataIndex: 'evalNum',
        render: (val, record) => <a onClick={() => viewDetail(record)}>{val}</a>,
        width: 140,
      },
      {
        title: intl.get(`sslm.evaluationQuery.model.archive.describe`).d('档案描述'),
        dataIndex: 'evalName',
        width: 200,
      },
      {
        title: intl.get(`sslm.evaluationQuery.model.evaluation.template`).d('考评模板'),
        dataIndex: 'evalTplName',
        width: 200,
      },
      {
        title: intl.get(`sslm.evaluationQuery.model.evaluation.evalTplType`).d('模板类型'),
        dataIndex: 'evalTplTypeMeaning',
        width: 200,
      },
      {
        title: intl.get(`sslm.evaluationQuery.model.exam.method`).d('考评方式'),
        dataIndex: 'kpiMethod',
        width: 120,
        render: val => valueMapMeaning(methodValue, val),
      },
      {
        title: intl.get(`sslm.evaluationQuery.model.evaluation.cycle`).d('考评周期'),
        dataIndex: 'evalCycleMeaning',
        width: 150,
      },
      {
        title: intl.get(`sslm.evaluationQuery.model.evaluation.startDate`).d('考评日期从'),
        dataIndex: 'evalDateFrom',
        render: dateRender,
        width: 150,
      },
      {
        title: intl.get(`sslm.evaluationQuery.model.evaluation.endDate`).d('考评日期至'),
        dataIndex: 'evalDateTo',
        render: dateRender,
        width: 150,
      },
      {
        title: intl.get(`sslm.evaluationQuery.model.evaluation.dimension`).d('考评维度'),
        dataIndex: 'evalDimensionMeaning',
        width: 120,
      },
      {
        title: intl.get(`sslm.evaluationQuery.model.dimension.value`).d('维度值'),
        dataIndex: 'evalDimensionValueMeaning',
        width: 150,
      },
      {
        title: intl.get(`sslm.evaluationQuery.model.evaluation.charger`).d('考评负责人'),
        dataIndex: 'processUserName',
        width: 150,
      },
      {
        title: intl.get(`sslm.evaluationQuery.model.evaluation.createdUserName`).d('创建人'),
        dataIndex: 'createdUserName',
        width: 150,
      },
      {
        title: intl
          .get(`sslm.supplierDocManage.model.evalDocManage.evaluationDepart`)
          .d('考评负责人部门'),
        dataIndex: 'processUnitName',
        width: 150,
      },
      {
        title: intl.get(`sslm.evaluationQuery.model.archive.create.time`).d('建档时间'),
        dataIndex: 'creationDate',
        render: dateTimeRender,
        width: 170,
      },
    ];

    const scrollX = sum(columns.map(n => (isNumber(n.width) ? n.width : 150)));
    return customizeTable(
      {
        code: 'SSLM.EVALUATION_QUERY_ARCHIVES.LIST',
      },
      <Table
        bordered
        rowKey="evalHeaderId"
        columns={columns}
        dataSource={dataSource}
        pagination={pagination}
        scroll={{ x: scrollX, y: 'calc(100vh - 386px)' }}
        loading={loading}
        rowSelection={rowSelection}
        onChange={page => onChange(page)}
        custLoading={custLoading}
      />
    );
  }
}

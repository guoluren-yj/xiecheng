/**
 * TableList - 考评结果查询/按明细查询
 * @date: 2019-11-22
 * @author: jing.chen05@hand-china.com
 * @version: 1.0.0
 * @copyright Copyright (c) 2019, Hand
 */
import React, { Component } from 'react';
import { Table } from 'hzero-ui';
import { isNumber, sum } from 'lodash';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { PRIVATE_BUCKET } from '_utils/config';
import Upload from 'components/Upload';
import { dateRender, dateTimeRender, valueMapMeaning } from 'utils/renderer';

/**
 * 年度考评结果列表
 * @extends {Component} - React.Component
 * @reactProps {Object} dataSource - 数据源
 * @reactProps {Boolean} loading - 加载状态
 * @reactProps {Object} pagination - 分页器
 * @return React.element
 */
export default class TableList extends Component {
  @Bind()
  onCell() {
    return {
      style: {
        overflow: 'hidden',
        maxWidth: 200,
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      },
      onClick: e => {
        const { target } = e;
        if (target.style.whiteSpace === 'normal') {
          target.style.whiteSpace = 'nowrap';
        } else {
          target.style.whiteSpace = 'normal';
        }
      },
    };
  }

  render() {
    const {
      dataSource,
      pagination,
      viewDetail,
      loading,
      rowSelection,
      onChange,
      methodValue,
      onScoreDetail,
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
        title: intl.get(`sslm.evaluationQuery.model.archive.supplierNum`).d('供应商编码'),
        dataIndex: 'supplierNum',
        width: 120,
      },
      {
        title: intl.get(`sslm.evaluationQuery.model.archive.supplierName`).d('供应商名称'),
        dataIndex: 'supplierName',
        width: 200,
      },
      {
        title: intl.get(`sslm.evaluationQuery.model.archive.erpSupplierNum`).d('erp供应商编码'),
        dataIndex: 'erpSupplierNum',
        width: 120,
      },
      {
        title: intl.get(`sslm.evaluationQuery.model.archive.erpSupplierName`).d('erp供应商名称'),
        dataIndex: 'erpSupplierName',
        width: 200,
      },
      {
        title: intl.get(`sslm.evaluationQuery.model.evaluation.purchaseProduct`).d('品类名称'),
        width: 160,
        dataIndex: 'categoryName',
        render: (text, record) => (record.evalGranularity === 'SU+CA' ? record.categoryName : null),
      },
      {
        title: intl.get(`sslm.evaluationQuery.model.evaluation.categoryName`).d('物料名称'),
        width: 160,
        dataIndex: 'itemName',
        render: (text, record) => (record.evalGranularity === 'SU+IT' ? record.itemName : null),
      },
      {
        title: intl.get(`sslm.evaluationQuery.model.score.detail`).d('评分明细'),
        dataIndex: 'scoreDetail',
        width: 120,
        render: (_, record) => (
          <a onClick={() => onScoreDetail(record)}>
            {intl.get(`sslm.evaluationQuery.model.score.detail`).d('评分明细')}
          </a>
        ),
      },
      {
        title: intl.get(`sslm.evaluationQuery.model.archive.lineScore`).d('得分'),
        dataIndex: 'lineScore',
        width: 100,
      },
      {
        title: intl.get(`sslm.evaluationQuery.model.archive.checkDetailScore`).d('校准明细得分'),
        dataIndex: 'checkCollectScore',
        width: 100,
      },
      {
        title: intl.get(`sslm.evaluationQuery.model.archive.lineEntityRemarks`).d('说明'),
        dataIndex: 'lineEntityRemark',
        width: 100,
      },
      {
        title: intl.get(`sslm.evaluationQuery.model.archive.suggestedStrategy`).d('建议策略'),
        dataIndex: 'suggestStrategiesMeaning',
        width: 100,
      },
      {
        title: intl.get(`sslm.evaluationQuery.model.archive.levelCode`).d('等级'),
        dataIndex: 'levelCode',
        width: 100,
      },
      {
        title: intl.get(`sslm.evaluationQuery.model.archive.rankNum`).d('考评排名'),
        dataIndex: 'rankNum',
        width: 100,
      },
      {
        title: intl.get(`sslm.evaluationQuery.model.archive.lineRemark`).d('反馈说明'),
        dataIndex: 'lineRemark',
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
        width: 150,
      },
      {
        title: intl.get(`sslm.common.model.evaluation.supplierAttachment`).d('供方上传附件'),
        dataIndex: 'attachmentUuid',
        width: 130,
        render: val => (
          <Upload
            viewOnly
            bucketName={PRIVATE_BUCKET}
            bucketDirectory="sslm-evaluation"
            attachmentUUID={val}
          />
        ),
      },
    ];

    const scrollX = sum(columns.map(n => (isNumber(n.width) ? n.width : 150)));

    return customizeTable(
      {
        code: 'SSLM.EVALUATION_QUERY_DETAIL.LIST',
      },
      <Table
        bordered
        rowKey="evalLineId"
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

import React, { Component } from 'react';
import { Table, Popover } from 'hzero-ui';
import { Link } from 'dva/router';

import intl from 'utils/intl';
import { dateRender } from 'utils/renderer';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { tableScrollWidth } from 'utils/utils';

const promptCode = 'sqam.incomingInspectionQuery';

@withCustomize({
  unitCode: ['SQAM.QUALITY_INSPECT_APPROVAL_LIST.GRID'],
})
export default class ListTable extends Component {
  render() {
    const {
      dataSource = [],
      loading,
      pagination = {},
      onFetchList,
      customizeTable,
      selectedRowKeys,
      onSelectRow,
    } = this.props;
    const columns = [
      {
        title: intl
          .get(`${promptCode}.view.message.model.incomingInspectionQuery.inspectionNum`)
          .d('检验批号'),
        dataIndex: 'inspectionNum',
        width: 150,
        fixed: 'left',
        render: (val, record) => (
          <Link to={`/sqam/quality-inspect-approval/detail/${record.inspectionId}`}>{val}</Link>
        ),
      },
      {
        title: intl.get(`hzero.common.status`).d('状态'),
        dataIndex: 'inspectionStateMeaning',
        width: 100,
      },
      {
        title: intl
          .get(`${promptCode}.view.message.model.incomingInspectionQuery.inspectionTypeMeaning`)
          .d('检验类型'),
        dataIndex: 'inspectionTypeMeaning',
        width: 150,
      },
      {
        title: intl.get(`entity.supplier.tag`).d('供应商'),
        dataIndex: 'supplierName',
        width: 240,
      },
      {
        title: intl.get(`entity.item.code`).d('物料编码'),
        dataIndex: 'itemCode',
        width: 150,
      },
      {
        title: intl.get(`entity.item.name`).d('物料名称'),
        dataIndex: 'itemName',
        width: 150,
      },
      {
        title: intl
          .get(`${promptCode}.view.message.model.incomingInspectionQuery.assessmentResult`)
          .d('评估结果'),
        dataIndex: 'assessmentResultMeaning',
        width: 120,
      },
      {
        title: intl
          .get(`${promptCode}.view.message.model.incomingInspectionQuery.decisionResult`)
          .d('决策结果'),
        dataIndex: 'decisionResultMeaning',
        width: 120,
      },
      {
        title: intl.get('entity.company.tag').d('公司'),
        dataIndex: 'companyName',
        width: 200,
      },
      {
        title: intl.get('entity.organization.class.inventory').d('库存组织'),
        dataIndex: 'organizationName',
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.model.common.sourceNum`).d('来源单据'),
        dataIndex: 'sourceNum',
        key: 'sourceNum',
        width: 220,
        render: val => <Popover content={val}>{val}</Popover>,
      },
      {
        title: intl
          .get(`${promptCode}.view.message.model.incomingInspectionQuery.startDate`)
          .d('检验开始日期'),
        dataIndex: 'startDate',
        width: 150,
        render: dateRender,
      },
      {
        title: intl
          .get(`${promptCode}.view.message.model.incomingInspectionQuery.endDate`)
          .d('检验结束日期'),
        dataIndex: 'endDate',
        width: 150,
        render: dateRender,
      },
      {
        title: intl.get('entity.roles.creator').d('创建人'),
        dataIndex: 'createName',
        width: 150,
      },
      {
        title: intl.get(`hzero.common.date.creation`).d('创建日期'),
        dataIndex: 'creationDate',
        width: 160,
        render: dateRender,
      },
    ];
    const tableProps = {
      columns,
      dataSource,
      bordered: true,
      loading,
      scroll: { x: tableScrollWidth(columns) },
      pagination,
      onChange: onFetchList,
      rowKey: 'inspectionId',
      rowSelection: {
        selectedRowKeys,
        onChange: onSelectRow,
      },
    };
    return customizeTable(
      {
        code: 'SQAM.QUALITY_INSPECT_APPROVAL_LIST.GRID',
      },
      <Table {...tableProps} />
    );
  }
}

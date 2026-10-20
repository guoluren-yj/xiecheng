import React, { PureComponent } from 'react';
import { Table } from 'hzero-ui';
import intl from 'utils/intl';
import { isNumber, sum } from 'lodash';
import withCustomize from 'srm-front-cuz/lib/h0Customize';

import { thousandBitSeparator } from '@/routes/utils.js';

const promptCode = 'sqam.incomingInspectionQuery';

/**
 * PurchaseRequestHeader - 采购申请头页面
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
@withCustomize({
  unitCode: ['SQAM.INCOMING_INSPECTION_QUERY_DETAIL.DEFECT'],
})
export default class Result extends PureComponent {
  componentDidMount() {
    const { fetchList } = this.props;
    fetchList();
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const { defectList = {}, fetchListLoading, fetchList, customizeTable } = this.props;
    const { list = [], pagination = {} } = defectList;
    const columns = [
      {
        title: intl
          .get(`${promptCode}.view.message.model.incomingInspectionQuery.defectProject`)
          .d('项目'),
        dataIndex: 'defectProject',
        width: 80,
      },
      {
        title: intl
          .get(`${promptCode}.view.message.model.incomingInspectionQuery.codeGroup`)
          .d('代码组'),
        dataIndex: 'codeGroup',
        width: 120,
      },
      {
        title: intl.get(`sqam.common.model.8d.defectType`).d('缺陷类型'),
        dataIndex: 'defectCategory',
        width: 150,
      },
      {
        title: intl
          .get(`${promptCode}.view.message.model.incomingInspectionQuery.defectQuantity`)
          .d('缺陷数'),
        dataIndex: 'defectQuantity',
        width: 120,
        render: (text) => thousandBitSeparator(Number(text)),
      },
      {
        title: intl
          .get(`${promptCode}.view.message.model.incomingInspectionQuery.inspectionFeatures`)
          .d('检验特性的短文本'),
        dataIndex: 'inspectionFeatures',
        width: 260,
      },
      {
        title: intl
          .get(`${promptCode}.view.message.model.incomingInspectionQuery.problemCode`)
          .d('文本问题代码'),
        dataIndex: 'problemCode',
        width: 150,
      },
      {
        title: intl
          .get(`${promptCode}.view.message.model.incomingInspectionQuery.sequenceNum`)
          .d('序列数'),
        dataIndex: 'sequenceNum',
        width: 120,
      },
      {
        title: intl
          .get(`${promptCode}.view.message.model.incomingInspectionQuery.defectFeatures`)
          .d('特性'),
        dataIndex: 'defectFeatures',
      },
    ];
    const scrollX = sum(columns.map((item) => (isNumber(item.width) ? item.width : 0))) + 200;
    const tableProps = {
      scroll: { x: scrollX },
      dataSource: list,
      columns,
      bordered: true,
      pagination,
      loading: fetchListLoading,
      onChange: (page) => fetchList(page),
    };
    return customizeTable(
      {
        code: 'SQAM.INCOMING_INSPECTION_QUERY_DETAIL.DEFECT',
      },
      <Table {...tableProps} />
    );
  }
}

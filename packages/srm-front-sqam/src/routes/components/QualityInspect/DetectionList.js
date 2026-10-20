/*
 * PurchaseRequestItem - 采购Item
 * @date: 2019-12-4
 * @author: gzq <zhiqiang.guo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import React, { PureComponent } from 'react';
import { Table } from 'hzero-ui';
import { isNumber, sum } from 'lodash';
import { dateRender } from 'utils/renderer';
import withCustomize from 'srm-front-cuz/lib/h0Customize';

import intl from 'utils/intl';

const promptCode = 'sqam.incomingInspectionQuery';

/**
 * PurchaseRequestHeader - 采购申请头页面
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
@withCustomize({
  unitCode: ['SQAM.INCOMING_INSPECTION_QUERY_DETAIL.DETECT'],
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
    const { detectionList = {}, fetchListLoading, fetchList, customizeTable } = this.props;
    const { list = [], pagination = {} } = detectionList;
    const columns = [
      {
        title: intl
          .get(`${promptCode}.view.message.model.incomingInspectionQuery.detectWeighting`)
          .d('加权'),
        dataIndex: 'detectWeighting',
        width: 80,
      },
      {
        title: intl
          .get(`${promptCode}.view.message.model.incomingInspectionQuery.defectCategory`)
          .d('缺陷分类'),
        dataIndex: 'defectCategory',
        width: 120,
      },
      {
        title: intl.get('sqam.common.model.qualityRectification.explain').d('说明'),
        dataIndex: 'defectExplain',
        width: 150,
      },
      {
        title: intl
          .get(`${promptCode}.view.message.model.incomingInspectionQuery.defectResult`)
          .d('结果'),
        dataIndex: 'defectResult',
        width: 120,
      },
      {
        title: intl
          .get(`${promptCode}.view.message.model.incomingInspectionQuery.inspectionFeatures`)
          .d('检验特性的短文本'),
        dataIndex: 'defectFeatures',
        width: 260,
      },
      {
        title: intl
          .get(`${promptCode}.view.message.model.incomingInspectionQuery.inconformityQuantity`)
          .d('不符合'),
        dataIndex: 'inconformityQuantity',
        width: 120,
      },
      {
        title: intl
          .get(`${promptCode}.view.message.model.incomingInspectionQuery.defectAssessment`)
          .d('评估'),
        dataIndex: 'defectAssessment',
        width: 180,
      },
      {
        title: intl
          .get(`${promptCode}.view.message.model.incomingInspectionQuery.endDate`)
          .d('检验结束日期'),
        dataIndex: 'defectEndDate',
        width: 180,
        render: dateRender,
      },
      {
        title: intl
          .get(`${promptCode}.view.message.model.incomingInspectionQuery.detectRemark`)
          .d('检验描述'),
        dataIndex: 'detectRemark',
      },
    ];
    const scrollX = sum(columns.map((item) => (isNumber(item.width) ? item.width : 0))) + 150;
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
        code: 'SQAM.INCOMING_INSPECTION_QUERY_DETAIL.DETECT',
      },
      <Table {...tableProps} />
    );
  }
}

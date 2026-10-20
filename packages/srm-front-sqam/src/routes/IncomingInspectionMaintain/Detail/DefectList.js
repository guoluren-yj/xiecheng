/*
 * PurchaseRequestItem - 采购Item
 * @date: 2019-12-4
 * @author: gzq <zhiqiang.guo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import React, { PureComponent } from 'react';
import { Table } from 'hzero-ui';
import intl from 'utils/intl';
import { isNumber, sum } from 'lodash';

import { thousandBitSeparator } from '@/routes/utils.js';

const promptCode = 'sqam.incomingInspectionQuery';

/**
 * PurchaseRequestHeader - 采购申请头页面
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
export default class Result extends PureComponent {
  componentDidMount() {
    const { fetchList, id } = this.props;
    if (id !== 'create') {
      fetchList();
    }
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const { defectList = {}, fetchListLoading, fetchList } = this.props;
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
    return <Table {...tableProps} />;
  }
}

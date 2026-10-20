/**
 * List - 供应商绩效标准指标定义 - 列表组件
 * @date: 2018-7-4
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Table } from 'hzero-ui';
import { sum } from 'lodash';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';

/**
 * List - 供应商绩效标准指标定义 - 列表组件
 * @extends {Component} - React.Component
 * @reactProps {function} [ref= (e => e)] - react ref属性
 * @reactProps {boolean} [loading=false] - 表格处理状态
 * @reactProps {function} [onChange= (e => e)] - 表格onChange事件
 * @reactProps {object} [pagination={}] - 分页数据
 * @reactProps {Array<Object>} [dataSource=[]] - 表格数据源
 * @reactProps {object} [rowSelection={}] - 表格选择框配置
 * @return React.element
 */
@formatterCollections({ code: ['spfm.supplierKpiIndicator'] })
export default class List extends PureComponent {
  constructor(props) {
    super(props);
    // 方法注册
    ['onCell'].forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  defaultTableRowKey = 'indicatorFmlId';

  /**
   * onCell - 设置表格单元格属性函数
   */
  onCell() {
    return {
      style: {
        overflow: 'hidden',
        maxWidth: 180,
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      },
      onClick: (e) => {
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
    const { dataSource = [], pagination, loading, onChange = (e) => e } = this.props;
    const tableProps = {
      dataSource,
      columns: [
        {
          title: intl.get('spfm.supplierKpiIndicator.model.supplier.optName').d('选项名称'),
          dataIndex: 'optName',
          width: 180,
        },
        {
          title: intl.get('spfm.supplierKpiIndicator.model.supplier.score').d('分值'),
          dataIndex: 'score',
          width: 180,
        },
        {
          title: intl.get('spfm.supplierKpiIndicator.model.suKpiIn.sequence').d('排序号'),
          dataIndex: 'sequence',
          width: 150,
        },
      ],
      rowKey: this.defaultTableRowKey,
      bordered: true,
      loading,
      pagination,
      onChange,
    };
    tableProps.scroll = { x: sum(tableProps.columns.map((n) => n.width)) };
    return <Table {...tableProps} />;
  }
}

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
// import { enableRender } from 'utils/renderer';

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
@formatterCollections({ code: ['sslm.supplierDocManage'] })
export default class List extends PureComponent {
  constructor(props) {
    super(props);
    // 方法注册
    ['onCell'].forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

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
    const {
      loading,
      onChange,
      pagination,
      dataSource,
      rowSelection = {},
      defaultTableRowKey,
      expandAllKeys = [],
    } = this.props;
    const tableProps = {
      dataSource,
      columns: [
        {
          title: intl.get(`sslm.supplierDocManage.model.docManage.productCode`).d('品类编码'),
          dataIndex: 'categoryCode',
          width: 150,
          onCell: this.onCell,
        },
        {
          title: intl.get(`sslm.supplierDocManage.model.docManage.categoryName`).d('品类名称'),
          dataIndex: 'categoryName',
          width: 180,
          onCell: this.onCell,
        },
      ],
      rowKey: defaultTableRowKey,
      bordered: true,
      loading,
      onChange,
      pagination,
      rowSelection,
      style: { marginBottom: 40 },
      expandedRowKeys: expandAllKeys,
      uncontrolled: true,
    };
    tableProps.scroll = { x: sum(tableProps.columns.map((n) => n.width)) };
    return <Table {...tableProps} />;
  }
}

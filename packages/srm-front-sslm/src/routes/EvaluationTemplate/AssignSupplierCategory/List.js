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
@formatterCollections({ code: ['spfm.supplierKpiIndicator', 'sslm.supplierDocManage'] })
export default class List extends PureComponent {
  constructor(props) {
    super(props);
    // 方法注册
    ['onCell', 'categoryRender', 'itemRender'].forEach((method) => {
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

  /**
   * categoryRender - 品类render
   * @param {String} text - 显示文本
   * @param {Object} record - 当前行数据
   */
  categoryRender(text, record) {
    const { openCategoriesDrawer = (e) => e } = this.props;
    return (
      record._status !== 'create' && (
        <a onClick={() => openCategoriesDrawer(record)}>
          {intl.get(`spfm.supplierKpiIndicator.view.button.category`).d('参评品类')}
        </a>
      )
    );
  }

  /**
   * itemRender - 物料render
   * @param {String} text - 显示文本
   * @param {Object} record - 当前行数据
   */
  itemRender(text, record) {
    const { openItemsDrawer = (e) => e } = this.props;
    return (
      record._status !== 'create' && (
        <a onClick={() => openItemsDrawer(record)}>
          {intl.get(`spfm.supplierKpiIndicator.view.button.item`).d('参评物料')}
        </a>
      )
    );
  }

  render() {
    const {
      loading,
      onChange,
      pagination,
      dataSource,
      rowSelection = {},
      activeEvalGranularity = 'SU+CA',
    } = this.props;
    const defaultColumns = [
      {
        title: intl.get(`sslm.supplierDocManage.model.docManage.venderCode`).d('供应商编码'),
        dataIndex: 'companyNum',
        width: 180,
        onCell: this.onCell,
      },
      {
        title: intl.get(`sslm.supplierDocManage.model.docManage.venderName`).d('供应商名称'),
        dataIndex: 'companyName',
        width: 180,
        onCell: this.onCell,
      },
    ];
    const activeColumnsGroup = {
      'SU+CA': [
        {
          title: intl.get(`spfm.supplierKpiIndicator.view.button.category`).d('参评品类'),
          width: 150,
          onCell: this.onCell,
          render: this.categoryRender,
        },
      ],
      'SU+IT': [
        {
          title: intl.get(`spfm.supplierKpiIndicator.view.button.item`).d('参评物料'),
          width: 150,
          onCell: this.onCell,
          render: this.itemRender,
        },
      ],
    };
    const tableProps = {
      dataSource,
      columns: defaultColumns.concat(activeColumnsGroup[activeEvalGranularity] || []),
      bordered: true,
      loading,
      onChange,
      pagination,
      rowSelection,
    };
    tableProps.scroll = { x: sum(tableProps.columns.map((n) => n.width)) };
    return <Table {...tableProps} />;
  }
}

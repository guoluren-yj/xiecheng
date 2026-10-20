/**
 * List - 供应商绩效标准指标定义 - 列表组件
 * @date: 2018-7-4
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import Table from 'srm-front-boot/lib/components/Table';
import { sum, forEach } from 'lodash';
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
@formatterCollections({ code: ['sslm.evaluationTemplate'] })
export default class List extends PureComponent {
  constructor(props) {
    super(props);
    // 方法注册
    ['onCell'].forEach(method => {
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
      loading,
      onChange,
      pagination,
      dataSource,
      rowSelection = {},
      defaultTableRowKey,
      evaluationTemplateRemote,
    } = this.props;
    const tableProps = {
      dataSource,
      columns: [
        {
          title: intl
            .get('sslm.evaluationTemplate.view.supplier.platformSupplierCode')
            .d('平台供应商编码'),
          dataIndex: 'companyNum',
          width: 140,
          onCell: this.onCell,
        },
        {
          title: intl
            .get('sslm.evaluationTemplate.view.supplier.platformSupplierName')
            .d('平台供应商名称'),
          dataIndex: 'companyName',
          width: 180,
          onCell: this.onCell,
        },
        {
          title: intl
            .get('sslm.evaluationTemplate.view.supplier.erpSupplierCode')
            .d('ERP供应商编码'),
          dataIndex: 'erpSupplierNum',
          width: 140,
          onCell: this.onCell,
        },
        {
          title: intl
            .get('sslm.evaluationTemplate.view.supplier.erpSupplierName')
            .d('ERP供应商名称'),
          dataIndex: 'erpSupplierName',
          width: 180,
          onCell: this.onCell,
        },
        {
          title: intl
            .get(`sslm.evaluationTemplate.model.evalTemplate.supplierCategory`)
            .d('供应商分类'),
          dataIndex: 'categoryName',
          width: 200,
          onCell: this.onCell,
        },
      ],
      rowKey: defaultTableRowKey,
      bordered: true,
      loading,
      onChange,
      pagination,
      rowSelection,
    };
    // column数据埋点
    if (evaluationTemplateRemote) {
      const renderColumns =
        (evaluationTemplateRemote &&
          evaluationTemplateRemote.process('SSLM_EVALUATIONTEMPLATE_CUSTOMER_COLUMNS', [], {})) ||
        [];
      forEach(renderColumns, column => {
        tableProps.columns.push(column);
      });
    }
    tableProps.scroll = { x: sum(tableProps?.columns?.map(n => n.width)) };
    return <Table {...tableProps} />;
  }
}

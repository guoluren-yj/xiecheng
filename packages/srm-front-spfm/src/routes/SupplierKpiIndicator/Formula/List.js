/**
 * List - 供应商绩效标准指标定义 - 列表组件
 * @date: 2018-7-4
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Table } from 'hzero-ui';
import { sum, isEmpty, uniqBy, isString } from 'lodash';
import intl from 'utils/intl';
import { enableRender } from 'utils/renderer';
import EditableRow from './EditableRow';
import EditableCell from './EditableCell';

// EditableContext组件初始化
const EditableContext = React.createContext();

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
export default class List extends PureComponent {
  constructor(props) {
    super(props);
    // 方法注册
    ['onTableRow', 'operiationRender'].forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  /**
   * operiationRender - 操作记录render方法
   * @param {String} text - 显示字段
   * @param {object} record - 当前行数据
   */
  operiationRender(text, record) {
    const {
      setRowEditable = e => e,
      cancelEditing = e => e,
      deleteNewRow = e => e,
      editableRows = [],
      defaultTableRowKey,
    } = this.props;
    let result = (
      <a onClick={() => setRowEditable(record)}>{intl.get(`hzero.common.button.edit`).d('编辑')}</a>
    );
    if (editableRows.some(o => o.key === record[defaultTableRowKey])) {
      result = isString(record[defaultTableRowKey]) ? (
        <a onClick={() => deleteNewRow(record[defaultTableRowKey])}>
          {intl.get(`hzero.common.button.clear`).d('清除')}
        </a>
      ) : (
        <a onClick={() => cancelEditing(record[defaultTableRowKey])}>
          {intl.get(`hzero.common.button.cancel`).d('取消')}
        </a>
      );
    }
    return result;
  }

  /**
   * onTableRow - 设置表格行
   * @param {object} record - 当前行数据
   */
  onTableRow(record = {}) {
    const { editableRows = [], defaultTableRowKey } = this.props;
    return Object.assign(
      {
        onRef: node => {
          this.setTableRowForms(node, record);
        },
        contextProvider: EditableContext.Provider,
      },
      editableRows.some(o => o.key === record[defaultTableRowKey])
        ? {
            style: {
              height: 70,
            },
          }
        : {}
    );
  }

  /**
   * setTableRowForms - 设置行缓存
   * @param {!object} node - 表格行this对象
   * @param {object} record - 行数据
   */
  setTableRowForms(node, record) {
    const { defaultTableRowKey } = this.props;
    if (isEmpty(this.tableRowForms)) {
      this.tableRowForms = []; // new Map();
    }
    // this.tableRowForms = this.tableRowForms.set(record.key, node);

    this.tableRowForms = uniqBy(
      this.tableRowForms.concat({ key: record[defaultTableRowKey], row: node }),
      'key'
    );
  }

  /**
   * getColumns - 组装columns
   */
  getColumns() {
    const { defaultTableRowKey, editableRows = [] } = this.props;
    const defaultColumns = [
      {
        title: intl
          .get(`spfm.supplierKpiIndicator.model.supplierKpiIndicator.remark`)
          .d('公式说明'),
        dataIndex: 'remark',
        width: 150,
      },
      {
        title: intl.get(`spfm.supplierKpiIndicator.model.supplierKpiIndicator.service`).d('服务'),
        dataIndex: 'serviceCode',
        width: 180,
      },
      {
        title: intl.get(`spfm.supplierKpiIndicator.model.supplierKpiIndicator.url`).d('URL'),
        dataIndex: 'formulaUrl',
        width: 180,
      },
      {
        title: intl.get('hzero.common.status').d('状态'),
        dataIndex: 'enabledFlag',
        width: 100,
        render: enableRender,
      },
      {
        title: intl.get(`hzero.common.table.column.option`).d('操作'),
        width: 60,
        render: this.operiationRender,
      },
    ];

    return defaultColumns.map(n => ({
      ...n,
      onCell: record =>
        Object.assign({
          record,
          dataIndex: n.dataIndex,
          title: n.title,
          style: {
            overflow: 'hidden',
            maxWidth: 240,
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
          editable: editableRows.some(o => o.key === record[defaultTableRowKey]),
          contextConsumer: EditableContext.Consumer,
          render: n.render,
        }),
    }));
  }

  render() {
    const {
      dataSource = [],
      defaultTableRowKey,
      pagination,
      loading,
      onChange = e => e,
    } = this.props;
    const components = {
      body: {
        row: EditableRow,
        cell: EditableCell,
      },
    };
    const tableProps = {
      dataSource,
      components,
      onRow: this.onTableRow,
      columns: this.getColumns(),
      rowKey: defaultTableRowKey,
      bordered: true,
      pagination,
      loading,
      onChange,
    };
    tableProps.scroll = { x: sum(tableProps.columns.map(n => n.width)) };
    return <Table {...tableProps} />;
  }
}

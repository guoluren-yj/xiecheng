/**
 * List - 采购申请创建列表组件
 * @date: 2018-7-4
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent, Fragment } from 'react';
import { Table, Form, Icon, Button, Popconfirm } from 'hzero-ui';
import { sum, isNumber, isEmpty, uniqBy, find } from 'lodash';
import { Bind } from 'lodash-decorators';
import uuidv4 from 'uuid/v4';
import intl from 'utils/intl';
import { createPagination, getResponse } from 'utils/utils';
import {
  queryFlexDetailFields,
  createFlexDetailFields,
  updateFlexDetailFields,
  deleteFlexDetailFields,
  queryFormula,
} from '@/services/flexRuleService';
import notification from 'utils/notification';
import EditableRow from './EditableRow';
import EditableCell from './EditableCell';

// EditableContext组件初始化
const EditableContext = React.createContext();

// 设置sinv国际化前缀 - view.title
// const viewTitlePrompt = 'sslm.flexModel.view.title';
// 设置sinv国际化前缀 - view.button
// const viewButtonPrompt = 'hpfm.flexModel.view.button';
const defaultListPrimaryKey = 'detailFieldId';

@Form.create({ fieldNameProp: null })
/**
 * List - 采购申请创建列表组件
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
    this.state = {
      queryListLoading: undefined,
      saveLoading: undefined,
      deleteLoading: undefined,
      editableRowKey: null,
      progressRows: [],
    };
    const { onRef = () => {} } = this.props;
    onRef(this);
  }

  /**
   *
   *
   * @memberof List
   */
  componentDidMount() {
    this.fetchList();
    this.fetchFormula();
  }

  /**
   *
   *
   * @param {*} prevProps
   * @returns
   * @memberof List
   */
  getSnapshotBeforeUpdate(prevProps) {
    const { active } = this.props;
    return active && active !== prevProps.active;
  }

  /**
   *
   *
   * @param {*} rest
   * @memberof List
   */
  componentDidUpdate(...rest) {
    const snapshot = rest[2];
    if (snapshot) {
      this.fetchList();
    }
  }

  /**
   * fetchList - 查询列表数据
   * @param {object} params - 查询条件
   */
  @Bind()
  fetchList(params = {}) {
    const { ruleDetailId } = this.props;
    this.setState({
      queryListLoading: true,
    });
    queryFlexDetailFields({ ...params, ruleDetailId }).then(res => {
      if (res) {
        const response = getResponse(res);
        this.tableRowForms = (this.tableRowForms || []).filter(o => isNumber(o.key));
        this.setState({
          dataSource: ((response || {}).content || []).map(o => ({
            ...o,
            key: o[defaultListPrimaryKey],
          })),
          pagination: createPagination(response || {}),
          queryListLoading: false,
          editableRowKey: null,
        });
      }
    });
  }

  /**
   * fetchList - 查询列表数据
   * @param {object} params - 查询条件
   */
  @Bind()
  fetchFormula() {
    const { ruleDetailId } = this.props;
    queryFormula(ruleDetailId).then(res => {
      if (res && res.failed) {
        notification.error({ description: res.message });
      } else {
        this.setState({
          formula: res,
        });
      }
    });
  }

  /**
   *
   *
   * @param {*} record
   * @memberof List
   */
  @Bind()
  save(record) {
    const { editableRowKey = [] } = this.state;
    const { ruleDetailId } = this.props;
    const { validateFields = () => {} } =
      (find(this.tableRowForms || [], o => o.key === record.key) || {}).row || {};
    if (record.key === editableRowKey) {
      validateFields((error, values) => {
        if (isEmpty(error)) {
          const data = { ...record, ...values, ruleDetailId };
          this.setState({
            saveLoading: true,
          });
          if (isNumber(editableRowKey)) {
            updateFlexDetailFields(data).then(res => {
              this.setState({
                saveLoading: false,
              });
              if (res && res.failed) {
                notification.error({ description: res.message });
              } else {
                this.fetchList();
                this.fetchFormula();
                notification.success();
              }
            });
          } else {
            createFlexDetailFields(data).then(res => {
              this.setState({
                saveLoading: false,
              });
              if (res && res.failed) {
                notification.error({ description: res.message });
              } else {
                this.fetchList();
                this.fetchFormula();
                notification.success();
              }
            });
          }
        }
      });
    }
  }

  /**
   *
   *
   * @param {*} record
   * @memberof List
   */
  @Bind()
  deleteRows(record) {
    const { progressRows = [] } = this.state;
    this.setState({
      deleteLoading: true,
    });
    deleteFlexDetailFields([record]).then(res => {
      if (res && res.failed) {
        notification.error({ description: res.message });
      } else {
        this.tableRowForms = this.tableRowForms.filter(o => o.key !== record.key);
        this.setState({
          progressRows: progressRows.filter(o => o.key !== record.key),
          deleteLoading: false,
        });

        this.fetchList();
        this.fetchFormula();
        notification.success();
      }
    });
  }

  /**
   *
   *
   * @param {*} rest
   * @returns
   * @memberof List
   */
  @Bind()
  fieldTypeRender(...rest) {
    return (rest[1] || {}).fieldTypeMeaning;
  }

  /**
   *
   *
   * @param {*} rest
   * @returns
   * @memberof List
   */
  @Bind()
  preSymbolRender(...rest) {
    return (rest[1] || {}).preSymbolMeaning;
  }

  /**
   *
   *
   * @param {*} rest
   * @returns
   * @memberof List
   */
  @Bind()
  operatorRender(...rest) {
    return (rest[1] || {}).operatorMeaning;
  }

  /**
   *
   *
   * @param {*} rest
   * @returns
   * @memberof List
   */
  @Bind()
  backSymbolRender(...rest) {
    return (rest[1] || {}).backSymbolMeaning;
  }

  /**
   *
   *
   * @returns
   * @memberof List
   */
  @Bind()
  getColumns() {
    const {
      primaryKey,
      flexRuleCode,
      code = {},
      ruleDetailId,
      flexTableColumnsCode,
      formSchema = {},
      // getSourceFormSchema = () => {},
    } = this.props;

    const { editableRowKey } = this.state;
    const defaultColumns = [
      {
        title: intl.get(`hpfm.flexModel.model.flexModel.preSymbol`).d('前缀'),
        dataIndex: 'preSymbol',
        width: 150,
        render: this.preSymbolRender,
      },
      {
        title: intl.get(`hpfm.flexModel.model.flexModel.fieldName`).d('字段名称'),
        dataIndex: 'fieldName',
      },
      {
        title: intl.get(`hpfm.flexModel.model.flexModel.fieldType`).d('规则字段类型'),
        dataIndex: 'fieldType',
        width: 150,
        render: this.fieldTypeRender,
      },
      {
        title: intl.get(`hpfm.flexModel.model.flexModel.operator`).d('运算符'),
        dataIndex: 'operator',
        width: 150,
        render: this.operatorRender,
      },
      {
        title: intl.get(`hpfm.flexModel.model.flexModel.fieldValue`).d('规则字段值'),
        dataIndex: 'fieldValue',
        width: 150,
      },
      {
        title: intl.get(`hpfm.flexModel.model.flexModel.backSymbol`).d('后缀'),
        dataIndex: 'backSymbol',
        width: 150,
        render: this.backSymbolRender,
      },
      {
        title: intl.get(`hzero.common.button.action`).d('操作'),
        dataIndex: 'action',
        width: 110,
        fixed: 'right',
        render: this.actionRender,
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
          editable: editableRowKey === record.key,
          status: isNumber(record[primaryKey]) ? 'edit' : 'new',
          contextConsumer: EditableContext.Consumer,
          render: n.render,
          flexRuleCode,
          code,
          ruleDetailId,
          flexTableColumnsCode,
          defaultListPrimaryKey,
          formSchema,
          // getSourceFormSchema,
        }),
    }));
  }

  /**
   *
   *
   * @param {*} [record={}]
   * @returns
   * @memberof List
   */
  @Bind()
  onTableRow(record = {}) {
    const { editableRowKey = [] } = this.props;
    return Object.assign(
      {
        onRef: node => {
          this.setTableRowForms(node, record);
        },
        contextProvider: EditableContext.Provider,
      },
      editableRowKey === record.key
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
  @Bind()
  setTableRowForms(node, record) {
    if (isEmpty(this.tableRowForms)) {
      this.tableRowForms = []; // new Map();
    }
    // this.tableRowForms = this.tableRowForms.set(record.key, node);
    this.tableRowForms = uniqBy(
      this.tableRowForms.concat({ key: record.key, row: node.props.form }),
      'key'
    );
  }

  /**
   *
   *
   * @param {*} rest
   * @returns
   * @memberof List
   */
  @Bind()
  actionRender(...rest) {
    const { editableRowKey, progressRows = [], deleteLoading } = this.state;
    const form = rest[2] || {};
    return (
      <span className="action-link">
        {editableRowKey === rest[1].key ? (
          <Fragment>
            <a onClick={() => this.save(rest[1], form)}>
              {intl.get(`hzero.common.button.save`).d('保存')}
            </a>
            {isNumber(rest[1][defaultListPrimaryKey]) ? (
              <a onClick={this.cancelEditRow}>{intl.get(`hzero.common.button.cancel`).d('取消')}</a>
            ) : (
              <a onClick={() => this.clear(rest[1].key)}>
                {intl.get(`hzero.common.button.clean`).d('清除')}
              </a>
            )}
          </Fragment>
        ) : (
          <Fragment>
            <a disabled={isNumber(editableRowKey)} onClick={() => this.edit(rest[1])}>
              {intl.get(`hzero.common.button.edit`).d('编辑')}
            </a>
            <Popconfirm
              title={intl.get('hzero.common.message.confirm.delete').d('是否删除此条记录？')}
              onConfirm={() => {
                this.deleteRows(rest[1]);
              }}
            >
              <a>
                {progressRows.some(o => o === rest[1][defaultListPrimaryKey]) && deleteLoading ? (
                  <Icon type="loading" />
                ) : (
                  intl.get(`hzero.common.button.delete`).d('删除')
                )}
              </a>
            </Popconfirm>
          </Fragment>
        )}
      </span>
    );
  }

  /**
   *
   *
   * @memberof List
   */
  @Bind()
  add() {
    const { editableRowKey, dataSource = [], pagination } = this.state;
    const newEditableRowKey = uuidv4();
    const newDataSource = dataSource.concat({ key: newEditableRowKey });
    if (isEmpty(editableRowKey)) {
      this.setState({
        editableRowKey: newEditableRowKey,
        dataSource: newDataSource,
        pagination: {
          ...pagination,
          pageSize:
            newDataSource.length > (pagination.pageSize || 10)
              ? (pagination.pageSize || 10) + 1
              : pagination.pageSize,
        },
      });
    }
  }

  /**
   *
   *
   * @param {*} rowData
   * @memberof List
   */
  @Bind()
  edit(rowData) {
    const { editableRowKey } = this.state;
    if (!isNumber(editableRowKey)) {
      this.setState({
        editableRowKey: rowData.key,
      });
    }
  }

  /**
   *
   *
   * @param {*} key
   * @memberof List
   */
  @Bind()
  clear(key) {
    const { dataSource = [] } = this.state;
    this.tableRowForms = this.tableRowForms.filter(o => o.key !== key);
    this.setState({
      dataSource: dataSource.filter(o => o.key !== key),
      editableRowKey: null,
    });
  }

  /**
   *
   *
   * @memberof List
   */
  @Bind()
  cancelEditRow() {
    this.setState({
      editableRowKey: null,
    });
  }

  /**
   *
   *
   * @param {*} page
   * @memberof List
   */
  @Bind()
  onChange(page) {
    this.fetchList({ page });
  }

  render() {
    const {
      queryListLoading,
      saveLoading,
      pagination = {},
      dataSource = [],
      formula = '',
    } = this.state;
    const components = {
      body: {
        row: EditableRow,
        cell: EditableCell,
      },
    };
    const tableProps = {
      dataSource,
      components,
      columns: this.getColumns(),
      bordered: true,
      loading: queryListLoading || saveLoading,
      onChange: this.onChange,
      pagination,
      onRow: this.onTableRow,
    };
    tableProps.scroll = { x: sum(tableProps.columns.map(n => n.width)) + 300 };
    return (
      <Fragment>
        {!isEmpty(formula) && (
          <div style={{ float: 'left', height: 28, lineHeight: '28px' }}>
            {`${intl.get(`hzero.common.title.formula`).d('公式')}: ${formula}`}
          </div>
        )}
        <div style={{ textAlign: 'right', marginBottom: 16 }}>
          <Button onClick={this.add}>{intl.get('hzero.common.button.create').d('新建')}</Button>
        </div>
        <Table {...tableProps} />
      </Fragment>
    );
  }
}

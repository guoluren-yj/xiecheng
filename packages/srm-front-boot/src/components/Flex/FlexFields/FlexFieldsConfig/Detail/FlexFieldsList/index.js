/**
 * List - 采购申请创建列表组件
 * @date: 2018-7-4
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent, Fragment } from 'react';
import { Table, Form, Icon, Button, Popconfirm } from 'hzero-ui';
import { sum, isNumber, isEmpty, uniqBy, find, isString } from 'lodash';
import { Bind } from 'lodash-decorators';
import uuidv4 from 'uuid/v4';
import { createPagination, getResponse } from 'utils/utils';
import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';

import notification from 'utils/notification';
import {
  queryFlexDetailConfigs,
  createFlexDetailConfigs,
  updateFlexDetailConfigs,
  deleteFlexDetailConfigs,
} from '@/services/flexRuleService';
import EditableRow from './EditableRow';
import EditableCell from './EditableCell';

// EditableContext组件初始化
const EditableContext = React.createContext();

// 设置sinv国际化前缀 - view.title
// const viewTitlePrompt = 'sslm.flexModel.view.title';
// 设置sinv国际化前缀 - view.button
// const viewButtonPrompt = 'hpfm.flexModel.view.button';
// // 设置通用国际化前缀
const defaultListPrimaryKey = 'detailConfigId';

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
      isEditedFieldType: false,
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
    queryFlexDetailConfigs({ ...params, ruleDetailId }).then(res => {
      if (res) {
        const response = getResponse(res);
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
          const data = {
            ...record,
            ...values,
            ruleDetailId,
            readableFlag: values.readableFlag ? 1 : 0,
            requiredFlag: values.requiredFlag ? 1 : 0,
          };
          this.setState({
            saveLoading: true,
          });
          if (isNumber(record[defaultListPrimaryKey])) {
            updateFlexDetailConfigs(data).then(res => {
              this.setState({
                saveLoading: false,
              });
              if (res && res.failed) {
                notification.error({ description: res.message });
              } else {
                this.fetchList();
                notification.success();
              }
            });
          } else {
            createFlexDetailConfigs(data).then(res => {
              this.setState({
                saveLoading: false,
              });
              if (res && res.failed) {
                notification.error({ description: res.message });
              } else {
                this.fetchList();
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
    deleteFlexDetailConfigs([record]).then(res => {
      if (res && res.failed) {
        notification.error({ description: res.message });
      } else {
        this.setState({
          progressRows: progressRows.filter(o => o.key !== record.key),
          deleteLoading: false,
        });

        this.fetchList();
        notification.success();
      }
    });
  }

  @Bind()
  getColumns() {
    const { primaryKey, flexRuleCode, code = {} } = this.props;
    const { editableRowKey, dataSource = [], isEditedFieldType } = this.state;
    const defaultColumns = [
      {
        title: intl.get(`hpfm.flexModel.model.flexModel.modelFieldName`).d('弹性域模型字段名称'),
        dataIndex: 'modelFieldId',
        width: 180,
        render: this.modelFieldIdRender,
      },
      {
        title: intl.get(`hpfm.flexModel.model.flexModel.orderSeq`).d('排序号'),
        dataIndex: 'orderSeq',
        width: 120,
      },
      {
        title: intl.get(`hpfm.flexModel.model.flexModel.fieldDescription`).d('字段描述'),
        dataIndex: 'fieldDescription',
      },
      {
        title: intl.get(`hpfm.flexModel.model.flexModel.fieldColumnNumber`).d('行号'),
        dataIndex: 'fieldColumnNumber',
        width: 120,
      },
      {
        title: intl.get(`hpfm.flexModel.model.flexModel.fieldColumnWidth`).d('宽度'),
        dataIndex: 'fieldColumnWidth',
        width: 120,
      },
      {
        title: intl.get(`hpfm.flexModel.model.flexModel.fieldType`).d('规则字段类型'),
        dataIndex: 'fieldType',
        width: 180,
        render: this.fieldTypeRender,
      },
      (dataSource.some(o => o.fieldType === 'LOV' || o.fieldType === 'SELECT') ||
        isEditedFieldType) && {
        title: intl.get(`hpfm.flexModel.model.flexModel.valueSource`).d('数据源'),
        dataIndex: 'valueSource',
        width: 180,
      },
      {
        title: intl.get(`hpfm.flexModel.model.flexModel.readableFlag`).d('是否只读'),
        dataIndex: 'readableFlag',
        width: 90,
        render: yesOrNoRender,
      },
      {
        title: intl.get(`hpfm.flexModel.model.flexModel.requiredFlag`).d('是否必输'),
        dataIndex: 'requiredFlag',
        width: 90,
        render: yesOrNoRender,
      },
      {
        title: intl.get(`hzero.common.button.action`).d('操作'),
        dataIndex: 'action',
        width: 120,
        fixed: 'right',
        render: this.actionRender,
      },
    ].filter(Boolean);

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
          onFiledTypeChange: this.onFiledTypeChange,
        }),
    }));
  }

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
            <a
              disabled={isNumber(editableRowKey) || isString(editableRowKey)}
              onClick={() => this.edit(rest[1])}
            >
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

  @Bind()
  edit(rowData) {
    const { editableRowKey } = this.state;
    if (!isNumber(editableRowKey)) {
      this.setState({
        editableRowKey: rowData.key,
      });
    }
  }

  @Bind()
  clear(key) {
    const { dataSource = [] } = this.state;
    this.setState({
      dataSource: dataSource.filter(o => o.key !== key),
      editableRowKey: null,
    });
  }

  @Bind()
  cancelEditRow() {
    this.setState({
      editableRowKey: null,
    });
  }

  @Bind()
  onChange(page) {
    this.fetchList({ page });
  }

  @Bind()
  modelFieldIdRender(...rest) {
    return (rest[1] || {}).fieldName;
  }

  @Bind()
  fieldTypeRender(...rest) {
    return (rest[1] || {}).fieldTypeMeaning;
  }

  @Bind()
  onFiledTypeChange(value) {
    this.setState({
      isEditedFieldType: value === 'LOV' || value === 'SELECT',
    });
  }

  render() {
    const { queryListLoading, saveLoading, pagination = {}, dataSource = [] } = this.state;
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
        <div style={{ textAlign: 'right', marginBottom: 16 }}>
          <Button onClick={this.add}>{intl.get('hzero.common.button.add').d('新增')}</Button>
        </div>
        <Table {...tableProps} />
      </Fragment>
    );
  }
}

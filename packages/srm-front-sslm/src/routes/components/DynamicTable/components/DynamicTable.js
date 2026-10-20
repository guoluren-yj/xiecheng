/**
 * DynamicTable - 动态表格
 * @date: 2021/06/23 14:07:49
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component, Fragment } from 'react';
import {
  isNumber,
  sum,
  isEmpty,
  unionBy,
  isArray,
  pullAllBy,
  isString,
  isFunction,
  isNil,
} from 'lodash';
import { Bind } from 'lodash-decorators';
import qs from 'querystring';
import moment from 'moment';
import uuidv4 from 'uuid/v4';
import { Form, Popover, DatePicker, InputNumber, Input, Button, Spin } from 'hzero-ui';
import { Button as C7nButton } from 'choerodon-ui/pro';
import EditTable from 'components/EditTable';
import intl from 'utils/intl';
import Checkbox from 'components/Checkbox';
import Lov from 'components/Lov';
import notification from 'utils/notification';
import Upload from 'srm-front-boot/lib/components/Upload/index';
import { PRIVATE_BUCKET } from '_utils/config';
import {
  getEditTableData,
  delItemToPagination,
  addItemToPagination,
  getCurrentOrganizationId,
  createPagination,
  getResponse,
  delItemsToPagination,
} from 'utils/utils';
import { DEFAULT_DATE_FORMAT, DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import { yesOrNoRender } from 'utils/renderer';
import {
  queryTableConfig,
  queryTableData,
  saveData,
  queryLifecycleModelData,
  deleteData,
} from '@/services/dynamicTableService';
import Select from './FlexSelect';
import { coverConfig } from '../utils/utils';

const FormItem = Form.Item;
const { TextArea } = Input;

const organizationId = getCurrentOrganizationId();

/**
 * 动态表格
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {Object} [history={}]
 * @reactProps {Object} dataSource - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */

export default class DynamicTable extends Component {
  constructor(props) {
    super(props);
    const pathQueryParams = qs.parse(location.search.substr(1));
    const {
      modelTable: {
        uniqueCode = '',
        editorFlag = 1,
        addButtonFlag = 1,
        saveButtonFlag = 1,
        deleteButtonFlag = 1,
      } = {},
      modelTable,
    } = props;
    this.state = {
      dataSource: [],
      pagination: {},
      selectedRows: [],
      selectedRowKeys: [],
      uniqueCode,
      definitionList: [], // 列配置
      readyQuery: false,
      queryLoading: false,
      queryHistoryDataLoading: false,
      rowKey: 'dataId',
      viewOnlyFlag: !editorFlag,
      addButtonFlag,
      saveButtonFlag,
      deleteButtonFlag,
      pathQueryParams,
      modelTable,
    };
  }

  componentDidMount() {
    const { onRef } = this.props;
    if (onRef) onRef(this);
    // 通过code查询列配置
    this.fetchTableColConfig();
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    // 分两步判断
    // 1. 申请单已有主键id，直接查申请单数据接口（包括入参改变一次就掉一次查询接口）
    // 2. 申请单没有主键id，在readyQuery（前置数据已经完成标识）为true时查询
    const { readyQuery = false, relationId = '', modelTable = {} } = nextProps;
    const {
      readyQuery: oldReadyQuery = false, // 引用组件前置数据完成的标识
      relationId: oldRelationId = '',
      modelTable: oldModelTable = {},
      reQueryFinishFlag = false, // 模型表已经查询完成的标识
      definitionList = [],
    } = prevState;
    const rowKey = relationId || oldRelationId ? 'dataId' : 'virtualUUid';

    const newQueryParams = {
      companyId: modelTable.companyId,
      supplierCompanyId: modelTable.supplierCompanyId,
    };
    const oldQueryParams = {
      companyId: oldModelTable.companyId,
      supplierCompanyId: oldModelTable.supplierCompanyId,
    };
    const newParams = ['']
      .concat(Object.keys(newQueryParams), Object.values(newQueryParams))
      .join(',');
    const oldParams = ['']
      .concat(Object.keys(oldQueryParams), Object.values(oldQueryParams))
      .join(',');
    // 入参改变
    const paramsUpdate = newParams !== oldParams;
    // 前置接口完成
    const preQueryFinallyFlag = readyQuery && readyQuery !== oldReadyQuery;
    // 主键改变
    const primaryKeyUpdate = relationId !== oldRelationId;
    const nextState = {
      relationId,
      rowKey,
      modelTable,
      readyQuery,
    };
    if (!isEmpty(definitionList)) {
      // 步骤1
      if (oldRelationId && relationId) {
        // 相当于componentDidMount只执行一次
        if (!primaryKeyUpdate && !reQueryFinishFlag) {
          nextState.reQueryFlag = true;
          nextState.reQueryFinishFlag = true;
        } else if (primaryKeyUpdate || paramsUpdate) {
          nextState.reQueryFlag = true;
          nextState.reQueryFinishFlag = true;
        } else {
          nextState.reQueryFlag = false;
        }
        // 步骤2
      } else if (preQueryFinallyFlag) {
        if (!relationId || primaryKeyUpdate) {
          nextState.reQueryFlag = true;
          nextState.reQueryFinishFlag = true;
        } else {
          nextState.reQueryFlag = false;
        }
      } else {
        nextState.reQueryFlag = false;
      }
    }
    // 先粗略这判断，后续可以在精细判断，当查询的时候再返回nextState否则返回null
    return isEmpty(definitionList) ? null : nextState;
  }

  componentDidUpdate() {
    // 分两步判断
    // 1. 申请单已有主键id，直接查申请单数据接口
    // 2. 申请单没有主键id，在readyQuery（前置数据已经完成标识）为true时查询
    const { definitionList, relationId, reQueryFlag } = this.state;
    const { interfaceChange = false } = this.props;
    if (reQueryFlag && !isEmpty(definitionList)) {
      if (relationId) {
        this.queryDynamicTable();
      } else if (interfaceChange) {
        // 查询主数据带值接口
        this.queryLifecycleModelData();
      }
    }
  }

  componentWillUnmount() {
    window.SSLMSELECTCACHE = {};
  }

  /**
   * 查询动态表格列配置
   */
  @Bind()
  fetchTableColConfig() {
    const { modelTable = {} } = this.props;
    const { tableCode, uniqueCode } = modelTable;
    this.setState({
      queryLoading: true,
    });
    queryTableConfig({
      tableCode,
      uniqueCode,
    })
      .then(res => {
        if (res && getResponse(res) && isArray(res)) {
          this.setState({
            definitionList: res || [],
          });
        }
      })
      .finally(() => {
        this.setState({
          queryLoading: false,
        });
      });
  }

  /**
   * 查询动态表格数据
   */
  @Bind()
  queryDynamicTable(page = {}, newRelationId) {
    const { uniqueCode = '', definitionList = [], relationId, viewOnlyFlag } = this.state;
    const {
      remote,
      remoteProps = {},
      c7nButton = false,
      readOnly = false,
      pageFlag = true,
      compare = undefined,
      modelTable = {},
      updateCollapseKeys,
      updateModelTableLoading,
    } = this.props;
    const readOnlyFlag = viewOnlyFlag || readOnly;
    const { companyId, supplierCompanyId, tableCode, otherParams = {} } = modelTable;
    const newPage = pageFlag
      ? page
      : {
          current: 1,
          pageSize: 0,
        };
    const params = {
      tenantId: organizationId,
      relationId: relationId || newRelationId,
      page: newPage,
      tableCode: uniqueCode,
      definitionList,
      compare,
      companyId: companyId || null,
      supplierCompanyId,
      ...otherParams,
    };
    const payload = remote
      ? remote.process('SSLM_COMMON_DYNAMIC_TABLE_QUERY_PARAMS', params, remoteProps)
      : params;
    this.setState({
      queryLoading: true,
    });
    if (updateModelTableLoading) {
      updateModelTableLoading(true);
    }
    queryTableData(payload)
      .then(res => {
        if (getResponse(res)) {
          // 行内编辑还是点击操作列
          if (c7nButton && !readOnlyFlag) {
            const dataSource = (res.content || []).map(n => {
              return {
                ...n,
                _status: 'update',
              };
            });

            this.setState({
              dataSource,
              pagination: createPagination(res),
            });
          } else {
            const newData = res.content || [];
            const remoteData = remote
              ? remote.process('SSLM_COMMON_DYNAMIC_TABLE_DATASOURCE', newData, {
                  readOnlyFlag,
                  _this: this,
                })
              : newData;
            this.setState({
              dataSource: remoteData,
              pagination: createPagination(res),
            });
          }
          // 有变更折叠栏展开
          (res.content || []).forEach(n => {
            if (n && n.objectFlag && isFunction(updateCollapseKeys)) {
              updateCollapseKeys([tableCode]);
            }
          });
        }
      })
      .finally(() => {
        this.setState({
          queryLoading: false,
        });
        if (updateModelTableLoading) {
          updateModelTableLoading(false);
        }
      });
  }

  /**
   * 查询生命周期第一次新建模型表数据
   */
  @Bind()
  queryLifecycleModelData() {
    const {
      remote,
      modelTable = {},
      c7nButton = false,
      readOnly = false,
      updateModelTableLoading,
    } = this.props;
    const { viewOnlyFlag } = this.state;
    const readOnlyFlag = viewOnlyFlag || readOnly;
    const payload = {
      ...modelTable,
    };
    this.setState({
      queryHistoryDataLoading: true,
    });
    if (updateModelTableLoading) {
      updateModelTableLoading(true);
    }
    queryLifecycleModelData(payload)
      .then(res => {
        if (getResponse(res)) {
          // 行内编辑还是点击操作列
          if (c7nButton && !readOnlyFlag) {
            const dataSource = (isEmpty(res) ? [] : res).map(n => {
              return {
                ...n,
                _status: 'update',
              };
            });
            this.setState({
              dataSource,
            });
          } else {
            const newData = remote
              ? remote.process('SSLM_COMMON_DYNAMIC_TABLE_LIFE_CYCLE_DATASOURCE', res, {
                  readOnlyFlag,
                  _this: this,
                })
              : res;
            this.setState({
              dataSource: isEmpty(newData) ? [] : newData,
            });
          }
        }
      })
      .finally(() => {
        this.setState({
          queryHistoryDataLoading: false,
        });
        if (updateModelTableLoading) {
          updateModelTableLoading(false);
        }
      });
  }

  /**
   * 编辑／取消编辑
   */
  @Bind()
  handleEdit(flag, record) {
    const { dataSource, rowKey } = this.state;
    const newDataSource = dataSource.map(n =>
      n[rowKey] === record[rowKey] ? { ...n, _status: flag ? 'update' : '' } : n
    );
    this.setState({ dataSource: newDataSource });
  }

  /**
   * 清除新建的行
   * @param {object} record
   */
  @Bind()
  handleDeleteRow(_, record) {
    const { dataSource = [], pagination = {}, rowKey } = this.state;
    const newDataSource = dataSource.filter(item => item[rowKey] !== record[rowKey]);
    this.setState({
      dataSource: newDataSource,
      pagination: delItemToPagination(dataSource.length, pagination),
    });
  }

  /**
   * 新建
   */
  @Bind()
  handleAdd() {
    const {
      dataSource = [],
      pagination = {},
      uniqueCode = '',
      relationId = '',
      rowKey,
    } = this.state;
    this.setState({
      dataSource: [
        { _status: 'create', [rowKey]: uuidv4(), relationId, tableCode: uniqueCode },
        ...dataSource,
      ],
      pagination: addItemToPagination(dataSource.length, pagination),
    });
  }

  /**
   * 勾选删除
   */
  @Bind()
  handleDelete() {
    const { selectedRows = [], dataSource = [], pagination = {}, rowKey } = this.state;
    // 要删除的行
    const existRows = selectedRows
      .filter(n => n._status !== 'create')
      .map(item => {
        const { _status, $form, ...others } = item;
        return others;
      });
    if (!isEmpty(existRows)) {
      this.setState({
        queryLoading: true,
      });
      deleteData(existRows)
        .then(res => {
          if (getResponse(res)) {
            notification.success();
            this.setState({
              selectedRowKeys: [],
              selectedRows: [],
            });
            // 查询
            this.queryDynamicTable();
          }
        })
        .finally(() => {
          this.setState({
            queryLoading: false,
          });
        });
    } else {
      const newDataSource = pullAllBy(dataSource, selectedRows, rowKey);
      this.setState({
        dataSource: newDataSource,
        pagination: delItemsToPagination(selectedRows.length, dataSource.length, pagination),
        selectedRowKeys: [],
        selectedRows: [],
      });
      notification.success();
    }
  }

  /**
   * 校验数据
   */
  @Bind()
  checkData() {
    const { readOnly = false, interfaceChange = false } = this.props;
    const { dataSource = [], definitionList = [], rowKey, viewOnlyFlag, relationId } = this.state;
    const readOnlyFlag = viewOnlyFlag || readOnly;
    if (readOnlyFlag) {
      return [];
    } else if (interfaceChange && !relationId) {
      // 如果是生命周期阶段页面，第一次新建需要把所有数据传给后端
      const payloadData = getEditTableData(dataSource, [], {
        force: true,
      });
      const latestData = unionBy(payloadData, dataSource, rowKey);
      const finalData = latestData.map(item => {
        const { $form, _status, ...newItem } = item;
        if (_status === 'create') {
          delete newItem[rowKey];
        }
        return {
          ...newItem,
        };
      });
      const formatData = this.handleformatData(finalData, definitionList);
      const isEditing = !!dataSource.find(d => d._status === 'create' || d._status === 'update');
      if (isEditing) {
        if (Array.isArray(payloadData) && payloadData.length !== 0) {
          return formatData;
        } else {
          return false;
        }
      } else {
        return formatData;
      }
    } else {
      const payloadData = getEditTableData(dataSource, ['_status', rowKey], {
        force: true,
      });
      const isEditing = !!dataSource.find(d => d._status === 'create' || d._status === 'update');
      if (isEditing) {
        if (Array.isArray(payloadData) && payloadData.length !== 0) {
          const formatData = this.handleformatData(payloadData, definitionList);
          return formatData;
        } else {
          return false;
        }
      } else {
        return [];
      }
    }
  }

  /**
   * 格式化数据
   */
  @Bind()
  handleformatData(data = [], fieldConfig = []) {
    // checkBox类型
    const valueType1 = [];
    // DatePicker 类型
    const valueType2 = [];
    // DateTimePicker 类型
    const valueType3 = [];
    // lookup 多选类型
    const valueType4 = [];
    fieldConfig.forEach(field => {
      if (field._component === 'checkBox') {
        valueType1.push(field.name);
      } else if (field._component === 'datePicker') {
        valueType2.push(field.name);
      } else if (field._component === 'dateTimePicker') {
        valueType3.push(field.name);
      } else if (field._component === 'lookup' && field.multiple) {
        valueType4.push(field.name);
      }
    });
    // 格式化
    const value = data.map(item => {
      const item_ = { ...item };
      valueType1.forEach(key => {
        item_[key] = item_[key] ? 1 : 0;
      });
      valueType2.forEach(key => {
        item_[key] = item_[key] && moment(item_[key]).format(DEFAULT_DATE_FORMAT);
      });
      valueType3.forEach(key => {
        item_[key] = item_[key] && moment(item_[key]).format(DEFAULT_DATETIME_FORMAT);
      });
      valueType4.forEach(key => {
        item_[key] = item_[key] && (item_[key] || []).join();
      });
      return item_;
    });
    return value;
  }

  /**
   * 处理保存
   */
  @Bind()
  handleSave() {
    const modelData = this.checkData();
    if (modelData) {
      this.setState({
        queryLoading: true,
      });
      saveData(modelData)
        .then(res => {
          if (getResponse(res)) {
            notification.success();
            this.setState({
              selectedRows: [],
              selectedRowKeys: [],
            });
            this.queryDynamicTable();
          }
        })
        .finally(() => {
          this.setState({
            queryLoading: false,
          });
        });
    }
  }

  /**
   * 处理选中的行
   * @param {Array} selectedRowKeys
   */
  @Bind()
  onSelectChange(selectedRowKeys, selectedRows) {
    this.setState({ selectedRowKeys, selectedRows });
  }

  /**
   * 处理查询参数
   * @param {Array} selectedRowKeys
   */
  @Bind()
  handleFieldQueryParam(fieldProps = [], form = {}) {
    let queryParam = {};
    // lov查询参数名
    let queryParamField = '';
    // 父级联字段名
    let parentField = '';
    fieldProps.forEach(n => {
      if (n.fieldPropertyCode === 'relationParamName') {
        // 级联查询参数名
        const relationParamName = n.fieldPropertyValue;
        queryParamField = relationParamName;
      } else if (n.fieldPropertyCode === 'parentRelationField') {
        // 父级联字段
        const relationParamName = n.fieldPropertyValue;
        parentField = relationParamName;
      }
      if (queryParamField && parentField) {
        queryParam = {
          [queryParamField]: form.getFieldValue(parentField),
        };
      }
    });
    // 处理lov其他参数
    const otherLovParam = this.handleLovParamConfig(fieldProps);
    return {
      ...queryParam,
      ...otherLovParam,
    };
  }

  // 处理lov拓展参数
  @Bind()
  handleLovParamConfig(fieldProps = []) {
    const { relationId, pathQueryParams } = this.state;
    const params = {};
    const lovPropsList = fieldProps.filter(n => n.fieldPropertyCode === 'lovParam');
    if (!isEmpty(lovPropsList)) {
      const lovProps = lovPropsList[0];
      const { lines = [] } = lovProps;
      // 目前只处理一种情况 todo
      const paramProps = lines.find(n => n.conExpression === 'businessKey');
      const { sourceFieldCode } = paramProps || {};
      if (sourceFieldCode) {
        params[sourceFieldCode] = relationId;
      }
      // url参数
      const relParamProps = lines.filter(n => n.conExpression === 'urlParam');
      relParamProps.forEach(n => {
        const { sourceFieldCode: urlQueryParam } = n;
        params[urlQueryParam] = (pathQueryParams || {})[urlQueryParam];
      });
    }
    return params;
  }

  /**
   * 获取级联字段
   * @param {Array} selectedRowKeys
   */
  @Bind()
  getRelationField(fieldProps = []) {
    // 父级联字段名
    let parentField = '';
    fieldProps.forEach(n => {
      if (n.fieldPropertyCode === 'parentRelationField') {
        // 父级联字段
        parentField = n.fieldPropertyValue;
      }
    });
    return parentField;
  }

  /**
   * 处理级联清空
   * @param {Array} selectedRowKeys
   */
  @Bind()
  handleFieldClear(fieldProps = []) {
    let childRelationField = [];
    const clearFields = {};
    fieldProps.forEach(n => {
      if (n.fieldPropertyCode === 'childRelationField') {
        // 子级级联字段
        childRelationField = n.fieldPropertyValue.split(',') || [];
        childRelationField.forEach(item => {
          clearFields[item] = undefined;
        });
      }
    });
    return clearFields;
  }

  // 处理字段显示隐藏，1-显示返回false；0-隐藏返回true
  @Bind()
  handleFieldDisplay(fieldProps = []) {
    const { fieldPropertyValue = true } =
      fieldProps.find(item => item.fieldPropertyCode === 'display') || {};
    const displayFlag = !!Number(fieldPropertyValue);
    return !displayFlag;
  }

  // 处理显示字段回传
  @Bind()
  handleTextFieldMapping(fieldProps = [], cols = []) {
    const { fieldPropertyValue } =
      fieldProps.find(item => item.fieldPropertyCode === 'textFieldMapping') || {};
    const findCol = fieldPropertyValue
      ? cols.find(item => item.name === fieldPropertyValue) || {}
      : {};
    // 显示字段回传只能是配置隐藏的字段，否则配置字段回传无效
    let decideResultFlag = true;
    if (!isEmpty(findCol)) {
      const { fieldProperty = [] } = findCol;
      decideResultFlag = this.handleFieldDisplay(fieldProperty || []);
    }
    return decideResultFlag ? fieldPropertyValue : false;
  }

  // 处理lov映射字段,把lov对象映射到form表单, 可以支持多个,以逗号分隔
  @Bind()
  handleExtMapToForm(lovRecord = {}, fieldProps = [], form) {
    const { fieldPropertyValue } =
      fieldProps.find(item => item.fieldPropertyCode === 'extSetMap') || {};
    const dataSet = {};
    if (fieldPropertyValue && isString(fieldPropertyValue)) {
      fieldPropertyValue.split(/\s*,\s*/g).forEach(entryStr => {
        const [recordField, formFieldTmp] = entryStr.split('->');
        const formField = formFieldTmp || recordField;
        dataSet[formField] = lovRecord[recordField];
      });
    }
    form.setFieldsValue(dataSet);
  }

  // 处理条件配置渲染
  @Bind()
  handleConditionConfig(params = {}) {
    const { record, config = {} } = params;
    const toolsObj = {
      record,
      targetForm: record.$form,
    };
    // 不含条件配置的必输和编辑配置
    const originConfig = {
      required: config.required,
      disabled: config.disabled,
      displayUrl: false,
    };
    // 处理fx配置
    const newConfig = coverConfig(originConfig, config.fieldProperty, toolsObj);
    const { required, disabled, displayUrl } = newConfig;
    return { required, disabled, displayUrl };
  }

  // 处理字段宽度
  @Bind()
  handleFieldWidth(fieldProps = []) {
    const { fieldPropertyValue = 150 } =
      fieldProps.find(item => item.fieldPropertyCode === 'width') || {};
    const parseIntFlag = !!Number(fieldPropertyValue);
    return parseIntFlag ? Number(fieldPropertyValue) : 150;
  }

  // 处理字段最大长度
  @Bind()
  handleFieldMaxLength(fieldProps = []) {
    const { fieldPropertyValue = 100 } =
      fieldProps.find(item => item.fieldPropertyCode === 'maxLength') || {};
    const parseIntFlag = !!Number(fieldPropertyValue);
    return parseIntFlag ? Number(fieldPropertyValue) : 100;
  }

  /**
   * 处理列
   */
  @Bind()
  handleColumns(colList = []) {
    const {
      readOnly = false,
      c7nButton = false,
      compareFlag = false,
      modelTable = {},
    } = this.props;
    const { viewOnlyFlag } = this.state;
    const readOnlyFlag = viewOnlyFlag || readOnly;
    const { tableCode = '' } = modelTable;
    const columns = colList.map(li => {
      const newFieldProperty = li.fieldProperty || [];
      const width = this.handleFieldWidth(newFieldProperty);
      const maxLength = this.handleFieldMaxLength(newFieldProperty);
      // 处理隐藏
      if (li.fieldProperty && this.handleFieldDisplay(newFieldProperty)) {
        return {};
      }
      if (li._component === 'checkBox') {
        return {
          title: li.label,
          dataIndex: li.name,
          width,
          render: (val, record) => {
            if (record._status === 'update' || record._status === 'create') {
              const noDefaultValue = Number(record[li.name]) === 1 ? 1 : 0;
              const hasDefautValue = Number(li.defaultValue) === 1 ? 1 : 0;

              const { required, disabled } = this.handleConditionConfig({ record, config: li });
              return (
                <FormItem>
                  {record.$form.getFieldDecorator(li.name, {
                    initialValue: record._status === 'create' ? hasDefautValue : noDefaultValue,
                    rules: [
                      {
                        required: !!required,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: li.label,
                        }),
                      },
                    ],
                  })(<Checkbox disabled={!!disabled} />)}
                </FormItem>
              );
            } else {
              return compareFlag ? (
                <div
                  style={{
                    color:
                      (record.objectFlag === 'CREATE' || record[`${li.name}Flag`] === 'UPDATE') &&
                      'red',
                  }}
                >
                  {yesOrNoRender(Number(record[li.name]))}
                </div>
              ) : (
                yesOrNoRender(Number(record[li.name]))
              );
            }
          },
        };
      } else if (li._component === 'lov') {
        return {
          title: li.label,
          dataIndex: li.name,
          width,
          render: (val, record) => {
            if (record._status === 'update' || record._status === 'create') {
              // 级联暂时没想到好的处理方式 todo
              const newQueryParams = this.handleFieldQueryParam(newFieldProperty, record.$form);
              const clearFields = this.handleFieldClear(newFieldProperty);
              const parentField = this.getRelationField(newFieldProperty);
              const fieldDisabled = parentField ? !record.$form.getFieldValue(parentField) : false;
              const { required, disabled } = this.handleConditionConfig({ record, config: li });
              // 默认值
              const noDefaultValue = record[li.name];
              const hasDefautValue = li.defaultValue;
              const noDefaultValueMeaning =
                record[`${li.name}Meaning`] || record[li.textField] || record[li.name];
              const hasDefautValueMeaning = li.defaultValueMeaning;
              return (
                <FormItem>
                  {record.$form.getFieldDecorator(li.name, {
                    initialValue: record._status === 'create' ? hasDefautValue : noDefaultValue,
                    rules: [
                      {
                        required: !!required,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: li.label,
                        }),
                      },
                    ],
                  })(
                    <Lov
                      code={li.lovCode}
                      lovOptions={{ displayField: li.textField, valueField: li.valueField }}
                      textValue={
                        record._status === 'create' ? hasDefautValueMeaning : noDefaultValueMeaning
                      }
                      onChange={(_, lovRecord) => {
                        record.$form.setFieldsValue(clearFields);
                        this.handleExtMapToForm(lovRecord, newFieldProperty, record.$form || {});
                      }}
                      queryParams={{
                        ...newQueryParams,
                        tenantId: organizationId,
                      }}
                      disabled={!!disabled || fieldDisabled}
                    />
                  )}
                </FormItem>
              );
            } else {
              return compareFlag ? (
                <div
                  style={{
                    color:
                      (record.objectFlag === 'CREATE' || record[`${li.name}Flag`] === 'UPDATE') &&
                      'red',
                  }}
                >
                  <Popover
                    content={record[`${li.name}Meaning`] || record[li.textField] || record[li.name]}
                  >
                    {record[`${li.name}Meaning`] || record[li.textField] || record[li.name]}
                  </Popover>
                </div>
              ) : (
                <Popover
                  content={record[`${li.name}Meaning`] || record[li.textField] || record[li.name]}
                >
                  {record[`${li.name}Meaning`] || record[li.textField] || record[li.name]}
                </Popover>
              );
            }
          },
        };
      } else if (li._component === 'lookup') {
        return {
          title: li.label,
          dataIndex: li.name,
          width,
          render: (_, record) => {
            if (record._status === 'update' || record._status === 'create') {
              const mappingField = this.handleTextFieldMapping(newFieldProperty, colList || []);
              const noDefaultValue = li.multiple
                ? (record[li.name] && record[li.name].split(',')) || []
                : record[li.name];
              const hasDefautValue = li.multiple
                ? (li.defaultValue && li.defaultValue.split(',')) || []
                : li.defaultValue;
              const { required, disabled } = this.handleConditionConfig({ record, config: li });
              const clearFields = this.handleFieldClear(newFieldProperty);
              return (
                <FormItem>
                  {record.$form.getFieldDecorator(li.name, {
                    initialValue: record._status === 'create' ? hasDefautValue : noDefaultValue,
                    rules: [
                      {
                        required: !!required,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: li.label,
                        }),
                      },
                    ],
                  })(
                    <Select
                      lovCode={li.lookupCode}
                      multipleFlag={!!li.multiple}
                      disabled={!!disabled}
                      onChange={val => {
                        if (!li.multiple) {
                          if (mappingField) {
                            record.$form.setFieldsValue({
                              [mappingField]: val,
                            });
                          } else if (!isEmpty(clearFields)) {
                            record.$form.setFieldsValue(clearFields);
                          }
                        }
                      }}
                    />
                  )}
                  {mappingField &&
                    record.$form.getFieldDecorator(mappingField, {
                      initialValue: record[`${li.name}Meaning`] || record[li.textField],
                    })}
                </FormItem>
              );
            } else {
              return compareFlag ? (
                <div
                  style={{
                    color:
                      (record.objectFlag === 'CREATE' || record[`${li.name}Flag`] === 'UPDATE') &&
                      'red',
                  }}
                >
                  <Popover
                    content={record[`${li.name}Meaning`] || record[li.textField] || record[li.name]}
                  >
                    {record[`${li.name}Meaning`] || record[li.textField] || record[li.name]}
                  </Popover>
                </div>
              ) : (
                <Popover
                  content={record[`${li.name}Meaning`] || record[li.textField] || record[li.name]}
                >
                  {record[`${li.name}Meaning`] || record[li.textField] || record[li.name]}
                </Popover>
              );
            }
          },
        };
      } else if (li._component === 'datePicker') {
        return {
          title: li.label,
          dataIndex: li.name,
          width,
          render: (val, record) => {
            if (record._status === 'update' || record._status === 'create') {
              const { required, disabled } = this.handleConditionConfig({ record, config: li });
              return (
                <FormItem>
                  {record.$form.getFieldDecorator(li.name, {
                    initialValue: record[li.name]
                      ? moment(record[li.name], DEFAULT_DATE_FORMAT)
                      : null,
                    rules: [
                      {
                        required: !!required,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: li.label,
                        }),
                      },
                    ],
                  })(
                    <DatePicker
                      placeholder=""
                      disabled={!!disabled}
                      style={{ width: '100%' }}
                      format={DEFAULT_DATE_FORMAT}
                    />
                  )}
                </FormItem>
              );
            } else {
              return compareFlag ? (
                <div
                  style={{
                    color:
                      (record.objectFlag === 'CREATE' || record[`${li.name}Flag`] === 'UPDATE') &&
                      'red',
                  }}
                >
                  {record[li.name]}
                </div>
              ) : (
                record[li.name]
              );
            }
          },
        };
      } else if (li._component === 'dateTimePicker') {
        return {
          title: li.label,
          dataIndex: li.name,
          width,
          render: (val, record) => {
            if (record._status === 'update' || record._status === 'create') {
              const { required, disabled } = this.handleConditionConfig({ record, config: li });
              return (
                <FormItem>
                  {record.$form.getFieldDecorator(li.name, {
                    initialValue: record[li.name]
                      ? moment(record[li.name], DEFAULT_DATETIME_FORMAT)
                      : null,
                    rules: [
                      {
                        required: !!required,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: li.label,
                        }),
                      },
                    ],
                  })(
                    <DatePicker
                      placeholder=""
                      disabled={!!disabled}
                      style={{ width: '100%' }}
                      format={DEFAULT_DATETIME_FORMAT}
                      showTime
                    />
                  )}
                </FormItem>
              );
            } else {
              return compareFlag ? (
                <div
                  style={{
                    color:
                      (record.objectFlag === 'CREATE' || record[`${li.name}Flag`] === 'UPDATE') &&
                      'red',
                  }}
                >
                  {record[li.name]}
                </div>
              ) : (
                record[li.name]
              );
            }
          },
        };
      } else if (li._component === 'number') {
        return {
          title: li.label,
          dataIndex: li.name,
          width,
          render: (val, record) => {
            if (record._status === 'update' || record._status === 'create') {
              const { required, disabled } = this.handleConditionConfig({ record, config: li });
              return (
                <FormItem>
                  {record.$form.getFieldDecorator(li.name, {
                    initialValue: record[li.name],
                    rules: [
                      {
                        required: !!required,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: li.label,
                        }),
                      },
                    ],
                  })(<InputNumber allowThousandth disabled={!!disabled} min={0} />)}
                </FormItem>
              );
            } else {
              return compareFlag ? (
                <div
                  style={{
                    color:
                      (record.objectFlag === 'CREATE' || record[`${li.name}Flag`] === 'UPDATE') &&
                      'red',
                  }}
                >
                  {val && parseFloat(val).toLocaleString()}
                </div>
              ) : (
                val && parseFloat(val).toLocaleString()
              );
            }
          },
        };
      } else if (li._component === 'textArea') {
        return {
          title: li.label,
          dataIndex: li.name,
          width,
          render: (val, record) => {
            if (record._status === 'update' || record._status === 'create') {
              const { required, disabled } = this.handleConditionConfig({ record, config: li });
              return (
                <FormItem>
                  {record.$form.getFieldDecorator(li.name, {
                    initialValue: record[li.name],
                    rules: [
                      {
                        required: !!required,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: li.label,
                        }),
                      },
                    ],
                  })(
                    <TextArea
                      style={{ resize: 'none' }}
                      disabled={!!disabled}
                      maxLength={maxLength}
                    />
                  )}
                </FormItem>
              );
            } else {
              return compareFlag ? (
                <div
                  style={{
                    color:
                      (record.objectFlag === 'CREATE' || record[`${li.name}Flag`] === 'UPDATE') &&
                      'red',
                  }}
                >
                  {<Popover content={record[li.name]}>{record[li.name]}</Popover>}
                </div>
              ) : (
                <Popover content={record[li.name]}>{record[li.name]}</Popover>
              );
            }
          },
        };
      } else if (li._component === 'textField') {
        return {
          title: li.label,
          dataIndex: li.name,
          width,
          render: (val, record) => {
            const { required, disabled, displayUrl } = this.handleConditionConfig({
              record,
              config: li,
            });

            if ((record._status === 'update' || record._status === 'create') && !displayUrl) {
              const noDefaultValue = record[li.name];
              const hasDefautValue = li.defaultValue;
              return (
                <FormItem>
                  {record.$form.getFieldDecorator(li.name, {
                    initialValue: record._status === 'create' ? hasDefautValue : noDefaultValue,
                    rules: [
                      {
                        required: !!required,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: li.label,
                        }),
                      },
                    ],
                  })(<Input disabled={!!disabled} dbc2sbc={false} maxLength={maxLength} />)}
                </FormItem>
              );
            } else if (displayUrl) {
              const displayText = record[`${li.name}Meaning`];
              return <div dangerouslySetInnerHTML={{ __html: displayText || '' }} />;
            } else {
              return compareFlag ? (
                <div
                  style={{
                    color:
                      (record.objectFlag === 'CREATE' || record[`${li.name}Flag`] === 'UPDATE') &&
                      'red',
                  }}
                >
                  {<Popover content={val}>{val}</Popover>}
                </div>
              ) : (
                <Popover content={val}>{val}</Popover>
              );
            }
          },
        };
      } else if (li._component === 'upload') {
        return {
          title: li.label,
          dataIndex: li.name,
          width: 150,
          render: (val, record) => {
            if (record._status === 'update' || record._status === 'create') {
              const { required, disabled } = this.handleConditionConfig({ record, config: li });
              return (
                <FormItem>
                  {record.$form.getFieldDecorator(li.name, {
                    initialValue: record[li.name],
                    rules: [
                      {
                        required: !!required,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: li.label,
                        }),
                      },
                    ],
                  })(
                    <Upload
                      bucketName={PRIVATE_BUCKET}
                      bucketDirectory={tableCode}
                      filePreview
                      viewOnly={!!disabled}
                      attachmentUUID={val}
                    />
                  )}
                </FormItem>
              );
            } else {
              return (
                <Upload
                  viewOnly
                  bucketName={PRIVATE_BUCKET}
                  bucketDirectory={tableCode}
                  attachmentUUID={val}
                  filePreview
                />
              );
            }
          },
        };
      } else {
        return {};
      }
    });
    if (!readOnlyFlag && !c7nButton) {
      columns.push({
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 80,
        render: (_, record) => (
          <Fragment>
            {record._status === 'create' && (
              <a onClick={() => this.handleDeleteRow(false, record)}>
                {intl.get('hzero.common.button.clean').d('清除')}
              </a>
            )}
            {record._status === 'update' && (
              <a onClick={() => this.handleEdit(false, record)}>
                {intl.get('hzero.common.button.cancel').d('取消')}
              </a>
            )}
            {record._status !== 'create' && record._status !== 'update' && (
              <a onClick={() => this.handleEdit(true, record)}>
                {intl.get('hzero.common.button.edit').d('编辑')}
              </a>
            )}
          </Fragment>
        ),
      });
    }

    const newColumns = columns.filter(n => !isEmpty(n));

    return newColumns;
  }

  render() {
    const {
      remote,
      readOnly = false,
      viewSaveButton, // 页面传入的条件判断
      viewDeleteButton, // 页面传入的条件判断
      c7nButton = false,
      pageFlag = true,
    } = this.props;

    const {
      dataSource = [],
      pagination = {},
      selectedRows = [],
      selectedRowKeys = [],
      definitionList = [],
      queryLoading,
      relationId = '',
      rowKey,
      viewOnlyFlag,
      queryHistoryDataLoading,
      addButtonFlag,
      saveButtonFlag,
      deleteButtonFlag,
    } = this.state;

    const isShowAddButton = Boolean(+addButtonFlag);

    // 是否展示保存按钮
    const isShowSaveButton = isNil(viewSaveButton)
      ? Boolean(+saveButtonFlag)
      : Boolean(+saveButtonFlag) && viewSaveButton;

    // 是否展示删除按钮
    const isShowDeleteButton = isNil(viewDeleteButton)
      ? Boolean(+deleteButtonFlag)
      : Boolean(+deleteButtonFlag) && viewDeleteButton;

    const readOnlyFlag = viewOnlyFlag || readOnly;

    const columns = this.handleColumns(definitionList);
    const scrollX = sum(columns.map(n => (isNumber(n.width) ? n.width : 150)));

    // 历史数据允许删除- 展示删除按钮并且dataId有值可以删除
    // 历史数据不允许删除- dataId没值的接口查询数据
    const rowSelection = {
      selectedRowKeys,
      selectedRows,
      onChange: this.onSelectChange,
      getCheckboxProps: record => ({
        disabled: !(
          isShowDeleteButton &&
          (record._status === 'create' || (!!record.dataId && record._status !== 'create'))
        ),
      }),
    };

    const remoteColumns = remote
      ? remote.process('SSLM_COMMON_DYNAMIC_TABLE_COLUMNS', columns, { readOnlyFlag, _this: this })
      : columns;

    const viewRowSelection = readOnlyFlag ? false : !!isShowDeleteButton;
    const allLoading = queryLoading || queryHistoryDataLoading;
    return (
      <Spin spinning={allLoading || false}>
        <Fragment>
          {!readOnlyFlag && !c7nButton && (
            <div style={{ textAlign: 'right', paddingBottom: 16 }}>
              {isShowSaveButton && (
                <Button onClick={() => this.handleSave()}>
                  {intl.get('hzero.common.button.save').d('保存')}
                </Button>
              )}
              {isShowDeleteButton && (
                <Button
                  onClick={() => this.handleDelete()}
                  disabled={isEmpty(selectedRowKeys)}
                  style={{ marginLeft: 8 }}
                >
                  {intl.get('hzero.common.button.delete').d('删除')}
                </Button>
              )}
              {isShowAddButton && (
                <Button type="primary" onClick={() => this.handleAdd()} style={{ marginLeft: 8 }}>
                  {intl.get(`hzero.common.button.create`).d('新建')}
                </Button>
              )}
            </div>
          )}
          {!readOnlyFlag && c7nButton && (
            <div style={{ textAlign: 'left', paddingBottom: 16 }}>
              {isShowAddButton && (
                <C7nButton
                  funcType="flat"
                  color="primary"
                  icon="playlist_add"
                  onClick={() => this.handleAdd()}
                >
                  {intl.get(`hzero.common.button.create`).d('新建')}
                </C7nButton>
              )}
              {isShowDeleteButton && (
                <C7nButton
                  onClick={() => this.handleDelete()}
                  disabled={isEmpty(selectedRowKeys)}
                  funcType="flat"
                  color="primary"
                  icon="delete"
                >
                  {intl.get('hzero.common.button.delete').d('删除')}
                </C7nButton>
              )}
              {isShowSaveButton && (
                <C7nButton
                  funcType="flat"
                  color="primary"
                  icon="save"
                  onClick={() => this.handleSave()}
                >
                  {intl.get('hzero.common.button.save').d('保存')}
                </C7nButton>
              )}
            </div>
          )}
          <EditTable
            bordered={!c7nButton}
            scroll={{ x: scrollX }}
            rowKey={rowKey}
            columns={remoteColumns}
            dataSource={dataSource}
            pagination={pageFlag ? (relationId ? pagination : false) : false}
            onChange={page => this.queryDynamicTable(page)}
            rowSelection={viewRowSelection ? rowSelection : null}
          />
        </Fragment>
      </Spin>
    );
  }
}

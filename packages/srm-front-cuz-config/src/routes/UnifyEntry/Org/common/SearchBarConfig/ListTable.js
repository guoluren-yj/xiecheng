import React, { Component } from 'react';
import { connect } from 'dva';
import { observer } from "mobx-react";
import { Table, DataSet, Modal, Button, Form as C7NForm, TextField } from 'choerodon-ui/pro';
import { Icon, Tooltip, Spin, Form } from 'hzero-ui';
import { Bind, Debounce } from 'lodash-decorators';
import { isEmpty, values, isArray, isNil, isString } from 'lodash';

import intl from 'utils/intl';
import notification from 'utils/notification';
import { getCurrentOrganizationId } from 'utils/utils';
import { queryMapIdpValue } from 'services/api';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';

import styles from './index.less';
import FieldSelector from './FieldEditor';
import SortSelector from './SortSelector';
import { FilterComponentList, SEARCHBAR_RANGE_COMPONENT, FIX_DATE_RANGES } from '@/utils/constConfig';
import { getLovPara } from '@/utils/util';

const rowKey = 'filterFieldId';
export const formsLayouts = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

@connect(({ loading }) => ({
  removeLoading: loading.effects['searchBarConfig/removeFilterField'],
  saveFilterLoading: loading.effects['searchBarConfig/saveUnitFilter'],
  saveFieldLoading: loading.effects['searchBarConfig/saveFilterField'],
}))
@Form.create({ fieldNameProp: null })
@observer
export default class ListTable extends Component {
  constructor(props) {
    super(props);
    this.fieldSelectorRef = null;
    this.state = {
      enabledFlag: false, // 启用标识
      fieldList: [], // 已加的字段列表
      optionalFieldList: [], // 可选的字段列表
      widgetTypeObj: {}, // 字段组件类型map
      whereOptions: [], // 关系类型
      refreshFlag: false,
    };
  }

  componentDidMount() {
    this.fetchLovData();
  }

  @Bind
  fetchLovData() {
    queryMapIdpValue({
      widgetType: 'HPFM.CUST.FIELD_COMPONENT',
      whereOptions: 'HPFM.CUST.FIELD_QUERY_REALTION',
    }).then((res) => {
      if (res) {
        const { widgetType, whereOptions } = res;
        const widgetTypeObj = {};
        (widgetType || []).forEach((i) => {
          if (FilterComponentList.includes(i.value)) {
            widgetTypeObj[i.value] = i.meaning;
          }
        });
        this.setState({
          widgetTypeObj,
          whereOptions,
        });
      }
    });
  }

  componentWillReceiveProps(nextProps) {
    if (!isEmpty(nextProps.currentFilter)) {
      const { refreshFlag } = this.state;
      const {
        filterCode,
        enabledFlag,
        filterFields = [],
        allFields = [],
        defaultSortedField,
        defaultSortedOrder,
      } = nextProps.currentFilter;
      const {
        filterCode: oldFilterCode,
        filterFields: oldFilterFields = [],
        enabledFlag: oldEnabledFlag,
      } = this.props.currentFilter;
      if (
        oldFilterCode !== filterCode ||
        oldFilterFields.length !== filterFields.length ||
        nextProps.unitInfo.orderCount !== this.props.unitInfo.orderCount || 
        enabledFlag !== oldEnabledFlag ||
        refreshFlag
      ) {
        this.props.form.setFieldsValue({
          defaultSortedField,
          defaultSortedOrder,
        });
        const fieldListMap = this.transformFieldList(filterFields);
        this.props.tableDs.loadData(fieldListMap.fieldList);
        this.setState({
          ...fieldListMap,
          enabledFlag: enabledFlag === 1,
          refreshFlag: false,
          optionalFieldList: isEmpty(allFields)
            ? []
            : allFields.filter((item) => item.showFlag !== 0),
        });
      }
    }
  }

  transformFieldList(originFieldList = []) {
    let fieldList = [];
    const fixedFieldList = []; // 冻结字段
    const mergeFieldList = []; // 聚合字段
    const normalFieldList = []; // 普通字段
    if (!isEmpty(originFieldList)) {
      originFieldList.sort((before, after) => before.num - after.num);
      fieldList = originFieldList;
      originFieldList.forEach((item) => {
        if (item.showFlag === 0) {
          return;
        }
        if (item.fixedFlag === 1) {
          fixedFieldList.push(item);
        } else if (item.mergeFlag === 1) {
          mergeFieldList.push(item);
        } else {
          normalFieldList.push(item);
        }
      });
      fieldList = fixedFieldList.concat(normalFieldList).concat(mergeFieldList);
    }
    return { fieldList, fixedFieldList, mergeFieldList, normalFieldList };
  }

  @Bind()
  checkFieldPosition(field) {
    const { filterFieldId, fixedFlag, mergeFlag } = field.get(['filterFieldId', 'fixedFlag', 'mergeFlag']);
    const { fixedFieldList, mergeFieldList, normalFieldList } = this.state;
    let fieldList = normalFieldList;
    if (fixedFlag === 1) {
      fieldList = fixedFieldList;
    } else if (mergeFlag === 1) {
      fieldList = mergeFieldList;
    }
    const isFirstItem = !isEmpty(fieldList) && fieldList[0].filterFieldId === filterFieldId;
    const isLastItem =
      !isEmpty(fieldList) && fieldList[fieldList.length - 1].filterFieldId === filterFieldId;
    return { isFirstItem, isLastItem };
  }

  @Bind()
  handleEdit(record = {}, readOnly = false) {
    this.handleOpenModal(true, record.toData(), readOnly || this.props.readonly);
   }

  /**
   * @param {需移动的field的主键} targetFilterFieldId
   * @param {上移或下移,true-上移,false-下移} rankType
   */
  @Bind()
  handleRankFieldList(targetFilterFieldId, rankType = false) {
    const { unitInfo = {}, dispatch, mode, tplParams, tableDs } = this.props;
    const { unitCode } = unitInfo;
    const { fieldList = [] } = this.state;
    let newFieldList = fieldList;
    // 先设置每个filter的rank为 index * 10
    newFieldList = newFieldList.map((item, index) => {
      let num = index * 10;
      // 设置需移动的filter的rank
      if (item[rowKey] === targetFilterFieldId) {
        num = rankType ? (index - 1) * 10 - 1 : (index + 1) * 10 + 1;
      }
      return {
        ...item,
        num,
        unitCode,
      };
    });
    const fieldsListMap = this.transformFieldList(newFieldList);
    this.setState({
      ...fieldsListMap,
    });
    tableDs.loadData(fieldsListMap.fieldList);
    dispatch({
      type: 'searchBarConfig/saveFilterField',
      params: newFieldList,
      mode,
      tplParams,
    }).then((res) => {
      if (res) {
        notification.success();
      }
    });
  }

  @Bind()
  renderFieldName({ record }) {
    const { fieldAlias, fieldName } = record.get(['fieldName', 'fieldAlias']);
    return (
      <div>
        <div>{fieldName}</div>
        <div style={{ color: '#a5a5a5' }}>{fieldAlias}</div>
      </div>
    );
  }

  @Bind()
  generateLovDefaultValue(records, displayField) {
    if (!isArray(records) || isEmpty(records)) {
      return null;
    }
    return records.map((item) => item[displayField]).join(',');
  }

  @Bind()
  renderDefaultValue({record }) {
    const { defaultValue, lovValueRecords, proDefaultFlag, comparison } = record.toData();
    if (comparison && FIX_DATE_RANGES.filter(i => i !== 'RANGE').includes(comparison.split(',')[0])) {
      return null;
    }
    if (proDefaultFlag === 1) {
      return defaultValue;
    }
    if (!defaultValue) {
      return null;
    }
    const { originFields = [] } = this.props;
    if (isEmpty(originFields)) {
      return null;
    }
    const targetField =
      originFields.find((item) => item.get('fieldAlias') === record.get('fieldAlias'));
    if (!targetField) {
      return;
    }
    const { widget, displayField } = targetField.get(['widget', 'displayField']);
    const { lovInfo, fieldWidget, multipleFlag, lovEnhanceFlag } = widget || {};
    const { displayField: originDisplayField } = lovInfo || {};
    if (fieldWidget === 'LOV') {
      if (lovEnhanceFlag === 1) {
        return undefined;
      }
      if (lovValueRecords) {
        return this.generateLovDefaultValue(lovValueRecords, displayField || originDisplayField);
      }
    } else if (fieldWidget === 'SELECT' && !isEmpty(lovValueRecords)) {
      const meanings = values(lovValueRecords);
      if (meanings.length < defaultValue.split(',').length) {
        return meanings.join(',').concat('...');
      } else {
        return meanings.join(',');
      }
    } else if (fieldWidget === 'DATE_PICKER') {
      if (comparison && ['RANGE', 'IN'].includes(comparison.split(',')[0])) {
        return defaultValue.split(',').join('~');
      } else if (!moment(defaultValue).isValid()) {
        return undefined;
      }
    } else if (SEARCHBAR_RANGE_COMPONENT.includes(fieldWidget) && defaultValue) {
      if (Number(multipleFlag) === 1) {
        return defaultValue.split(',').join('~');
      }
    }
    return defaultValue;
  }

  @Bind()
  getColumns() {
    const { widgetTypeObj } = this.state;
    return [
      {
        title: intl.get('hpfm.searchBar.model.searchBar.fieldName').d('字段名称'),
        name: 'fieldName',
        renderer: this.renderFieldName,
      },
      {
        title: intl.get('hpfm.searchBar.model.searchBar.widgetType').d('组件类型'),
        name: 'widget.fieldWidget',
        width: 100,
        renderer: ({ value }) => widgetTypeObj[value],
        // render: (text) => widgetTypeObj[text || 'INPUT'],
      },
      {
        title: intl.get('hpfm.searchBar.model.searchBar.defaultValue').d('默认值'),
        name: 'defaultValue',
        width: 200,
        renderer: this.renderDefaultValue,
      },
      {
        title: intl.get('hpfm.searchBar.model.searchBar.fixed').d('冻结'),
        name: 'fixedFlag',
        width: 80,
        renderer: ({ value }) => Number(value) === 1 ? <Icon type="check" /> : null,
      },
      {
        title: intl.get('hzero.common.table.column.options').d('操作'),
        lock: 'right',
        renderer: ({ record }) => {
          const { currentFilter = {}, readonly } = this.props;
          const { enabledFlag = false } = this.state;
          const { filterFieldId, fieldAlias, fieldName } = record.get(['filterFieldId', 'fieldAlias', 'fieldName']);
          const { tenantId } = currentFilter;
          const customizeFlag = tenantId === getCurrentOrganizationId();
          const { isFirstItem, isLastItem } = this.checkFieldPosition(record);
          if (!customizeFlag || !enabledFlag || readonly) {
            return (
              <Button funcType='link' onClick={() => this.handleEdit(record, true)}>
                {intl.get('hzero.common.button.look').d('查看')}
              </Button>
            );
          }
          return (
            <>
              <Button funcType='link' onClick={() => this.handleEdit(record)}>
                {intl.get('hzero.common.button.edit').d('编辑')}
              </Button>
              {!isFirstItem && (
                <Button
                  funcType='link'
                  onClick={() => this.handleRankFieldList(filterFieldId, true)}
                >
                  {intl.get('hpfm.searchBar.button.moveUp').d('上移')}
                </Button>
              )}
              {!isLastItem && (
                <Button
                  funcType='link'
                  onClick={() => this.handleRankFieldList(filterFieldId)}
                >
                  {intl.get('hpfm.searchBar.button.moveDown').d('下移')}
                </Button>
              )}
            </>
          );
        }
      }
      // {
      //   title: intl.get('hpfm.searchBar.model.searchBar.mergeSearch').d('合并查询'),
      //   dataIndex: 'mergeFlag',
      //   width: 100,
      //   render: (text) => text === 1 ? <Icon type="check" /> : null,
      // },
    ];
  }

  @Bind()
  handleFieldSelectorRef(ref) {
    this.fieldSelectorRef = ref;
  }

  @Bind()
  createField() {
    this.handleOpenModal();
  }

  @Bind()
  initFieldDefaultValue(defaultValue, field) {
    const { proDefaultFlag, fieldWidget, displayField: customDisplayField, lovInfo, dateFormat, multipleFlag, lovValueRecords, comparison } = field;
    if (proDefaultFlag !== 1 && !isNil(defaultValue)) {
      let newDefaultValue;
      const multiple = fieldWidget === 'DATE_PICKER' ? comparison === 'RANGE' : Number(multipleFlag) === 1;
      if (fieldWidget === 'LOV') {
        const { valueField, displayField: originDisplayField } = lovInfo || {};
        const displayField = customDisplayField || originDisplayField;
        if (!lovValueRecords && isString(defaultValue)) {
          newDefaultValue =
            multiple
              ? defaultValue.split(',').map(v => ({ [displayField]: v, [valueField]: v }))
              : { [displayField]: defaultValue, [valueField]: defaultValue };
        } else if (isArray(lovValueRecords) && lovValueRecords.length > 0) {
          if (multiple) {
            newDefaultValue = defaultValue.split(',').map(i => {
              const targetRecord = lovValueRecords.find(r => String(r[valueField]) === String(i));
              if (targetRecord) {
                return targetRecord;
              } else {
                return {
                  [displayField]: i,
                  [valueField]: i,
                };
              }
            });
          } else {
            newDefaultValue = lovValueRecords[0];
          }
        } else if (isObject(lovValueRecords)) {
          if (multiple) {
            newDefaultValue = defaultValue.split(',').map(v => ({ [displayField]: lovValueRecords[v], [valueField]: v }));
          } else {
            newDefaultValue = { [valueField]: defaultValue, [displayField]: lovValueRecords[defaultValue] };
          }
        } else {
          newDefaultValue = undefined;
        }
      } else if (!fieldWidget || ['SELECT', 'INPUT'].includes(fieldWidget)) {
        newDefaultValue = multiple ? defaultValue.split(',') : defaultValue;
      } else if (fieldWidget === 'INPUT_NUMBER') {
        newDefaultValue = multiple ? defaultValue.split(',').map(i => !i ? undefined : Number(i)) : Number(defaultValue);
      } else if (fieldWidget === 'DATE_PICKER') {
        const format = dateFormat || DEFAULT_DATETIME_FORMAT;
        if (multiple) {
          newDefaultValue = defaultValue.split(',').map(i => !i ? undefined : moment(i && i.includes('/') ? i.replaceAll('/', '-') : i).format(format));
        } else {
          newDefaultValue = moment(defaultValue).isValid() ? moment(defaultValue && defaultValue.includes('/') ? defaultValue.replaceAll('/', '-') : defaultValue).format(format) : undefined;
        }
      }
      return newDefaultValue;
    } else {
      return defaultValue;
    }
  }

  @Bind()
  handleOpenModal(isEdit = false, data = {}, readOnly = false) {
    const formData = data;
    const { optionalFieldList } = this.state;
    const {
      currentFilter = {},
      unitInfo = {},
      originFields = [],
      unitList = [],
      mode,
      tplParams,
      readonly,
      tplFxParams,
    } = this.props;
    if (!isEmpty(formData)) {
      const targetField = originFields.find((item) => item.get('fieldAlias') === formData.fieldAlias);
      if (targetField) {
        const { proDefaultFlag } = formData;
        const { widget, displayField, modelFieldFlag, paramList } = targetField.get(['widget', 'displayField', 'modelFieldFlag', 'paramList']);
        const { fieldWidget, lovInfo, dateFormat, multipleFlag } = widget || {};
        const defaultComparison = formData.comparison && formData.comparison.split(',')[0];
        formData.comparison = fieldWidget === 'DATE_PICKER' && modelFieldFlag && defaultComparison === 'IN' ? 'RANGE' : defaultComparison;
        formData.defaultValue =
          this.initFieldDefaultValue(formData.defaultValue, {
            proDefaultFlag, fieldWidget, displayField, lovInfo, dateFormat, multipleFlag, 
            lovValueRecords: formData.lovValueRecords, comparison: formData.comparison
          });
        formData.widget = widget;
        formData.displayField = displayField;
        formData.modelFieldFlag = modelFieldFlag;
        formData.lovPara = getLovPara(paramList);
      }
    }
    const formDs = new DataSet({
      fields: [
        {
          name: 'fieldAlias',
          label: intl.get('hpfm.searchBar.model.searchBar.fieldCode').d('字段编码'),
        },
        {
          name: 'fieldName',
          label: intl.get('hpfm.searchBar.model.searchBar.fieldName').d('字段名称'),
          options: isEdit ? undefined : new DataSet({
            paging: false,
            data: optionalFieldList.map(field => ({ meaning: field.fieldName, value: field.fieldAlias })),
          }),
          required: true,
        },
        {
          name: 'widget.fieldWidget',
          label: intl.get('hpfm.searchBar.model.searchBar.widgetType').d('组件类型'),
          lookupCode: 'HPFM.CUST.FIELD_COMPONENT',
        },
        {
          name: 'widget.sourceCode',
          label: intl.get('hpfm.searchBar.model.searchBar.sourceCode').d('数据来源值集'),
        },
        {
          name: 'proDefaultFlag',
          label: intl.get('hpfm.customize.common.defaultValueType').d('默认值类型'),
          type: 'number',
          options: new DataSet({
            data: [
              { value: 0, meaning: intl.get('hpfm.customize.common.fixed').d('固定值') },
              { value: 1, meaning: intl.get('hpfm.customize.common.expression').d('公式') },
            ],
          }),
          defaultValue: 0,
        },
        {
          name: 'comparison',
          label: intl.get('hpfm.searchBar.model.searchBar.defaultComparison').d('默认筛选方式'),
          lookupCode: 'HPFM.CUST.FIELD_QUERY_REALTION',
        },
        {
          name: 'defaultValue',
          label: intl.get('hpfm.searchBar.model.searchBar.defaultValue').d('默认值'),
          dynamicProps: ({ record }) => {
            const { comparison, lovPara } = record.get(['comparison', 'lovPara']);
            let defaultComparison = comparison && comparison.split(',')[0];
            if (defaultComparison === 'IN') {
              defaultComparison = 'RANGE';
            }
            const { fieldWidget: recordFieldWidget, multipleFlag, dateFormat, sourceCode, lovInfo } = record.get('widget') || {};
            const multiple = recordFieldWidget === 'DATE_PICKER' ? FIX_DATE_RANGES.includes(defaultComparison) : Number(multipleFlag) === 1;
            const displayField = record.get('displayField') || (lovInfo && lovInfo.displayField);
            return {
              type: recordFieldWidget === 'LOV' ? 'object' : undefined,
              lovCode: recordFieldWidget === 'LOV' ? sourceCode : undefined,
              textField: recordFieldWidget === 'LOV' ? displayField : undefined,
              lookupCode: recordFieldWidget === 'SELECT' ? sourceCode : undefined,
              multiple: !SEARCHBAR_RANGE_COMPONENT.includes(recordFieldWidget) && multiple,
              range:  SEARCHBAR_RANGE_COMPONENT.includes(recordFieldWidget) && multiple,
              format: recordFieldWidget === 'DATE_PICKER' ? dateFormat || DEFAULT_DATETIME_FORMAT : undefined,
              lovPara,
            };
          }
        },
        {
          name: 'fixedFlag',
          type: 'boolean',
          trueValue: 1,
          falseValue: 0,
          label: intl.get('hpfm.searchBar.model.searchBar.fixed').d('冻结'),
        }
      ],
    });
    const record = formDs.create(formData);
    Modal.open({
      title: 
        readOnly
          ? intl.get('hpfm.searchBar.view.message.viewField').d('查看字段')
          : isEdit
            ? intl.get('hpfm.searchBar.view.message.editField').d('编辑字段')
            : intl.get('hpfm.searchBar.view.message.createField').d('添加字段'),
      style: { width: 380 },
      bodyStyle: { padding: 0, overflow: 'hidden' },
      drawer: true,
      children: (
        <FieldSelector
          readOnly={readOnly}
          isEdit={isEdit}
          record={record}
          filterInfo={currentFilter}
          unitInfo={unitInfo}
          fieldList={optionalFieldList}
          unitList={unitList}
          onRefresh={this.handleRefresh}
          originFields={originFields}
          mode={mode}
          tplParams={tplParams}
          tplFxParams={tplFxParams}
        />
      ),
      footer: null,
    });
  }

  @Bind()
  removeField() {
    const { unitInfo = {}, dispatch, removeLoading, mode, tplParams, tableDs } = this.props;
    const { unitCode } = unitInfo;
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      children: intl.get('hzero.common.message.confirm.remove').d('确定删除选中数据？'),
      confirmLoading: removeLoading,
      onOk: () => {
        const params = {
          filterFieldIds: tableDs.selected.map((item) => item.get(rowKey)),
          unitCode,
        };
        dispatch({
          type: 'searchBarConfig/removeFilterField',
          params,
          mode,
          tplParams
        }).then((res) => {
          if (res) {
            notification.success();
            this.handleRefresh();
          }
        });
      },
    });
  }

  @Bind()
  handleRefresh() {
    const { onRefresh, tableDs } = this.props;
    if (typeof onRefresh === 'function') {
      onRefresh();
      this.setState({ refreshFlag: true });
    }
  }

  @Bind()
  handleChangeSortField(sortField) {
    if (!sortField) {
      const {
        form: { setFieldsValue = () => {} },
      } = this.props;
      setFieldsValue({
        defaultSortedOrder: 'asc',
      });
    }
    this.handleChangeFilterSort();
  }

  @Bind()
  @Debounce(500)
  handleChangeFilterSort() {
    const {
      form: { getFieldsValue },
      currentFilter,
      filterList = [],
      dispatch,
      onRefresh,
      mode,
      tplParams,
    } = this.props;
    const { defaultSortedField, defaultSortedOrder } = getFieldsValue();
    const newFilterList = filterList.map((item) => {
      if (item.filterId === currentFilter.filterId) {
        return {
          ...item,
          defaultSortedField,
          defaultSortedOrder,
        };
      }
      return item;
    });
    dispatch({
      type: 'searchBarConfig/saveUnitFilter',
      params: newFilterList,
      mode,
      tplParams,
    }).then((res) => {
      if (res) {
        notification.success();
        if (typeof onRefresh === 'function') {
          onRefresh();
        }
      }
    });
  }

  @Bind()
  getSortableFields(fields) {
    if (!fields || fields.length < 1) {
      return [];
    }
    return fields.filter((field) => {
      const { custType, unitSortedFlag, sortedFlag } = field.get([
        'custType',
        'unitSortedFlag',
        'sortedFlag',
      ]);
      // 标准字段
      if (custType === 'STD') {
        return unitSortedFlag !== 0 && sortedFlag !== 0;
      } else {
        return sortedFlag === 1;
      }
    });
  }

  render() {
    const {
      enabledFlag = false,
      fieldList = [],
      optionalFieldList = [],
      widgetTypeObj = {},
      whereOptions = [],
    } = this.state;
    const {
      removeLoading = false,
      saveFilterLoading = false,
      saveFieldLoading = false,
      currentFilter = {},
      unitInfo = {},
      originFields = [],
      unitList = [],
      mode,
      tplParams,
      readonly,
    } = this.props;
    const { tenantId } = currentFilter;
    const sortedEditorFlag = unitInfo.sortedEditorFlag || 0;
    const sortedEnabled = unitInfo.sortedEnabled || 0;
    const customizeFlag = tenantId === getCurrentOrganizationId(); // 自定义标识

    return (
      <Spin spinning={removeLoading || saveFilterLoading || saveFieldLoading || false}>
        <div className={styles['table-header']}>
          <div
            className={styles['table-header-left']}
            style={{
              display: customizeFlag && enabledFlag && !readonly ? 'block' : 'none',
              width: sortedEditorFlag === 1 && sortedEnabled !== 0 ? 'auto' : '100%',
            }}
          >
            <Button
              funcType='flat'
              disabled={removeLoading || !enabledFlag}
              icon="playlist_add"
              onClick={this.createField}
            >
              {intl.get('hpfm.searchBar.button.addFilterField').d('添加字段')}
            </Button>
            <Button
              funcType='flat'
              icon="delete_sweep"
              loading={removeLoading}
              disabled={!this.props.tableDs.selected.length || !enabledFlag}
              style={{ marginRight: 8 }}
              onClick={this.removeField}
            >
              {intl.get('hpfm.searchBar.button.removeFilterField').d('删除字段')}
            </Button>
          </div>
          {sortedEditorFlag === 1 && sortedEnabled !== 0 && (
            <SortSelector {...this.props} disabled={!customizeFlag || !enabledFlag || readonly} />
          )}
        </div>
        <Table
          rowKey={rowKey}
          bordered
          dataSet={this.props.tableDs}
          rowHeight="auto"
          selectionMode={enabledFlag && customizeFlag && !readonly ? 'rowbox' : false}
          columns={this.getColumns()}
          pagination={false}
          style={{ marginTop: 10 }}
          onRow={() => ({
            className: styles['search-bar-table-list-item'],
          })}
        />
      </Spin>
    );
  }
}

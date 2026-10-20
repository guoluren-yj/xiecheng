import React, { Component } from 'react';
import { connect } from 'dva';
import { Table, Icon, Button, Tooltip, Modal, Spin, Form, Select, Radio } from 'hzero-ui';
import { Bind, Debounce } from 'lodash-decorators';
import { isEmpty, values, isArray } from 'lodash';

import intl from 'utils/intl';
import notification from 'utils/notification';
import { getCurrentOrganizationId } from 'utils/utils';
import { queryMapIdpValue } from 'services/api';

import styles from './index.less';
import FieldSelector from './FieldEditor';
import { FilterComponentList, SEARCHBAR_RANGE_COMPONENT } from '@/utils/constConfig';

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
export default class ListTable extends Component {
  constructor(props) {
    super(props);
    this.fieldSelectorRef = null;
    this.state = {
      selectedRows: [],
      enabledFlag: false, // 启用标识
      fieldList: [], // 已加的字段列表
      optionalFieldList: [], // 可选的字段列表
      widgetTypeObj: {}, // 字段组件类型map
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
    }).then((res) => {
      if (res) {
        const widgetTypeObj = {};
        (res.widgetType || []).forEach((i) => {
          if (FilterComponentList.includes(i.value)) {
            widgetTypeObj[i.value] = i.meaning;
          }
        });
        this.setState({
          widgetTypeObj,
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
      } = this.props.currentFilter;
      if (
        oldFilterCode !== filterCode ||
        oldFilterFields.length !== filterFields.length ||
        refreshFlag
      ) {
        this.props.form.setFieldsValue({
          defaultSortedField,
          defaultSortedOrder,
        });
        this.setState({
          ...this.transformFieldList(filterFields),
          enabledFlag: enabledFlag === 1,
          refreshFlag: false,
          selectedRows: [],
          optionalFieldList: isEmpty(allFields)
            ? []
            : allFields.filter((item) => item && item.showFlag !== 0),
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
    const { filterFieldId } = field;
    const { fixedFieldList, mergeFieldList, normalFieldList } = this.state;
    let fieldList = normalFieldList;
    if (field.fixedFlag === 1) {
      fieldList = fixedFieldList;
    } else if (field.mergeFlag === 1) {
      fieldList = mergeFieldList;
    }
    const isFirstItem = !isEmpty(fieldList) && fieldList[0].filterFieldId === filterFieldId;
    const isLastItem =
      !isEmpty(fieldList) && fieldList[fieldList.length - 1].filterFieldId === filterFieldId;
    return { isFirstItem, isLastItem };
  }

  @Bind()
  handleEdit(record = {}, readOnly = false) {
    if (this.fieldSelectorRef) {
      this.fieldSelectorRef.handleOpenModal(true, record, readOnly);
    }
  }

  /**
   * @param {需移动的field的主键} targetFilterFieldId
   * @param {上移或下移,true-上移,false-下移} rankType
   */
  @Bind()
  handleRankFieldList(targetFilterFieldId, rankType = false) {
    const { unitInfo = {}, dispatch } = this.props;
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
    this.setState({
      ...this.transformFieldList(newFieldList),
    });
    dispatch({
      type: 'searchBarConfig/saveFilterField',
      params: newFieldList,
    }).then((res) => {
      if (res) {
        notification.success();
      }
    });
  }

  @Bind()
  renderFieldName(_, field) {
    const { currentFilter = {} } = this.props;
    const { enabledFlag = false } = this.state;
    const { filterFieldId, fieldAlias, fieldName } = field;
    const { tenantId } = currentFilter;
    const customizeFlag = tenantId === getCurrentOrganizationId();
    const { isFirstItem, isLastItem } = this.checkFieldPosition(field);
    return (
      <div>
        <div className={styles['search-bar-table-list-item-operator']}>
          {!customizeFlag || !enabledFlag ? (
            <Tooltip placement="bottom" title={intl.get('hzero.common.button.look').d('查看')}>
              <span onClick={() => this.handleEdit(field, true)}>
                <Icon type="eye-o" />
              </span>
            </Tooltip>
          ) : (
            <>
              {isFirstItem ? (
                <span>
                  <Icon type="arrow-up" className={styles['searchBar-btn-disabled']} />
                </span>
              ) : (
                <Tooltip
                  placement="bottom"
                  title={intl.get('hpfm.searchBar.button.moveUp').d('上移')}
                >
                  <span onClick={() => this.handleRankFieldList(filterFieldId, true)}>
                    <Icon type="arrow-up" />
                  </span>
                </Tooltip>
              )}
              {isLastItem ? (
                <span>
                  <Icon type="arrow-down" className={styles['searchBar-btn-disabled']} />
                </span>
              ) : (
                <Tooltip
                  placement="bottom"
                  title={intl.get('hpfm.searchBar.button.moveDown').d('下移')}
                >
                  <span onClick={() => this.handleRankFieldList(filterFieldId)}>
                    <Icon type="arrow-down" />
                  </span>
                </Tooltip>
              )}
              <Tooltip placement="bottom" title={intl.get('hzero.common.button.edit').d('编辑')}>
                <span onClick={() => this.handleEdit(field)}>
                  <Icon type="edit" />
                </span>
              </Tooltip>
            </>
          )}
        </div>
        <div style={{ fontWeight: 600, color: '#666' }}>{fieldName}</div>
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
  renderDefaultValue(_, record) {
    const { defaultValue, lovValueRecords, proDefaultFlag } = record;
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
    const targetField = originFields.find((item) => item.fieldAlias === record.fieldAlias) || {};
    const { widget, displayField } = targetField;
    const { lovInfo, fieldWidget, multipleFlag } = widget || {};
    const { displayField: originDisplayField } = lovInfo || {};
    if (fieldWidget === 'LOV' && lovValueRecords) {
      return this.generateLovDefaultValue(lovValueRecords, displayField || originDisplayField);
    } else if (fieldWidget === 'SELECT' && !isEmpty(lovValueRecords)) {
      const meanings = values(lovValueRecords);
      if (meanings.length < defaultValue.split(',').length) {
        return meanings.join(',').concat('...');
      } else {
        return meanings.join(',');
      }
    } else if (
      SEARCHBAR_RANGE_COMPONENT.includes(fieldWidget) &&
      defaultValue &&
      multipleFlag === 1
    ) {
      return defaultValue.split(',').join('~');
    }
    return defaultValue;
  }

  @Bind()
  getColumns() {
    const { widgetTypeObj } = this.state;
    return [
      {
        title: intl.get('hpfm.searchBar.model.searchBar.fieldName').d('字段名称'),
        dataIndex: 'fieldName',
        render: this.renderFieldName,
      },
      {
        title: intl.get('hpfm.searchBar.model.searchBar.widgetType').d('组件类型'),
        dataIndex: 'widget.fieldWidget',
        width: 100,
        render: (text) => widgetTypeObj[text],
        // render: (text) => widgetTypeObj[text || 'INPUT'],
      },
      {
        title: intl.get('hpfm.searchBar.model.searchBar.defaultValue').d('默认值'),
        dataIndex: 'defaultValue',
        width: 200,
        render: this.renderDefaultValue,
      },
      {
        title: intl.get('hpfm.searchBar.model.searchBar.fixed').d('冻结'),
        dataIndex: 'fixedFlag',
        width: 80,
        render: (text) => (text === 1 ? <Icon type="check" /> : null),
      },
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
    if (this.fieldSelectorRef) {
      this.fieldSelectorRef.handleOpenModal();
    }
  }

  @Bind()
  removeField() {
    const { selectedRows = [] } = this.state;
    const { unitInfo = {}, dispatch, removeLoading } = this.props;
    const { unitCode } = unitInfo;
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.remove').d('确定删除选中数据？'),
      confirmLoading: removeLoading,
      onOk: () => {
        const params = {
          filterFieldIds: selectedRows.map((item) => item[rowKey]),
          unitCode,
        };
        dispatch({
          type: 'searchBarConfig/removeFilterField',
          params,
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
    const { onRefresh } = this.props;
    if (typeof onRefresh === 'function') {
      onRefresh();
      this.setState({ refreshFlag: true });
    }
  }

  @Bind()
  handleSelectRows(_, selectedRows) {
    this.setState({ selectedRows });
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
      const { custType, unitSortedFlag, sortedFlag } = field;
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
      selectedRows = [],
      widgetTypeObj = {},
    } = this.state;
    const {
      removeLoading = false,
      saveFilterLoading = false,
      saveFieldLoading = false,
      currentFilter = {},
      unitInfo = {},
      originFields = [],
      unitList = [],
      form: { getFieldDecorator = () => {}, getFieldValue = () => {} },
    } = this.props;
    const { tenantId, defaultSortedField, defaultSortedOrder } = currentFilter;
    const sortedEditorFlag = unitInfo.sortedEditorFlag || 0;
    const sortedEnabled = unitInfo.sortedEnabled || 0;
    const customizeFlag = tenantId === getCurrentOrganizationId(); // 自定义标识
    const sortFields = this.getSortableFields(originFields);
    return (
      <Spin spinning={removeLoading || saveFilterLoading || saveFieldLoading || false}>
        <div className={styles['table-header']}>
          {sortedEditorFlag === 1 && sortedEnabled !== 0 && (
            <div className={styles['table-header-left']}>
              <div className={styles['left-item']}>
                <div className={styles['left-item-label']}>
                  {intl.get('hpfm.searchBar.model.searchBar.defaultSortField').d('默认排序字段')}
                </div>
                <div className={styles['left-item-content']}>
                  {getFieldDecorator('defaultSortedField', {
                    initialValue: defaultSortedField,
                  })(
                    <Select
                      style={{ width: '100%' }}
                      allowClear
                      onChange={this.handleChangeSortField}
                      disabled={!customizeFlag || !enabledFlag}
                    >
                      {sortFields.map((field) => (
                        <Select.Option value={field.fieldAlias}>{field.fieldName}</Select.Option>
                      ))}
                    </Select>
                  )}
                </div>
              </div>
              {getFieldValue('defaultSortedField') && (
                <div className={styles['left-item']}>
                  <div className={styles['left-item-label']}>
                    {intl.get('hpfm.searchBar.model.searchBar.defaultSortRule').d('默认排序规则')}
                  </div>
                  <div className={styles['left-item-content']}>
                    {getFieldDecorator('defaultSortedOrder', {
                      initialValue: defaultSortedOrder || 'asc',
                    })(
                      <Radio.Group
                        disabled={!customizeFlag || !enabledFlag}
                        onChange={this.handleChangeFilterSort}
                      >
                        <Radio value="asc">
                          {intl.get('hpfm.searchBar.model.searchBar.sortByAsc').d('升序')}
                        </Radio>
                        <Radio value="desc">
                          {intl.get('hpfm.searchBar.model.searchBar.sortByDesc').d('降序')}
                        </Radio>
                      </Radio.Group>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          <div
            className={styles['table-header-right']}
            style={{
              visibility: customizeFlag && enabledFlag ? 'visible' : 'hidden',
              width: sortedEditorFlag === 1 && sortedEnabled !== 0 ? 'auto' : '100%',
            }}
          >
            <Button
              icon="delete"
              loading={removeLoading}
              disabled={isEmpty(selectedRows) || !enabledFlag}
              style={{ marginRight: 8 }}
              onClick={this.removeField}
            >
              {intl.get('hpfm.searchBar.button.removeFilterField').d('删除字段')}
            </Button>
            <Button
              disabled={removeLoading || !enabledFlag}
              type="primary"
              icon="plus"
              onClick={this.createField}
            >
              {intl.get('hpfm.searchBar.button.addFilterField').d('添加字段')}
            </Button>
          </div>
        </div>
        <Table
          rowKey={rowKey}
          bordered
          dataSource={fieldList}
          columns={this.getColumns()}
          pagination={false}
          style={{ marginTop: 10 }}
          onRow={() => ({
            className: styles['search-bar-table-list-item'],
          })}
          rowSelection={
            enabledFlag &&
            customizeFlag && {
              selectedRowKeys: selectedRows.map((n) => n[rowKey]),
              onChange: this.handleSelectRows,
            }
          }
        />
        <FieldSelector
          onRef={this.handleFieldSelectorRef}
          filterInfo={currentFilter}
          unitInfo={unitInfo}
          fieldList={optionalFieldList}
          unitList={unitList}
          widgetTypeObj={widgetTypeObj}
          onRefresh={this.handleRefresh}
          originFields={originFields}
        />
      </Spin>
    );
  }
}

import React, { Component } from 'react';
import { connect } from 'dva';
import { Table, Icon, Button, Tooltip, Modal, Spin, Form } from 'hzero-ui';
import { Bind, Debounce } from 'lodash-decorators';
import { isEmpty, values, isArray } from 'lodash';

import intl from 'utils/intl';
import notification from 'utils/notification';
import { queryMapIdpValue } from 'services/api';

import styles from './index.less';
import FieldSelector from './FieldEditor';
import SortSelector from './SortSelector';
import { FilterComponentList, SEARCHBAR_RANGE_COMPONENT, FIX_DATE_RANGES } from '@/utils/constConfig';

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
      selectorHidden: true,
      multiCondition: [],
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
        nextProps.unitInfo.orderCount !== this.props.unitInfo.orderCount ||
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
  handleEdit(record = {}) {
    if (this.fieldSelectorRef) {
      this.fieldSelectorRef.handleOpenModal(true, record);
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
    const { enabledFlag = false } = this.state;
    const { filterFieldId, fieldAlias, fieldName } = field;
    const { isFirstItem, isLastItem } = this.checkFieldPosition(field);

    return (
      <div>
        {enabledFlag && (
          <div className={styles['search-bar-table-list-item-operator']}>
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
          </div>
        )}
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
    const { defaultValue, lovValueRecords, proDefaultFlag, comparison } = record;
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
    const targetField = originFields.find((item) => item.fieldAlias === record.fieldAlias) || {};
    const { widget, displayField } = targetField;
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

  render() {
    const {
      enabledFlag = false,
      fieldList = [],
      optionalFieldList = [],
      selectedRows = [],
      widgetTypeObj = {},
    } = this.state;
    const {
      originFields = [],
      removeLoading = false,
      saveFilterLoading = false,
      saveFieldLoading = false,
      currentFilter = {},
      unitInfo = {},
      unitList = [],
      codes,
    } = this.props;
    const { sortedEnabled } = unitInfo;

    const allowAddField = (window.$$env || {}).CUSZ_ADD_FIELD === "true";
    return (
      <Spin spinning={removeLoading || saveFieldLoading || saveFilterLoading || false}>
        <div className={styles['table-header']}>
          {sortedEnabled === 1 && <SortSelector {...this.props} />}
          <div
            className={styles['table-header-right']}
            style={{
              width: sortedEnabled !== 1 ? '100%' : 'auto',
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
            {
              allowAddField && (
                <Button
                  disabled={removeLoading || !enabledFlag}
                  type="primary"
                  icon="plus"
                  onClick={this.createField}
                >
                  {intl.get('hpfm.searchBar.button.addFilterField').d('添加字段')}
                </Button>
              )
            }
          </div>
        </div>
        <Table
          rowKey={rowKey}
          bordered
          dataSource={fieldList}
          columns={this.getColumns()}
          pagination={false}
          onRow={() => ({
            className: styles['search-bar-table-list-item'],
          })}
          rowSelection={
            enabledFlag && {
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
          codes={codes}
          widgetTypeObj={widgetTypeObj}
          onRefresh={this.handleRefresh}
          originFields={originFields}
        />
      </Spin>
    );
  }
}

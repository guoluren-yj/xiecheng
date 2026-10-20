/* eslint-disable no-unneeded-ternary */
/* eslint-disable no-lonely-if */
/* eslint-disable prefer-destructuring */
import React, { Component } from 'react';
import classnames from 'classnames';
import moment from 'moment';
import { DataSet, Button, Form, IntlField, Tooltip, TextField, Modal } from 'choerodon-ui/pro';
import { Divider, Icon } from 'choerodon-ui';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';
import { API_HOST, HZERO_PLATFORM } from 'utils/config';
import { FieldType, DataSetStatus, RecordStatus } from 'choerodon-ui/pro/lib/data-set/enum';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import { Bind, Debounce } from 'lodash-decorators';
import {
  isEmpty,
  cloneDeep,
  omit,
  values,
  keys,
  isArray,
  unionWith,
  isEqual,
  isNil,
  isString,
} from 'lodash';
import { toJS } from 'mobx';
import { observer } from 'mobx-react';
import intl from 'utils/intl';
import { filterNullValueObject, getCurrentLanguage } from 'hzero-front/lib/utils/utils';
// import notification from 'hzero-front/lib/utils/notification';
import { DEFAULT_DATETIME_FORMAT } from 'hzero-front/lib/utils/constants';
import { queryMapIdpValue } from 'hzero-front/lib/services/api';
import formatterCollections from 'utils/intl/formatterCollections';

import TableButtonRenderer from './components/TableButtonRenderer';
import CollpaseFilter from './components/CollpaseFilter';
import FilterSeletor from './components/FilterSeletor';
import FieldSelector from './components/FieldSelector';
import Field from './components/Field';
import SortSelector from './components/SortSelector';
import { FilterMenuDS, SearchInputDS } from './store';
import {
  // saveFilters, // 保存筛选器
  // queryFilters,
  getTempFieldName,
  getRangeBeforeFieldName,
  getRangeAfterFieldName,
  getComparsionFieldName,
  getRangeFieldName,
  getDateTimeMinFormat,
  getDateTimeMaxFormat,
  getMeaningFieldName,
  filterTempFields,
  checkValueValid,
  sortFields,
  getRelatedFilterFields,
  checkFieldConfigModified,
  getLovQueryAxiosConfig,
  checkFieldValueModified,
  isObjectEqual,
  transformNilValue,
  checkComparsionWithNull,
  DefaultValueType,
} from './utils/common';

import {
  stylePrefix,
  FieldFlag,
  FilterStatus,
  MergeFieldName,
  FilterType,
  SUPPORT_COMPONENTS,
  MeaingFieldSuffix,
  SortFieldName,
  omitFieldProps,
  ComparisonSetFieldSuffix,
  RANGE_COMPONENTS,
} from './utils/enum';

import { statementToJs, innerFunctionMap, getContext, defaultValueFx } from './utils/utils';

import {
  setSearchBarCache,
  resetSearchBarCache,
  initialFilterCache,
  getSearchBarCache,
  hasSearchBarCache,
} from './utils/cache';

import './index.less';
import CollapseUpIcon from '../../assets/collapse_up.svg';
import RefreshIcon from '../../assets/refresh.svg';

let editModal; // 编辑弹窗
@formatterCollections({ code: ['srm.filterBar', 'sdat.commonFilter'] })
export default class StaticSearchBar extends Component {
  queryDs; // queryDataSet

  filterMenuDs; // 筛选器列表dataSet

  searchInputDs; // 合并查询输入框dataSet

  computedFieldMap = new Map();

  sortSelectorRef;

  cacheData;

  contextParams;

  constructor(props) {
    super(props);
    const { closeFilterSelector, defaultExpand } = props;
    // 查询区域展开收起标识, true-展开, false-收起, 关闭筛选器切换功能默认收起, 其他情况默认展开
    const expand =
      !defaultExpand && closeFilterSelector ? false : transformNilValue(defaultExpand, true);
    this.queryDs = new DataSet();
    this.filterMenuDs = new DataSet(FilterMenuDS());
    this.searchInputDs = new DataSet(SearchInputDS());
    this.contextParams = {
      ctx: getContext(),
    };
    this.state = {
      config: {}, // 筛选器源数据
      filterList: [], // 筛选器列表
      expand, // 查询区域展开收起标识
      fields: [], // 所有查询字段列表
      originFields: [], // fields 备份，以便还原
      displayFields: [], // 显示的查询字段列表
      optionalFields: [], // 可选的查询字段列表
      invisibleFields: [], // 不显示的查询字段列表
      sortableFields: [], // 可排序的查询字段列表
      searchInputFields: [], // 合并查询输入框内的查询字段列表
      currentFilter: {}, // 当前选择的筛选器
      defaultFilter: {}, // 默认的筛选器
      changeFlag: false, // 当前筛选器是否发生更改
      queryParameter: {},
      cacheFlag: false,
      sortedEnabled: false, // 是否开启排序
      currentField: {}, // 正在编辑的字段
      initFlag: true,
    };
  }

  componentDidMount() {
    this.addDsEventListener();
    this.fetchLovData();
    // 初始化时设置关联的dataSet的状态，解决筛选器未加载完毕前表格显示暂无数据情况的问题
    this.handleDataSetLoading(true);
    this.fetchFilters();
    this.handleRef();
    this.handleFilterCacheInitial();
  }

  componentWillReceiveProps(newProps) {
    const { filters } = newProps;
    this.initConfig(filters);
  }

  componentWillUnmount() {
    this.removesEventListener();
    this.handleCacheFilter();
  }

  /**
   * 注册DS事件监听
   */
  @Bind()
  addDsEventListener() {
    this.filterMenuDs.addEventListener('update', this.handleChangeQueryDs);
    this.queryDs.addEventListener('create', this.handleQueryDsCreate);
    this.queryDs.addEventListener('update', this.handleQueryDsUpdate);
    this.searchInputDs.addEventListener('update', this.handleSearchInputDsUpdate);
  }

  /**
   * 移除DS事件监听
   */
  @Bind()
  removesEventListener() {
    this.filterMenuDs.removeEventListener('update', this.handleChangeQueryDs);
    this.queryDs.removeEventListener('create', this.handleQueryDsCreate);
    this.queryDs.removeEventListener('update', this.handleQueryDsUpdate);
    this.searchInputDs.removeEventListener('update', this.handleSearchInputDsUpdate);
  }

  /**
   * 初始化筛选器缓存
   */
  @Bind()
  handleFilterCacheInitial() {
    initialFilterCache(this.props.searchCode);
  }

  @Bind()
  handleDataSetLoading(loading) {
    const { dataSet = [] } = this.props;
    if (!isEmpty(dataSet)) {
      dataSet.forEach((ds) => {
        // eslint-disable-next-line no-param-reassign
        ds.status = loading ? DataSetStatus.loading : DataSetStatus.ready;
      });
    }
  }

  /**
   * 查询筛选器配置
   */
  @Bind()
  fetchFilters() {
    const { filters } = this.props;
    // queryFilters({
    //   unitCode: searchCode,
    // })
    //   .then(res => {
    //     const filters = getResponse(res);
    //     this.initConfig(filters);
    //   })
    //   .catch(() => {
    //     this.handleDataSetLoading(false);
    //   });
    this.initConfig(filters);
  }

  /**
   * 初始化配置
   * @param filters 筛选器列表
   * @param currentFilter 指定当前筛选器
   */
  @Bind()
  initConfig(filters, currentFilter) {
    const { searchCode, cacheState, closeFilterSelector, expandable = true } = this.props;
    const { currentFilter: oldCurrentFilter } = this.state;
    if (isEmpty(filters) || isEmpty(filters[searchCode])) {
      this.handleDataSetLoading(false);
      return;
    }
    const filtersMap = filters[searchCode];
    const { customFilters, systemFilters, mergeFieldList, sortedEnabled } = filtersMap;
    let defaultFilter;
    let filterList = [];
    // 自定义的
    if (!isEmpty(customFilters)) {
      const customFiltersList = customFilters.map((item) => ({ ...item, type: FilterType.CUSTOM }));
      filterList = [...filterList, ...customFiltersList];
      // 若不关闭切换筛选器功能， 则先取用户级默认筛选器
      if (!closeFilterSelector || expandable) {
        defaultFilter = customFiltersList.find((item) => item.defaultFlag === 1);
      }
    }
    // 预置的
    if (!isEmpty(systemFilters)) {
      const systemFiltersList = systemFilters.map((item) => ({ ...item, type: FilterType.SYSTEM }));
      filterList = [...filterList, ...systemFiltersList];
      // 未去到用户级默认筛选器时， 取预定义默认筛选器
      if (!defaultFilter) {
        defaultFilter = systemFiltersList.find((item) => item.defaultFlag === 1);
        if (!defaultFilter) {
          // 未设置默认筛选器时 取预定义中的第一个
          defaultFilter = systemFiltersList[0] || {};
        }
      }
    }
    // 保存筛选器后需刷新当前筛选器
    let newCurrentFilter = currentFilter;
    if (!newCurrentFilter) {
      newCurrentFilter =
        filterList.find((item) => item.filterCode === oldCurrentFilter.filterCode) || defaultFilter;
    }
    let cacheOtherState = {};
    if (cacheState && hasSearchBarCache(searchCode)) {
      const cacheData = getSearchBarCache(searchCode);
      this.cacheData = cacheData;
      const { currentFilter: cacheFilter, fields, state } = cacheData;
      newCurrentFilter = cacheFilter;
      cacheOtherState = {
        fields,
        cacheFlag: true,
        ...state,
      };
    }
    this.setState(
      {
        config: filtersMap,
        filterList,
        defaultFilter,
        currentFilter: newCurrentFilter,
        searchInputFields:
          mergeFieldList && mergeFieldList.length ? sortFields(mergeFieldList, 'gridSeq') : [],
        sortedEnabled: sortedEnabled === 1,
        ...cacheOtherState,
      },
      () => {
        // 未指定当前筛选器时，需处理筛选器配置
        if (!currentFilter) {
          this.handleFilterConfig(newCurrentFilter, true);
        }
      }
    );
  }

  /**
   * 查询lov
   */
  @Bind
  fetchLovData() {
    queryMapIdpValue({
      comparisonSet: 'HPFM.CUST.FIELD_QUERY_REALTION',
    }).then((res) => {
      if (res && !isEmpty(res.comparisonSet)) {
        const comparisonSetObj = {};
        res.comparisonSet.forEach((item) => {
          comparisonSetObj[item.value] = item.meaning;
        });
        this.setState({
          comparisonSetObj,
        });
      }
    });
  }

  @Bind()
  handleQueryDsCreate({ dataSet, record }) {
    if (this.computedFieldMap.size > 0) {
      const { fieldProps } = this.props;
      const { fields = [], cacheFlag, changeFlag, searchInputFields = [] } = this.state;
      const computedFieldValues = {};
      this.computedFieldMap.forEach((computedFieldValueFunc, computedFieldName) => {
        const targetField = fields.find((item) => item.name === computedFieldName);
        if (
          !targetField ||
          (!targetField.defaultValueCon &&
            targetField.proDefaultFlag !== 1 &&
            typeof fieldProps?.[computedFieldName]?.defaultValue !== 'function')
        ) {
          return;
        }
        const {
          fieldCode = '',
          modelCode = '',
          defaultValueCon,
          proDefaultFlag,
          multipleFlag,
          fieldWidget,
          textField = '',
          valueField = '',
        } = targetField;
        let computedFieldValue;
        let computedFieldValueMeaning;
        const { valids = [], lines = [] } = defaultValueCon || {};
        // 条件
        if (valids && valids.length > 0) {
          if (cacheFlag) {
            return;
          }
          const { defaultValue, defaultValueMeaning } = defaultValueFx(
            {
              fieldCode,
              modelCode,
              queryDsRecord: record,
              searchInputDsRecord: this.searchInputDs.current,
              ctxParams: this.contextParams,
              queryDsFields: fields,
              searchInputDsFields: searchInputFields,
              getFieldValue: this.getFieldValue,
            },
            {
              valids,
              lines,
            },
            proDefaultFlag
          );
          if (defaultValue) {
            computedFieldValue =
              proDefaultFlag === 1 && typeof defaultValue === 'function'
                ? defaultValue({
                    dataSet,
                    record,
                    name: computedFieldName,
                  })
                : defaultValue;
          }
          // lov字段需拼接成对象
          if (
            fieldWidget === 'LOV' &&
            checkValueValid(computedFieldValue) &&
            checkValueValid(defaultValueMeaning)
          ) {
            let newValue = computedFieldValue;
            if (multipleFlag === 1 && typeof defaultValueMeaning === 'object') {
              newValue = Object.keys(defaultValueMeaning).map((item) => ({
                [textField]: defaultValueMeaning[item],
                [valueField]: item,
              }));
              computedFieldValue = newValue;
            } else if (multipleFlag !== 1 && typeof defaultValueMeaning === 'string') {
              newValue = {
                [textField]: defaultValueMeaning,
                [valueField]: computedFieldValue,
              };
            }
            computedFieldValue = newValue;
          } else {
            if (
              checkValueValid(computedFieldValue) &&
              multipleFlag === 1 &&
              typeof computedFieldValue === 'string'
            ) {
              computedFieldValue = computedFieldValue.split(',');
            }
            if (checkValueValid(defaultValueMeaning)) {
              if (typeof defaultValueMeaning === 'string') {
                computedFieldValueMeaning = defaultValueMeaning;
              } else if (typeof defaultValueMeaning === 'object') {
                computedFieldValueMeaning = Object.values(defaultValueMeaning).join(',');
              }
            }
          }
        } else {
          // 公式
          computedFieldValue = computedFieldValueFunc({
            dataSet,
            record,
            name: computedFieldName,
          });
        }
        computedFieldValues[computedFieldName] = computedFieldValue;
        if (computedFieldValueMeaning) {
          record.set(getMeaningFieldName(computedFieldName), computedFieldValueMeaning);
          if (multipleFlag === 1) {
            record.set(
              getMeaningFieldName(getTempFieldName(computedFieldName)),
              computedFieldValueMeaning
            );
          }
        }
      });
      this.setFields(computedFieldValues);
      // 恢复缓存时不重置changeFlag
      this.setState({ changeFlag: cacheFlag ? changeFlag : false });
    }
  }

  @Bind()
  handleQueryDsUpdate(config) {
    const { name, value, record, oldValue } = config;
    const filterField = this.getFilterField(name);
    this.setState({ currentField: {} });
    // meaing 字段和范围类型组件虚拟字段不处理
    if (
      name.endsWith(MeaingFieldSuffix) ||
      (filterField &&
        RANGE_COMPONENTS.includes(filterField.fieldWidget) &&
        filterField[FieldFlag.VIRTUAL])
    ) {
      return false;
    }
    const { initFlag, fields } = this.state;
    // 非首次更新，表明字段值发生变更, 公式类型默认值需设为0
    if (
      !initFlag &&
      filterField &&
      !filterField[FieldFlag.VIRTUAL] &&
      checkFieldValueModified(filterField, value, oldValue)
    ) {
      // 字段更新时，若原默认值是公式类型，需将proDefaultFlag设为0，方便在保存的时候识别出该字段值更新过
      const newFields = fields.map((item) => ({
        ...item,
        defaultValueCon: item.name === name ? null : item.defaultValueCon,
        proDefaultFlag: item.name === name ? 0 : item.proDefaultFlag,
      }));
      this.setState({
        fields: newFields,
      });
    }
    this.setRelatedFieldValue(name, value, record);
    const { onFieldChange } = this.props;
    if (onFieldChange) {
      onFieldChange(config);
    }
    // this.handleChangeQueryDs();
    // 清除缓存
    this.handleResetCache();
    this.handleQuery();
  }

  @Bind()
  handleSearchInputDsUpdate(config) {
    const { onFieldChange } = this.props;
    if (onFieldChange) {
      onFieldChange(config);
    }
    // 清除缓存
    this.handleResetCache();
    this.handleQuery();
  }

  @Bind()
  handleRef() {
    const { onRef } = this.props;
    if (onRef) {
      onRef(this);
    }
  }

  @Bind()
  handleSortSelectorRef(ref) {
    this.sortSelectorRef = ref;
  }

  /**
   * 筛选器变更
   * @param filter 当前选中的筛选器
   */
  @Bind()
  handleSelectFilter(filter) {
    const { filterList, currentFilter = {} } = this.state;
    const { onFilterChange } = this.props;
    if (filter.filterCode !== currentFilter.filterCode) {
      const target = filterList.find((item) => item.filterCode === filter.filterCode);
      if (target) {
        // 变动筛选器时 清空缓存
        this.handleResetCache();
        if (onFilterChange) {
          onFilterChange(target, currentFilter);
        }
        this.setState(
          {
            currentFilter: target,
            initFlag: true,
          },
          () => {
            this.handleFilterConfig(target);
          }
        );
      }
    }
  }

  /**
   * 缓存筛选器
   */
  @Bind()
  handleCacheFilter() {
    const { searchCode } = this.props;
    const { fields, expand, changeFlag } = this.state;
    const newCurrentFilter = this.saveCurrentFilter();
    // 保存字段rank
    const cacheFields = this.setDisplayFieldsRank(fields);
    setSearchBarCache(searchCode, {
      currentFilter: newCurrentFilter,
      queryDsData: this.queryDs.current ? this.queryDs.current.toData() : {},
      searchInputDsData: this.searchInputDs.current ? this.searchInputDs.current.toData() : {},
      fields: cacheFields,
      state: {
        expand,
        changeFlag,
      },
    });
  }

  /**
   * 处理筛选器配置
   * @param filter 当前筛选器
   * @param isNew 首次初始化时为true,切换筛选器为false
   */
  @Bind()
  handleFilterConfig(filter, isNew = false) {
    this.handleDataSetLoading(false);
    if (!filter) {
      return;
    }
    const { changeFlag, cacheFlag } = this.state;
    if (cacheFlag) {
      const { fields: cacheFields } = this.state;
      const { fields = [], originFields = [] } = this.updateCacheFilterFields(filter, cacheFields);
      this.setState(
        {
          fields,
          originFields,
          ...this.getFieldType(fields),
        },
        () => {
          this.setSearchInputDs();
          this.setQueryDs(fields);
          this.handleQuery();
        }
      );
    } else {
      const { allFields = [] } = filter;
      const fields = this.handleTransformFields(allFields);
      if (!isNew) {
        // 重置
        this.queryDs = new DataSet();
        this.addDsEventListener();
      } else if (changeFlag) {
        // 变动筛选器时 清空缓存
        this.handleResetCache();
      }
      const originFields = fields.map((item) => ({
        ...item,
        defaultValue: item.proDefaultFlag === 1 ? item.originDefaultValue : item.defaultValue,
      }));
      this.setState(
        {
          fields,
          originFields,
          changeFlag: isNew ? changeFlag : false,
          ...this.getFieldType(fields),
        },
        () => {
          this.setSearchInputDs();
          this.setQueryDs(fields);
          this.handleQuery();
        }
      );
    }
  }

  // 更新缓存字段的配置,防止配置更新了而缓存中的字段未同步更新
  @Bind()
  updateCacheFilterFields(cacheFilter, cacheFields) {
    const newQueryDsData = this.cacheData?.queryDsData ?? {};
    const { filterList } = this.state;
    let fields = []; // 缓存字段
    let originFields = []; // ui接口返回字段
    if (!isEmpty(filterList)) {
      const targetFilter = filterList.find((item) => item.filterCode === cacheFilter.filterCode);
      if (targetFilter) {
        const { allFields: originAllFields = [] } = targetFilter;
        // 根据ui接口返回新的filter 生成字段配置
        originFields = this.handleTransformFields(originAllFields);
      }
      if (cacheFields.length > 0 && originFields.length > 0) {
        // 处理新增字段
        originFields.forEach((originField) => {
          if (originField[FieldFlag.VIRTUAL]) {
            return;
          }
          const targetField = cacheFields.find(
            (cacheField) => cacheField.name === originField.name
          );
          if (!targetField) {
            fields = [...fields, ...getRelatedFilterFields(originFields, originField)];
          }
        });
        cacheFields.forEach((cacheField) => {
          if (cacheField[FieldFlag.VIRTUAL]) {
            return;
          }
          let relatedFields = [];
          // 缓存字段同步更新ui接口返回字段配置
          const targetField = originFields.find(
            (originField) => originField.name === cacheField.name
          );
          if (!targetField) {
            // 缓存字段被删除了，不处理
            return;
          }
          // 更改了字段组件类型、多选标识、日期格式等 需更新关联字段
          if (checkFieldConfigModified(cacheField, targetField)) {
            relatedFields = getRelatedFilterFields(originFields, cacheField);
            const { name = '' } = cacheField;
            // 缓存为0 原始是1 表明是该字段由原公式值变成固定值了，此时不需要清空字段值
            // 有条件默认值的字段也不需要清空字段值
            if (
              !targetField.defaultValueCon &&
              !(cacheField.proDefaultFlag === 0 && targetField.proDefaultFlag === 1)
            ) {
              newQueryDsData[name] = '';
              newQueryDsData[getTempFieldName(name)] = '';
              newQueryDsData[getRangeBeforeFieldName(name)] = '';
              newQueryDsData[getRangeBeforeFieldName(name)] = '';
              newQueryDsData[getMeaningFieldName(name)] = '';
            }
            // 修改字段筛选条件配置后，页面需重置之前选择的筛选条件
            if (!isEqual(cacheField.customComparisonSet, targetField.customComparisonSet)) {
              newQueryDsData[getComparsionFieldName(name)] =
                targetField.customComparisonSet && targetField.customComparisonSet.length > 0
                  ? targetField.customComparisonSet[0]
                  : '=';
            }
            this.cacheData.queryDsData = newQueryDsData;
          } else {
            relatedFields = getRelatedFilterFields(cacheFields, cacheField);
          }
          fields = [...fields, ...relatedFields];
        });
      }
    }
    originFields = originFields.map((item) => ({
      ...item,
      defaultValue: item.proDefaultFlag === 1 ? item.originDefaultValue : item.defaultValue,
    }));
    return { fields, originFields };
  }

  /**
   * 转换成 dateSet 的 field 格式
   */
  @Bind()
  handleTransformFields(fields) {
    const { editorProps = {}, fieldProps = {} } = this.props;
    const result = [];
    if (!isEmpty(fields)) {
      fields.forEach((field) => {
        const {
          modelCode,
          fieldCode,
          fieldAlias,
          fieldName,
          widget,
          display,
          lovInfo,
          lock,
          defaultValue,
          displayField: customDisplayField,
          valueField: customValueField,
          // lovValueRecords,
          rank,
          comparison,
          customComparisonSet,
          showFlag,
          usedFlag,
          fixedFlag,
          sortedFlag,
          fieldVisible,
          fieldEditable = 0,
          gridSeq = 0,
          proDefaultFlag = 0,
          helpMessage,
          defaultValueCon,
        } = field;
        const {
          fieldWidget = 'INPUT',
          sourceCode,
          axiosConfig,
          queryField,
          multipleFlag,
          dateFormat,
          lookupUrl = '',
        } = widget || {};
        const { displayField: originDisplayField, valueField: originValueField } = lovInfo || {};
        const displayField = customDisplayField || originDisplayField;
        const valueField = customValueField || originValueField;
        let props = {
          label: fieldName,
          name: fieldAlias,
          comparison,
          customComparisonSet,
          defaultValue,
          multipleFlag,
          lovInfo,
          rank,
          modelCode,
          fieldCode,
          fieldWidget,
          fieldVisible,
          gridSeq,
          proDefaultFlag,
          helpMessage,
          disabled: fieldEditable === 0,
          originDefaultValue: defaultValue,
          defaultValueCon,
        };
        if (fieldAlias && !isEmpty(editorProps) && !isEmpty(editorProps[fieldAlias])) {
          props.editorProps = editorProps[fieldAlias];
          // 设置清空时跳过字段标识
          props[FieldFlag.SKIP_CLEAR] = editorProps[fieldAlias].clearButton === false;
        }
        if (fieldEditable === 0) {
          props[FieldFlag.SKIP_CLEAR] = true;
        }
        if (sortedFlag === 1) {
          props[FieldFlag.SORT] = true;
        }
        if (display || (showFlag === 1 && (usedFlag === 1 || fixedFlag === 1))) {
          props[FieldFlag.DISPLAY] = true;
        }
        if (lock || fixedFlag === 1) {
          props[FieldFlag.LOCK] = true;
        }
        // 默认显示文本框
        if (!props.fieldWidget || !SUPPORT_COMPONENTS.includes(props.fieldWidget)) {
          props.fieldWidget = 'INPUT';
        }
        if (fieldWidget === 'LOV' && sourceCode) {
          props.type = FieldType.object;
          props.lovCode = sourceCode || '';
          props.textField = displayField;
          props.valueField = valueField;
          props.axiosConfig = axiosConfig;
          props.queryField = queryField;
          props.lovQueryAxiosConfig = (code, config) => {
            return axiosConfig
              ? {
                  ...axiosConfig,
                  headers: {
                    's-lov-view-code': sourceCode,
                    's-lov-display-field': displayField,
                    ...axiosConfig.headers,
                  },
                }
              : getLovQueryAxiosConfig(code, config, {
                  headers: {
                    's-lov-view-code': sourceCode,
                    's-lov-display-field': displayField,
                  },
                });
          };
        } else if (fieldWidget === 'SELECT' && sourceCode) {
          props.lookupCode = sourceCode;
          props.lookupAxiosConfig = ({ lookupCode }) => {
            return {
              url: lookupUrl
                ? `${lookupUrl}`
                : `${API_HOST}${HZERO_PLATFORM}/v1/${
                    isTenantRoleLevel() ? `${getCurrentOrganizationId()}/` : ''
                  }lovs/data?lovCode=${lookupCode}`,
              params: {},
            };
          };
        } else if (fieldWidget === 'INPUT_NUMBER') {
          props.type = FieldType.number;
        } else if (fieldWidget === 'DATE_PICKER') {
          const format = dateFormat || DEFAULT_DATETIME_FORMAT;
          props.format = format;
          props.type = format.includes('mm:ss') ? FieldType.dateTime : FieldType.date;
        } else if (fieldWidget === 'INPUT') {
          props.type = FieldType.string;
        }
        const {
          defaultValue: newDefaultValue,
          defaultValueMeaning: newDefaultValueMeaning,
        } = this.handleFieldDefalutValue(field);
        props.defaultValue = newDefaultValue;
        props.defaultValueMeaning = newDefaultValueMeaning;
        if (fieldAlias && !isEmpty(fieldProps) && fieldProps[fieldAlias]) {
          props = {
            ...props,
            ...omit(fieldProps[fieldAlias], omitFieldProps),
          };
          // 此处过滤出特殊默认值
          if (typeof fieldProps[fieldAlias].defaultValue === 'function') {
            props.defaultValue = undefined;
            // 计算默认值
            this.computedFieldMap.set(fieldAlias, fieldProps[fieldAlias].defaultValue);
          }
        }
        result.push(props);
        // 多选字段 需要添加前端临时字段, 用作存值
        if (multipleFlag === 1) {
          if (['INPUT', 'SELECT', 'LOV'].includes(fieldWidget)) {
            result.push({
              ...props,
              name: getTempFieldName(fieldAlias),
              multiple: true,
              virtual: true,
            });
          } else if (RANGE_COMPONENTS.includes(fieldWidget)) {
            const rangeDefaultValue = props.defaultValue;
            result.push({
              ...props,
              virtual: true,
              name: getTempFieldName(fieldAlias),
              range: true,
            });
            result.push({
              ...props,
              name: getRangeBeforeFieldName(fieldAlias),
              max: getRangeAfterFieldName(fieldAlias),
              defaultValue:
                rangeDefaultValue && rangeDefaultValue[0] ? rangeDefaultValue[0] : undefined,
              defaultValueMeaning:
                rangeDefaultValue && rangeDefaultValue[0] ? rangeDefaultValue[0] : undefined,
              virtual: true,
            });
            result.push({
              ...props,
              name: getRangeAfterFieldName(fieldAlias),
              min: getRangeBeforeFieldName(fieldAlias),
              defaultValue:
                rangeDefaultValue && rangeDefaultValue[1] ? rangeDefaultValue[1] : undefined,
              defaultValueMeaning:
                rangeDefaultValue && rangeDefaultValue[1] ? rangeDefaultValue[1] : undefined,
              virtual: true,
            });
          }
        }
        // 配置了高级查询关系的字段需添加高级查询关系临时字段, 用作存值
        if (customComparisonSet && customComparisonSet.length > 0) {
          result.push({
            name: getComparsionFieldName(fieldAlias),
            virtual: true,
            type: FieldType.string,
            lookupCode: 'HPFM.CUST.FIELD_QUERY_REALTION',
            defaultValue: comparison || customComparisonSet[0],
          });
        }
      });
    }
    return result;
  }

  @Bind()
  handleFieldDefalutValue(field) {
    let newDefaultValue = field.defaultValue;
    let newDefaultValueMeaning;
    if (field.defaultValueCon?.valids && field.defaultValueCon?.valids.length > 0) {
      newDefaultValue = undefined;
      newDefaultValueMeaning = undefined;
      this.computedFieldMap.set(field.fieldAlias, undefined);
    } else if (field.defaultValue) {
      const {
        fieldAlias,
        defaultValue,
        proDefaultFlag,
        displayField: customDisplayField,
        valueField: customValueField,
        lovInfo,
        lovValueRecords,
        widget,
      } = field;
      // 默认值是公式时
      if (proDefaultFlag === DefaultValueType.EXPRESSION) {
        newDefaultValue = undefined;
        newDefaultValueMeaning = undefined;
        // 计算默认值
        const defaultValueFunc =
          // eslint-disable-next-line no-new-func
          new Function(
            'ctx,innerFunctionMap,getFieldValue',
            statementToJs(field.defaultValue).join('\r\n')
          )(this.contextParams, innerFunctionMap, this.getFieldValue);
        if (typeof defaultValueFunc === 'function') {
          this.computedFieldMap.set(fieldAlias, defaultValueFunc);
        }
      } else {
        const { fieldWidget = 'INPUT', sourceCode, multipleFlag, dateFormat } = widget || {};
        const { displayField: originDisplayField, valueField: originValueField } = lovInfo || {};
        const displayField = customDisplayField || originDisplayField;
        const valueField = customValueField || originValueField;
        if (fieldWidget === 'LOV' && sourceCode) {
          if (displayField && valueField && isArray(lovValueRecords) && !isEmpty(lovValueRecords)) {
            if (multipleFlag === 1) {
              newDefaultValue = lovValueRecords;
              newDefaultValueMeaning = lovValueRecords.map((item) => item[displayField]).join(',');
            } else {
              newDefaultValue = lovValueRecords[0];
              newDefaultValueMeaning = lovValueRecords[0][displayField];
            }
          }
        } else if (fieldWidget === 'SELECT' && sourceCode) {
          if (!isEmpty(lovValueRecords)) {
            newDefaultValue = keys(lovValueRecords)[0];
            newDefaultValueMeaning = values(lovValueRecords)[0];
            if (multipleFlag === 1) {
              newDefaultValue = keys(lovValueRecords);
              newDefaultValueMeaning = values(lovValueRecords).join(',');
            }
          }
        } else if (fieldWidget === 'INPUT_NUMBER') {
          if (multipleFlag === 1) {
            newDefaultValue = isString(defaultValue)
              ? defaultValue.split(',').map((item) => (item ? parseInt(item, 10) : undefined))
              : isArray(defaultValue)
              ? defaultValue
              : [];
          } else {
            newDefaultValue = parseInt(defaultValue, 10);
          }
          newDefaultValueMeaning = newDefaultValue;
        } else if (fieldWidget === 'DATE_PICKER') {
          const format = dateFormat || DEFAULT_DATETIME_FORMAT;
          if (multipleFlag === 1) {
            newDefaultValue = isString(defaultValue)
              ? defaultValue
                  .split(',')
                  .map((item) => (item ? moment(item).format(format) : undefined))
              : isArray(defaultValue)
              ? defaultValue
              : [];
          } else {
            newDefaultValue = moment(defaultValue).format(format);
          }
          newDefaultValueMeaning = newDefaultValue;
        } else if (fieldWidget === 'INPUT') {
          newDefaultValueMeaning = defaultValue;
          if (multipleFlag === 1 && !isEmpty(defaultValue)) {
            newDefaultValue = defaultValue.split(',');
          }
        }
      }
    }
    return {
      defaultValue: newDefaultValue,
      defaultValueMeaning: newDefaultValueMeaning,
    };
  }

  @Bind()
  getShowText(filterField, record) {
    if (!record) {
      return null;
    }
    const { name, fieldWidget, multipleFlag, format, virtual } = filterField;
    const field = record.dataSet.getField(name);
    const data = record.get(name);
    if (!field || !checkValueValid(toJS(data))) {
      return null;
    }
    if (multipleFlag === 1 && !virtual) {
      return null;
    }
    const textField = field.get('textField', record);
    const valueField = field.get('valueField', record);
    let text = data;
    if (fieldWidget === 'INPUT' && multipleFlag === 1) {
      text = data.join(',');
    } else if (fieldWidget === 'LOV') {
      text = multipleFlag === 1 ? data.map((item) => item[textField]).join(',') : data[textField];
    } else if (fieldWidget === 'SELECT') {
      const lookupOptions = field && field.getLookup ? field.getLookup(record) : null;
      if (!lookupOptions) {
        return null;
      }
      if (multipleFlag === 1) {
        text = data
          .map((item) => {
            const option = lookupOptions.find((obj) => obj[valueField] === item);
            return option ? option[textField] : null;
          })
          .join(',');
      } else {
        const option = lookupOptions.find((obj) => obj[valueField] === data);
        text = option ? option[textField] : null;
      }
    } else if (fieldWidget === 'DATE_PICKER') {
      text = moment(data).format(format);
    }
    return text;
  }

  // 检查是否有关联字段
  @Bind()
  checkRelatedField(field) {
    return field.multipleFlag === 1;
  }

  @Bind()
  getFilterField(fieldName) {
    const { fields } = this.state;
    return fields.find((item) => item.name === fieldName);
  }

  /**
   *
   * @param param 参数key
   * @param value 参数值
   */
  @Bind()
  setFields(params) {
    if (!isEmpty(params)) {
      keys(params).forEach((fieldName) => {
        this.setField(fieldName, params[fieldName]);
      });
    }
  }

  /**
   * 设置单个筛选字段的值
   * @param param 参数key
   * @param value 参数值
   * fieldValue传值说明:
   *  1)lov组件类型字段：
   *    单选传 {[displayField]: [valueField]}
   *    多选传 [{[displayField]: [valueField]}]
   *  2)范围组件类型字段:
   *    '[startValue],[endValue]'
   *  3)其他类型单选传单值，多选传数组即可
   */
  @Bind()
  setField(fieldName, fieldValue) {
    // 合并查询
    if (fieldName === MergeFieldName && this.searchInputDs.current) {
      this.searchInputDs.current.set(MergeFieldName, fieldValue);
    } else if (this.queryDs.current && this.queryDs.getField(fieldName)) {
      const originField = this.getFilterField(fieldName);
      if (originField && !originField[FieldFlag.VIRTUAL]) {
        const record = this.queryDs.current.set(fieldName, fieldValue);
        this.setRelatedFieldValue(fieldName, fieldValue, record);
      }
    }
  }

  // 设置关联字段值
  @Bind()
  setRelatedFieldValue(fieldName, fieldValue, record) {
    const originField = this.getFilterField(fieldName);
    if (!originField || !this.queryDs.current) {
      return;
    }
    const { name, fieldWidget, virtual, multipleFlag } = originField;
    if (name && name.includes(ComparisonSetFieldSuffix)) {
      return;
    }
    if (multipleFlag !== 1 || virtual) {
      const meaing = this.getShowText(originField, record);
      this.queryDs.current.set(getMeaningFieldName(name), meaing);
    }
    // 虚拟字段不处理
    if (!virtual && this.checkRelatedField(originField)) {
      // 多选组件需设置管理的 tmp 字段
      this.queryDs.current.set(getTempFieldName(fieldName), fieldValue);
      if (RANGE_COMPONENTS.includes(fieldWidget)) {
        // 范围类型组件需设置 开始值字段 和 结束值字段
        // 若是日期 moment 类型值，需获取到原始字符串值
        if (fieldValue instanceof moment) {
          // 取 momnent 中的原始字符串值
          // eslint-disable-next-line no-param-reassign
          fieldValue = fieldValue._i;
        }
        if (isArray(fieldValue)) {
          this.queryDs.current.set(
            getRangeBeforeFieldName(fieldName),
            transformNilValue(fieldValue[0], '')
          );
          this.queryDs.current.set(
            getRangeAfterFieldName(fieldName),
            transformNilValue(fieldValue[1], '')
          );
        } else if (typeof fieldValue === 'string') {
          this.queryDs.current.set(
            getRangeBeforeFieldName(fieldName),
            transformNilValue(fieldValue.split(',')[0], '')
          );
          this.queryDs.current.set(
            getRangeAfterFieldName(fieldName),
            transformNilValue(fieldValue.split(',')[1], '')
          );
        }
      }
    }
  }

  // 获取合并查询字段查询值
  @Bind()
  getMergeQueryParameter() {
    const { searchInputFields } = this.state;
    const mergeQueryParameter = {};
    if (!isEmpty(searchInputFields) && this.searchInputDs.current) {
      const mergeFieldValue = this.searchInputDs.current.get(MergeFieldName);
      if (mergeFieldValue) {
        searchInputFields.forEach((field) => {
          mergeQueryParameter[field.fieldAlias] = mergeFieldValue;
        });
      }
    }
    return mergeQueryParameter;
  }

  /**
   * 获取查询参数
   */
  @Bind()
  getQueryParameter() {
    const {
      queryParameter = {},
      sortedEnabled,
      searchInputFields,
      displayFields,
      sortableFields,
    } = this.state;
    let newQueryParameter = {
      customizeFilterComparison: '',
      customMergeFilterField: '',
    };
    const comparisonSetArray = [];
    // 无显示字段，不处理
    if (this.queryDs.current) {
      const queryData = this.queryDs.current.toData() || {};
      // 处理排序查询字段
      if (sortedEnabled && sortableFields.length > 0) {
        newQueryParameter[SortFieldName] = queryData[SortFieldName];
      }
      if (!isEmpty(displayFields)) {
        const { fields } = this.state;
        fields.forEach((item) => {
          const {
            name,
            multipleFlag,
            virtual,
            customComparisonSet,
            fieldWidget,
            modelCode,
            fieldCode,
          } = item;
          // 隐藏字段不处理
          const isDisplay = displayFields.find((f) => f.name === name);

          if (!isDisplay) {
            return;
          }
          // 虚拟字段不处理
          if (virtual) {
            return;
          }
          // 有customComparisonSet代表是扩展字段
          // 虚拟字段不处理筛选条件
          if (!isEmpty(customComparisonSet) && modelCode && fieldCode) {
            const comparison = queryData[getComparsionFieldName(name)];
            if (checkComparsionWithNull(comparison)) {
              comparisonSetArray.push(`${name}:${comparison}`);
              return;
            } else if (RANGE_COMPONENTS.includes(fieldWidget)) {
              if (multipleFlag !== 1 && checkValueValid(queryData[name])) {
                comparisonSetArray.push(`${name}:${comparison}`);
              } else if (
                multipleFlag === 1 &&
                (checkValueValid(queryData[getRangeBeforeFieldName(name)]) ||
                  checkValueValid(queryData[getRangeAfterFieldName(name)]))
              ) {
                comparisonSetArray.push(`${name}:~`);
              }
            } else if (
              (checkValueValid(queryData[name]) ||
                checkValueValid(queryData[getTempFieldName(name)])) &&
              comparison &&
              !RANGE_COMPONENTS.includes(fieldWidget)
            ) {
              // 多选非范围类型筛选条件只能是IN
              const comparisonSetField = multipleFlag === 1 ? 'IN' : comparison;
              comparisonSetArray.push(`${name}:${comparisonSetField}`);
              if (comparisonSetField === 'IN') {
                const param = this.generateQueryParameter(queryData, item);
                if (multipleFlag === 1) {
                  newQueryParameter[getRangeFieldName(name)] = param[name];
                } else {
                  newQueryParameter[name] = param[name];
                }
                return;
              }
            }
          }
          const param = this.generateQueryParameter(queryData, item);
          newQueryParameter = Object.assign(newQueryParameter, param);
        });
      }
    }
    const mergeQueryParameter = this.getMergeQueryParameter();
    newQueryParameter = Object.assign(newQueryParameter, mergeQueryParameter);
    // 处理筛选条件
    if (!isEmpty(comparisonSetArray)) {
      // url中带ISNULL会被拦截，故将ISNULL转换成IS_NULL
      // 为保持一直，NOTNULL也转换成NOT_NULL
      const comparisonSetStr = comparisonSetArray
        .map((i) => i && i.replace('ISNULL', 'IS_NULL').replace('NOTNULL', 'NOT_NULL'))
        .join(',');
      newQueryParameter.customizeFilterComparison = comparisonSetStr;
    } else {
      newQueryParameter.customizeFilterComparison = '';
    }
    // 处理合并查询字段统一字段
    if (!isEmpty(mergeQueryParameter)) {
      const mergeFieldStr = searchInputFields.map((item) => item.fieldAlias).join(',');
      newQueryParameter.customMergeFilterField = mergeFieldStr;
    } else {
      newQueryParameter.customMergeFilterField = '';
    }
    // 新查询条件覆盖原查询条件
    keys(queryParameter).forEach((paramKey) => {
      const paramValue = newQueryParameter[paramKey];
      if (isNil(paramValue) || (isArray(paramValue) && paramValue.length < 1)) {
        newQueryParameter[paramKey] = undefined;
      }
    });
    return newQueryParameter;
  }

  /**
   * 根据字段生成单个查询参数对象
   */
  @Bind()
  generateQueryParameter(queryData, field) {
    const { name, multipleFlag, fieldWidget, format, type, valueField } = field;
    let paramValue = queryData[name];
    // 日期类型如果是多选取 _before _after 字段的值
    if (RANGE_COMPONENTS.includes(fieldWidget)) {
      if (multipleFlag === 1) {
        let startValue = transformNilValue(queryData[getRangeBeforeFieldName(name)], '');
        let endValue = transformNilValue(queryData[getRangeAfterFieldName(name)], '');
        // 无时分秒格式的时间 默认拼上 00:00:00 和 23:59:59
        if (type === 'date') {
          startValue = startValue ? moment(startValue).format(getDateTimeMinFormat(format)) : '';
          endValue = endValue ? moment(endValue).format(getDateTimeMaxFormat(format)) : '';
        }
        if (checkValueValid(startValue) || checkValueValid(endValue)) {
          // 使用 toString 将 number 类型转成字符串
          paramValue = startValue.toString().concat(',').concat(endValue);
        } else {
          paramValue = null;
        }
        return { [getRangeFieldName(name)]: paramValue };
      } else if (type === 'date' && paramValue) {
        // 去掉组件默认自带的00:00:00
        const comparisonSetField = queryData[getComparsionFieldName(name)];
        if (['<=', '>'].includes(comparisonSetField)) {
          paramValue = moment(paramValue).format(getDateTimeMaxFormat(format));
        }
      }
    } else if (
      checkValueValid(queryData[name]) ||
      checkValueValid(queryData[getTempFieldName(name)])
    ) {
      // lov, select字段取tmp字段的值
      if (fieldWidget === 'LOV') {
        if (multipleFlag === 1) {
          if (isEmpty(queryData[getTempFieldName(name)]) || !valueField) {
            paramValue = null;
          } else {
            const valueArr = queryData[getTempFieldName(name)].map((item) => item[valueField]);
            paramValue = valueArr.join(',');
          }
        } else {
          paramValue = queryData[name][valueField];
        }
      } else if (['SELECT', 'INPUT'].includes(fieldWidget) && multipleFlag === 1) {
        if (isEmpty(queryData[getTempFieldName(name)])) {
          paramValue = null;
        } else {
          paramValue = queryData[getTempFieldName(name)].join(',');
        }
      }
    }
    return { [name]: paramValue };
  }

  @Bind()
  getSortFieldValue() {
    const { currentFilter = {}, sortableFields = [] } = this.state;
    const { defaultSortedField, defaultSortedOrder } = currentFilter;
    let sortFlag = defaultSortedOrder;
    let sortFieldCode = defaultSortedField;
    if (sortableFields.length > 0) {
      sortFieldCode = sortFieldCode || sortableFields[0].name;
      sortFlag = sortFlag || 'asc';
    }
    return `${sortFieldCode}:${sortFlag}`;
  }

  @Bind()
  setQueryDs(queryFields) {
    if (!isEmpty(queryFields)) {
      queryFields.forEach((item) => {
        const { name, defaultValueMeaning, sortFlag } = item;
        this.queryDs.addField(name, {
          ...item,
          type:
            !item[FieldFlag.VIRTUAL] &&
            item.multipleFlag === 1 &&
            RANGE_COMPONENTS.includes(item.fieldWidget)
              ? 'string'
              : item.type,
        });
        if (sortFlag && !this.queryDs.getField(SortFieldName)) {
          this.queryDs.addField(SortFieldName, {
            name: SortFieldName,
            type: FieldType.string,
            defaultValue: this.getSortFieldValue(),
          });
        }
        if (!(name && name.includes(ComparisonSetFieldSuffix))) {
          const meaingFieldProps = {
            name: getMeaningFieldName(name),
            type: FieldType.string,
            virtual: true,
            defaultValue: defaultValueMeaning,
          };
          this.queryDs.addField(meaingFieldProps.name, meaingFieldProps);
        }
      });
    }
    // 生成一条record
    if (!this.queryDs.current) {
      const { onLoad } = this.props;
      const { queryDsData } = this.cacheData || {};
      const { cacheFlag } = this.state;
      // 判断是否该取缓存
      const record =
        this.queryDs && this.queryDs.create(!isEmpty(queryDsData) && cacheFlag ? queryDsData : {});
      if (onLoad) {
        onLoad(this.queryDs, record);
      }
    }
  }

  @Bind()
  setSearchInputDs() {
    const { searchInputFields } = this.state;
    if (!isEmpty(searchInputFields) && !this.searchInputDs.current) {
      const { searchInputDsData = null } = this.cacheData || {};
      this.searchInputDs.create(!isEmpty(searchInputDsData) ? searchInputDsData : {});
    }
  }

  @Bind()
  handleRefresh(event) {
    if (event.target) {
      const iconEl = event.target.querySelector('i') || event.target;
      if (iconEl) {
        iconEl.style.animation = 'none';
        setTimeout(() => {
          iconEl.style.animation = 'rotateImg 0.3s linear';
        }, 100);
      }
    }
    this.handleQuery(true);
  }

  /**
   * 查询
   * @param sync true-刷新
   */
  @Bind()
  @Debounce(300)
  handleQuery(sync = false) {
    const queryParameter = this.getQueryParameter();
    const { queryParameter: oldQueryParameter, initFlag } = this.state;
    // 初始化和刷新时不判断，强制查询
    if (!initFlag && !sync) {
      // 查询参数是否发生改变
      if (isObjectEqual(oldQueryParameter, queryParameter)) {
        return;
      } else {
        this.setState({ changeFlag: true });
      }
    }
    this.setState({ queryParameter, initFlag: false });
    const { dataSet } = this.props;
    dataSet.forEach((ds) => {
      if (!ds.queryDataSet) {
        // eslint-disable-next-line no-param-reassign
        ds.queryDataSet = new DataSet();
      }
    });
    const { onQuery } = this.props;
    const { currentFilter, fields, cacheFlag } = this.state;
    const params = filterNullValueObject(queryParameter);
    const filter = currentFilter;
    this.handleDataSetLoading(false);
    if (onQuery) {
      onQuery({
        params,
        filter,
        fields: filterTempFields(fields),
        dataSet: this.queryDs,
      });
    } else {
      dataSet.forEach((ds) => {
        if (ds.queryDataSet) {
          ds.queryDataSet.loadData([params]);
          // 解决缓存问题
          ds.query(cacheFlag ? ds.currentPage : undefined);
        }
      });
    }
  }

  @Bind()
  handleChangeQueryDs() {
    // 变动筛选器时清除缓存
    this.handleResetCache();
    this.setState({ changeFlag: true });
  }

  /**
   * 筛选字段分类
   * @param fields 所有字段列表
   */
  @Bind()
  getFieldType(fields) {
    const { searchInputFields = [] } = this.state;
    let displayFields = []; // 显示字段,包含固定字段
    let optionalFields = []; // 可选
    const lockFields = []; // 固定字段
    const invisibleFields = []; // 不显示的,在可选的基础上去掉已勾选显示的字段
    const sortableFields = []; // 可排序字段
    fields.forEach((item) => {
      if (item[FieldFlag.VIRTUAL]) {
        return;
      }
      if (item[FieldFlag.SORT]) {
        sortableFields.push(item);
      }
      if (item[FieldFlag.LOCK]) {
        lockFields.push(item);
        return;
      }
      if (item.fieldVisible !== 1) {
        return;
      }
      optionalFields.push(item);
      if (item[FieldFlag.DISPLAY]) {
        displayFields.push(item);
      } else {
        invisibleFields.push(item);
      }
    });
    // 过滤合并查询字段列表中的可排序字段
    if (searchInputFields.length > 0) {
      searchInputFields.forEach((item) => {
        const { fieldAlias, fieldName, sortedFlag } = item;
        if (sortedFlag === 1) {
          sortableFields.push({
            ...item,
            name: fieldAlias,
            label: fieldName,
          });
        }
      });
    }
    displayFields = sortFields(displayFields, 'rank'); // 对非固定的显示字段做排序
    displayFields = [...lockFields, ...displayFields]; // 固定字段排在最前面
    optionalFields = sortFields(optionalFields, 'gridSeq'); // 对可选字段做排序
    return { displayFields, optionalFields, invisibleFields, sortableFields };
  }

  /**
   * 筛选字段选择回调
   * @param field 当前选中的字段
   */
  @Bind()
  handleSelectField(field) {
    const { name, display: oldDisplay, multipleFlag, fieldWidget = 'INPUT' } = field;
    const { fields = [], displayFields = [], optionalFields = [] } = this.state;
    const targetField = optionalFields.find((item) => item.name === name);
    if (targetField) {
      const display = !oldDisplay;
      if (display) {
        // 增加显示字段时设置当前编辑字段，否则置空
        this.setState({ currentField: display ? field : {} });
      }
      targetField.display = display;
      const newFields = fields.map((item) => ({
        ...item,
        display: item.name === field.name ? display : item.display,
      }));
      let newDisplayFields = displayFields;
      if (targetField.display) {
        newDisplayFields.push({ ...field, display });
        if (this.queryDs.current) {
          // 若隐藏字段有默认值，需触发查询
          const hasValueOrComparsionFlag =
            !!this.queryDs.current.get(name) ||
            checkComparsionWithNull(this.queryDs.current.get(getComparsionFieldName(name)));
          if (hasValueOrComparsionFlag) {
            this.handleQuery();
          }
        }
      } else {
        if (this.queryDs.current) {
          if (multipleFlag === 1) {
            // 隐藏字段时需重置的关联虚拟字段
            this.queryDs.current.set(getTempFieldName(targetField.name), undefined);
            this.queryDs.current.set(
              getMeaningFieldName(getTempFieldName(targetField.name)),
              undefined
            );
            if (RANGE_COMPONENTS.includes(fieldWidget)) {
              this.queryDs.current.set(getRangeBeforeFieldName(targetField.name), undefined);
              this.queryDs.current.set(getRangeAfterFieldName(targetField.name), undefined);
            }
          }
          this.queryDs.current.set(getMeaningFieldName(targetField.name), undefined);
          this.queryDs.current.set(targetField.name, null);
          // 筛选条件是为空，非空时且未填值的时候 需要强制查询
          if (
            checkComparsionWithNull(
              this.queryDs.current.get(getComparsionFieldName(targetField.name))
            )
          ) {
            this.handleQuery();
          }
        }
        newDisplayFields = newDisplayFields.filter((item) => item.name !== name);
      }
      // 变动筛选器时清空缓存
      this.handleResetCache();
      this.setState({
        fields: newFields,
        displayFields: newDisplayFields,
        invisibleFields: optionalFields.filter((item) => !item[FieldFlag.DISPLAY]),
        changeFlag: true,
      });
    }
  }

  /**
   * 筛选字段全选回调
   */
  @Bind()
  handleSelectAllField(selectFields) {
    const { fields = [], displayFields = [], optionalFields = [] } = this.state;
    // 非固定字段
    const noLockFields = displayFields.filter((item) => !item[FieldFlag.LOCK]);
    if (!isEmpty(optionalFields)) {
      if (!isEmpty(noLockFields) && noLockFields.length === optionalFields.length) {
        return;
      }
      let selectableFields = selectFields;
      let newFields = fields;
      let newOptionalFields = optionalFields;
      let newDisplayFields = displayFields;
      if (selectableFields && selectableFields.length > 0) {
        newOptionalFields = optionalFields.map((item) => ({
          ...item,
          display: selectableFields.some((f) => f.name === item.name) ? true : item.display,
        }));
        newFields = fields.map((item) => ({
          ...item,
          display:
            selectableFields && selectableFields.some((f) => f.name === item.name)
              ? true
              : item.display,
        }));
        selectableFields = selectableFields.map((item) => ({ ...item, display: true }));
        if (this.queryDs.current) {
          // 若隐藏字段有默认值，需触发查询
          const hasValueOrComparsionFlag = selectableFields.some(
            (item) =>
              !!this.queryDs.current &&
              (!!this.queryDs.current.get(item.name) ||
                !!checkComparsionWithNull(
                  this.queryDs.current.get(getComparsionFieldName(item.name))
                ))
          );
          if (hasValueOrComparsionFlag) {
            this.handleQuery();
          }
        }
        newDisplayFields = unionWith(displayFields, selectableFields, (a, b) => a.name === b.name);
        this.setState({
          currentField: {},
          fields: newFields,
          displayFields: newDisplayFields,
          optionalFields: newOptionalFields,
          invisibleFields: [],
          changeFlag: true,
        });
        // 变动筛选器时 清空缓存
        this.handleResetCache();
      }
    }
  }

  @Bind()
  handleExpand() {
    this.setState({
      expand: !this.state.expand,
      // 展开收起时，重置 currentField
      currentField: {},
    });
  }

  /**
   * 清空筛选器字段值
   */
  @Bind()
  handleCleanFilter() {
    const { onClear } = this.props;
    const { displayFields, changeFlag } = this.state;
    let newChangeFlag = changeFlag;
    // 清空
    this.searchInputDs.loadData([{}]);
    if (!isEmpty(displayFields)) {
      displayFields.forEach((item) => {
        if (
          (!item[FieldFlag.SKIP_CLEAR] &&
            this.queryDs.current &&
            (checkValueValid(this.queryDs.current.get(item.name)) ||
              checkValueValid(this.queryDs.current.get(getTempFieldName(item.name))) ||
              checkValueValid(this.queryDs.current.get(getRangeAfterFieldName(item.name))) ||
              checkValueValid(this.queryDs.current.get(getRangeBeforeFieldName(item.name))) ||
              checkValueValid(this.queryDs.current.get(getMeaningFieldName(item.name))))) ||
          checkValueValid(this.queryDs.current.get(`${item.name}-zpTemp`))
        ) {
          if (!newChangeFlag) {
            newChangeFlag = true;
          }
          this.queryDs.current.set(item.name, undefined);
          this.queryDs.current.set(getTempFieldName(item.name), undefined);
          this.queryDs.current.set(getRangeAfterFieldName(item.name), undefined);
          this.queryDs.current.set(getRangeBeforeFieldName(item.name), undefined);
          this.queryDs.current.set(getMeaningFieldName(item.name), undefined);
          this.queryDs.current.set(getMeaningFieldName(getTempFieldName(item.name)), undefined);
          this.queryDs.current.set(`${item.name}-zpTemp`, undefined);
        }
      });
    }
    this.setState(
      {
        changeFlag: newChangeFlag,
      },
      () => {
        // 变动筛选器时 清空缓存
        this.handleResetCache();
        this.handleQuery();
        if (onClear) {
          onClear();
        }
      }
    );
  }

  /**
   * 重置筛选器字段值
   */
  @Bind()
  handleResetFilter() {
    const { onReset } = this.props;
    const { originFields, currentFilter } = this.state;
    const fields = cloneDeep(originFields);
    this.setState(
      {
        ...this.getFieldType(fields),
        fields,
        currentFilter: {
          ...currentFilter,
        },
        changeFlag: false,
      },
      () => {
        // 变动筛选器时 清空缓存
        this.handleResetCache();
        // 重置
        this.setQueryDs(fields);
        this.queryDs.create();
        // 清空
        this.searchInputDs.loadData([{}]);
        this.handleQuery(true);
        // 重置排序
        if (this.sortSelectorRef && this.sortSelectorRef.handleReset) {
          this.sortSelectorRef.handleReset();
        }
        if (onReset) {
          onReset();
        }
      }
    );
  }

  /**
   * 获取lov字段值
   * @param field 字段
   */
  @Bind()
  getLovFieldValue(field) {
    let fieldValue;
    const { multipleFlag, name, lovInfo = {} } = field;
    const { valueField: originValueField } = lovInfo;

    let queryData = {};
    if (this.queryDs.current) {
      queryData = this.queryDs.current.toData();
    }
    if (multipleFlag === 1 && checkValueValid(queryData[getTempFieldName(name)])) {
      fieldValue = queryData[getTempFieldName(name)]
        .map((item) => item[originValueField])
        .join(',');
    } else if (checkValueValid(queryData[name])) {
      fieldValue = (queryData[name] || {})[originValueField];
    }
    return fieldValue;
  }

  @Bind()
  getFieldValue(fieldName) {
    const { searchInputFields, fields } = this.state;
    const queryFieldTmp = fields.find((item) => item.name === fieldName);
    if (queryFieldTmp) {
      return this.queryDs.current?.get(queryFieldTmp.name);
    } else {
      const searchInputFieldTmp = searchInputFields.find((item) => item.name === fieldName);
      if (searchInputFieldTmp) {
        return this.searchInputDs.current?.get(MergeFieldName);
      } else {
        return undefined;
      }
    }
  }

  /**
   * 获取字段保存的值
   * @param field 字段
   */
  @Bind()
  getFieldSavedValue(field) {
    const { multipleFlag, name, fieldWidget, originDefaultValue, proDefaultFlag } = field;
    const { queryParameter = {} } = this.state;
    let newValue = queryParameter[name];
    // 公式类型默认值 要还原成公式
    if (proDefaultFlag === 1) {
      newValue = originDefaultValue;
    } else if (fieldWidget === 'LOV') {
      // 获取当前字段值
      newValue = this.getLovFieldValue(field);
    } else if (multipleFlag === 1) {
      newValue = queryParameter[getRangeFieldName(name)];
    }
    return newValue;
  }

  @Bind()
  handleSaveFilterParam(filter) {
    const { searchCode } = this.props;
    const { fields, originFields, defaultFilter, config = {} } = this.state;
    const { isNew, type, _status, allFields = [] } = filter;
    const { customFilters, systemFilters } = config;
    let data = {};
    if (this.queryDs.current) {
      data = this.queryDs.current.toData();
    }
    let saveFields = [];
    originFields.forEach((item) => {
      if (item[FieldFlag.VIRTUAL]) {
        return;
      }
      const target = fields.find((field) => item.name === field.name);
      if (target) {
        const { defaultValue } = item;
        let newField;
        const newValue = this.getFieldSavedValue(target);
        // 另存为即新建时, 只保存显示字段
        if (isNew) {
          newField = allFields.find((i) => i.fieldAlias === target.name);
          if (target.display && newField) {
            const { customComparisonSet, fieldAlias } = newField;
            if (!isEmpty(customComparisonSet) && data[getComparsionFieldName(item.name)]) {
              newField.comparison = data[getComparsionFieldName(item.name)];
            }
            newField = omit(newField, ['lovValueRecords', 'dispalyField', 'valueField']);
            saveFields.push({
              ...newField,
              fieldAlias,
              name: fieldAlias,
              defaultValue: newValue,
              defaultValueMeaning: null,
              defaultValueCon: undefined,
              proDefaultFlag: target.proDefaultFlag,
            });
          }
        } else {
          // 保存
          let fieldStatus;
          if (item.display && !target.display) {
            // 删除字段
            fieldStatus = FilterStatus.DELETE;
          } else if (target.display && !item.display) {
            // 新增字段
            fieldStatus = FilterStatus.CREATE;
          } else if (
            target.display &&
            (target.proDefaultFlag !== item.proDefaultFlag ||
              defaultValue !== newValue ||
              transformNilValue(data[getComparsionFieldName(item.name)], '') !==
                transformNilValue(item.comparison, ''))
          ) {
            // 更新字段
            fieldStatus = FilterStatus.UPDATE;
          }
          if (fieldStatus) {
            newField = allFields.find((i) => i.fieldAlias === target.name);
          }
          if (newField) {
            const { customComparisonSet, fieldAlias } = newField;
            if (!isEmpty(customComparisonSet) && data[getComparsionFieldName(item.name)]) {
              newField.comparison = data[getComparsionFieldName(item.name)];
            }
            saveFields.push({
              ...newField,
              fieldAlias,
              name: fieldAlias,
              defaultValue: newValue,
              defaultValueMeaning: null,
              lovValueRecords: null,
              _status: fieldStatus,
              usedFlag: fieldStatus === 'create' ? 1 : newField.usedFlag,
              proDefaultFlag: target.proDefaultFlag,
            });
          }
        }
      }
    });
    saveFields = this.setDisplayFieldsRank(saveFields);
    const params = omit(filter, '_token', 'tlMaps', 'isNew');
    const newFilter = {
      ...params,
      allFields: saveFields.map((item) => omit(item, '_token')),
    };
    let newSystemFilter = systemFilters || [];
    let newCustomFilter = customFilters || [];
    // 如果是设置默认筛选器,需更新原筛选器的defaulFlag为0,同时指定_status为update
    if (
      _status === FilterStatus.UPDATE &&
      filter.defaultFlag === 1 &&
      defaultFilter.filterCode !== filter.filterCode
    ) {
      if (defaultFilter.type === FilterType.SYSTEM) {
        newSystemFilter = newSystemFilter.map((item) => {
          if (item.filterCode === defaultFilter.filterCode) {
            return {
              ...omit(defaultFilter, '_token', 'tlMaps', '_tls'),
              defaultFlag: 0,
              _status: FilterStatus.UPDATE,
            };
          } else {
            return item;
          }
        });
      } else {
        newCustomFilter = newCustomFilter.map((item) => {
          if (item.filterCode === defaultFilter.filterCode) {
            return {
              ...omit(defaultFilter, '_token', 'tlMaps', '_tls'),
              defaultFlag: 0,
              _status: FilterStatus.UPDATE,
            };
          } else {
            return item;
          }
        });
      }
    }
    // 预定义类型
    if (type === FilterType.SYSTEM) {
      // 新建时需要往对应类型的filter数组下增加元素
      if (_status === FilterStatus.CREATE) {
        newSystemFilter.push(newFilter);
      } else {
        // 更新或删除时需更新对应的filter
        newSystemFilter = newSystemFilter.map((item) => {
          if (item.filterCode === newFilter.filterCode) {
            return newFilter;
          } else {
            return item;
          }
        });
      }
    } else {
      // 自定义类型
      // 新建时需要往对应类型的filter数组下增加元素
      if (_status === FilterStatus.CREATE) {
        newCustomFilter.push(newFilter);
      } else {
        // 更新或删除时需更新对应的filter
        newCustomFilter = newCustomFilter.map((item) => {
          if (item && item.filterCode === newFilter.filterCode) {
            return newFilter;
          } else {
            return item;
          }
        });
      }
    }
    return {
      [searchCode]: {
        systemFilters: newSystemFilter,
        customFilters: newCustomFilter,
      },
    };
  }

  /**
   * 保存筛选器
   * @param filter 需保存的筛选器
   * @param onSuccess 保存成功回调
   * @param onError 保存失败回调
   */
  // @Bind()
  // async saveFilter(filter, onSuccess, onError) {
  //   const { currentFilter } = this.state;
  //   const { isNew } = filter;
  //   const param = this.handleSaveFilterParam(filter);
  //   const result = await saveFilters(param);
  //   const res = getResponse(result);
  //   if (!res) {
  //     if (onError) {
  //       onError();
  //     }
  //     return false;
  //   } else {
  //     notification.success({});
  //     // 变动筛选器时 清空缓存
  //     this.handleResetCache();
  //     // 保存后刷新
  //     this.setState({
  //       changeFlag: false,
  //     });
  //     this.initConfig(res, isNew ? currentFilter : undefined);
  //     if (onSuccess) {
  //       onSuccess();
  //     }
  //   }
  // }

  @Bind()
  saveCurrentFilter(isNew = false) {
    const { currentFilter = {} } = this.state;
    const { type, filterName, _tls } = currentFilter;
    let newFilterName = filterName;
    let newFilterNameTls = _tls;
    if (isNew && this.filterMenuDs.current) {
      newFilterName = this.filterMenuDs.current.get('filterName');
      newFilterNameTls = this.filterMenuDs.current.get('_tls');
    }
    let data = {};
    if (this.queryDs.current) {
      data = this.queryDs.current.toData();
    }
    const sortField = data[SortFieldName] || '';
    return {
      ...currentFilter,
      filterName: newFilterName,
      _tls: newFilterNameTls,
      type: isNew ? FilterType.CUSTOM : type,
      _status: isNew ? FilterStatus.CREATE : FilterStatus.UPDATE,
      defaultFlag: isNew ? 0 : currentFilter.defaultFlag,
      defaultSortedField: sortField.split(':')[0] || '',
      defaultSortedOrder: sortField.split(':')[1] || '',
    };
  }

  // @Bind()
  // @Debounce(500)
  // async saveFilterConfig(isNew = false) {
  //   if (isNew) {
  //     const flag = await this.filterMenuDs.validate();
  //     if (!flag) {
  //       return false;
  //     }
  //   }
  //   const newFilter = this.saveCurrentFilter(isNew);
  //   this.saveFilter(newFilter, () => {
  //     if (isNew && this.filterMenuDs.current) {
  //       this.filterMenuDs.current.reset();
  //     }
  //   });
  // }

  @Bind()
  setDisplayFieldsRank(allFields = []) {
    // 处理排序rank
    const { displayFields = [] } = this.state;
    const tmpRankFilterFields = [];
    displayFields.forEach((item, index) => {
      const target = allFields.find((field) => field.name && field.name === item.name);
      if (target) {
        tmpRankFilterFields.push({
          ...target,
          rank: index * 10 + 1,
        });
      }
    });
    return allFields.map((item) => {
      const target = tmpRankFilterFields.find((field) => field.name && field.name === item.name);
      return target || item;
    });
  }

  @Bind()
  handleRenameFilter(filter) {
    this.openEditModal(false, filter);
  }

  @Bind()
  handleClearSelected() {
    const { displayFields = [], optionalFields = [] } = this.state;
    if (!isEmpty(optionalFields)) {
      let hasComparsionFlag = false;
      optionalFields.map((item) => {
        const { name, multipleFlag, fieldWidget = 'INPUT' } = item;
        if (this.queryDs.current) {
          if (multipleFlag === 1) {
            // 隐藏字段时需重置的关联虚拟字段
            this.queryDs.current.set(getTempFieldName(name), undefined);
            this.queryDs.current.set(getMeaningFieldName(getTempFieldName(name)), undefined);
            if (RANGE_COMPONENTS.includes(fieldWidget)) {
              this.queryDs.current.set(getRangeBeforeFieldName(name), undefined);
              this.queryDs.current.set(getRangeAfterFieldName(name), undefined);
            }
          }
          this.queryDs.current.set(getMeaningFieldName(name), undefined);
          this.queryDs.current.set(name, null);
          if (
            !hasComparsionFlag &&
            checkComparsionWithNull(this.queryDs.current.get(getComparsionFieldName(name)))
          ) {
            hasComparsionFlag = true;
          }
        }
        // eslint-disable-next-line no-param-reassign
        item.display = false;
        return item;
      });
      if (hasComparsionFlag) {
        this.handleQuery();
      }
      const newDisplayFields = displayFields.filter((item) => item[FieldFlag.LOCK]);
      // 变动筛选器时清空缓存
      this.handleResetCache();
      this.setState({
        displayFields: newDisplayFields,
        invisibleFields: optionalFields.filter((item) => !item[FieldFlag.DISPLAY]),
        changeFlag: true,
      });
    }
  }

  @Bind()
  openEditModal(isNew = false, filter = {}) {
    const formDs = new DataSet({
      fields: [
        {
          name: 'filterName',
          type: FieldType.intl,
          required: true,
          label: intl.get('srm.filterBar.view.title.filterName').d('筛选器名称'),
        },
      ],
    });
    if (isNew) {
      formDs.create();
    } else {
      const { filterName, _token } = filter;
      formDs.create({
        filterName,
        _token,
      });
      if (formDs.current) {
        formDs.current.status = RecordStatus.update;
      }
    }
    editModal = Modal.open({
      title: isNew
        ? intl.get('srm.filterBar.view.title.saveCondition').d('保存筛选器')
        : intl.get('srm.filterBar.view.title.renameFilter').d('重命名筛选器'),
      className: `${stylePrefix}-edit-modal`,
      children: (
        <Form labelLayout={LabelLayout.float} dataSet={formDs} useColon={false}>
          <IntlField name="filterName" />
        </Form>
      ),
      footer: (
        <>
          <Button onClick={this.closeEditModal}>
            {intl.get('hzero.common.button.cancel').d('取消')}
          </Button>
          <Button
            color={ButtonColor.primary}
            onClick={() => this.handleEditModalOk(formDs, isNew, filter)}
          >
            {intl.get('hzero.common.button.ok').d('确定')}
          </Button>
        </>
      ),
    });
  }

  @Bind()
  async handleEditModalOk(formDs, isNew, filter) {
    const currentLanguage = getCurrentLanguage();
    const flag = await formDs.validate();
    if (!flag) {
      return;
    }
    const { type } = filter;
    let newFilterName;
    let newFilterNameTls;
    if (formDs.current) {
      newFilterName = formDs.current.get('filterName');
      newFilterNameTls = formDs.current.get('_tls');
    }
    if (!newFilterNameTls) {
      newFilterNameTls = {
        filterName: {
          [currentLanguage]: newFilterName,
        },
      };
    }
    newFilterNameTls.filterName[currentLanguage] = newFilterName;
    let data = {};
    if (this.queryDs && this.queryDs.current) {
      data = this.queryDs.current.toData();
    }
    const sortField = data[SortFieldName] || '';
    const newFilter = {
      ...filter,
      isNew,
      filterName: newFilterName,
      _tls: newFilterNameTls,
      type: isNew ? FilterType.CUSTOM : type,
      _status: isNew ? FilterStatus.CREATE : FilterStatus.UPDATE,
      defaultFlag: isNew ? 0 : filter.defaultFlag,
      defaultSortedField: sortField.split(':')[0] || '',
      defaultSortedOrder: sortField.split(':')[1] || '',
    };
    await this.saveFilter(newFilter, () => {
      this.closeEditModal();
    });
  }

  @Bind()
  closeEditModal() {
    if (editModal && editModal.close) {
      editModal.close();
    }
  }

  @Bind()
  handleResetCache() {
    const { initFlag } = this.state;
    if (initFlag) {
      return;
    }
    const { searchCode } = this.props;
    this.setState({
      cacheFlag: false,
    });
    resetSearchBarCache(searchCode);
  }

  @Bind()
  getShowSortSelectorFlag() {
    const { currentFilter = {}, sortedEnabled, sortableFields = [] } = this.state;
    const { defaultSortedField } = currentFilter;
    if (sortedEnabled && sortableFields.length > 0) {
      const targetField = sortableFields.find((item) => item.name === defaultSortedField);
      // 默认排序字段找不到时，取第一个排序字段
      return (!!targetField && !!targetField.label) || !!sortableFields[0].label;
    }
    return false;
  }

  @Bind()
  checkFieldNeedClear() {
    const { displayFields } = this.state;
    let flag = false;
    if (!isEmpty(displayFields)) {
      flag = displayFields.some(
        (field) =>
          !field[FieldFlag.SKIP_CLEAR] &&
          this.queryDs.current &&
          (checkValueValid(toJS(this.queryDs.current.get(field.name))) ||
            checkValueValid(toJS(this.queryDs.current.get(getTempFieldName(field.name)))))
      );
      if (flag) {
        return flag;
      }
    }
    if (this.searchInputDs.current) {
      flag = !!this.searchInputDs.current.get(MergeFieldName);
    }
    return flag;
  }

  @Bind()
  renderFields() {
    const { expandable = true, closeFilterSelector } = this.props;
    const { currentField, displayFields, optionalFields, comparisonSetObj } = this.state;
    // 添加关于树状图组件的代码
    const { filters = {} } = this.props;
    const keyArr = Object.keys(filters) || [];
    let options = [];
    if (keyArr.length !== 0) {
      const configObj = filters[`${keyArr[0]}`];
      const systemArr = configObj?.systemFilters ?? [];
      if (systemArr?.length !== 0) {
        const allFieldsArr = systemArr[0]?.allFields ?? [];
        // eslint-disable-next-line no-unused-expressions
        options = allFieldsArr?.map((i) => i?.optionsForTree ?? []);
      }
    }
    // 添加关于树状图组件的代码
    return (
      <div>
        {(closeFilterSelector || !expandable) && (
          <>
            {this.renderCustomLeft()}
            {this.renderMergeSearchInput()}
          </>
        )}
        {!isEmpty(displayFields) &&
          displayFields.map((field, ind) => (
            <Field
              key={field.name}
              autoFocus={currentField.name === field.name}
              dataSet={this.queryDs}
              field={field}
              comparisonSetObj={comparisonSetObj}
              onDelete={this.handleSelectField}
              options={options[ind]}
            />
          ))}
        <FieldSelector
          displayFields={displayFields}
          optionalFields={optionalFields}
          onClearSelected={this.handleClearSelected}
          onAllSelected={this.handleSelectAllField}
          onSelectField={this.handleSelectField}
        />
      </div>
    );
  }

  @Bind()
  renderMergeSearchInput() {
    const { closeMergeSearchInput } = this.props;
    if (closeMergeSearchInput) {
      return null;
    }
    const { searchInputFields } = this.state;
    if (isEmpty(searchInputFields)) {
      return null;
    }
    const mergeFieldPlaceholder = intl
      .get('srm.filterBar.view.message.mergeSearchPlaceholder', {
        name: searchInputFields
          .map((item) => item.fieldName)
          .join(intl.get('srm.filterBar.view.message.separator').d('、')),
      })
      .d(
        `请输入${searchInputFields
          .map((item) => item.fieldName)
          .join(intl.get('srm.filterBar.view.message.separator').d('、'))}查询`
      );
    return (
      <span className={`${stylePrefix}-merge-field`}>
        <TextField
          dataSet={this.searchInputDs}
          name={MergeFieldName}
          clearButton
          placeholder={mergeFieldPlaceholder}
          prefix={<Icon type="search" />}
        />
      </span>
    );
  }

  @Bind()
  renderCustomLeft() {
    const { left = {} } = this.props;
    const { currentFilter } = this.state;
    if (typeof left.render !== 'function') {
      return null;
    }
    return (
      <>
        <div className={`${stylePrefix}-operator-custom-wrap`}>
          {typeof left.render === 'function' && left.render(currentFilter)}
        </div>
        <Divider type="vertical" style={{ background: '#ccc' }} />
      </>
    );
  }

  @Bind()
  renderCustomRight() {
    const { right = {} } = this.props;
    const { currentFilter } = this.state;
    if (typeof right.render !== 'function') {
      return null;
    }
    return (
      <>
        <Divider type="vertical" style={{ background: '#ccc' }} />
        <div className={`${stylePrefix}-operator-custom-wrap`}>
          {typeof right.render === 'function' && right.render(currentFilter)}
        </div>
      </>
    );
  }

  @Bind()
  renderButtons() {
    const { expand, changeFlag } = this.state;
    const clearFlag = this.checkFieldNeedClear();

    return (
      <>
        {changeFlag && (
          <>
            {/* <Button
              className={`${stylePrefix}-operator-btn`}
              onClick={() => this.openEditModal(true, currentFilter)}
            >
              {intl.get('srm.filterBar.view.button.saveAs').d('另存为')}
            </Button> */}
            {/* {currentFilter.type !== FilterType.SYSTEM && (
              <Button
                className={`${stylePrefix}-operator-btn`}
                onClick={() => this.saveFilterConfig()}
              >
                {intl.get('hzero.common.button.save').d('保存')}
              </Button>
            )} */}
            <Button className={`${stylePrefix}-operator-btn`} onClick={this.handleResetFilter}>
              {intl.get('hzero.common.button.reset').d('重置')}
            </Button>
          </>
        )}
        {clearFlag && (
          <Button className={`${stylePrefix}-operator-btn`} onClick={this.handleCleanFilter}>
            {intl.get('hzero.common.button.clear').d('清空')}
          </Button>
        )}
        <Divider type="vertical" style={{ margin: '0 0.02rem', background: '#ccc' }} />
        <Tooltip title={intl.get('hzero.common.button.refresh').d('刷新')}>
          <span className={`${stylePrefix}-operator-icon`} onClick={this.handleRefresh}>
            <img alt={intl.get('hzero.common.button.refresh').d('刷新')} src={RefreshIcon} />
          </span>
        </Tooltip>
        <Tooltip
          title={
            expand
              ? intl.get('hzero.common.button.up').d('收起')
              : intl.get('hzero.common.button.expand').d('展开')
          }
        >
          <span className={`${stylePrefix}-operator-icon`} onClick={this.handleExpand}>
            <img
              alt={
                expand
                  ? intl.get('hzero.common.button.up').d('收起')
                  : intl.get('hzero.common.button.expand').d('展开')
              }
              src={CollapseUpIcon}
              className={!expand ? `${stylePrefix}-operator-icon-unFold` : undefined}
            />
          </span>
        </Tooltip>
      </>
    );
  }

  @Bind()
  renderHeaderLeft() {
    const {
      closeFilterSelector,
      tableButtons = [],
      dataSet = [],
      tableRef,
      tableMode,
    } = this.props;
    const { expand, filterList, changeFlag, defaultFilter, currentFilter } = this.state;

    if (closeFilterSelector) {
      return (
        <div className={`${stylePrefix}-operator-left`}>
          {this.renderCustomLeft()}
          <CollpaseFilter expand={expand} handleExpand={this.handleExpand} />
          {!isEmpty(tableButtons) && !isEmpty(dataSet) && (
            <>
              <Divider type="vertical" style={{ margin: '0 0.02rem', background: '#ccc' }} />
              <TableButtonRenderer
                dataSet={dataSet[0]}
                tableRef={tableRef}
                tableMode={tableMode}
                buttons={tableButtons}
              />
            </>
          )}
        </div>
      );
    } else {
      return (
        <div className={`${stylePrefix}-operator-left`}>
          {this.renderCustomLeft()}
          {this.renderMergeSearchInput()}
          <FilterSeletor
            filterList={filterList}
            currentFilter={currentFilter}
            defaultFilter={defaultFilter}
            changeFlag={changeFlag}
            onSelectFilter={this.handleSelectFilter}
            onSaveFilter={this.saveFilter}
            onRenameFilter={this.handleRenameFilter}
          />
          {this.renderButtons()}
        </div>
      );
    }
  }

  @Bind()
  renderHeaderRight() {
    const { currentFilter, sortedEnabled, sortableFields = [] } = this.state;
    const { right = {} } = this.props;
    const showSorterFlag = this.getShowSortSelectorFlag();
    return (
      <div
        className={`${stylePrefix}-operator-right`}
        style={{ display: typeof right.render === 'function' || sortedEnabled ? 'block' : 'none' }}
      >
        {showSorterFlag && (
          <SortSelector
            onRef={this.handleSortSelectorRef}
            filter={currentFilter}
            fields={sortableFields}
            dataSet={this.queryDs}
          />
        )}
        {typeof right.render === 'function' && (
          <>
            {showSorterFlag && (
              <Divider type="vertical" style={{ margin: '0 0.16rem', background: '#ccc' }} />
            )}
            {right.render(currentFilter)}
          </>
        )}
      </div>
    );
  }

  render() {
    const { expand } = this.state;
    const { dataSet = [], expandable = true, showLoading = true } = this.props;
    const headerLeft = this.renderHeaderLeft();
    const headerRight = this.renderHeaderRight();
    const wrapClsName = classnames(stylePrefix, { [`${stylePrefix}-expand`]: expand });
    if (expandable) {
      return (
        <div className={wrapClsName}>
          {showLoading && <SearchBarSpin dataSet={dataSet} />}
          <div className={`${stylePrefix}-left`}>
            <div className={`${stylePrefix}-operator`}>
              {headerLeft}
              {headerRight}
            </div>
            {expand && <div className={`${stylePrefix}-fields`}>{this.renderFields()}</div>}
          </div>
        </div>
      );
    } else {
      return (
        <div className={wrapClsName}>
          <SearchBarSpin dataSet={dataSet} />
          <div className={`${stylePrefix}-left`}>
            <div className={`${stylePrefix}-fields`}>{this.renderFields()}</div>
          </div>
          <div className={`${stylePrefix}-right`}>{!expandable && headerRight}</div>
        </div>
      );
    }
  }
}

const SearchBarSpin = observer(({ dataSet }) => {
  if (isEmpty(dataSet)) {
    return null;
  }
  const loading = dataSet.some((item) => item.status === 'loading');
  if (!loading) {
    return null;
  }
  return <div className={`${stylePrefix}-loading`} />;
});

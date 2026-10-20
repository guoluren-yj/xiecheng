/* eslint-disable no-unused-vars */
/* eslint-disable no-lonely-if */
/* eslint-disable prefer-destructuring */
import React, { Component, MouseEvent } from 'react';
import classnames from 'classnames';
import moment from 'moment';
import { DataSet, Button, Form, IntlField, Tooltip, TextField, Modal } from 'choerodon-ui/pro';
import { Divider, Icon, Spin } from 'choerodon-ui';
import { FieldType, DataSetStatus, RecordStatus } from 'choerodon-ui/pro/lib/data-set/enum';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import Record from 'choerodon-ui/pro/lib/data-set/Record';
import { Buttons } from 'choerodon-ui/pro/lib/table/Table';
import { TableMode } from 'choerodon-ui/pro/lib/table/enum';
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
  isFunction,
} from 'lodash';
import { toJS } from 'mobx';
import { observer } from 'mobx-react';

import intl from 'utils/intl';
import {
  getResponse,
  filterNullValueObject,
  getCurrentLanguage,
} from 'hzero-front/lib/utils/utils';
import notification from 'hzero-front/lib/utils/notification';
import { DEFAULT_DATETIME_FORMAT } from 'hzero-front/lib/utils/constants';
import { queryMapIdpValue } from 'hzero-front/lib/services/api';
import formatterCollections from 'utils/intl/formatterCollections';

import { fetchPriceLibHeaderConfig } from './util/api';

import CollpaseFilter from './components/CollpaseFilter';
import FilterSeletor from './components/FilterSeletor';
import FieldSelector from './components/FieldSelector';
import Field from './components/Field';
import SortSelector from './components/SortSelector';
import { FilterMenuDS, SearchInputDS } from './store';
import {
  stylePrefix,
  FieldFlag,
  FilterStatus,
  MergeFieldName,
  FilterType,
  saveFilters,
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
  omitFieldProps,
  queryFilters,
  setSearchBarCache,
  resetSearchBarCache,
  initialFilterCache,
  getSearchBarCache,
  hasSearchBarCache,
  ComparisonSetFieldSuffix,
  RANGE_COMPONENTS,
  sortFields,
  MeaingFieldSuffix,
  SortFieldName,
  getRelatedFilterFields,
  checkFieldConfigModified,
  getLovQueryAxiosConfig,
  SUPPORT_COMPONENTS,
  DefaultValueType,
  statementToJs,
  innerFunctionMap,
  getContext,
  checkFieldValueModified,
  isObjectEqual,
  transformNilValue,
  defaultValueFx,
} from './util';
import './index.less';
import CollapseUpIcon from '../../../assets/collapse_up.svg';
import RefreshIcon from '../../../assets/refresh.svg';

let editModal; // 编辑弹窗

class SearchBar extends Component {
  queryDs; // queryDataSet

  filterMenuDs; // 筛选器列表dataSet

  searchInputDs; // 合并查询输入框dataSet

  computedFieldMap = new Map();

  sortSelectorRef;

  cacheData = {
    currentFilter: {},
    queryDsData: null,
    searchInputDsData: null,
    fields: [],
    state: {},
  };

  contextParams = {};

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
      queryLoading: false, // 查询筛选条件loading
    };
  }

  static defaultProps = {
    closeMergeSearchInput: false,
    closeFilterSelector: false,
    defaultExpand: true,
    expandable: true,
    showLoading: true,
  };

  componentDidMount() {
    this.addDsEventListener();
    this.fetchLovData();
    // 初始化时设置关联的dataSet的状态，解决筛选器未加载完毕前表格显示暂无数据情况的问题
    this.handleDataSetLoading(true);
    // this.initFilters();
    this.handleRef();
    this.handleFilterCacheInitial();
    // 请求配置头
    this.fetchPriceLibHeaderConfig();
  }

  componentWillUnmount() {
    this.removesEventListener();
    this.handleCacheFilter();
  }

  /**
   * 查询头
   */
  @Bind()
  async fetchPriceLibHeaderConfig() {
    const { remote, templateCode, onAfterQueryFields, queryFilterConfig = {} } = this.props;
    this.setState({
      queryLoading: true,
    });
    try {
      const result = getResponse(
        await fetchPriceLibHeaderConfig({
          templateCode,
          ...queryFilterConfig,
        })
      );
      if (result && Array.isArray(result) && result.length > 0) {
        const _displayFields = [];

        const list = result.map((item, index) => {
          const fieldConfig = {};
          // 查询表单
          if (item.queryFlag) {
            // 针对 `LOV` 增加fieldMeaning, 适配导出组件
            const {
              dimensionCode,
              dimensionName,
              fieldWidget,
              multipleFlag,
              dateFormat,
              sourceCode,
            } = item;
            // if (item.fieldWidget === 'LOV') {
            //   const displayField = item.priceLibDimMapList?.find(
            //     (n) => n.targetDimensionCode === item.dimensionCode
            //   )?.sourceFromFieldMeaning;

            //   this.queryDs.addField(item.dimensionCode, {
            //     name: item.dimensionCode,
            //     label: item.dimensionName,
            //     ...this.renderQueryFieldType(item),
            //   });
            //   this.queryDs.addField(`${item.dimensionCode}Meaning`, {
            //     name: `${item.dimensionCode}Meaning`,
            //     type: 'string',
            //     bind: `${item.dimensionCode}.${displayField || item.displayField}`,
            //   });
            // } else {
            //   this.queryDs.addField(item.dimensionCode, {
            //     name: item.dimensionCode,
            //     label: item.dimensionName,
            //     ...this.renderQueryFieldType(item),
            //   });
            // }
            Object.assign(
              fieldConfig,
              {
                ...item,
                name: dimensionCode,
                label: dimensionName,
                fieldWidget: fieldWidget === 'SWITCH' ? 'SELECT' : fieldWidget,
                multipleFlag: RANGE_COMPONENTS.includes(fieldWidget) ? 1 : multipleFlag,
                dateFormat,
                sourceCode,
                fixedFlag: item.preDisplayFlag,
                display: !!item.preDisplayFlag,
                // ...this.renderQueryFieldType(item),
              },
              fieldWidget === 'SWITCH' && {
                sourceCode: 'HPFM.FLAG',
              },
              fieldWidget === 'INPUT' && {
                // 文本默认支持多值查询
                multipleFlag: 1,
              }
            );
            _displayFields.push(fieldConfig);
          }
          // 修复配置默认值清空后defaultValue=""导致字段必输校验失效问题
          return {
            ...item,
            defaultValue: item?.defaultValue || null,
          };
        });
        const displayFields = remote
          ? remote?.process('SSRC_COMPONENTS_PROCESS_SEARCHBAR_DISPLAY_FIELDS', _displayFields, {
              templateCode,
              queryFilterConfig,
            })
          : _displayFields;

        // this.setQueryDs(displayFields);
        const custFilter = {
          allFields: displayFields,
        };
        this.handleFilterConfig(custFilter, true);
        // this.setState({ displayFields });
        // 回调处理查询 `queryFields` 后操作
        // eslint-disable-next-line no-unused-expressions
        isFunction(onAfterQueryFields) && onAfterQueryFields(list);
      }
    } finally {
      this.setState({
        queryLoading: false,
      });
    }
  }

  /**
   * 渲染queryFieldType
   * 链接，上传，不可作查询条件
   */
  @Bind()
  renderQueryFieldType(field) {
    let queryFieldConfig = {};
    switch (field.fieldWidget) {
      case 'INPUT':
        queryFieldConfig = {
          type: 'string',
        };
        break;
      case 'INPUT_NUMBER':
        queryFieldConfig = {
          type: 'number',
          range: ['start', 'end'],
        };
        break;
      case 'SELECT':
        queryFieldConfig = {
          type: 'string',
          lookupCode: field.sourceCode,
          multiple: Number(field.multipleFlag) === 1 ? ',' : false,
        };
        break;
      case 'LOV':
        queryFieldConfig = {
          type: 'object',
          lovCode: field.sourceCode,
          multiple: Number(field.multipleFlag) === 1,
          transformRequest: (value) =>
            value &&
            (Number(field.multipleFlag) === 1
              ? value.map((item) => item[field.valueField])
              : value[field.valueField]),
        };
        break;
      case 'DATE_PICKER':
        queryFieldConfig = {
          type:
            field.dateFormat === 'yyyy/MM/dd hh:mm:ss' || field.dateFormat === 'yyyy-MM-dd hh:mm:ss'
              ? 'dateTime'
              : 'date',
          format: this.renderDateFormat(field.dateFormat),
          range: ['start', 'end'],
          transformRequest: (val) => {
            if (val) {
              Object.assign(val, {
                start: val.start && moment(val.start).format('YYYY-MM-DD 00:00:00'),
                end: val.end && moment(val.end).format('YYYY-MM-DD 23:59:59'),
              });
            }
            return val;
          },
        };
        break;
      case 'SWITCH':
        queryFieldConfig = {
          type: 'string',
          lookupCode: 'HPFM.FLAG',
        };
        break;
      default:
        queryFieldConfig = {
          type: 'string',
        };
        break;
    }
    return queryFieldConfig;
  }

  /**
   * 渲染时间日期渲染格式
   */
  @Bind()
  renderDateFormat(dateFormat) {
    let format;
    switch (dateFormat) {
      case 'yyyy-MM-dd':
        format = 'YYYY-MM-DD';
        break;
      case 'yyyy/MM/dd':
        format = 'YYYY/MM/DD';
        break;
      case 'yyyy-MM-dd hh:mm:ss':
        format = 'YYYY-MM-DD HH:mm:ss';
        break;
      case 'yyyy/MM/dd hh:mm:ss':
        format = 'YYYY/MM/DD HH:mm:ss';
        break;
      default:
        break;
    }
    return format;
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
   * 初始化筛选器配置
   */
  initFilters() {
    // const { searchCode } = this.props;
    // this.initConfig(filters);
    // this.handleFilterConfig(filter, true);
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
        searchInputFields: mergeFieldList,
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

  /**
   * [贝泰妮] 重写, 谨慎修改!!!
   * @protected
   */
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
          fieldId,
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
              fieldId,
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
      }));
      this.setState(
        {
          fields,
          originFields,
          changeFlag: isNew ? changeFlag : false,
          // cacheFlag: isNew && cacheState,
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
    const newQueryDsData = this.cacheData.queryDsData || {};
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
    const { editorProps = {}, fieldProps = {}, remote } = this.props;
    const result = [];
    if (!isEmpty(fields)) {
      fields.forEach((field) => {
        const {
          modelId,
          fieldId,
          name: fieldAlias,
          label: fieldName,
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
          sourceCode,
          fieldWidget,
          multipleFlag,
          dateFormat,
          ...otherProps
        } = field;
        const { displayField: originDisplayField, valueField: originValueField } = lovInfo || {};
        const displayField = customDisplayField || originDisplayField;
        const valueField = customValueField || originValueField;
        let props = {
          ...otherProps,
          label: fieldName,
          name: fieldAlias,
          customComparisonSet,
          multipleFlag,
          lovInfo,
          rank,
          modelId,
          fieldId,
          fieldWidget,
          fieldVisible,
          gridSeq,
          helpMessage,
        };
        if (fieldAlias && !isEmpty(editorProps) && !isEmpty(editorProps[fieldAlias])) {
          props.editorProps = editorProps[fieldAlias];
          // 设置清空时跳过字段标识
          props[FieldFlag.SKIP_CLEAR] = editorProps[fieldAlias].clearButton === false;
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
          props.lovCode = sourceCode;
          props.textField = displayField;
          props.valueField = valueField;
          props.lovQueryAxiosConfig = (code, config) =>
            getLovQueryAxiosConfig(code, config, {
              headers: {
                's-lov-view-code': sourceCode,
                's-lov-display-field': displayField,
              },
            });
        } else if (fieldWidget === 'SELECT' && sourceCode) {
          props.lookupCode = sourceCode;
        } else if (fieldWidget === 'INPUT_NUMBER') {
          props.type = FieldType.number;
        } else if (fieldWidget === 'DATE_PICKER') {
          const format = this.renderDateFormat(dateFormat) || DEFAULT_DATETIME_FORMAT;
          props.format = format;
          props.type = format.includes('mm:ss') ? FieldType.dateTime : FieldType.date;
        } else if (fieldWidget === 'INPUT') {
          props.type = FieldType.string;
        }
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
            result.push({
              ...props,
              virtual: true,
              name: getTempFieldName(fieldAlias),
              range: true,
              // range: ['start', 'end'], // 为了适配价格库后端逻辑
            });
            result.push({
              ...props,
              name: getRangeBeforeFieldName(fieldAlias),
              max: getRangeAfterFieldName(fieldAlias),
              virtual: true,
            });
            result.push({
              ...props,
              name: getRangeAfterFieldName(fieldAlias),
              min: getRangeBeforeFieldName(fieldAlias),
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
          });
        }
      });
    }
    return remote
      ? remote?.process('SSRC_COMPONENTS_PROCESS_SEARCHBAR_TRANSFORM_FIELDS', result, {
          fields,
          current: this,
        })
      : result;
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
      const lookupOptions = field.getLookup(record);
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
    if (name.includes(ComparisonSetFieldSuffix)) {
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
    if (this.queryDs.current && !isEmpty(displayFields)) {
      const queryData = this.queryDs.current.toData() || {};
      const { fields } = this.state;
      let sortHandleFlag = false;
      fields.forEach((item) => {
        const {
          name,
          multipleFlag,
          virtual,
          customComparisonSet,
          fieldWidget,
          modelId,
          fieldId,
        } = item;
        // 隐藏字段不处理
        const isDisplay = displayFields.find((f) => f.name === name);
        // 处理排序查询字段，只处理一次
        if (sortedEnabled && sortableFields.length > 0 && !sortHandleFlag) {
          newQueryParameter[SortFieldName] = queryData[SortFieldName];
          sortHandleFlag = true;
        }
        if (!isDisplay) {
          return;
        }
        // 虚拟字段不处理
        if (virtual) {
          return;
        }
        // 有customComparisonSet代表是扩展字段
        // 虚拟字段不处理筛选条件
        if (!isEmpty(customComparisonSet) && modelId !== -1 && fieldId !== -1) {
          if (RANGE_COMPONENTS.includes(fieldWidget)) {
            if (multipleFlag !== 1 && checkValueValid(queryData[name])) {
              const comparisonSetField = queryData[getComparsionFieldName(name)];
              comparisonSetArray.push(`${name}:${comparisonSetField}`);
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
            queryData[getComparsionFieldName(name)] &&
            !RANGE_COMPONENTS.includes(fieldWidget)
          ) {
            // 多选非范围类型筛选条件只能是IN
            const comparisonSetField =
              multipleFlag === 1 ? 'IN' : queryData[getComparsionFieldName(name)];
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
    const mergeQueryParameter = this.getMergeQueryParameter();
    newQueryParameter = Object.assign(newQueryParameter, mergeQueryParameter);
    // 处理筛选条件
    if (!isEmpty(comparisonSetArray)) {
      const comparisonSetStr = comparisonSetArray.join(',');
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
        if (!name.includes(ComparisonSetFieldSuffix)) {
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
      const { queryDsData } = this.cacheData;
      const { cacheFlag } = this.state;
      // 判断是否该取缓存
      const record = this.queryDs.create(!isEmpty(queryDsData) && cacheFlag ? queryDsData : {});
      if (onLoad) {
        onLoad(this.queryDs, record);
      }
    }
  }

  @Bind()
  setSearchInputDs() {
    const { searchInputFields } = this.state;
    if (!isEmpty(searchInputFields) && !this.searchInputDs.current) {
      const { searchInputDsData } = this.cacheData;
      this.searchInputDs.create(!isEmpty(searchInputDsData) ? searchInputDsData : {});
    }
  }

  @Bind()
  handleRefresh(event) {
    const { cacheData = {}, setState = () => {} } = this.props;
    const doFresh = async () => {
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
    };
    const fatherState = {};
    if (!isEmpty(cacheData)) {
      Modal.confirm({
        title: intl.get('ssrc.common.message.tip').d('提示'),
        children: intl
          .get('ssrc.filterBar.view.clearCacheConfirm')
          .d('当前操作将会清空变更过的数据，是否继续？'),
        onOk: () => {
          fatherState.cacheData = {};
          fatherState.checkData = [];
          fatherState.checkValues = [];
          setState(fatherState);
          doFresh();
        },
      });
    } else {
      fatherState.checkData = [];
      fatherState.checkValues = [];
      setState(fatherState);
      doFresh();
    }
  }

  /**
   * 查询
   * @param sync true-刷新
   */
  @Bind()
  @Debounce(800)
  async handleQuery(sync = false) {
    const validateFlag = await this.queryDs.validate();
    if (!validateFlag) {
      return;
    }
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
    const { dataSet } = this.props; // table 对应的 ds
    if (dataSet) {
      dataSet.forEach((ds) => {
        if (!ds.queryDataSet) {
          // eslint-disable-next-line no-param-reassign
          ds.queryDataSet = new DataSet();
        }
      });
    }
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
      if (dataSet) {
        dataSet.forEach((ds) => {
          if (ds.queryDataSet) {
            ds.queryDataSet.loadData([params]);
            // 解决缓存问题
            ds.query(cacheFlag ? ds.currentPage : undefined);
          }
        });
      }
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
    //  const searchInputFields = []; // 输入框内
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
          const value = this.queryDs.current.get(name);
          if (value) {
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
          const hasDefaultValueFlag = selectableFields.some(
            (item) => !!this.queryDs.current && !!this.queryDs.current.get(item.name)
          );
          if (hasDefaultValueFlag) {
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
          !item[FieldFlag.SKIP_CLEAR] &&
          this.queryDs.current &&
          (checkValueValid(this.queryDs.current.get(item.name)) ||
            checkValueValid(this.queryDs.current.get(getTempFieldName(item.name))) ||
            checkValueValid(this.queryDs.current.get(getRangeAfterFieldName(item.name))) ||
            checkValueValid(this.queryDs.current.get(getRangeBeforeFieldName(item.name))) ||
            checkValueValid(this.queryDs.current.get(getMeaningFieldName(item.name))))
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
        this.handleQuery();
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
            (target.proDefaultFlag !== item.proDefaultFlag || defaultValue !== newValue)
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
  @Bind()
  async saveFilter(filter, onSuccess, onError) {
    const { currentFilter } = this.state;
    const { isNew } = filter;
    const param = this.handleSaveFilterParam(filter);
    const result = await saveFilters(param);
    const res = getResponse(result);
    if (!res) {
      if (onError) {
        onError();
      }
      return false;
    } else {
      notification.success({});
      // 变动筛选器时 清空缓存
      this.handleResetCache();
      // 保存后刷新
      this.setState({
        changeFlag: false,
      });
      this.initConfig(res, isNew ? currentFilter : undefined);
      if (onSuccess) {
        onSuccess();
      }
    }
  }

  @Bind()
  saveCurrentFilter(isNew) {
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

  @Bind()
  @Debounce(500)
  async saveFilterConfig(isNew) {
    if (isNew) {
      const flag = await this.filterMenuDs.validate();
      if (!flag) {
        return false;
      }
    }
    const newFilter = this.saveCurrentFilter(isNew);
    this.saveFilter(newFilter, () => {
      if (isNew && this.filterMenuDs.current) {
        this.filterMenuDs.current.reset();
      }
    });
  }

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
        }
        // eslint-disable-next-line no-param-reassign
        item.display = false;
        return item;
      });
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
          label: intl.get('ssrc.filterBar.view.title.filterName').d('筛选器名称'),
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
        ? intl.get('ssrc.filterBar.view.title.saveCondition').d('保存筛选器')
        : intl.get('ssrc.filterBar.view.title.renameFilter').d('重命名筛选器'),
      className: `${stylePrefix}-edit-modal`,
      children: (
        <Form labelLayout={LabelLayout.vertical} dataSet={formDs} useColon={false}>
          <IntlField name="filterName" />
        </Form>
      ),
      footer: (
        <>
          <Button
            color={ButtonColor.primary}
            funcType={FuncType.flat}
            onClick={() => this.handleEditModalOk(formDs, isNew, filter)}
          >
            {intl.get('hzero.common.button.ok').d('确定')}
          </Button>
          <Button funcType={FuncType.flat} onClick={this.closeEditModal}>
            {intl.get('hzero.common.button.cancel').d('取消')}
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
    return (
      <div>
        {(closeFilterSelector || !expandable) && (
          <>
            {this.renderCustomLeft()}
            {this.renderMergeSearchInput()}
          </>
        )}
        {!isEmpty(displayFields) &&
          displayFields
            .filter((item) => item.display)
            .map((field) => (
              <Field
                autoFocus={currentField.name === field.name}
                dataSet={this.queryDs}
                field={field}
                comparisonSetObj={comparisonSetObj}
                onDelete={this.handleSelectField}
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
    const mergeFieldPlaceholder =
      intl.get('ssrc.filterBar.view.message.pleaseInput').d('请输入') +
      searchInputFields.map((item) => item.fieldName).join('、') +
      intl.get('hzero.common.button.search').d('查询');
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
    const { expand, changeFlag, currentFilter } = this.state;
    const clearFlag = this.checkFieldNeedClear();

    return (
      <>
        {changeFlag && (
          <>
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
            </>
          )}
        </div>
      );
    } else {
      return (
        <div className={`${stylePrefix}-operator-left`}>
          {this.renderCustomLeft()}
          {this.renderMergeSearchInput()}
          {/* <FilterSeletor
            filterList={filterList}
            currentFilter={currentFilter}
            defaultFilter={defaultFilter}
            changeFlag={changeFlag}
            onSelectFilter={this.handleSelectFilter}
            onSaveFilter={this.saveFilter}
            onRenameFilter={this.handleRenameFilter}
          /> */}
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
    const { expand, queryLoading = false } = this.state;
    const { dataSet = [], expandable = true, renderLeftLayout } = this.props;
    const leftLayout = renderLeftLayout;
    const headerLeft = this.renderHeaderLeft();
    const headerRight = this.renderHeaderRight();
    const wrapClsName = classnames(stylePrefix, { [`${stylePrefix}-expand`]: expand });
    if (expandable) {
      return (
        <Spin spinning={queryLoading}>
          <div className={wrapClsName}>
            {/* {showLoading && <SearchBarSpin dataSet={dataSet} />} */}
            {/* {queryLoading && <div className={`${stylePrefix}-loading`} />} */}
            <div className={`${stylePrefix}-left`}>
              <div className={`${stylePrefix}-operator`}>
                {leftLayout}
                {headerLeft}
                {headerRight}
              </div>
              {expand && <div className={`${stylePrefix}-fields`}>{this.renderFields()}</div>}
            </div>
          </div>
        </Spin>
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

const hocFuc = (com) => formatterCollections({ code: ['ssrc.filterBar', 'ssrc.common'] })(com);

export default hocFuc(SearchBar);
export { hocFuc, SearchBar };

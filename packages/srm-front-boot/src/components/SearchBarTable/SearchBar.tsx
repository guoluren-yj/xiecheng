/* eslint-disable no-unused-vars */
/* eslint-disable no-lonely-if */
/* eslint-disable prefer-destructuring */
import type { MouseEvent } from 'react';
import React, { Component } from 'react';
import type { RouteComponentProps } from 'react-router';
import { withRouter } from 'react-router';
import classnames from 'classnames';
import moment from 'moment';
import { parse } from 'querystring';
import { DataSet, Button, Form, IntlField, Tooltip, TextField, Modal } from 'choerodon-ui/pro';
import { Divider, Icon } from 'choerodon-ui';
import { FieldType, DataSetStatus, RecordStatus } from 'choerodon-ui/pro/lib/data-set/enum';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import type Record from 'choerodon-ui/pro/lib/data-set/Record';
import type { Buttons } from 'choerodon-ui/pro/lib/table/interface';
import type { TableMode } from 'choerodon-ui/pro/lib/table/enum';
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
  isObject,
  isString,
} from 'lodash';
import { toJS } from 'mobx';
import { observer } from 'mobx-react';

import {
  getResponse,
  filterNullValueObject,
  getCurrentLanguage,
  getCurrentOrganizationId,
  getCurrentUserId,
  getCurrentUserDateFormatPerfer,
  getCurrentUser,
} from 'hzero-front/lib/utils/utils';
import notification from 'hzero-front/lib/utils/notification';
import { DEFAULT_DATETIME_FORMAT, DEFAULT_DATE_FORMAT } from 'hzero-front/lib/utils/constants';
import { queryMapIdpValue } from 'hzero-front/lib/services/api';
import formatterCollections from '../../utils/intl/formatterCollections';
import { getLovPatching } from '../..//utils/utils';
import intl from '../../utils/intl';
import C7nCustomizeContext from '../../components/CustomizeContext/C7nCustomizeContext';
import TableButtonRenderer from './components/TableButtonRenderer';
import CollpaseFilter from './components/CollpaseFilter';
import FilterSeletor from './components/FilterSeletor';
import FieldSelector from './components/FieldSelector';
import Field from './components/Field';
import SortSelector from './components/SortSelector';
import { FilterMenuDS, SearchInputDS } from './store';
import type {
  fieldProperties,
  filterProperties,
  searchBarConfigProperties,
  ICacheData,
  templateConfig,
} from './util';
import {
  getLovProFieldName,
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
  checkComparsionWithNull,
  parseUrlParams,
  ParseUrlParamsType,
  FieldDefaultValueType,
  getSearchBarKey,
  parseLovPara,
  getFieldName,
  DATE_RANGE_COMPARISON,
  getLocalLovQueryDefaultField,
} from './util';
import './index.less';
import CollapseUpIcon from '../../assets/collapse_up.svg';
import RefreshIcon from '../../assets/refresh.svg';

interface SearchBarProps extends searchBarConfigProperties {
  cacheState?: boolean; // 是否缓存筛选器, 为true则开启缓存
  onRef?: (elem: any) => any; // searchBar ref
  dataSet: DataSet[]; // table DataSet
  searchCode: string; // searchBar编码
  tableButtons?: Buttons[]; // table buttons
  tableRef?: any;
  tableMode?: TableMode;
}

let editModal; // 编辑弹窗
@formatterCollections({ code: ['srm.filterBar'] })
class SearchBar extends Component<RouteComponentProps & SearchBarProps, any> {
  static contextType = C7nCustomizeContext;

  queryDs: DataSet; // queryDataSet

  filterMenuDs: DataSet; // 筛选器列表dataSet

  searchInputDs: DataSet; // 合并查询输入框dataSet

  customizeDs: DataSet; // 自定义区域关联dataSet

  computedFieldMap = new Map();

  sortSelectorRef;

  cacheKey: string;

  location: string;

  lovQueryDefaultField: { [lovCode: string]: string };

  cacheData: ICacheData = {
    currentFilter: {},
    queryDsData: null,
    searchInputDsData: null,
    fields: [],
    customizeDs: this.customizeDs,
    state: {},
    lovPatchParams: {},
    location: '',
  };

  urlParams: any;

  contextParams: any;

  firstFlag: boolean;

  cleanFlag: boolean;

  fixQueryParams: any = {}; // 固定查询参数，不受字段显示隐藏影响

  fixQueryParamsFilterKeys: string[] = []; // 固定查询参数需过滤的参数数组

  lovPatchParams: any = {}; // lov附加参数

  lovPatchConfig: any = {}; // lov附加配置

  showUserPerferFormat: boolean = false;

  constructor(props) {
    super(props);
    const { manualQuery, closeFilterSelector, defaultExpand, autoParseUrlParams, parseUrlParamsKey, parseUrlParamsType, location, expand: originExpand, cacheKey, searchCode, loading } = props;
    const { search } = location || {};
    this.urlParams = parse((search || '').substring(1)) || {};
    if (search && autoParseUrlParams && parseUrlParamsKey) {
      this.fixQueryParams = parseUrlParams(search, parseUrlParamsKey, parseUrlParamsType);
    }
    this.cacheKey = getSearchBarKey(cacheKey || searchCode);
    this.lovQueryDefaultField = getLocalLovQueryDefaultField(props.searchCode);
    this.location = window.location.pathname;
    // 查询区域展开收起标识, true-展开, false-收起, 关闭筛选器切换功能默认收起, 其他情况默认展开
    let expand = !defaultExpand && closeFilterSelector ? false : transformNilValue(defaultExpand, true);
    if (!isNil(originExpand)) {
      expand = originExpand;
    }
    this.queryDs = new DataSet();
    this.filterMenuDs = new DataSet(FilterMenuDS());
    this.searchInputDs = new DataSet(SearchInputDS());
    this.customizeDs = new DataSet();
    this.contextParams = {
      ctx: getContext(),
    };
    this.firstFlag = true; // 首次加载标识
    this.cleanFlag = false; // 清空操作标识
    this.showUserPerferFormat = getCurrentUserDateFormatPerfer();
    this.state = {
      comparisonSetObj: {}, // 筛选条件map
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
      cacheFlag: false, // 用来标识当前是首次新加载还是首次从缓存中加载
      sortedEnabled: false, // 是否开启排序
      currentField: {}, // 正在编辑的字段
      initFlag: true, // 用来标识当前筛选列表是否第一次加载
      cleanFlag: true, // 标识是否点击清空
      orderCount: 1, // 支持多少个排序字段
      loading, // loading
      fieldParamConfig: {}, // 含值集参数配置的字段集合
      manualQuery: !isNil(manualQuery) ? manualQuery : getCurrentUser()?.themeConfigVO?.searchbarDelayFlag === 1,
    };
    this.lovPatchConfig = getLovPatching();
  }

  static defaultProps = {
    closeMergeSearchInput: false,
    closeFilterSelector: false,
    cuxDefaultFilterFlag: false,
    defaultExpand: true,
    expandable: true,
    showLoading: true,
    autoParseUrlParams: true,
    parseUrlParamsKey: 'filters',
    parseUrlParamsType: ParseUrlParamsType.BASE64,
    onlyModelField: false,
    onlySiteField: false,
    refreshButton: true,
    fieldDefaultValueType: FieldDefaultValueType.STANDARD,
    checkParamLength: false,
    paramMaxLength: 2000,
    checkDataSetStatus: true,
    isTemplate: false,
    loading: false,
  };

  componentDidMount() {
    this.handleRef();
    this.addDsEventListener();
    this.fetchLovData();
    // 初始化时设置关联的dataSet的状态，解决筛选器未加载完毕前表格显示暂无数据情况的问题
    this.handleDataSetLoading(true);
    // 单据样式不直接查询配置
    if (!this.props.isTemplate) {
      this.fetchFilters();
    }
    this.handleFilterCacheInitial();
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.dataSet &&
      nextProps.dataSet !== this.props.dataSet &&
      nextProps.dataSet.some(ds => ds.getState('queryStatus') !== 'ready')
    ) {
      nextProps.dataSet.forEach(ds => {
        if (ds) {
          ds.setState('queryStatus', 'ready');
        }
      });
    }
    if (!this.state.cacheFlag && this.state.initFlag && this.computedFieldMap.size > 0) {
      this.computeFieldPropDefaultValue();
    }
    if (nextProps.expand !== this.props.expand) {
      this.setState({ expand: nextProps.expand });
    }
    if (nextProps.loading !== this.props.loading) {
      this.setState({ loading: nextProps.loading });
    }
    if (nextProps.isTemplate && nextProps.templateConfig !== this.props.templateConfig) {
      this.fetchFilters(nextProps.templateConfig);
    }
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
    this.customizeDs.addEventListener('update', this.handleCustomizeDsUpdate);
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
    this.customizeDs.removeEventListener('update', this.handleCustomizeDsUpdate);
  }

  /**
   * 初始化筛选器缓存
   */
  @Bind()
  handleFilterCacheInitial() {
    const { cacheState, searchCode } = this.props;
    if (cacheState) {
      initialFilterCache(searchCode, this.cacheKey, true);
    }
  }

  @Bind()
  handleDataSetLoading(loading: boolean) {
    const { dataSet = [] } = this.props;
    if (!isEmpty(dataSet)) {
      dataSet.forEach(ds => {
        if (ds) {
          // eslint-disable-next-line no-param-reassign
          ds.status = loading ? DataSetStatus.loading : DataSetStatus.ready;
        }
      });
    }
  }

  /**
   * 查询筛选器配置
   */
  @Bind()
  fetchFilters(templateConfig?: templateConfig) {
    const { searchCode, isTemplate } = this.props;
    let params = { unitCode: searchCode };
    if (isTemplate && !isEmpty(templateConfig)) {
      params = {
        ...params,
        ...templateConfig,
      };
    }
    queryFilters(params)
      .then(res => {
        const filters = getResponse(res);
        this.initConfig(filters);
      })
      .catch(() => {
        this.handleDataSetLoading(false);
      });
  }

  /**
   * 初始化配置
   * @param filters 筛选器列表
   * @param currentFilter 指定当前筛选器
   * @param disabledSync 不刷新当前筛选器配置
   */
  @Bind()
  initConfig(filters, currentFilter?: filterProperties, disabledSync: boolean = false) {
    const { searchCode, cacheState, closeFilterSelector, cuxDefaultFilterFlag, expandable = true, onlySiteField, onlyModelField } = this.props;
    const { currentFilter: oldCurrentFilter } = this.state;
    if (isEmpty(filters) || isEmpty(filters[searchCode])) {
      this.handleDataSetLoading(false);
      return;
    }
    const filtersMap = filters[searchCode];
    const { customFilters, systemFilters, mergeFieldList, sortedEnabled, orderCount, unitFieldList } = filtersMap;
    let defaultFilter;
    let filterList: filterProperties[] = [];
    // 自定义的
    if (!isEmpty(customFilters)) {
      const customFiltersList = customFilters.map(item => ({ ...item, type: FilterType.CUSTOM }));
      filterList = [...filterList, ...customFiltersList];
      // 若不关闭切换筛选器功能， 则先取用户级默认筛选器
      if (!closeFilterSelector || expandable) {
        defaultFilter = customFiltersList.find(item => item.defaultFlag === 1);
      }
    }
    // 预置的
    if (!isEmpty(systemFilters)) {
      const systemFiltersList = systemFilters.map(item => ({ ...item, type: FilterType.SYSTEM }));
      filterList = [...filterList, ...systemFiltersList];
      // 未去到用户级默认筛选器时， 取预定义默认筛选器
      if (!defaultFilter) {
        defaultFilter = systemFiltersList.find(item => item.defaultFlag === 1);
        if (!defaultFilter || cuxDefaultFilterFlag) {
          // 未设置默认筛选器时 取预定义中的第一个
          defaultFilter = systemFiltersList[0] || {};
        }
      }
    }
    // 保存筛选器后需刷新当前筛选器
    let newCurrentFilter = currentFilter;
    if (!newCurrentFilter) {
      newCurrentFilter =
        filterList.find(item => item.filterCode === oldCurrentFilter.filterCode) || defaultFilter;
    }
    let cacheOtherState = {};
    if (cacheState && hasSearchBarCache(searchCode, this.cacheKey, true)) {
      const cacheData = getSearchBarCache(searchCode, this.cacheKey, true) as ICacheData;
      this.cacheData = cacheData;
      const { currentFilter: cacheFilter, fields, customizeDs, state, lovPatchParams } = cacheData;
      this.customizeDs = customizeDs;
      this.lovPatchParams = lovPatchParams;
      this.customizeDs.addEventListener('update', this.handleCustomizeDsUpdate);
      newCurrentFilter = cacheFilter;
      cacheOtherState = {
        fields,
        cacheFlag: true,
        ...state,
      };
    }
    let searchInputFields: any[] = [];
    if (mergeFieldList && mergeFieldList.length) {
      mergeFieldList.forEach(mergeField => {
        // onlySiteField 为true标识只处理平台标准子弹
        if (onlySiteField && mergeField.custType !== "STD") {
          return;
        }
        // onlyModelField 为true 表示只处理模型字段，过滤掉虚拟字段
        if (onlyModelField && (!mergeField.modelCode || !mergeField.fieldCode)) {
          return;
        }
        searchInputFields.push(mergeField);
      });
      searchInputFields = sortFields(mergeFieldList, 'gridSeq');
    }
    const fieldParamConfig = {};
    if (unitFieldList) {
      unitFieldList.forEach(i => {
        if (i.paramList) {
          fieldParamConfig[i.fieldAlias] = i.paramList;
        }
      });
    }
    this.setState(
      {
        config: filtersMap,
        filterList,
        defaultFilter,
        searchInputFields,
        currentFilter: newCurrentFilter,
        sortedEnabled: sortedEnabled === 1,
        orderCount: orderCount || 1,
        fieldParamConfig,
        ...cacheOtherState,
      },
      () => {
        // 刷新当前筛选器配置
        // 重命名或更改默认筛选器时由于页面存在暂存数据，此处不刷新筛选器配置
        if (!disabledSync) {
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
    }).then(res => {
      if (res && !isEmpty(res.comparisonSet)) {
        const comparisonSetObj = {};
        res.comparisonSet.forEach(item => {
          comparisonSetObj[item.value] = item.meaning;
        });
        this.setState({
          comparisonSetObj,
        });
      }
    });
  }

  @Bind()
  handleQueryDsCreate() {
    if (!this.state.cacheFlag && this.state.initFlag && this.computedFieldMap.size > 0) {
      this.computeFieldPropDefaultValue();
    }
  }

  @Bind()
  getLovPatchConfig(lovCode) {
    if (!this.lovPatchConfig || !this.lovPatchConfig.length) {
      return null;
    }
    return this.lovPatchConfig.find(l => l.code === lovCode);
  }

  @Bind()
  updateLovPatchQueryParam(field, fieldName, record, param) {
    const patchConfig = this.getLovPatchConfig(field.lovCode);
    if (patchConfig) {
      this.lovPatchParams = {
        ...this.lovPatchParams,
        [field.fieldCode]: param || {},
      };
      record.dataSet?.getField(fieldName)?.set('optionsProps', {
        queryParameter: param,
      });
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
    // 针对多选字段可能出现[undefined, undefined]值的情况处理
    if (!checkValueValid(value) && !checkValueValid(oldValue)) {
      return false;
    }
    // 针对下拉多选/lov多选且必填的情况处理，否则校验不通过不触发查询
    if (filterField && filterField.multiple && !RANGE_COMPONENTS.includes(filterField.fieldWidget)) {
      record.init(filterField.originFieldCode, value);
    }
    const { initFlag, fields, manualQuery } = this.state;
    // 非首次更新，表明字段值发生变更, 公式类型默认值需设为0
    if (
      !initFlag &&
      filterField &&
      !filterField[FieldFlag.VIRTUAL] &&
      checkFieldValueModified(filterField, value, oldValue)
    ) {
      // 当前字段更新时，若原默认值是公式类型，需将proDefaultFlag设为0，方便在保存的时候识别出该字段值更新过
      // 只更新当前字段
      fields.find((item, index) => {
        if (item.name === name) {
          fields[index].defaultValueCon = null;
          fields[index].proDefaultFlag = 0;
        };
      });
      this.setState({
        fields,
      });
    }
    this.setRelatedFieldValue(name, value, record);
    // 清除缓存
    this.handleResetCache();
    const { onFieldChange } = this.props;
    if (manualQuery) {
      this.setState({ changeFlag: true });
    }
    if (onFieldChange && filterField) {
      const onFieldChangeConfig = config;
      if (name === MergeFieldName) {
        onFieldChangeConfig.name = this.state.searchInputFields.join(',');
      } else if (filterField[FieldFlag.VIRTUAL] && filterField.originFieldCode) {
        onFieldChangeConfig.name = filterField.originFieldCode;
      }
      onFieldChange(onFieldChangeConfig);
    }
    // 初始化加载时或通过清空操作改变值时不校验，直接执行查询
    // 更改排序字段前已经判断过ds状态，此处不用在判断了
    if (initFlag || (this.cleanFlag && !manualQuery) || name === SortFieldName) {
      this.handleQuery();
    } else if (!manualQuery) {
      // 此处增加延时，解决日期选择框组件选择完日期后会莫名在设置一次非法日期的问题
      setTimeout(() => {
        this.checkDataSetBeforeAction(() => {
          this.handleQuery();
        }, () => {
          record.init(name, oldValue);
          this.setRelatedFieldValue(name, oldValue, record, 'init');
        });
      }, 500);
    }
  }

  @Bind()
  handleSearchInputDsUpdate(config) {
    const { onFieldChange } = this.props;
    if (onFieldChange) {
      onFieldChange(config);
    }
    // 清除缓存
    this.handleResetCache();
    const { initFlag, manualQuery } = this.state;
    // 初始化加载时或通过清空操作改变值时不校验，直接执行查询
    if (initFlag || (this.cleanFlag && !manualQuery)) {
      this.handleQuery();
    } else if (!manualQuery) {
      this.checkDataSetBeforeAction(() => {
        this.handleQuery();
      }, () => {
        const { record, name, oldValue } = config;
        record.init(name, oldValue);

      });
    }
  }

  @Bind()
  handleCustomizeDsUpdate(config) {
    const { onFieldChange } = this.props;
    if (onFieldChange) {
      onFieldChange(config);
    }
    const { initFlag, manualQuery } = this.state;
    // 初始化加载时或通过清空操作改变值时不校验，直接执行查询
    if (initFlag || (this.cleanFlag && !manualQuery)) {
      this.handleQuery(true);
    } else if (!manualQuery) {
      this.checkDataSetBeforeAction(() => {
        this.handleQuery(true);
      }, () => {
        const { record, name, oldValue } = config;
        record.init(name, oldValue);
      });
    }
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

  @Bind()
  computeFieldPropDefaultValue() {
    const dataSet = this.queryDs;
    const record = this.queryDs.current as Record;
    const { fieldProps, searchCode } = this.props;
    const { fields = [], cacheFlag, changeFlag, searchInputFields = [], currentFilter } = this.state;
    const computedFieldValues = {};
    this.computedFieldMap.forEach((computedFieldValueFunc, computedFieldName) => {
      const targetField: fieldProperties = fields.find(item => item.name === computedFieldName);
      if (
        !targetField ||
        (!targetField.defaultValueCon &&
          targetField.proDefaultFlag !== 1 &&
          typeof fieldProps?.[computedFieldName]?.defaultValue !== 'function')
      ) {
        // this.computedFieldMap.delete(computedFieldName);
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
        originDefaultValue,
        comparison,
        customComparisonSet,
      } = targetField;
      let computedFieldValue;
      let computedFieldValueMeaning;
      const { valids = [], lines = [] } = defaultValueCon || {};
      // 条件
      if (valids && valids.length > 0) {
        const { defaultValue, defaultValueMeaning } = defaultValueFx(
          {
            fieldCode,
            modelCode,
            queryDsRecord: this.queryDs.current as Record,
            searchInputDsRecord: this.searchInputDs.current as Record,
            ctxParams: this.contextParams,
            queryDsFields: fields,
            searchInputDsFields: searchInputFields,
            getFieldValue: this.getFieldValue,
            currentUnitCode: searchCode,
            innerCache: this.context.cache,
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
        if (checkValueValid(computedFieldValue)) {
          if (fieldWidget === 'LOV') {
            let newValue = computedFieldValue;
            if (multipleFlag === 1) {
              newValue = computedFieldValue.split(',').map((item) => ({
                [valueField]: item,
                [textField]: (defaultValueMeaning && defaultValueMeaning[item]) || item,
              }));
              computedFieldValue = newValue;
            } else {
              newValue = {
                [valueField]: computedFieldValue,
                [textField]: defaultValueMeaning || computedFieldValue,
              };
            }
            computedFieldValue = newValue;
          } else {
            let defaultComparison = comparison;
            if (customComparisonSet && (!defaultComparison || !customComparisonSet.includes(defaultComparison))) {
              defaultComparison = customComparisonSet[0];
            }
            const isRangeDate =
              modelCode && fieldCode ? defaultComparison && ['IN', 'RANGE'].includes(defaultComparison) : multipleFlag === 1;
            if ((fieldWidget === 'DATE_PICKER' ? isRangeDate : multipleFlag === 1) &&
              typeof computedFieldValue === 'string') {
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
        } else if (checkValueValid(originDefaultValue)) {
          const originField = currentFilter && currentFilter.allFields ? currentFilter.allFields.find(f => f.fieldAlias === computedFieldName) : undefined;
          if (originField) {
            const {
              defaultValue: newDefaultValue,
              defaultValueMeaning: newDefaultValueMeaning,
            } = this.handleFieldDefalutValue(originField, true);
            computedFieldValue = newDefaultValue;
            computedFieldValueMeaning = newDefaultValueMeaning;
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
        if (fieldWidget === 'DATE_PICKER' && modelCode && fieldCode ? (this.queryDs.current && DATE_RANGE_COMPARISON.includes(this.queryDs.current.get(getComparsionFieldName(computedFieldName)))) : multipleFlag === 1) {
          record.set(
            getMeaningFieldName(getTempFieldName(computedFieldName)),
            computedFieldValueMeaning
          );
        }
      }
      this.computedFieldMap.delete(computedFieldName);
    });
    this.setFields(computedFieldValues);
    // 恢复缓存时不重置changeFlag
    this.setState({ changeFlag: cacheFlag ? changeFlag : false });
  }

  /**
   * 筛选器变更
   * @param filter 当前选中的筛选器
   */
  @Bind()
  handleSelectFilter(filter: filterProperties) {
    this.checkDataSetBeforeAction(() => {
      const { filterList, currentFilter = {} } = this.state;
      const { onFilterChange } = this.props;
      if (filter.filterCode !== currentFilter.filterCode) {
        const target = (filterList as filterProperties[]).find(
          item => item.filterCode === filter.filterCode
        );
        if (target) {
          // 变动筛选器时 清空缓存
          this.handleResetCache();
          if (onFilterChange) {
            onFilterChange(target, currentFilter);
          }
          this.setState(
            {
              currentFilter: target,
            },
            () => {
              this.computedFieldMap.clear();
              this.handleFilterConfig(target);
            }
          );
        }
      }
    });
  }

  /**
   * 缓存筛选器
   */
  @Bind()
  handleCacheFilter() {
    const { cacheState, searchCode } = this.props;
    const { fields, expand, changeFlag } = this.state;
    const newCurrentFilter = this.saveCurrentFilter();
    // 保存字段rank
    const cacheFields = this.updateFieldOptionsProps(this.setDisplayFieldsRank(fields));
    // 预防fields在转换完成之前就卸载组件了导致缓存中fields为空
    if (!cacheState || isEmpty(cacheFields) || !newCurrentFilter || newCurrentFilter.unitCode !== searchCode) {
      return;
    }
    // 当前页面刷新不缓存
    if (this.location === window.location.pathname) {
      return;
    }
    setSearchBarCache(searchCode, {
      currentFilter: newCurrentFilter,
      queryDsData: this.queryDs.current ? this.queryDs.current.toData() : {},
      searchInputDsData: this.searchInputDs.current ? this.searchInputDs.current.toData() : {},
      fields: cacheFields,
      customizeDs: this.customizeDs,
      state: {
        expand,
        changeFlag,
      },
      lovPatchParams: this.lovPatchParams,
      location: this.location,
    }, this.cacheKey, true);
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
          initFlag: true,
          ...this.getFieldType(fields),
        },
        () => {
          this.lovPatchParams = this.cacheData.lovPatchParams;
          this.setSearchInputDs(cacheFlag);
          this.setQueryDs(fields);
          this.handleQuery();
        }
      );
    } else {
      const { allFields = [] as fieldProperties[] } = filter;
      const fields: fieldProperties[] = this.handleTransformFields(allFields);
      if (!isNew) {
        // 重置
        this.queryDs = new DataSet();
        this.addDsEventListener();
      } else if (changeFlag) {
        // 变动筛选器时 清空缓存
        this.handleResetCache();
      }
      const originFields = fields.map(item => ({
        ...item,
        defaultValue: item.proDefaultFlag === 1 ? item.originDefaultValue : item.defaultValue,
      }));
      this.setState(
        {
          fields,
          originFields,
          initFlag: true,
          changeFlag: isNew ? changeFlag : false,
          // cacheFlag: isNew && cacheState,
          ...this.getFieldType(fields),
        },
        () => {
          this.setSearchInputDs();
          this.setQueryDs(fields);
          this.setCustomizeDs();
          this.handleQuery();
        }
      );
    }
  }

  // 更新缓存字段的配置,防止配置更新了而缓存中的字段未同步更新
  @Bind()
  updateCacheFilterFields(
    cacheFilter,
    cacheFields: fieldProperties[]
  ): {
    fields: fieldProperties[];
    originFields: fieldProperties[];
  } {
    const newQueryDsData = this.cacheData.queryDsData || {};
    const { filterList } = this.state;
    let fields: fieldProperties[] = []; // 缓存字段
    let originFields: fieldProperties[] = []; // ui接口返回字段
    if (!isEmpty(filterList)) {
      const targetFilter = filterList.find(item => item.filterCode === cacheFilter.filterCode);
      if (targetFilter) {
        const { allFields: originAllFields = [] as fieldProperties[] } = targetFilter;
        // 根据ui接口返回新的filter 生成字段配置
        originFields = this.handleTransformFields(originAllFields);
      }
      if (cacheFields.length > 0 && originFields.length > 0) {
        // 处理新增字段
        originFields.forEach(originField => {
          if (originField[FieldFlag.VIRTUAL]) {
            return;
          }
          const targetField = cacheFields.find(cacheField => cacheField.name === originField.name);
          if (!targetField) {
            fields = [...fields, ...getRelatedFilterFields(originFields, originField)];
          }
        });
        cacheFields.forEach(cacheField => {
          if (cacheField[FieldFlag.VIRTUAL]) {
            return;
          }
          let relatedFields: fieldProperties[] = [];
          // 缓存字段同步更新ui接口返回字段配置
          const targetField = originFields.find(
            originField => originField.name === cacheField.name
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
              newQueryDsData[getRangeAfterFieldName(name)] = '';
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
    originFields = originFields.map(item => ({
      ...item,
      defaultValue: item.proDefaultFlag === 1 ? item.originDefaultValue : item.defaultValue,
    }));
    return { fields, originFields };
  }

  /**
   * 转换成 dateSet 的 field 格式
   */
  @Bind()
  handleTransformFields(fields: fieldProperties[]) {
    const { currentFilter, fieldParamConfig, searchInputFields } = this.state;
    const isSystemFilter =
      currentFilter.type === FilterType.SYSTEM && currentFilter.tenantId !== getCurrentOrganizationId();
    const { editorProps = {}, fieldProps: originFieldProps = {}, onlyModelField, onlySiteField, fieldDefaultValueType = FieldDefaultValueType.STANDARD, searchCode } = this.props;
    const fieldProps: any = cloneDeep(originFieldProps);
    const result: fieldProperties[] = [];
    if (!isEmpty(fields)) {
      fields.forEach(field => {
        const {
          custType,
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
          num,
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
          backgroundText,
          defaultValueJsonFlag = 0,
        } = field;
        let { comparison, customComparisonSet } = field;
        // onlySiteField 为true 表示只处理平台标准子弹
        if (onlySiteField && custType !== "STD") {
          return;
        }
        // onlyModelField 为true 表示只处理模型字段，过滤掉虚拟字段
        if (onlyModelField && (!modelCode || !fieldCode)) {
          return;
        }
        const { fieldWidget = 'INPUT', sourceCode, multipleFlag, dateFormat, lovEnhanceFlag } = widget || {};
        const { displayField: originDisplayField, valueField: originValueField, queryFieldList } = lovInfo || {};
        const displayField = customDisplayField || originDisplayField;
        const valueField = customValueField || originValueField;
        let props: fieldProperties = {
          label: fieldName,
          name: fieldAlias,
          comparison,
          customComparisonSet,
          defaultValue,
          multipleFlag,
          lovInfo,
          num,
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
          backgroundText,
          defaultValueJsonFlag: defaultValueJsonFlag || 0,
          lovEnhanceFlag: lovEnhanceFlag || 0,
          queryFieldList,
        };
        if (fieldAlias && !isEmpty(fieldProps) && fieldProps[fieldAlias] && fieldProps[fieldAlias].transformValue) {
          props.transformValue = fieldProps[fieldAlias].transformValue;
        }
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
          field.fieldWidget = 'INPUT';
          if (field.widget) {
            field.widget.fieldWidget = 'INPUT';
          }
        }
        if (fieldWidget === 'LOV' && sourceCode) {
          let defaultQueryField = this.lovQueryDefaultField[sourceCode];
          if (!defaultQueryField) {
            const tenantDefaultQueryField = queryFieldList ? queryFieldList.find(i => i.defaultQueryFlag === 1) : undefined;
            if (tenantDefaultQueryField && tenantDefaultQueryField.field) {
              defaultQueryField = tenantDefaultQueryField.field;
            }
          }
          props = {
            ...props,
            type: FieldType.object,
            lovCode: sourceCode,
            textField: displayField,
            valueField,
            defaultQueryField,
            lovPara: {
              tenantId: getCurrentOrganizationId(),
            },
            lovQueryAxiosConfig: (code, config) =>
              getLovQueryAxiosConfig(code, config, {
                headers: {
                  's-lov-view-code': sourceCode,
                  's-lov-display-field': defaultQueryField || displayField,
                },
              }),
          };
          if (
            fieldAlias &&
            !isEmpty(fieldProps) &&
            fieldProps[fieldAlias] &&
            fieldProps[fieldAlias].lovPara
          ) {
            props.lovPara = {
              ...props.lovPara,
              ...fieldProps[fieldAlias].lovPara,
            };
          }
          const patchConfig = this.getLovPatchConfig(sourceCode);
          if (patchConfig && !isNil(defaultValue)) {
            const { name, parseValue } = patchConfig;
            if (parseValue) {
              props.optionsProps = {
                queryParameter: {
                  [name]: parseValue(defaultValue),
                },
                ...(fieldProps?.[fieldAlias || '']?.optionsProps || {}),
              };
            }
          }
          if (fieldParamConfig[fieldAlias!]) {
            props.dynamicProps = {
              ...(fieldProps?.[fieldAlias!]?.dynamicProps || {}),
              lovPara: ({ record }) => parseLovPara({
                record, contextParams: this.contextParams, urlParams: this.urlParams, config: fieldParamConfig[fieldAlias!],
                searchInputDsRecord: this.searchInputDs.current, queryDsFields: fields, searchInputDsFields: searchInputFields,
                currentUnitCode: searchCode, innerCache: this.context.cache,
              }),
            };
          }
        } else if (fieldWidget === 'SELECT' && sourceCode) {
          props.lookupCode = sourceCode;
          if (
            fieldAlias &&
            !isEmpty(fieldProps) &&
            fieldProps[fieldAlias] &&
            fieldProps[fieldAlias].lovPara
          ) {
            props.lovPara = fieldProps[fieldAlias].lovPara;
          }
          if (fieldParamConfig[fieldAlias!]) {
            props.dynamicProps = {
              ...(fieldProps?.[fieldAlias!]?.dynamicProps || {}),
              lovPara: ({ record }) => parseLovPara({
                record, contextParams: this.contextParams, urlParams: this.urlParams, config: fieldParamConfig[fieldAlias!],
                searchInputDsRecord: this.searchInputDs.current, queryDsFields: fields, searchInputDsFields: searchInputFields,
                currentUnitCode: searchCode, innerCache: this.context.cache,
              }),
            };
          }
        } else if (fieldWidget === 'INPUT_NUMBER') {
          props.type = FieldType.number;
        } else if (fieldWidget === 'DATE_PICKER') {
          const format = dateFormat || DEFAULT_DATETIME_FORMAT;
          props.format = format;
          props.type = format.includes('mm:ss') ? FieldType.dateTime : FieldType.date;
          props.dynamicProps = {
            type: ({ record }) => {
              const isRangeDate = modelCode && fieldCode ? DATE_RANGE_COMPARISON.includes(record.get(getComparsionFieldName(props.name))) : multipleFlag === 1;
              return isRangeDate ? FieldType.string : format.includes('mm:ss') ? FieldType.dateTime : FieldType.date;
            },
          };
        } else if (fieldWidget === 'INPUT') {
          props.type = FieldType.string;
        }
        let defaultComparison = comparison;
        if (customComparisonSet && (!comparison || !customComparisonSet.includes(comparison))) {
          defaultComparison = customComparisonSet[0];
        }
        if (fieldWidget === 'DATE_PICKER') {
          if (defaultComparison === 'IN') {
            defaultComparison = 'RANGE';
            comparison = 'RANGE';
            props.comparison = comparison;
          }
          if (customComparisonSet && customComparisonSet.includes('IN')) {
            customComparisonSet = customComparisonSet.map(i => i === 'IN' ? 'RANGE' : i);
            props.customComparisonSet = customComparisonSet;
          }
        }
        // 默认筛选方式为 为空或不为空时，不显示默认值
        if (checkComparsionWithNull(defaultComparison)) {
          props.defaultValue = undefined;
          props.defaultValueMeaning = undefined;
        } else if (fieldWidget !== 'DATE_PICKER' || !defaultComparison || !DATE_RANGE_COMPARISON.filter(i => i !== 'RANGE').includes(defaultComparison)){
          const {
            defaultValue: newDefaultValue,
            defaultValueMeaning: newDefaultValueMeaning,
          } = this.handleFieldDefalutValue(field);
          props.defaultValue = newDefaultValue;
          props.defaultValueMeaning = newDefaultValueMeaning;
        }
        props.forceQuery = field.forceQuery;
        if (lovEnhanceFlag !== 1 && fieldAlias && !isEmpty(fieldProps) && fieldProps[fieldAlias] && !this.computedFieldMap.get(fieldAlias)) {
          // 若字段已从路由上解析出默认值，则不再计算通过fieldProps设置的defaultValue
          if (field.forceQuery) {
            delete fieldProps[fieldAlias].defaultValue;
          }
          if (typeof fieldProps[fieldAlias].dynamicProps === 'object') {
            props.dynamicProps = {
              ...(props.dynamicProps || {}),
              ...fieldProps[fieldAlias].dynamicProps,
            };
          }
          props = {
            ...props,
            ...omit(fieldProps[fieldAlias], omitFieldProps),
          };
          // 用户自定义的筛选不取代码默认值
          // fieldDefaultValueType为CUSTOM时不取标准代码默认值
          if (fieldDefaultValueType !== FieldDefaultValueType.CUSTOM || isSystemFilter) {
            const standardDefaultValue = fieldProps[fieldAlias].defaultValue;
            if (standardDefaultValue) {
              props.defaultValue = standardDefaultValue;
              props.defaultValueMeaning = this.getFieldMeaning(props);
              if (typeof standardDefaultValue === 'function') {
                props.defaultValue = undefined;
                props.defaultValueMeaning = undefined;
                // 计算默认值
                this.computedFieldMap.set(fieldAlias, standardDefaultValue);
              }
            }
          }
        }
        // 添加自定义fieldProps属性
        result.push(props);
        // 实体字段且是日期类型时，且包含范围时，需添加前端临时字段, 用作存值
        if (modelCode && fieldCode && fieldWidget === 'DATE_PICKER') {
          const rangeDefaultValue = props.defaultValue;
          result.push({
            ...props,
            virtual: true,
            name: getTempFieldName(fieldAlias),
            range: true,
            originFieldCode: fieldAlias,
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
        } else if (multipleFlag === 1) {
          // 多选字段 需要添加前端临时字段, 用作存值
          if ((fieldWidget === 'LOV' && lovEnhanceFlag !== 1) || ['INPUT', 'SELECT'].includes(fieldWidget)) {
            result.push({
              ...props,
              name: getTempFieldName(fieldAlias),
              multiple: true,
              virtual: true,
              originFieldCode: fieldAlias,
            });
          } else if (RANGE_COMPONENTS.includes(fieldWidget)) {
            const rangeDefaultValue = props.defaultValue;
            result.push({
              ...props,
              virtual: true,
              name: getTempFieldName(fieldAlias),
              range: true,
              originFieldCode: fieldAlias,
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
          // comparison没值或者展示的筛选条件不在筛选条件集合中时，默认值取集合中的第一个值
          result.push({
            name: getComparsionFieldName(fieldAlias),
            virtual: true,
            type: FieldType.string,
            lookupCode: 'HPFM.CUST.FIELD_QUERY_REALTION',
            defaultValue: !comparison || !customComparisonSet.includes(comparison) ? customComparisonSet[0] : comparison,
          });
        }
        if (!isEmpty(fieldProps) && fieldAlias && fieldProps[fieldAlias]) {
          delete fieldProps[fieldAlias];
        }
      });
    }
    if (!isEmpty(fieldProps)) {
      keys(fieldProps).forEach(fieldName => {
        this.customizeDs.addField(fieldName, fieldProps[fieldName]);
        delete fieldProps[fieldName];
      });
    }
    return result;
  }

  @Bind()
  getFieldMeaning(field) {
    let meaning: string | undefined;
    const {
      defaultValue,
      textField,
      lovInfo,
      multipleFlag,
      format,
      lovCode,
      lookupCode,
      type,
      fieldWidget,
      comparison,
      customComparisonSet,
      modelCode,
      fieldCode,
    } = field;
    if (!defaultValue) {
      return undefined;
    }
    if (fieldWidget === 'LOV' && lovCode) {
      meaning =
        multipleFlag === 1 && isArray(defaultValue) ?
          defaultValue.map(v => v[textField] || '').join(',') : defaultValue[textField];
    } else if (fieldWidget === 'SELECT' && lookupCode) {
      meaning = undefined;
    } else if (!fieldWidget || ['INPUT_NUMBER', 'INPUT'].includes(fieldWidget)) {
      meaning = multipleFlag === 1 && isArray(defaultValue) ? defaultValue.join(',') : defaultValue;
    } else if (fieldWidget === 'DATE_PICKER') {
      const defaultComparison = comparison && customComparisonSet && customComparisonSet.includes(comparison) ? comparison : customComparisonSet ? customComparisonSet[0] : undefined;
      const isRangeDate = modelCode && fieldCode ? (defaultComparison && DATE_RANGE_COMPARISON.includes(defaultComparison)) : multipleFlag === 1;
      const dateFormat = format || (type === FieldType.dateTime ? DEFAULT_DATETIME_FORMAT : DEFAULT_DATE_FORMAT);
      const enLocale = dateFormat && dateFormat.includes('MMM');
      meaning =
        isRangeDate && isArray(defaultValue) ?
          defaultValue
            .map(item => (item ? (enLocale ? moment(item).clone().locale('en') : moment(item)).format(dateFormat) : undefined)).join(',') : (enLocale ? moment(defaultValue).clone().locale('en') : moment(defaultValue)).format(dateFormat);
    }
    return meaning;
  }

  @Bind()
  handleFieldDefalutValue(
    field: fieldProperties,
    getOriginDefaultValue = false,
  ): {
    defaultValue: any;
    defaultValueMeaning: any;
  } {
    let newDefaultValue: any = field.defaultValue;
    let newDefaultValueMeaning: any;
    if (!getOriginDefaultValue && this.fixQueryParams) {
      const {
        fieldAlias = '',
        displayField: customDisplayField,
        valueField: customValueField,
        lovInfo,
        widget,
        comparison,
        customComparisonSet,
        modelCode,
        fieldCode,
      } = field;
      const { fieldWidget = 'INPUT', multipleFlag, dateFormat } = widget || {};
      const { displayField: originDisplayField, valueField: originValueField } = lovInfo || {};
      const displayField = customDisplayField || originDisplayField;
      const valueField = customValueField || originValueField;
      if (fieldWidget === 'LOV' && this.fixQueryParams[fieldAlias] &&
        isObject(this.fixQueryParams[fieldAlias])) {
        const queryValue = this.fixQueryParams[fieldAlias];
        if (isArray(queryValue)) {
          if (checkValueValid(queryValue[0]) && isObject(queryValue[0]) &&
            checkValueValid(queryValue[0][displayField]) && checkValueValid(queryValue[0][valueField])) {
            newDefaultValue = multipleFlag !== 1 ? queryValue[0] : queryValue;
            newDefaultValueMeaning = multipleFlag !== 1 ? queryValue[0][displayField] : queryValue.map(v => v[displayField]).join(',');
          }
        } else if (checkValueValid(queryValue[displayField]) && checkValueValid(queryValue[valueField])) {
          newDefaultValue = multipleFlag !== 1 ? queryValue : [queryValue];
          newDefaultValueMeaning = queryValue[displayField];
        }
        // delete this.fixQueryParams[valueField];
        // delete this.fixQueryParams[displayField];
        this.fixQueryParamsFilterKeys.push(fieldAlias);
        // 给字段加上强制查询的标识，不受显示隐藏影响
        field.forceQuery = true;
        return {
          defaultValue: newDefaultValue,
          defaultValueMeaning: newDefaultValueMeaning,
        };
      } else if (fieldWidget === 'SELECT' && this.fixQueryParams[fieldAlias]) {
        // delete this.fixQueryParams[fieldAlias];
        this.fixQueryParamsFilterKeys.push(fieldAlias);
        // 给字段加上强制查询的标识，不受显示隐藏影响
        field.forceQuery = true;
        newDefaultValue = undefined;
        if (multipleFlag === 1) {
          if (isArray(this.fixQueryParams[fieldAlias])) {
            newDefaultValue = this.fixQueryParams[fieldAlias];
          } else if (isString(this.fixQueryParams[fieldAlias])) {
            newDefaultValue = this.fixQueryParams[fieldAlias].split(',');
          }
        } else {
          newDefaultValue = this.fixQueryParams[fieldAlias];
        }
        return {
          defaultValue: newDefaultValue,
          defaultValueMeaning: undefined,
        };
      } else if (fieldWidget === 'INPUT_NUMBER' && this.fixQueryParams[fieldAlias]) {
        if (multipleFlag === 1) {
          newDefaultValue = isString(this.fixQueryParams[fieldAlias])
            ? this.fixQueryParams[fieldAlias].split(',').map(item => (item ? parseInt(item, 10) : undefined))
            : isArray(this.fixQueryParams[fieldAlias])
              ? this.fixQueryParams[fieldAlias]
              : [];
        } else {
          newDefaultValue = parseInt(this.fixQueryParams[fieldAlias], 10);
        }
        newDefaultValueMeaning = newDefaultValue;
        // delete this.fixQueryParams[fieldAlias];
        this.fixQueryParamsFilterKeys.push(fieldAlias);
        // 给字段加上强制查询的标识，不受显示隐藏影响
        field.forceQuery = true;
        return {
          defaultValue: newDefaultValue,
          defaultValueMeaning: newDefaultValueMeaning,
        };
      } else if (fieldWidget === 'DATE_PICKER' && this.fixQueryParams[fieldAlias]) {
        newDefaultValue = this.fixQueryParams[fieldAlias];
        const format = dateFormat || DEFAULT_DATETIME_FORMAT;
        let defaultComparison = comparison;
        if (customComparisonSet && (!defaultComparison || !customComparisonSet.includes(defaultComparison))) {
          defaultComparison = customComparisonSet[0];
        }
        const isRangeDate =
          modelCode && fieldCode ? defaultComparison && ['IN', 'RANGE'].includes(defaultComparison) : multipleFlag === 1;
        if (isRangeDate) {
          newDefaultValue = isString(newDefaultValue)
            ? newDefaultValue
              .split(',')
              .map(item => (item ? moment(item).format(format) : undefined))
            : isArray(newDefaultValue)
              ? newDefaultValue
              : [];
        } else {
          newDefaultValue = moment(newDefaultValue).format(format);
        }
        newDefaultValueMeaning = newDefaultValue;
        // delete this.fixQueryParams[fieldAlias];
        this.fixQueryParamsFilterKeys.push(fieldAlias);
        // 给字段加上强制查询的标识，不受显示隐藏影响
        field.forceQuery = true;
        return {
          defaultValue: newDefaultValue,
          defaultValueMeaning: newDefaultValueMeaning,
        };
      } else if (fieldWidget === 'INPUT' && this.fixQueryParams[fieldAlias]) {
        newDefaultValue = this.fixQueryParams[fieldAlias];
        newDefaultValueMeaning = newDefaultValue;
        if (multipleFlag === 1) {
          newDefaultValue = newDefaultValue.split(',');
        }
        // delete this.fixQueryParams[fieldAlias];
        this.fixQueryParamsFilterKeys.push(fieldAlias);
        // 给字段加上强制查询的标识，不受显示隐藏影响
        field.forceQuery = true;
        return {
          defaultValue: newDefaultValue,
          defaultValueMeaning: newDefaultValueMeaning,
        };
      }
    }
    if (!getOriginDefaultValue && field.defaultValueCon?.valids && field.defaultValueCon?.valids.length > 0) {
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
        defaultValueJsonFlag,
        comparison,
        customComparisonSet,
        modelCode,
        fieldCode,
      } = field;
      // 默认值是公式时
      if (proDefaultFlag === DefaultValueType.EXPRESSION) {
        newDefaultValue = undefined;
        newDefaultValueMeaning = undefined;
        try {
          // 计算默认值
          const defaultValueFunc =
            // eslint-disable-next-line no-new-func
            new Function(
              'ctx,innerFunctionMap,getFieldValue,innerCache',
              statementToJs(field.defaultValue, this.props.searchCode).join('\r\n')
            )(this.contextParams, innerFunctionMap, this.getFieldValue, this.context.cache);
          if (typeof defaultValueFunc === 'function') {
            this.computedFieldMap.set(fieldAlias, defaultValueFunc);
          }
        } catch(e) {
          console.log(`${fieldCode} defaultValue Expresson error.`);
        }
      } else {
        const { fieldWidget = 'INPUT', sourceCode, multipleFlag, dateFormat, lovEnhanceFlag } = widget || {};
        const { displayField: originDisplayField, valueField: originValueField } = lovInfo || {};
        const displayField = customDisplayField || originDisplayField;
        const valueField = customValueField || originValueField;
        if (fieldWidget === 'LOV' && sourceCode) {
          if (lovEnhanceFlag === 1) {
            if (defaultValueJsonFlag === 1) {
              newDefaultValue = JSON.parse(defaultValue);
              newDefaultValueMeaning = undefined;
            } else {
              newDefaultValue = undefined;
              newDefaultValueMeaning = undefined;
            }
          } else if (!lovValueRecords && isString(field.defaultValue)) {
            newDefaultValue =
              multipleFlag !== 1
                ? { [displayField]: field.defaultValue, [valueField]: field.defaultValue }
                : field.defaultValue.split(',').map(v => ({ [displayField]: v, [valueField]: v }));
            newDefaultValueMeaning = field.defaultValue;
          } else if (isArray(lovValueRecords) && lovValueRecords.length > 0) {
            if (multipleFlag === 1) {
              newDefaultValue = field.defaultValue.split(',').map(i => {
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
              newDefaultValueMeaning = newDefaultValue.map(v => v[displayField]).join(',');
            } else {
              newDefaultValue = lovValueRecords[0];
              newDefaultValueMeaning = lovValueRecords[0][displayField];
            }
          } else if (isObject(lovValueRecords)) {
            if (multipleFlag === 1) {
              newDefaultValue = field.defaultValue.split(',').map(v => ({ [displayField]: lovValueRecords[v], [valueField]: v }));
              newDefaultValueMeaning = newDefaultValue.map(v => v[displayField]).join(',');
            } else {
              newDefaultValue = { [valueField]: field.defaultValue, [displayField]: lovValueRecords[field.defaultValue] };
              newDefaultValueMeaning = lovValueRecords[field.defaultValue];
            }
          } else {
            newDefaultValue = undefined;
            newDefaultValueMeaning = undefined;
          }
        } else if (fieldWidget === 'SELECT' && sourceCode) {
          if (isString(field.defaultValue)) {
            newDefaultValue =
              multipleFlag === 1 ? field.defaultValue.split(',') : field.defaultValue;
            if (isEmpty(lovValueRecords)) {
              newDefaultValueMeaning = field.defaultValue;
            } else {
              newDefaultValueMeaning = values(lovValueRecords);
              if (multipleFlag !== 1) {
                newDefaultValueMeaning = newDefaultValueMeaning[0];
              } else {
                if (
                  newDefaultValueMeaning &&
                  newDefaultValue &&
                  newDefaultValueMeaning.length < newDefaultValue.length
                ) {
                  newDefaultValueMeaning = `${newDefaultValueMeaning.join(',')}...`;
                } else {
                  newDefaultValueMeaning = newDefaultValueMeaning.join(',');
                }
              }
            }
          } else {
            newDefaultValue = undefined;
            newDefaultValueMeaning = undefined;
          }
        } else if (fieldWidget === 'INPUT_NUMBER') {
          if (multipleFlag === 1) {
            newDefaultValue = isString(defaultValue)
              ? defaultValue.split(',').map(item => (item ? parseInt(item, 10) : undefined))
              : isArray(defaultValue)
                ? defaultValue
                : [];
          } else {
            newDefaultValue = parseInt(defaultValue, 10);
          }
          newDefaultValueMeaning = newDefaultValue;
        } else if (fieldWidget === 'DATE_PICKER') {
          const format = dateFormat || DEFAULT_DATETIME_FORMAT;
          let defaultComparison = comparison;
          if (customComparisonSet && (!defaultComparison || !customComparisonSet.includes(defaultComparison))) {
            defaultComparison = customComparisonSet[0];
          }
          const isRangeDate = modelCode && fieldCode ? defaultComparison && ['IN', 'RANGE'].includes(defaultComparison) : multipleFlag === 1;
          if (isRangeDate) {
            newDefaultValue = isString(defaultValue)
              ? defaultValue
                .split(',')
                .map(item => (item ? moment(item).format(format) : undefined))
              : isArray(defaultValue)
                ? defaultValue
                : [];
          } else {
            newDefaultValue = moment(defaultValue).isValid() ? moment(defaultValue).format(format) : undefined;
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
  getShowText(filterField, record?: Record, isRangeDate?: boolean) {
    if (!record) {
      return null;
    }
    const { name, fieldWidget, multipleFlag, format, virtual } = filterField;
    const field = record.dataSet.getField(name);
    const data = record.get(name);
    if (!field || !checkValueValid(toJS(data))) {
      return null;
    }
    if (!virtual && (fieldWidget === 'DATE_PICKER' ? isRangeDate : multipleFlag === 1)) {
      return null;
    }
    const textField = field.get('textField', record);
    const valueField = field.get('valueField', record);
    let text = data;
    if (fieldWidget === 'INPUT' && multipleFlag === 1) {
      text = data.join(',');
    } else if (fieldWidget === 'LOV') {
      text = multipleFlag === 1 ? data.map(item => item[textField]).join(',') : data[textField];
    } else if (fieldWidget === 'SELECT') {
      const lookupOptions = field.getLookup(record);
      if (!lookupOptions) {
        return null;
      }
      if (multipleFlag === 1) {
        text = data
          .map(item => {
            const option = lookupOptions.find(obj => obj[valueField] == item);
            return option ? option[textField] : null;
          })
          .join(',');
      } else {
        const option = lookupOptions.find(obj => obj[valueField] == data);
        text = option ? option[textField] : null;
      }
    } else if (fieldWidget === 'DATE_PICKER') {
      const enLocale = format && format.includes('MMM');
      text = (enLocale ? moment(data).clone().locale('en') : moment(data)).format(format);
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
    return fields.find(item => item.name === fieldName);
  }

  /**
   *
   * @param param 参数key
   * @param value 参数值
   */
  @Bind()
  setFields(params) {
    if (!isEmpty(params)) {
      keys(params).forEach(fieldName => {
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
   *    单选传 {[displayField], [valueField]}
   *    多选传 [{[displayField], [valueField]}]
   *  2)范围组件类型字段:
   *    '[startValue],[endValue]'
   *  3)其他类型单选传单值，多选传数组即可
   */
  @Bind()
  setField(fieldName, fieldValue) {
    // 合并查询
    if (fieldName === MergeFieldName) {
      if (!this.searchInputDs.current) {
        this.searchInputDs.current = this.searchInputDs.create();
      }
      this.searchInputDs.current.set(MergeFieldName, fieldValue);
    } else if (this.queryDs.current && this.queryDs.getField(fieldName)) {
      const originField = this.getFilterField(fieldName);
      if (originField) {
        let transformFieldValue = fieldValue;
        if (isString(fieldValue) && RANGE_COMPONENTS.includes(originField.fieldWidget)) {
          const isRangeDate =
            originField.fieldWidget === 'DATE_PICKER' &&
            (originField.modelCode && originField.fieldCode ?
              DATE_RANGE_COMPARISON.includes(this.queryDs.current.get(getComparsionFieldName(originField.name)))
              : originField.multipleFlag === 1
            );
          if (originField.fieldWidget === 'DATE_PICKER' ? isRangeDate : originField.multipleFlag === 1) {
            transformFieldValue = transformFieldValue.split(',');
            if (transformFieldValue && transformFieldValue.length) {
              transformFieldValue = transformFieldValue.map(item => {
                if (item && isString(item)) {
                  return moment(item).isValid()? moment(item).format(originField.format || DEFAULT_DATETIME_FORMAT) : undefined;
                }
                return item;
              });
            }
          }
        }
        const record = this.queryDs.current.set(fieldName, transformFieldValue);
        if (!originField[FieldFlag.VIRTUAL]) {
          this.setRelatedFieldValue(fieldName, transformFieldValue, record);
        }
      }
    }
  }

  // 设置关联字段值
  @Bind()
  setRelatedFieldValue(fieldName, fieldValue, record: Record, method: 'set' | 'init' = 'set') {
    const originField = this.getFilterField(fieldName);
    if (!originField || !this.queryDs.current) {
      return;
    }
    const { name, fieldWidget, virtual, multipleFlag, modelCode, fieldCode } = originField;
    if (name.includes(ComparisonSetFieldSuffix)) {
      return;
    }
    const isRangeDate = fieldWidget === 'DATE_PICKER' && (modelCode && fieldCode ? DATE_RANGE_COMPARISON.includes(this.queryDs.current.get(getComparsionFieldName(name))) : multipleFlag === 1);
    if (multipleFlag !== 1 || virtual || !isRangeDate) {
      const meaing = this.getShowText(originField, record, isRangeDate);
      this.queryDs.current[method](getMeaningFieldName(name), meaing);
    }
    // 虚拟字段清空值时需同时清空原字段的值
    if (virtual && !checkValueValid(fieldValue) && fieldName.endsWith('_tmp')) {
      const originFieldName = fieldName.slice(0, fieldName.length - 4);
      this.queryDs.current[method](originFieldName, undefined);
      if (RANGE_COMPONENTS.includes(fieldWidget)) {
        // 范围类型组件需设置 开始值字段 和 结束值字段
        // 若是日期 moment 类型值，需获取到原始字符串值
        if (fieldValue instanceof moment) {
          // 取 momnent 中的原始字符串值
          // eslint-disable-next-line no-param-reassign
          fieldValue = (fieldValue as any)._i;
        }
        if (isArray(fieldValue)) {
          this.queryDs.current[method](
            getRangeBeforeFieldName(originFieldName),
            transformNilValue(fieldValue[0], '')
          );
          this.queryDs.current[method](
            getRangeAfterFieldName(originFieldName),
            transformNilValue(fieldValue[1], '')
          );
        } else if (typeof fieldValue === 'string') {
          this.queryDs.current[method](
            getRangeBeforeFieldName(originFieldName),
            transformNilValue(fieldValue.split(',')[0], '')
          );
          this.queryDs.current[method](
            getRangeAfterFieldName(originFieldName),
            transformNilValue(fieldValue.split(',')[1], '')
          );
        }
      }
    } else if (!virtual && (fieldWidget === 'DATE_PICKER' ? isRangeDate : this.checkRelatedField(originField))) {
      // 多选组件需设置管理的 tmp 字段
      this.queryDs.current[method](getTempFieldName(fieldName), fieldValue);

      if (RANGE_COMPONENTS.includes(fieldWidget)) {
        // 范围类型组件需设置 开始值字段 和 结束值字段
        // 若是日期 moment 类型值，需获取到原始字符串值
        if (fieldValue instanceof moment) {
          // 取 momnent 中的原始字符串值
          // eslint-disable-next-line no-param-reassign
          fieldValue = (fieldValue as any)._i;
        }
        if (isArray(fieldValue)) {
          this.queryDs.current[method](
            getRangeBeforeFieldName(fieldName),
            transformNilValue(fieldValue[0], '')
          );
          this.queryDs.current[method](
            getRangeAfterFieldName(fieldName),
            transformNilValue(fieldValue[1], '')
          );
        } else if (typeof fieldValue === 'string') {
          this.queryDs.current[method](
            getRangeBeforeFieldName(fieldName),
            transformNilValue(fieldValue.split(',')[0], '')
          );
          this.queryDs.current[method](
            getRangeAfterFieldName(fieldName),
            transformNilValue(fieldValue.split(',')[1], '')
          );
        } else if (fieldValue === undefined && fieldWidget === 'DATE_PICKER') {
          this.queryDs.current[method](
            getRangeBeforeFieldName(fieldName),
            ''
          );
          this.queryDs.current[method](
            getRangeAfterFieldName(fieldName),
            ''
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
        searchInputFields.forEach(field => {
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
      fields,
    } = this.state;
    let newQueryParameter = {
      customizeFilterComparison: '',
      customMergeFilterField: '',
    };
    const comparisonSetArray: string[] = [];
    // 无显示字段，不处理
    if (this.queryDs.current) {
      const queryData = this.queryDs.current.toData() || {};
      // 处理排序查询字段
      if (sortedEnabled && sortableFields.length > 0) {
        newQueryParameter[SortFieldName] = queryData[SortFieldName];
      }
      if (!isEmpty(fields)) {
        fields.forEach(item => {
          const {
            name,
            multipleFlag,
            virtual,
            customComparisonSet,
            fieldWidget,
            modelCode,
            fieldCode,
            forceQuery,
            lovEnhanceFlag,
            noComparison,
          } = item;

          // 隐藏字段不处理
          const isDisplay = displayFields.find(f => f.name === name);
          // forceQuery为true表示强制查询，不受显示隐藏影响
          if (!isDisplay && !forceQuery) {
            return;
          }
          // 虚拟字段不处理
          if (virtual) {
            return;
          }
          // 有customComparisonSet代表是扩展字段
          // 虚拟字段不处理筛选条件
          // lovEnhanceFlag 为1的即开启了高级筛选，也不处理筛选条件
          // 特殊处理，通过fieldProps设置noComparison的字段不处理筛选方式
          if (lovEnhanceFlag === 1 && fieldWidget === 'LOV' && !noComparison) {
            if (checkValueValid(queryData[name])) {
              comparisonSetArray.push(`${name}:LOV`);
            }
          } else if (!isEmpty(customComparisonSet) && modelCode && fieldCode && !noComparison) {
            const comparison = queryData[getComparsionFieldName(name)];
            if (checkComparsionWithNull(comparison)) {
              comparisonSetArray.push(`${name}:${comparison}`);
              return;
            } else if (fieldWidget === 'DATE_PICKER' && modelCode && fieldCode) {
              if (!DATE_RANGE_COMPARISON.includes(comparison) && !checkComparsionWithNull(comparison) && checkValueValid(queryData[name])) {
                comparisonSetArray.push(`${name}:${comparison}`);
              } else if (DATE_RANGE_COMPARISON.filter(i => i !== 'RANGE').includes(comparison) || (
                  comparison === 'RANGE' && (
                    checkValueValid(queryData[getRangeBeforeFieldName(name)]) ||
                    checkValueValid(queryData[getRangeAfterFieldName(name)])
                ))) {
                comparisonSetArray.push(`${name}:~`);
              }
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
        .map(i => i && i.replace('ISNULL', 'IS_NULL').replace('NOTNULL', 'NOT_NULL'))
        .join(',');
      newQueryParameter.customizeFilterComparison = comparisonSetStr;
    } else {
      newQueryParameter.customizeFilterComparison = '';
    }
    // 处理合并查询字段统一字段
    if (!isEmpty(mergeQueryParameter)) {
      const mergeFieldStr = searchInputFields.map(item => item.fieldAlias).join(',');
      newQueryParameter.customMergeFilterField = mergeFieldStr;
    } else {
      newQueryParameter.customMergeFilterField = '';
    }
    // 新查询条件覆盖原查询条件
    keys(queryParameter).forEach(paramKey => {
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
    const { name, label, multipleFlag, fieldWidget, format, type, valueField, transformValue, lovEnhanceFlag, modelCode, fieldCode } = field;
    let paramValue = queryData[name];
    // 日期类型如果是多选取 _before _after 字段的值
    if (RANGE_COMPONENTS.includes(fieldWidget)) {
      const isMonthFormat = /^(YYYY)?[-/]?MM$/.test(format);
      const comparisonField = queryData[getComparsionFieldName(name)];
      const isRangeDate = fieldWidget === 'DATE_PICKER' && (modelCode && fieldCode ? DATE_RANGE_COMPARISON.includes(comparisonField) : multipleFlag === 1);
      if (fieldWidget !== 'DATE_PICKER' ? multipleFlag === 1 : isRangeDate) {
        let startValue = transformNilValue(queryData[getRangeBeforeFieldName(name)], '');
        let endValue = transformNilValue(queryData[getRangeAfterFieldName(name)], '');
        if (comparisonField === 'PAST_ONE_MONTH') {
          startValue = moment().subtract(1, 'months').format(DEFAULT_DATETIME_FORMAT);
          endValue = moment().format(DEFAULT_DATETIME_FORMAT);
        } else if (comparisonField === 'PAST_TWO_MONTH') {
          startValue = moment().subtract(2, 'months').format(DEFAULT_DATETIME_FORMAT);
          endValue = moment().format(DEFAULT_DATETIME_FORMAT);
        } else if (comparisonField === 'PAST_THREE_MONTH') {
          startValue = moment().subtract(3, 'months').format(DEFAULT_DATETIME_FORMAT);
          endValue = moment().format(DEFAULT_DATETIME_FORMAT);
        } else if (comparisonField === 'PAST_SIX_MONTH') {
          startValue = moment().subtract(6, 'months').format(DEFAULT_DATETIME_FORMAT);
          endValue = moment().format(DEFAULT_DATETIME_FORMAT);
        } else if (comparisonField === 'PAST_ONE_YEAR') {
          startValue = moment().subtract(1, 'years').format(DEFAULT_DATETIME_FORMAT);
          endValue = moment().format(DEFAULT_DATETIME_FORMAT);
        }
        // 无时分秒格式的时间 默认拼上 00:00:00 和 23:59:59
        if (type === 'date') {
          startValue = startValue ? moment(startValue).format(getDateTimeMinFormat(format)) : '';
          endValue = endValue ? moment(endValue).format(getDateTimeMaxFormat(format)) : '';
          if (format === 'YYYY-MM') {
            startValue = startValue ? moment(startValue).startOf('M').format(getDateTimeMinFormat(format)) : '';
            endValue = endValue ? moment(endValue).endOf('M').format(getDateTimeMaxFormat(format)) : '';
          }
        }
        if (checkValueValid(startValue) || checkValueValid(endValue)) {
          // 使用 toString 将 number 类型转成字符串
          paramValue = startValue
            .toString()
            .concat(',')
            .concat(endValue);
        } else {
          paramValue = null;
        }
        if (transformValue) {
          paramValue = transformValue(paramValue, this.queryDs.current);
        }
        return { [getRangeFieldName(name)]: paramValue };
      } else if (type === 'date' && paramValue) {
        paramValue = moment(paramValue).format(DEFAULT_DATETIME_FORMAT);
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
        if (lovEnhanceFlag === 1) {
          return { [getLovProFieldName(name)]: paramValue ? JSON.stringify(paramValue) : undefined };
        } else if (multipleFlag === 1) {
          if (isEmpty(queryData[getTempFieldName(name)]) || !valueField) {
            paramValue = null;
          } else {
            const valueArr = queryData[getTempFieldName(name)].map(item => item[valueField]);
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
    if (transformValue) {
      paramValue = transformValue(paramValue, this.queryDs.current);
    }
    return { [name]: paramValue };
  }

  @Bind()
  getSortFieldValue() {
    const { currentFilter = {}, sortableFields = [], orderCount = 1 } = this.state;
    const { defaultSortedField = '', defaultSortedOrder = 'asc' } = currentFilter;
    if (!defaultSortedField || !sortableFields.length) {
      return undefined;
    }
    if (orderCount === 1) {
      return `${defaultSortedField.split(',')[0]}:${defaultSortedOrder.split(',')[0]}`;
    } else {
      return defaultSortedField
        .split(',')
        .map((field, index) => `${field}:${defaultSortedOrder.split(',')[index] || 'asc'}`)
        .join(',');
    }
  }

  @Bind()
  setQueryDs(queryFields) {
    const { sortableFields = [] } = this.state;
    // 处理排序字段
    if (sortableFields.length > 0 && !this.queryDs.getField(SortFieldName)) {
      this.queryDs.addField(SortFieldName, {
        name: SortFieldName,
        type: FieldType.string,
        defaultValue: this.getSortFieldValue(),
      });
    }
    if (!isEmpty(queryFields)) {
      queryFields.forEach(item => {
        const { name, defaultValueMeaning } = item;
        this.queryDs.addField(name, {
          ...item,
          type:
            !item[FieldFlag.VIRTUAL] &&
              item.fieldWidget !== 'DATE_PICKER' && item.multipleFlag === 1 &&
              RANGE_COMPONENTS.includes(item.fieldWidget)
              ? 'string'
              : item.type,
        });

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
  setSearchInputDs(cacheFlag?: boolean) {
    const { searchInputFields } = this.state;
    if (!isEmpty(searchInputFields) && !this.searchInputDs.current) {
      if (cacheFlag) {
        const { searchInputDsData } = this.cacheData;
        this.searchInputDs.create(!isEmpty(searchInputDsData) ? searchInputDsData : {});
      } else if (!isEmpty(omit(this.fixQueryParams, this.fixQueryParamsFilterKeys))) {
        const targetField = searchInputFields.find(field => !!this.fixQueryParams[field.fieldAlias]);
        if (targetField) {
          this.searchInputDs.loadData([{
            [MergeFieldName]: this.fixQueryParams[targetField.fieldAlias],
          }]);
          searchInputFields.forEach(field => {
            // delete this.fixQueryParams[field.fieldAlias];
            this.fixQueryParamsFilterKeys.push(field.fieldAlias);
          });
        }
      }
    }
  }

  @Bind()
  setCustomizeDs() {
    const customizeParams = omit(this.fixQueryParams, this.fixQueryParamsFilterKeys);
    if (!isEmpty(customizeParams)) {
      // 若 customizeDs 已存在record， 则合并路径参数
      if (this.customizeDs.current) {
        Object.keys(customizeParams).forEach(paramKey => {
          this.customizeDs.current!.init(paramKey, customizeParams[paramKey]);
        });
      } else {
        this.customizeDs.create(omit(this.fixQueryParams, this.fixQueryParamsFilterKeys));
      }
    } else if (this.props.customizeDsAutoCreate) {
      this.customizeDs.create(omit(this.fixQueryParams, this.fixQueryParamsFilterKeys));
    }
  }

  @Bind()
  handleRefresh(event: MouseEvent) {
    this.checkDataSetBeforeAction(() => {
      if (event.target && !this.state.manualQuery) {
        const iconEl: HTMLElement =
          (event.target as HTMLElement).querySelector('i') || (event.target as HTMLElement);
        if (iconEl) {
          iconEl.style.animation = 'none';
          setTimeout(() => {
            iconEl.style.animation = 'rotateImg 0.3s linear';
          }, 100);
        }
      }
      this.handleQuery(true);
      if (this.props.onRefresh) {
        this.props.onRefresh();
      }
    });
  }

  // 校验get请查询参数长度是否超过限制
  @Bind()
  checkParamsLengthValid(params) {
    const { dataSet, paramMaxLength = 2000 } = this.props;
    if (dataSet && dataSet[0] && dataSet[0].transport && dataSet[0].transport.read) {
      let readConfig: any = dataSet[0].transport.read;
      if (typeof readConfig === 'function') {
        readConfig = readConfig({ data: {}, params: {}, dataSet: dataSet[0] });
      }
      if (readConfig && readConfig.method && readConfig.method.toLowerCase() === 'get') {
        const paramsString = Object.keys(params).map(i => `${i}=${JSON.stringify(params[i])}`).join('&');
        if (paramsString.length > paramMaxLength) {
          notification.error({
            message: intl.get('hzero.common.status.mistake').d('错误'),
            description: intl.get('hzero.common.view.message.queryParameterLengthTooLong').d('查询参数超长，请调整查询条件'),
          });
          return false;
        }
      }
    }
    return true;
  }

  /**
   * 查询
   * @param force true-强制查询
   */
  @Bind()
  @Debounce(300)
  async handleQuery(force: boolean = false) {
    const {
      displayFields,
      fields,
    } = this.state;
    // 还原清空操作标识
    this.cleanFlag = false;
    this.setState({ cleanFlag: false });
    // 校验通过再查询
    const flag = await this.queryDs.validate();
    if (!flag) {
      // ds校验没通过，重新对展示字段进行校验
      const result = displayFields.some(item => {
        return !this.queryDs.getField(getFieldName({ dataSet: this.queryDs, field: item }))?.isValid(this.queryDs.current);
      });
      // 展示字段校验不通过则不查询
      if (result) {
        return;
      }
    }
    const { autoQuery = true } = this.props;
    const {
      queryParameter: oldQueryParameter,
      cacheFlag,
      initFlag,
      currentFilter,
    } = this.state;
    let queryParameter = this.getQueryParameter();
    // 初始化和强制查询时不判断，直接查询
    if (!initFlag && !force) {
      // 查询参数是否发生改变
      if (isObjectEqual(oldQueryParameter, queryParameter)) {
        return;
      } else {
        this.setState({ changeFlag: true });
      }
    }
    if (this.customizeDs.current) {
      queryParameter = Object.assign(
        queryParameter,
        omit(this.customizeDs.current.toData(), ['__dirty'])
      );
    }
    // cacheflag仅在第一次查询前为true
    this.setState({ queryParameter, initFlag: false, cacheFlag: false });
    const { dataSet } = this.props;
    dataSet.forEach(ds => {
      if (!ds.queryDataSet) {
        // eslint-disable-next-line no-param-reassign
        ds.queryDataSet = new DataSet();
      }
    });
    const { beforeQuery, onQuery } = this.props;
    let params = filterNullValueObject(queryParameter);
    if (this.fixQueryParams) {
      params = {
        ...omit(this.fixQueryParams, this.fixQueryParamsFilterKeys),
        ...params,
      };
    }
    const filter = currentFilter;
    if (beforeQuery) {
      const queryFlag = await beforeQuery({
        params,
        filter,
        fields: filterTempFields(fields),
        dataSet: this.queryDs,
      });
      if (!queryFlag) {
        return;
      }
    }
    this.handleDataSetLoading(false);
    // 给dataSet打标记
    dataSet.forEach(ds => {
      if (ds) {
        ds.setState('queryStatus', 'ready');
      }
    });
    // 强制查询忽略关闭首次自动查询
    if (force) {
      this.firstFlag = false;
    } else if (this.firstFlag && !autoQuery) {
      // 关闭自动查询仅首次查询生效
      this.firstFlag = false;
      return;
    }
    // 校验get请求查询参数长度
    if (!this.checkParamsLengthValid(params)) {
      return;
    }
    if (onQuery) {
      onQuery({
        params,
        filter,
        fields: filterTempFields(fields),
        dataSet: this.queryDs,
        currentPage: !force && cacheFlag && dataSet[0] ? dataSet[0].currentPage : undefined,
      });
    } else {
      dataSet.forEach(ds => {
        if (ds.queryDataSet) {
          ds.queryDataSet.loadData([params]);
          // 解决缓存问题
          ds.query(!force && cacheFlag ? ds.currentPage : undefined);
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
    let displayFields: fieldProperties[] = []; // 显示字段,包含固定字段
    let optionalFields: fieldProperties[] = []; // 可选
    let lockFields: fieldProperties[] = []; // 固定字段
    const invisibleFields: fieldProperties[] = []; // 不显示的,在可选的基础上去掉已勾选显示的字段
    //  const searchInputFields: fieldProperties[] = []; // 输入框内
    const sortableFields: fieldProperties[] = []; // 可排序字段
    fields.forEach(item => {
      if (item[FieldFlag.VIRTUAL]) {
        return;
      }
      if (item[FieldFlag.SORT]) {
        sortableFields.push(item);
      }
      if (item.fieldVisible !== 1) {
        return;
      }
      if (item[FieldFlag.LOCK]) {
        lockFields.push(item);
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
      searchInputFields.forEach(item => {
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
    lockFields = sortFields(lockFields, 'num'); // 对固定的显示字段做排序
    displayFields = sortFields(displayFields, 'num'); // 对非固定的显示字段做排序
    displayFields = [...lockFields, ...displayFields]; // 固定字段排在最前面
    optionalFields = sortFields(optionalFields, 'gridSeq'); // 对可选字段做排序
    return { displayFields, optionalFields, invisibleFields, sortableFields };
  }

  /**
   * 筛选字段选择回调
   * @param field 当前选中的字段
   */
  @Bind()
  handleSelectField(field: fieldProperties) {
    const { name, display: oldDisplay, multipleFlag, fieldWidget = 'INPUT' } = field;
    const { fields = [], displayFields = [], optionalFields = [], manualQuery } = this.state;
    const targetField = optionalFields.find(item => item.name === name);
    if (targetField) {
      const display = !oldDisplay;
      if (display) {
        // 增加显示字段时设置当前编辑字段，否则置空
        this.setState({ currentField: display ? field : {} });
      }
      targetField.display = display;
      const newFields = fields.map(item => ({
        ...item,
        display: item.name === field.name ? display : item.display,
      }));
      let newDisplayFields = displayFields;
      if (targetField.display) {
        newDisplayFields.push({ ...field, display });
        if (this.queryDs.current) {
          const comparsionFieldName = this.queryDs.current.get(getComparsionFieldName(name));
          // 若隐藏字段有默认值，需触发查询
          const hasValueOrComparsionFlag =
            !!this.queryDs.current.get(name) ||
            checkComparsionWithNull(comparsionFieldName)
          || DATE_RANGE_COMPARISON.filter(i => i !== 'RANGE').includes(comparsionFieldName);
          if (hasValueOrComparsionFlag && !manualQuery) {
            this.handleQuery();
          }
        }
      } else {
        if (this.queryDs.current) {
          if (multipleFlag === 1 || fieldWidget === 'DATE_PICKER') {
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
          const comparsionFieldName = this.queryDs.current.get(getComparsionFieldName(name));
          // 筛选条件是为空，非空时且未填值的时候 需要强制查询
          if (!manualQuery && (
            checkComparsionWithNull(comparsionFieldName) || DATE_RANGE_COMPARISON.filter(i => i !== 'RANGE').includes(comparsionFieldName)
          )) {
            this.handleQuery();
          }
        }
        newDisplayFields = newDisplayFields.filter(item => item.name !== name);
      }
      // 变动筛选器时清空缓存
      this.handleResetCache();
      // 已展示字段重新排序
      newDisplayFields.forEach((item, index) => {
        item.num = 10 * index + 1;
      });
      this.setState({
        fields: newFields,
        displayFields: newDisplayFields,
        invisibleFields: optionalFields.filter(item => !item[FieldFlag.DISPLAY]),
        changeFlag: true,
      });
    }
  }

  /**
   * 筛选字段全选回调
   */
  @Bind()
  handleSelectAllField(selectFields: fieldProperties[]) {
    const { fields = [], displayFields = [], optionalFields = [], manualQuery } = this.state;
    // 非固定字段
    const noLockFields = displayFields.filter(item => !item[FieldFlag.LOCK]);
    if (!isEmpty(optionalFields)) {
      if (!isEmpty(noLockFields) && noLockFields.length === optionalFields.length) {
        return;
      }
      let selectableFields = selectFields;
      let newFields = fields;
      let newOptionalFields = optionalFields;
      let newDisplayFields = displayFields;
      if (selectableFields && selectableFields.length > 0) {
        newOptionalFields = optionalFields.map(item => ({
          ...item,
          display: selectableFields.some(f => f.name === item.name) ? true : item.display,
        }));
        newFields = fields.map(item => ({
          ...item,
          display:
            selectableFields && selectableFields.some(f => f.name === item.name)
              ? true
              : item.display,
        }));
        selectableFields = selectableFields.map(item => ({ ...item, display: true }));
        if (this.queryDs.current) {
          // 若隐藏字段有默认值，需触发查询
          const hasValueOrComparsionFlag = selectableFields.some(
            item =>
              !!this.queryDs.current &&
              (!!this.queryDs.current.get(item.name) ||
                !!checkComparsionWithNull(
                  this.queryDs.current.get(getComparsionFieldName(item.name))
                ))
          );
          if (hasValueOrComparsionFlag && !manualQuery) {
            this.handleQuery();
          }
        }
        // 去重
        newDisplayFields = unionWith(displayFields, selectableFields, (a, b) => a.name === b.name);
        // 已展示字段重新排序
        newDisplayFields.forEach((item, index) => {
          item.num = 10 * index + 1;
        });
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
    this.setState({ cleanFlag: true });
    const { displayFields, changeFlag, manualQuery } = this.state;
    const { onClear } = this.props;
    const action = () => {
      let newChangeFlag = changeFlag;
      // 清空
      this.searchInputDs.loadData([{}]);
      this.customizeDs.reset();
      // this.customizeDs.loadData([{}]);
      if (this.fixQueryParams) {
        this.fixQueryParamsFilterKeys = keys(this.fixQueryParams);
      }
      if (!isEmpty(displayFields)) {
        displayFields.forEach(item => {
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
          if (!manualQuery) {
            this.handleQuery();
          }
          if (onClear) {
            onClear();
          }
        }
      );
    };
    // 清空时判断合并查询框字段、所有显示的筛选字段以及自定义区域字段是否有值
    const flag =
      (this.searchInputDs.current && !isEmpty(omit(this.searchInputDs.current.toData(), ['__dirty']))) ||
      (this.customizeDs.current && !isEmpty(omit(this.customizeDs.current.toData(), ['__dirty']))) ||
      (displayFields
        && displayFields.length > 0
        && displayFields.some(
          field =>
            this.queryDs.current &&
            !isEmpty(this.queryDs.current.get(getFieldName({ record: this.queryDs.current, field })))));
    if (flag) {
      this.cleanFlag = true;
      this.checkDataSetBeforeAction(action);
    } else {
      action();
    }
  }

  /**
   * 重置筛选器字段值
   */
  @Bind()
  handleResetFilter() {
    this.checkDataSetBeforeAction(() => {
      const { onReset } = this.props;
      const { originFields, currentFilter, manualQuery } = this.state;
      const fields = cloneDeep(originFields);
      this.setState(
        {
          ...this.getFieldType(fields),
          fields,
          currentFilter: {
            ...currentFilter,
          },
          changeFlag: false,
          initFlag: true,
        },
        () => {
          // 变动筛选器时 清空缓存
          this.handleResetCache();
          // 重置
          this.setQueryDs(fields);
          this.queryDs.create();
          // 清空
          this.searchInputDs.loadData([{}]);
          this.customizeDs.reset();
          if (this.fixQueryParams) {
            this.fixQueryParamsFilterKeys = keys(this.fixQueryParams);
          }
          // this.setSearchInputDs();
          // this.setCustomizeDs();
          if (!manualQuery) {
            this.handleQuery(true);
          }
          // 重置排序
          if (this.sortSelectorRef && this.sortSelectorRef.handleReset) {
            this.sortSelectorRef.handleReset();
          }
          if (onReset) {
            onReset();
          }
        }
      );
    });
  }

  /**
   * 获取lov字段值
   * @param field 字段
   */
  @Bind()
  getLovFieldValue(field) {
    let fieldValue;
    const { multipleFlag, name, lovInfo = {}, lovEnhanceFlag } = field;
    const { valueField: originValueField } = lovInfo;
    let queryData = {};
    if (this.queryDs.current) {
      queryData = this.queryDs.current.toData();
    }
    if (lovEnhanceFlag === 1) {
      fieldValue = checkValueValid(queryData[name]) ? JSON.stringify(queryData[name]) : null;
    } else if (multipleFlag === 1 && checkValueValid(queryData[getTempFieldName(name)])) {
      fieldValue = queryData[getTempFieldName(name)].map(item => item[originValueField]).join(',');
    } else if (checkValueValid(queryData[name])) {
      fieldValue = (queryData[name] || {})[originValueField];
    }
    return fieldValue;
  }

  @Bind()
  getFieldValue(fieldName) {
    const { searchInputFields, fields } = this.state;
    const queryFieldTmp = fields.find(item => item.name === fieldName);
    if (queryFieldTmp) {
      return this.queryDs.current?.get(queryFieldTmp.name);
    } else {
      const searchInputFieldTmp = searchInputFields.find(item => item.name === fieldName);
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
    const { multipleFlag, name, fieldWidget, originDefaultValue, proDefaultFlag, modelCode, fieldCode } = field;
    const queryParameter = this.getQueryParameter();
    let newValue: any = queryParameter[name];
    // 公式类型默认值 要还原成公式
    if (proDefaultFlag === 1) {
      newValue = originDefaultValue;
    } else if (fieldWidget === 'LOV') {
      // 获取当前字段值
      newValue = this.getLovFieldValue(field);
    } else if (fieldWidget === 'DATE_PICKER') {
      const isRangeDate =
        fieldWidget === 'DATE_PICKER'
        && (modelCode && fieldCode
              ? DATE_RANGE_COMPARISON.includes(this.queryDs.current!.get(getComparsionFieldName(name)))
              : multipleFlag === 1);
      newValue = isRangeDate ? queryParameter[getRangeFieldName(name)] : queryParameter[name];
    } else if (multipleFlag === 1) {
      // 多选字段 如果是模型字段需要取带range的字段，虚拟字段直接根据name取就行
      newValue = (checkValueValid(fieldCode) && checkValueValid(modelCode)) ? queryParameter[getRangeFieldName(name)] : queryParameter[name];
    }
    return newValue;
  }

  @Bind()
  handleSaveFilterParam(filter) {
    const { searchCode } = this.props;
    const { fields, displayFields, originFields, defaultFilter, config = {} } = this.state;
    const { isNew, isNewDefault, type, _status, allFields = [] } = filter;
    const { customFilters, systemFilters } = config;
    let data = {};
    if (this.queryDs.current) {
      data = this.queryDs.current.toData();
    }
    let saveFields: fieldProperties[] = [];
    originFields.forEach(item => {
      if (item[FieldFlag.VIRTUAL]) {
        return;
      }
      const target = fields.find(field => item.name === field.name);
      if (target) {
        const displayTarget = displayFields.find(i => i.name === target.name);
        const { defaultValue } = item;
        let newField;
        const newValue: any = this.getFieldSavedValue(target);
        // 另存为即新建时, 只保存显示字段
        if (isNew) {
          newField = allFields.find(i => i.fieldAlias === target.name);
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
          } else if (displayTarget && target.num !== displayTarget.num) {
            // 比较显示字段的rank序号，改变则更新字段
            fieldStatus = FilterStatus.UPDATE;
          }
          if (fieldStatus) {
            newField = allFields.find(i => i.fieldAlias === target.name);
          }
          if (newField) {
            const { customComparisonSet, fieldAlias } = newField;
            if (!isEmpty(customComparisonSet) && data[getComparsionFieldName(item.name)]) {
              newField.comparison = data[getComparsionFieldName(item.name)];
            }
            const saveFieldProps = {
              ...newField,
              fieldAlias,
              name: fieldAlias,
              defaultValue: newValue,
              defaultValueMeaning: null,
              lovValueRecords: null,
              _status: fieldStatus,
              usedFlag: fieldStatus === 'create' ? 1 : newField.usedFlag,
              proDefaultFlag: target.proDefaultFlag,
            };
            // 设为默认筛选器器或重命名时，去掉字段的_status，防止页面未刷新导致字段重复新建
            // isNew为false表示重命名
            if (isNewDefault || isNew === false) {
              delete saveFieldProps._status;
            }
            saveFields.push(saveFieldProps);
          }
        }
      }
    });
    saveFields = this.setDisplayFieldsRank(saveFields);
    const params = omit(filter, '_token', 'tlMaps', 'isNew');
    const newFilter: filterProperties = {
      ...params,
      allFields: saveFields.map(item => omit(item, '_token')),
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
        newSystemFilter = newSystemFilter.map(item => {
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
        newCustomFilter = newCustomFilter.map(item => {
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
        newSystemFilter = newSystemFilter.map(item => {
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
        newCustomFilter = newCustomFilter.map(item => {
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
  async saveFilter(filter, onSuccess?: Function, onError?: Function) {
    const { searchCode, isTemplate, templateConfig } = this.props;
    const { currentFilter, filterList = [] } = this.state;
    const { isNew, isNewDefault } = filter;
    const param = this.handleSaveFilterParam(filter);
    const result = await saveFilters(param, isTemplate && templateConfig ? templateConfig : undefined);
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
      // 重命名或设置默认筛选器时由于存在暂存字段，故不刷新
      if (isNew !== false && !isNewDefault) {
        this.setState({
          changeFlag: false,
        });
      }
      const { customFilters } = res[searchCode];
      let newCurrentFilter = currentFilter;
      if (isNew && customFilters && customFilters.length > 0) {
        // 找出新建的
        const newCreateFilter = customFilters.find(cf =>
          filterList.every(fl => fl.filterCode !== cf.filterCode)
        );
        if (newCreateFilter) {
          newCurrentFilter = newCreateFilter;
        }
      }
      this.initConfig(res, isNew ? newCurrentFilter : undefined, isNew === false || isNewDefault);
      if (onSuccess) {
        onSuccess();
      }
    }
  }

  @Bind()
  saveCurrentFilter(isNew: boolean = false) {
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
    const defaultSortedField = sortField.split(',').map(i => i.split(':')[0]).join(',');
    const defaultSortedOrder = sortField.split(',').map(i => i.split(':')[1]).join(',');
    return {
      ...currentFilter,
      filterName: newFilterName,
      _tls: newFilterNameTls,
      type: isNew ? FilterType.CUSTOM : type,
      _status: isNew ? FilterStatus.CREATE : FilterStatus.UPDATE,
      defaultFlag: isNew ? 0 : currentFilter.defaultFlag,
      defaultSortedField,
      defaultSortedOrder,
    };
  }

  @Bind()
  @Debounce(500)
  async saveFilterConfig(isNew: boolean = false) {
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
  updateFieldOptionsProps(allFields: fieldProperties[] = []) {
    return allFields.map(item => {
      if (item.display) {
        const { fieldWidget, lovCode, fieldCode } = item;
        if (fieldWidget === 'LOV') {
          const patchConfig = this.getLovPatchConfig(lovCode);
          if (patchConfig) {
            let type = 'string';
            if (patchConfig.options && patchConfig.options[0]) {
              type = typeof patchConfig.options[0].value;
            }
            const { name } = patchConfig;
            let paramsValue = this.lovPatchParams[fieldCode || '']?.[name];
            if (!isNil(paramsValue)) {
              paramsValue = type === 'number' ? Number(paramsValue) : paramsValue;
              item.optionsProps = {
                queryParameter: {
                  [name]: paramsValue,
                },
              };
            }
          }
        }
      }
      return item;
    });
  }

  @Bind()
  setDisplayFieldsRank(allFields: fieldProperties[] = []) {
    // 处理排序rank
    const { displayFields = [] } = this.state;
    const tmpRankFilterFields: fieldProperties[] = [];
    displayFields.forEach((item, index) => {
      const target = allFields.find(field => field.name && field.name === item.name);
      if (target) {
        tmpRankFilterFields.push({
          ...target,
          num: index * 10 + 1,
        });
      }
    });
    return allFields.map(item => {
      const target = tmpRankFilterFields.find(field => field.name && field.name === item.name);
      return target || item;
    });
  }

  @Bind()
  handleRenameFilter(filter) {
    this.openEditModal(false, filter);
  }

  // 清除已选
  @Bind()
  handleClearSelected() {
    const { displayFields = [], optionalFields = [], manualQuery } = this.state;
    if (!isEmpty(optionalFields)) {
      let hasComparsionFlag = false;
      optionalFields.map(item => {
        const { name, multipleFlag, fieldWidget = 'INPUT' } = item;
        if (this.queryDs.current) {
          if (multipleFlag === 1 || fieldWidget === 'DATE_PICKER') {
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
      if (hasComparsionFlag && !manualQuery) {
        this.handleQuery();
      }
      const newDisplayFields = displayFields.filter(item => item[FieldFlag.LOCK]);
      // 变动筛选器时清空缓存
      this.handleResetCache();
      this.setState({
        displayFields: newDisplayFields,
        invisibleFields: optionalFields.filter(item => !item[FieldFlag.DISPLAY]),
        changeFlag: true,
      });
    }
  }

  @Bind()
  openEditModal(isNew = false, filter: filterProperties = {}) {
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
      const { filterName, _token } = filter as filterProperties;
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
  checkDataSetBeforeAction(onOk?: Function, onCancel?: Function) {
    const { dataSet, checkDataSetStatus } = this.props;
    if (!checkDataSetStatus) {
      if (onOk) {
        onOk();
      }
      return;
    }
    const modifyDs = dataSet.filter(ds => !isEmpty(ds.created) || !isEmpty(ds.updated) || !isEmpty(ds.destroyed));
    if (modifyDs.length > 0) {
      Modal.confirm({
        title: intl.get('srm.filterBar.view.title.confirmActionTitle').d('提示'),
        children: intl.get('srm.filterBar.view.title.confirmAction').d('当前操作将会清空变更过的数据，是否继续？'),
        onOk: () => {
          // 刷新时返回第一页
          dataSet.forEach(ds => {
            if (ds) {
              ds.currentPage = 1;
            }
          });
          if (onOk) {
            onOk();
          }
        },
        onCancel: () => {
          if (onCancel) {
            onCancel();
          }
        },
      });
    } else {
      if (onOk) {
        onOk();
      }
    }
  }

  @Bind()
  async handleEditModalOk(formDs: DataSet, isNew: boolean, filter: filterProperties) {
    const currentLanguage = getCurrentLanguage();
    const flag = await formDs.validate();
    if (!flag) {
      return;
    }
    const { type } = filter;
    let newFilterName;
    let newFilterNameTls: any;
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
    const defaultSortedField = sortField.split(',').map(i => i.split(':')[0]).join(',');
    const defaultSortedOrder = sortField.split(',').map(i => i.split(':')[1]).join(',');
    const newFilter = {
      ...filter,
      isNew,
      filterName: newFilterName,
      _tls: newFilterNameTls,
      type: isNew ? FilterType.CUSTOM : type,
      _status: isNew ? FilterStatus.CREATE : FilterStatus.UPDATE,
      defaultFlag: isNew ? 0 : filter.defaultFlag,
      defaultSortedField,
      defaultSortedOrder,
      tenantId: getCurrentOrganizationId(),
      userId: getCurrentUserId(),
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
    const { cacheState, searchCode } = this.props;
    const { initFlag } = this.state;
    if (!cacheState || initFlag) {
      return;
    }
    this.setState({
      cacheFlag: false,
    });
    resetSearchBarCache(searchCode, this.cacheKey, true);
  }

  @Bind()
  getShowSortSelectorFlag(): boolean {
    const { sortedEnabled, sortableFields = [] } = this.state;
    return sortedEnabled && sortableFields.length > 0;
  }

  @Bind()
  checkFieldNeedClear(): boolean {
    const { displayFields } = this.state;
    let flag = false;
    if (!isEmpty(displayFields)) {
      flag = displayFields.some(
        field =>
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
  handleKeyDown(event) {
    if (event.keyCode === 13) {
      this.handleQuery(true);
    }
  }

  @Bind()
  renderFields() {
    const { expandable = true, closeFilterSelector, searchCode } = this.props;
    const { currentField, displayFields, optionalFields, comparisonSetObj, initFlag, cleanFlag, cacheFlag, manualQuery } = this.state;
    return (
      <div style={{ lineHeight: '40px' }}>
        {(closeFilterSelector || !expandable) ? (
          <>
            {this.renderCustomLeft()}
            {this.renderMergeSearchInput()}
          </>
        ) : null}
        {!isEmpty(displayFields) &&
          displayFields.map(field => (
            <Field
              key={field.name}
              autoFocus={currentField.name === field.name}
              dataSet={this.queryDs}
              field={field}
              comparisonSetObj={comparisonSetObj}
              onDelete={this.handleSelectField}
              onAction={this.checkDataSetBeforeAction}
              updateLovPatchQueryParam={this.updateLovPatchQueryParam}
              cacheFlag={cacheFlag}
              initFlag={initFlag}
              cleanFlag={cleanFlag}
              searchCode={searchCode}
              cacheData={this.cacheData}
              showUserPerferFormat={this.showUserPerferFormat}
            />
          ))}
        <FieldSelector
          displayFields={displayFields}
          optionalFields={optionalFields}
          queryDs={this.queryDs}
          onClearSelected={this.handleClearSelected}
          onAllSelected={this.handleSelectAllField}
          onSelectField={this.handleSelectField}
          onAction={this.checkDataSetBeforeAction}
        />
        {(!expandable || closeFilterSelector) && (
          manualQuery ? (
            <>
              <Button
                className={`${stylePrefix}-operator-btn ${stylePrefix}-operator-btn-manual`}
                color={ButtonColor.primary}
                onClick={this.handleRefresh}
              >
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
              <Button
                className={`${stylePrefix}-operator-btn ${stylePrefix}-operator-btn-manual`}
                onClick={this.handleCleanFilter}
              >
                {intl.get('hzero.common.button.clear').d('清空')}
              </Button>
            </>
          ) : this.renderFixButtons()
        )}
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
          .map(item => item.fieldName)
          .join(intl.get('srm.filterBar.view.message.separator').d('、')),
      })
      .d(
        `请输入${searchInputFields
          .map(item => item.fieldName)
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
          {typeof left.render === 'function' && left.render(currentFilter, this.customizeDs)}
        </div>
        <Divider type="vertical" style={{ background: '#ccc' }} />
      </>
    );
  }

  @Bind()
  renderFixButtons() {
    const { refreshButton } = this.props;
    return (
      <>
        <Divider type="vertical" style={{ margin: '0 0.02rem', background: '#ccc' }} />
        <Tooltip title={intl.get('hzero.common.button.clear').d('清空')}>
          <Icon
            style={{ fontSize: '14px' }}
            type='cleaning_services'
            className={`${stylePrefix}-operator-icon`}
            onClick={this.handleCleanFilter}
          />
        </Tooltip>
        {refreshButton && (
          <Tooltip title={intl.get('hzero.common.button.refresh').d('刷新')}>
            <span className={`${stylePrefix}-operator-icon`} onClick={this.handleRefresh}>
              <img alt={intl.get('hzero.common.button.refresh').d('刷新')} src={RefreshIcon} />
            </span>
          </Tooltip>
        )}
      </>
    );
  }

  @Bind()
  renderButtons() {
    const { expand, changeFlag, currentFilter, manualQuery } = this.state;
    if (manualQuery) {
      return (
        <>
          <Button
            className={`${stylePrefix}-operator-btn ${stylePrefix}-operator-btn-manual`}
            color={ButtonColor.primary}
            onClick={this.handleRefresh}
          >
            {intl.get('hzero.common.button.search').d('查询')}
          </Button>
          <Tooltip title={intl.get('srm.filterBar.view.button.clean.tip').d('清空当前所有筛选条件参数')}>
            <Button
              className={`${stylePrefix}-operator-btn ${stylePrefix}-operator-btn-manual`}
              onClick={this.handleCleanFilter}
            >
              {intl.get('hzero.common.button.clear').d('清空')}
            </Button>
          </Tooltip>
          <ResetButton
            changeFlag={changeFlag}
            dataSet={this.customizeDs}
            handleClick={this.handleResetFilter}
            className={`${stylePrefix}-operator-btn-manual`}
          />
          {changeFlag && (
            <>
              <Button
                className={`${stylePrefix}-operator-btn ${stylePrefix}-operator-btn-manual`}
                onClick={() => this.openEditModal(true, currentFilter)}
              >
                {intl.get('srm.filterBar.view.button.saveAs').d('另存为')}
              </Button>
              {currentFilter && currentFilter.type !== FilterType.SYSTEM ? (
                <Button
                  className={`${stylePrefix}-operator-btn ${stylePrefix}-operator-btn-manual`}
                  onClick={() => this.saveFilterConfig()}
                >
                  {intl.get('hzero.common.button.save').d('保存')}
                </Button>
              ) : null}
            </>
          )}
          <Divider type="vertical" style={{ margin: '0 0.08rem', background: '#ccc' }} />
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
    return (
      <>
        {changeFlag ? (
          <>
            <Button
              className={`${stylePrefix}-operator-btn`}
              onClick={() => this.openEditModal(true, currentFilter)}
            >
              {intl.get('srm.filterBar.view.button.saveAs').d('另存为')}
            </Button>
            {currentFilter && currentFilter.type !== FilterType.SYSTEM ? (
              <Button
                className={`${stylePrefix}-operator-btn`}
                onClick={() => this.saveFilterConfig()}
              >
                {intl.get('hzero.common.button.save').d('保存')}
              </Button>
            ) : null}
          </>
        ) : null}
        <ResetButton
          changeFlag={changeFlag}
          dataSet={this.customizeDs}
          handleClick={this.handleResetFilter}
        />
        {this.renderFixButtons()}
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
          <CollpaseFilter expand={expand} handleExpand={this.handleExpand} />
          {!isEmpty(tableButtons) && !isEmpty(dataSet) ? (
            <>
              <Divider type="vertical" style={{ margin: '0 0.02rem', background: '#ccc' }} />
              <TableButtonRenderer
                dataSet={dataSet[0]}
                tableRef={tableRef}
                tableMode={tableMode}
                buttons={tableButtons}
              />
            </>
          ) : null}
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
    const { currentFilter, sortedEnabled, sortableFields = [], orderCount } = this.state;
    const { right } = this.props;
    const showSorterFlag = this.getShowSortSelectorFlag();
    const hasRightRender = right && typeof right.render === 'function';
    const rightRender = hasRightRender && right && right.render ? right.render(currentFilter, this.customizeDs) : null;
    return (
      <div
        className={`${stylePrefix}-operator-right`}
        style={{ display: hasRightRender|| sortedEnabled ? 'block' : 'none' }}
      >
        {showSorterFlag ? (
          <SortSelector
            onRef={this.handleSortSelectorRef}
            filter={currentFilter}
            fields={sortableFields}
            dataSet={this.queryDs}
            onAction={this.checkDataSetBeforeAction}
            orderCount={orderCount}
          />
        ) : null}
        {rightRender ? (
          <>
            {showSorterFlag ? (
              <Divider type="vertical" style={{ margin: '0 0.16rem', background: '#ccc' }} />
            ) : null}
            {rightRender}
          </>
        ) : null}
      </div>
    );
  }

  render() {
    const { expand, loading } = this.state;
    const { dataSet = [], expandable = true, showLoading = true, tableButtons, tableRef, tableMode, closeFilterSelector } = this.props;
    const headerLeft = this.renderHeaderLeft();
    const headerRight = this.renderHeaderRight();
    const wrapClsName = classnames(stylePrefix, {
      [`${stylePrefix}-expand`]: expand,
      [`${stylePrefix}-expandable`]: expandable,
      [`${stylePrefix}-unexpandable`]: !expandable,
    });
    if (expandable) {
      return (
        <div className={wrapClsName} tabIndex={-1} onKeyDown={this.handleKeyDown}>
          {showLoading && <SearchBarSpin dataSet={dataSet} loading={loading} />}
          <div className={`${stylePrefix}-left`}>
            <div className={`${stylePrefix}-operator`}>
              {headerLeft}
              {headerRight}
            </div>
            {expand && <div className={`${stylePrefix}-fields`}>{this.renderFields()}</div>}
            {!closeFilterSelector && !isEmpty(tableButtons) && !isEmpty(dataSet) ? (
              <div>
                <TableButtonRenderer
                  dataSet={dataSet[0]}
                  tableRef={tableRef}
                  tableMode={tableMode}
                  buttons={tableButtons as Buttons[]}
                />
              </div>
            ) : null}
          </div>
        </div>
      );
    } else {
      return (
        <>
          <div className={wrapClsName} tabIndex={-1} onKeyDown={this.handleKeyDown}>
            <SearchBarSpin dataSet={dataSet} loading={loading} />
            <div className={`${stylePrefix}-left`}>
              <div className={`${stylePrefix}-fields`}>{this.renderFields()}</div>
            </div>
            <div className={`${stylePrefix}-right`}>{!expandable && headerRight}</div>
          </div>
          {!isEmpty(tableButtons) && !isEmpty(dataSet) ? (
            <div>
              <TableButtonRenderer
                dataSet={dataSet[0]}
                tableRef={tableRef}
                tableMode={tableMode}
                buttons={tableButtons as Buttons[]}
              />
            </div>
          ) : null}
        </>
      );
    }
  }
}

const SearchBarSpin = observer(({ dataSet, loading: controlLoading }) => {
  if (controlLoading) {
    return <div className={`${stylePrefix}-loading`} />;
  }
  if (isEmpty(dataSet)) {
    return null;
  }
  const loading = dataSet.some(item => item.status === 'loading');
  if (!loading) {
    return null;
  }
  return <div className={`${stylePrefix}-loading`} />;
});

const ResetButton = observer(({ dataSet, handleClick, changeFlag, className }): any => {
  if (!changeFlag && isEmpty(filterNullValueObject(dataSet.current?.data))) {
    return;
  }
  return (
    <Tooltip title={intl.get('srm.filterBar.view.button.reset.tip').d('重置筛选条件为当前筛选方案默认条件')}>
      <Button className={`${stylePrefix}-operator-btn ${className || ''}`} onClick={handleClick}>
        {intl.get('hzero.common.button.reset').d('重置')}
      </Button>
    </Tooltip>
  );
});

export default withRouter(SearchBar);

/* eslint-disable no-unused-expressions */
/* eslint-disable no-param-reassign */
/* eslint-disable camelcase */
import React, { Component } from 'react';
import { withRouter } from 'react-router';
import classnames from 'classnames';
import moment from 'moment';
import { DataSet, Button, Tooltip, TextField } from 'choerodon-ui/pro';
import { Divider, Icon } from 'choerodon-ui';
import { FieldType, DataSetStatus } from 'choerodon-ui/pro/lib/data-set/enum';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import { Bind, Debounce } from 'lodash-decorators';
import { isEmpty, cloneDeep, omit, keys, isArray, unionWith, isNil } from 'lodash';
import { toJS } from 'mobx';
import { observer } from 'mobx-react';

import { filterNullValueObject, getCurrentUser } from 'hzero-front/lib/utils/utils';
import { DEFAULT_DATETIME_FORMAT, DEFAULT_DATE_FORMAT } from 'hzero-front/lib/utils/constants';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import C7nCustomizeContext from '../CustomizeContext/C7nCustomizeContext';
import TableButtonRenderer from './components/TableButtonRenderer';
import CollpaseFilter from './components/CollpaseFilter';
import FieldSelector from './components/FieldSelector';
import Field from './components/Field';
import SortSelector from './components/SortSelector';
import { SearchInputDS } from './store';
import {
  stylePrefix,
  FieldFlag,
  MergeFieldName,
  getRangeBeforeFieldName,
  getRangeAfterFieldName,
  getDateTimeMinFormat,
  getDateTimeMaxFormat,
  getMeaningFieldName,
  filterTempFields,
  checkValueValid,
  hasFilterBarCache,
  setFilterBarCache,
  resetFilterBarCache,
  // initialFilterBarCache,
  getFilterBarCache,
  RANGE_COMPONENTS,
  sortFields,
  MeaingFieldSuffix,
  SortFieldName,
  getLovQueryAxiosConfig,
  checkFieldValueModified,
  isObjectEqual,
  transformNilValue,
  hasFilterBarRefreshKey,
  popFilterBarRefreshKey,
  INIT_FLAG,
} from './util';
import './index.less';
import CollapseUpIcon from '../../assets/collapse_up.svg';
import RefreshIcon from '../../assets/refresh.svg';

export function getCurrentUserDateFormatPerfer() {
  const user = getCurrentUser() || {};
  const { userDateFormatPreferFlag } = user;
  return userDateFormatPreferFlag === 1;
}

// let editModal; // 编辑弹窗
@formatterCollections({ code: ['srm.filterBar'] })
class FilterBar extends Component {
  static contextType = C7nCustomizeContext;

  queryDs; // queryDataSet

  searchInputDs; // 合并查询输入框dataSet

  customizeDs; // 自定义区域关联dataSet

  location;

  cacheData = {
    queryDsData: null,
    searchInputDsData: null,
    fields: [],
    customizeDs: this.customizeDs,
    state: {},
    location: '',
  };

  firstFlag;

  cleanFlag;

  showUserPerferFormat = false;

  constructor(props) {
    super(props);
    const {
      manualQuery,
      defaultExpand,
      defaultSortedField,
      defaultSortedOrder,
      expand: originExpand,
      collpase: originCollpase,
      defaultCollpase,
    } = props;
    // 查询区域展开收起标识, true-展开, false-收起, 关闭筛选器切换功能默认收起, 其他情况默认展开
    const expand = !isNil(originExpand) ? originExpand : transformNilValue(defaultExpand, true);
    const collpase = !isNil(originCollpase)
      ? originCollpase
      : transformNilValue(defaultCollpase, false);
    this.queryDs = new DataSet();
    this.searchInputDs = new DataSet(SearchInputDS());
    this.customizeDs = new DataSet();
    this.firstFlag = true; // 首次加载标识
    this.cleanFlag = false; // 清空操作标识
    this.location = window.location.pathname;
    this.showUserPerferFormat = getCurrentUserDateFormatPerfer();
    this.state = {
      expand, // 查询区域展开收起标识
      fields: [], // 所有查询字段列表
      originFields: [], // fields 备份，以便还原
      displayFields: [], // 显示的查询字段列表
      optionalFields: [], // 可选的查询字段列表
      sortableFields: [], // 可排序的查询字段列表
      searchInputFields: [], // 合并查询输入框内的查询字段列表
      changeFlag: false, // 当前筛选器是否发生更改
      queryParameter: {},
      cacheFlag: false,
      currentField: {}, // 正在编辑的字段
      initFlag: true,
      sortFieldCode: defaultSortedField,
      sortFlag: defaultSortedOrder,
      collpase, // 筛选区域展开收起标识
      manualQuery: !isNil(manualQuery)
        ? manualQuery
        : getCurrentUser()?.themeConfigVO?.searchbarDelayFlag === 1,
    };
  }

  static defaultProps = {
    defaultExpand: true,
    expandable: false,
    autoParseUrlParams: true,
    parseUrlParamsKey: 'filters',
    cacheKey: '',
    refreshButton: true,
    checkDataSetStatus: true,
  };

  componentDidMount() {
    this.initDataSetStatus();
    this.addDsEventListener();
    this.handleFilterCacheInitial();
    this.initConfig();
    this.handleRef();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.dataSet && nextProps.dataSet !== this.props.dataSet) {
      if (nextProps.dataSet.some((ds) => ds.getState('queryStatus') !== 'ready')) {
        nextProps.dataSet.forEach((ds) => {
          ds.setState('queryStatus', 'ready');
        });
      }
      if (this.props.dataSet.some((ds) => !ds.getState(INIT_FLAG))) {
        this.resetDataset();
      }
    }
    if (nextProps.expand !== this.props.expand) {
      this.setState({ expand: nextProps.expand });
    }
    if (nextProps.mergeSearchValue !== this.props.mergeSearchValue) {
      this.updateSearchInputDs(nextProps.mergeSearchValue);
    }
    if (nextProps.loading !== this.props.loading) {
      this.handleDataSetLoading(nextProps.loading);
    }
  }

  componentWillUnmount() {
    this.removesEventListener();
    this.handleCacheFilter();
  }

  // 设置初始化dataSet状态
  @Bind()
  initDataSetStatus() {
    const { dataSet } = this.props;
    if (dataSet && dataSet.length) {
      dataSet.forEach((ds) => {
        ds.setState(INIT_FLAG, true);
      });
    }
  }

  @Bind()
  resetDataset() {
    this.initDataSetStatus();
    this.removesEventListener();
    const { defaultSortedField, defaultSortedOrder, cacheState, cacheKey = '' } = this.props;
    this.queryDs = new DataSet();
    this.searchInputDs = new DataSet(SearchInputDS());
    this.customizeDs = new DataSet();
    this.addDsEventListener();
    if (cacheState) {
      resetFilterBarCache(cacheKey);
    }
    this.cacheData = {
      queryDsData: null,
      searchInputDsData: null,
      fields: [],
      customizeDs: this.customizeDs,
      state: {},
      location: '',
    };
    this.firstFlag = true;
    this.cleanFlag = false;
    this.setState(
      {
        fields: [], // 所有查询字段列表
        originFields: [], // fields 备份，以便还原
        displayFields: [], // 显示的查询字段列表
        optionalFields: [], // 可选的查询字段列表
        sortableFields: [], // 可排序的查询字段列表
        searchInputFields: [], // 合并查询输入框内的查询字段列表
        changeFlag: false, // 当前筛选器是否发生更改
        queryParameter: {},
        cacheFlag: false,
        currentField: {}, // 正在编辑的字段
        initFlag: true,
        sortFieldCode: defaultSortedField,
        sortFlag: defaultSortedOrder,
      },
      () => {
        this.initConfig();
      }
    );
  }

  /**
   * 注册DS事件监听
   */
  @Bind()
  addDsEventListener() {
    const { dataSet } = this.props;
    if (dataSet[0].queryDataSet) {
      dataSet[0].queryDataSet.addEventListener('update', this.handleQueryFieldsUpdate);
    }
    this.queryDs.addEventListener('update', this.handleQueryDsUpdate);
    this.searchInputDs.addEventListener('update', this.handleSearchInputDsUpdate);
    this.customizeDs.addEventListener('update', this.handleCustomizeDsUpdate);
  }

  /**
   * 移除DS事件监听
   */
  @Bind()
  removesEventListener() {
    const { dataSet } = this.props;
    if (dataSet[0].queryDataSet) {
      dataSet[0].queryDataSet.removeEventListener('update', this.handleQueryFieldsUpdate);
    }
    this.queryDs.removeEventListener('update', this.handleQueryDsUpdate);
    this.searchInputDs.removeEventListener('update', this.handleSearchInputDsUpdate);
    this.customizeDs.removeEventListener('update', this.handleCustomizeDsUpdate);
  }

  /**
   * 初始化筛选器缓存
   */
  @Bind()
  handleFilterCacheInitial() {
    // eslint-disable-next-line no-unused-vars
    const { cacheState } = this.props;
    if (cacheState) {
      // initialFilterBarCache(cacheKey);
    }
  }

  @Bind()
  handleDataSetLoading(loading) {
    const { dataSet = [], loading: PropLoading } = this.props;
    if (!isEmpty(dataSet)) {
      dataSet.forEach((ds) => {
        // eslint-disable-next-line no-param-reassign
        ds.status = PropLoading || loading ? DataSetStatus.loading : DataSetStatus.ready;
      });
    }
  }

  @Bind()
  updateSearchInputDs(value) {
    if (this.searchInputDs.current) {
      this.searchInputDs.current.set(MergeFieldName, value);
      if (!this.state.manualQuery) {
        this.handleQuery();
      }
    }
  }

  /**
   * 初始化配置
   */
  @Bind()
  initConfig() {
    const { cacheState, cacheKey = '', fields: originFields, dataSet } = this.props;
    let fields = [];
    let cacheOtherState = {};
    if (cacheState && hasFilterBarCache(cacheKey)) {
      const cacheData = getFilterBarCache(cacheKey);
      this.cacheData = cacheData;
      const { fields: cacheFields, customizeDs, state } = cacheData;
      this.customizeDs = customizeDs;
      this.customizeDs.addEventListener('update', this.handleCustomizeDsUpdate);
      fields = cacheFields;
      cacheOtherState = {
        cacheFlag: true,
        ...state,
      };
    } else if (originFields && originFields.length > 0) {
      if (dataSet && dataSet[0].props.queryFields) {
        // 有fields和queryFields时，字段以queryFields为准
        toJS(dataSet[0].props.queryFields).forEach((item) => {
          // multiple为true的字段全部将multiple值更改为','
          dataSet[0].queryDataSet
            ?.getField(item.name)
            ?.set('multiple', item.multiple ? ',' : undefined);
          const fieldItem =
            originFields.find((field) => {
              return field.name === item.name;
            }) || {};
          fields.push({ ...item, ...fieldItem });
        });
      } else {
        // 只有fields
        fields = originFields;
      }
    } else if (dataSet && dataSet[0].props.queryFields) {
      // 只有queryFields
      toJS(dataSet[0].props.queryFields).forEach((item) => {
        fields.push({ ...item });
      });
    }
    fields = this.handleTransformFields(fields);
    this.setState(
      {
        fields,
        ...this.getFieldType(fields),
        ...cacheOtherState,
      },
      () => {
        this.setSearchInputDs();
        this.setQueryDs(fields);
        this.handleQuery();
      }
    );
  }

  @Bind()
  handleQueryFieldsUpdate({ name, value }) {
    if (this.queryDs.current) {
      this.queryDs.current.set(name, value);
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
    if (
      filterField &&
      filterField.multiple &&
      !RANGE_COMPONENTS.includes(filterField.fieldWidget)
    ) {
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
      this.setState({
        fields,
      });
    }

    this.setRelatedFieldValue(name, value, record);
    // 清除缓存
    this.handleResetCache();
    const { onFieldChange } = this.props;
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
      if (name === SortFieldName) {
        const sortValue = isNil(value) ? [] : value.split(':');
        this.setState({
          sortFieldCode: sortValue[0],
          sortFlag: sortValue[1],
        });
      }
    } else if (!manualQuery) {
      this.checkDataSetBeforeAction(
        () => {
          this.handleQuery();
        },
        () => {
          record.init(name, oldValue);
          this.setRelatedFieldValue(name, oldValue, record, 'init');
        }
      );
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
      this.checkDataSetBeforeAction(
        () => {
          this.handleQuery();
        },
        () => {
          const { record, name, oldValue } = config;
          record.init(name, oldValue);
        }
      );
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
      this.checkDataSetBeforeAction(
        () => {
          this.handleQuery(true);
        },
        () => {
          const { record, name, oldValue } = config;
          record.init(name, oldValue);
        }
      );
    }
  }

  @Bind()
  handleRef() {
    const { onRef } = this.props;
    if (onRef) {
      onRef(this);
    }
  }

  /**
   * 缓存筛选器
   */
  @Bind()
  handleCacheFilter() {
    const { cacheState, cacheKey = '' } = this.props;
    if (hasFilterBarRefreshKey(cacheKey)) {
      popFilterBarRefreshKey(cacheKey);
      return;
    }
    const { fields, expand, changeFlag, sortFieldCode, sortFlag } = this.state;
    // 保存字段rank
    const cacheFields = this.setDisplayFieldsRank(fields);
    // 预防fields在转换完成之前就卸载组件了导致缓存中fields为空
    if (!cacheState || isEmpty(cacheFields)) {
      return;
    }
    // 当前页面刷新不缓存
    if (this.location === window.location.pathname) {
      return;
    }
    setFilterBarCache(
      {
        queryDsData: this.queryDs.current ? this.queryDs.current.toData() : {},
        searchInputDsData: this.searchInputDs.current ? this.searchInputDs.current.toData() : {},
        fields: cacheFields,
        customizeDs: this.customizeDs,
        state: {
          expand,
          changeFlag,
          sortFieldCode,
          sortFlag,
        },
        location: this.location,
      },
      cacheKey
    );
  }

  @Bind()
  getFieldDefalutValueMeaning(field) {
    if (!field.defaultValue) {
      return undefined;
    }
    const {
      defaultValue,
      displayField: originDisplayField,
      textField,
      format,
      multiple,
      fieldWidget,
    } = field;
    let defaultValueMeaning = defaultValue;
    const displayField = originDisplayField || textField;
    if (fieldWidget === 'LOV' && displayField) {
      if (!multiple) {
        defaultValueMeaning = defaultValueMeaning[displayField];
      } else if (isArray(defaultValueMeaning)) {
        defaultValueMeaning = defaultValueMeaning.map((v) => v[displayField]).join(',');
      }
    } else if (fieldWidget === 'DATE_PICKER') {
      const enLocale = format && format.includes('MMM');
      if (!multiple) {
        defaultValueMeaning = (enLocale
          ? moment(defaultValueMeaning).clone().locale('en')
          : moment(defaultValueMeaning)
        ).format(format);
      } else if (isArray(defaultValue)) {
        defaultValueMeaning = defaultValueMeaning
          .map((v) => (enLocale ? moment(v).clone().locale('en') : moment(v)).format(format))
          .join(',');
      }
    } else if (
      ['INPUT_NUMBER', 'INPUT'].includes(fieldWidget) &&
      multiple &&
      isArray(defaultValue)
    ) {
      defaultValueMeaning = defaultValueMeaning.join(',');
    } else if (fieldWidget === 'SELECT') {
      defaultValueMeaning = undefined; // field组件会处理的
    }
    return defaultValueMeaning;
  }

  /**
   * 转换成 dateSet 的 field 格式
   */
  @Bind()
  handleTransformFields(fields) {
    const result = [];
    if (!isEmpty(fields)) {
      const { editorProps = {} } = this.props;
      fields.forEach((field) => {
        const {
          name,
          type = FieldType.string,
          displayField,
          textField,
          lovCode,
          lookupCode,
          optionsData,
          format,
          multipleFlag,
        } = field;
        if (field[FieldFlag.VIRTUAL]) {
          return;
        }
        if (multipleFlag) {
          field.multiple = multipleFlag;
        }
        field.textField = textField || displayField;
        let { multiple } = field;
        if (name && !isEmpty(editorProps) && !isEmpty(editorProps[name])) {
          field.editorProps = editorProps[name];
        }
        if (!field.fieldWidget) {
          // 默认显示文本框
          if (type === FieldType.object && lovCode) {
            field.fieldWidget = 'LOV';
            field.lovQueryAxiosConfig = (code, config) =>
              getLovQueryAxiosConfig(code, config, {
                headers: {
                  's-lov-view-code': lovCode,
                  's-lov-display-field': displayField || textField,
                },
              });
          } else if (lookupCode) {
            field.fieldWidget = 'SELECT';
          } else if (isArray(optionsData)) {
            field.fieldWidget = 'SELECT';
            field.options = new DataSet({
              data: optionsData,
            });
          } else if (type === FieldType.number) {
            field.fieldWidget = 'INPUT_NUMBER';
          } else if (
            [
              FieldType.date,
              FieldType.dateTime,
              FieldType.time,
              FieldType.month,
              FieldType.year,
              FieldType.week,
            ].includes(type)
          ) {
            field.fieldWidget = 'DATE_PICKER';
            field.format =
              format || (type === FieldType.date ? DEFAULT_DATE_FORMAT : DEFAULT_DATETIME_FORMAT);
          } else {
            field.fieldWidget = 'INPUT';
          }
        }
        if (field.range) {
          multiple = true;
        }
        field.defaultValueMeaning = this.getFieldDefalutValueMeaning(field);
        // 范围类型模块传值multiple，转换为range
        if (RANGE_COMPONENTS.includes(field.fieldWidget) && multiple) {
          // 范围类型将multiple转为range
          field.range = true;
          field.multiple = undefined;
        } else {
          field.range = undefined;
        }
        result.push(field);
        // 多选字段 需要添加前端临时字段, 用作存值
        if (multiple && RANGE_COMPONENTS.includes(field.fieldWidget)) {
          const rangeDefaultValue = field.defaultValue;
          result.push({
            ...field,
            name: getRangeBeforeFieldName(name),
            max: getRangeAfterFieldName(name),
            multiple: undefined,
            defaultValue:
              rangeDefaultValue && rangeDefaultValue[0] ? rangeDefaultValue[0] : undefined,
            defaultValueMeaning:
              rangeDefaultValue && rangeDefaultValue[0] ? rangeDefaultValue[0] : undefined,
            virtual: true,
          });
          result.push({
            ...field,
            name: getRangeAfterFieldName(name),
            min: getRangeBeforeFieldName(name),
            multiple: undefined,
            defaultValue:
              rangeDefaultValue && rangeDefaultValue[1] ? rangeDefaultValue[1] : undefined,
            defaultValueMeaning:
              rangeDefaultValue && rangeDefaultValue[1] ? rangeDefaultValue[1] : undefined,
            virtual: true,
          });
        }
      });
    }
    return result;
  }

  @Bind()
  getShowText(filterField, record) {
    if (!record) {
      return null;
    }
    const { name, fieldWidget, multiple, range, format, optionsData } = filterField;
    const field = record.dataSet.getField(name);
    const data = record.get(name);
    if (!field || !checkValueValid(toJS(data))) {
      return null;
    }
    // 范围类型
    if (range && RANGE_COMPONENTS.includes(fieldWidget)) {
      return null;
    }
    const textField = field.get('textField', record);
    const valueField = field.get('valueField', record);
    let text = data;
    if (fieldWidget === 'INPUT' && multiple) {
      text = data.join(',');
    } else if (fieldWidget === 'LOV') {
      text = multiple ? data.map((item) => item[textField]).join(',') : data[textField];
    } else if (fieldWidget === 'SELECT') {
      let lookupOptions = field.getOptions(record);
      if (lookupOptions && lookupOptions.data) {
        lookupOptions = lookupOptions.toData();
      } else if (!lookupOptions && isArray(optionsData)) {
        lookupOptions = optionsData;
      }
      if (!lookupOptions) {
        return null;
      }
      if (multiple) {
        text = data
          .map((item) => {
            const option = lookupOptions?.find((obj) => obj[valueField] === item);
            return option ? option[textField] : null;
          })
          .join(',');
      } else {
        const option = lookupOptions.find((obj) => obj[valueField] === data);
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
    return field.multiple || field.range;
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
   *    单选传 {[displayField], [valueField]}
   *    多选传 [{[displayField], [valueField]}]
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
  setRelatedFieldValue(fieldName, fieldValue, record, method = 'set') {
    const originField = this.getFilterField(fieldName);
    if (!originField || !this.queryDs.current) {
      return;
    }
    const { name, fieldWidget, range } = originField;
    const meaing = this.getShowText(originField, record);
    this.queryDs.current[method](getMeaningFieldName(name), meaing);

    if (RANGE_COMPONENTS.includes(fieldWidget) && range) {
      // 范围类型组件需设置 开始值字段 和 结束值字段
      // 若是日期 moment 类型值，需获取到原始字符串值
      if (fieldValue instanceof moment) {
        // 取 momnent 中的原始字符串值
        // eslint-disable-next-line no-param-reassign
        fieldValue = fieldValue._i;
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
          mergeQueryParameter[field.name] = mergeFieldValue;
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
      displayFields,
      // sortableFields,
      fields,
      sortFieldCode,
      sortFlag,
    } = this.state;
    const { sortFieldName: customSortFieldName = SortFieldName } = this.props;
    let newQueryParameter = {};
    let range_time_str = '';
    // 无显示字段，不处理
    if (this.queryDs.current) {
      const queryData = this.queryDs.current.toData() || {};
      range_time_str = queryData?.range_time_str || '';

      // 处理排序查询字段
      if (sortFieldCode) {
        newQueryParameter[customSortFieldName] = `${sortFieldCode}:${sortFlag || 'asc'}`;
      }
      if (!isEmpty(fields)) {
        fields.forEach((item) => {
          const { name, virtual, forceQuery } = item;
          // 隐藏字段不处理
          const isDisplay = displayFields.find((f) => f.name === name);
          // forceQuery为true表示强制查询，不受显示隐藏影响
          if (!isDisplay && !forceQuery) {
            return;
          }
          // 虚拟字段不处理
          if (virtual) {
            return;
          }
          const param = this.generateQueryParameter(queryData, item);
          newQueryParameter = Object.assign(newQueryParameter, param);
        });
      }
    }
    const mergeQueryParameter = this.getMergeQueryParameter();
    newQueryParameter = Object.assign(newQueryParameter, mergeQueryParameter);
    // 新查询条件覆盖原查询条件
    keys(queryParameter).forEach((paramKey) => {
      const paramValue = newQueryParameter[paramKey];
      if (isNil(paramValue) || (isArray(paramValue) && paramValue.length < 1)) {
        newQueryParameter[paramKey] = undefined;
      }
    });

    if (range_time_str) {
      // eslint-disable-next-line dot-notation
      newQueryParameter['range_time_str'] = range_time_str;
    }

    return newQueryParameter;
  }

  /**
   * 根据字段生成单个查询参数对象
   */
  @Bind()
  generateQueryParameter(queryData, field) {
    const { name, multiple, range, fieldWidget, format, type, transformValue } = field;
    let paramValue = queryData[name];
    // 日期类型如果是多选取 _before _after 字段的值
    if (RANGE_COMPONENTS.includes(fieldWidget)) {
      if (range) {
        let startValue = transformNilValue(queryData[getRangeBeforeFieldName(name)], '');
        let endValue = transformNilValue(queryData[getRangeAfterFieldName(name)], '');
        // 无时分秒格式的时间 默认拼上 00:00:00 和 23:59:59
        if (
          [
            FieldType.date,
            FieldType.dateTime,
            FieldType.time,
            FieldType.month,
            FieldType.year,
            FieldType.week,
          ].includes(type)
        ) {
          startValue = startValue
            ? moment(startValue).format(
                type === FieldType.date ? getDateTimeMinFormat(format) : format
              )
            : '';
          endValue = endValue
            ? moment(endValue).format(
                type === FieldType.date ? getDateTimeMaxFormat(format) : format
              )
            : '';
        }
        if (checkValueValid(startValue) || checkValueValid(endValue)) {
          // 使用 toString 将 number 类型转成字符串
          paramValue = startValue.toString().concat(',').concat(endValue);
        } else {
          paramValue = null;
        }
        if (transformValue) {
          paramValue = transformValue(paramValue, this.queryDs.current);
        }
        return { [name]: paramValue };
      } else if (
        [
          FieldType.date,
          FieldType.dateTime,
          FieldType.time,
          FieldType.month,
          FieldType.year,
          FieldType.week,
        ].includes(type) &&
        paramValue
      ) {
        paramValue = moment(paramValue).format(
          type === FieldType.date ? DEFAULT_DATE_FORMAT : DEFAULT_DATETIME_FORMAT
        );
      }
    } else if (checkValueValid(queryData[name])) {
      // lov, select字段取tmp字段的值
      if (fieldWidget === 'LOV') {
        const valueField = this.queryDs.getField(name)?.get('valueField');
        if (multiple) {
          if (isEmpty(queryData[name]) || !valueField) {
            paramValue = null;
          } else {
            const valueArr = queryData[name].map((item) => item[valueField]);
            paramValue = valueArr.join(',');
          }
        } else {
          paramValue = queryData[name][valueField];
        }
      } else if (['SELECT', 'INPUT'].includes(fieldWidget) && multiple) {
        if (isEmpty(queryData[name])) {
          paramValue = null;
        } else {
          paramValue = queryData[name].join(',');
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
    const { defaultSortedField, defaultSortedOrder = 'asc' } = this.props;
    if (!defaultSortedField) {
      return undefined;
    }
    return `${defaultSortedField}:${defaultSortedOrder}`;
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
      queryFields.forEach((item) => {
        const { name, defaultValueMeaning } = item;
        this.queryDs.addField(name, {
          ...item,
          type:
            !item[FieldFlag.VIRTUAL] && item.multiple && RANGE_COMPONENTS.includes(item.fieldWidget)
              ? 'string'
              : item.type,
        });
        const meaingFieldProps = {
          name: getMeaningFieldName(name),
          type: FieldType.string,
          virtual: true,
          defaultValue: defaultValueMeaning,
        };
        this.queryDs.addField(meaingFieldProps.name, meaingFieldProps);
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
    const { mergeSearchValue } = this.props;
    if (!isEmpty(searchInputFields) && !this.searchInputDs.current) {
      const { searchInputDsData } = this.cacheData;
      let data = {};
      if (!isEmpty(searchInputDsData)) {
        data = searchInputDsData;
      } else if (!isNil(mergeSearchValue)) {
        data = {
          [MergeFieldName]: mergeSearchValue,
        };
      }
      this.searchInputDs.create(data);
    }
  }

  @Bind()
  handleRefresh(event) {
    this.checkDataSetBeforeAction(() => {
      if (event.target && !this.state.manualQuery) {
        const iconEl = event.target.querySelector('i') || event.target;
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

  getDateRangeString = (value) => {
    let startTime;
    let endTime;

    switch (value) {
      case 'YEST':
        // 昨天
        startTime = moment().subtract(1, 'day').format('YYYY-MM-DD 00:00:00');
        endTime = moment().subtract(1, 'day').format('YYYY-MM-DD 23:59:59');
        break;

      case 'WEEK':
        // 近一周：8天前00:00:00到昨天23:59:59
        startTime = moment().subtract(8, 'days').format('YYYY-MM-DD 00:00:00');
        endTime = moment().subtract(1, 'days').format('YYYY-MM-DD 23:59:59');
        break;

      case 'MONTH':
        // 近一个月：31天前00:00:00到昨天23:59:59
        startTime = moment().subtract(31, 'days').format('YYYY-MM-DD 00:00:00');
        endTime = moment().subtract(1, 'days').format('YYYY-MM-DD 23:59:59');
        break;
      default:
        return '';
    }

    return `${startTime || ''},${endTime || ''}`;
  };

  /**
   * 查询
   * @param force true-强制查询
   */
  @Bind()
  @Debounce(300)
  async handleQuery(force = false) {
    const { displayFields, fields } = this.state;
    // 还原清空操作标识
    this.cleanFlag = false;
    // 校验通过再查询
    const flag = await this.queryDs.validate();
    if (!flag) {
      // ds校验没通过，重新对展示字段进行校验
      const result = displayFields.some((item) => {
        // 多选字段根据temp字段获取
        if (item.multiple || item.range) {
          return !this.queryDs.getField(item.name)?.isValid(this.queryDs.current);
        }
        return !this.queryDs.getField(item.name)?.isValid(this.queryDs.current);
      });
      // 展示字段校验不通过则不查询
      if (result) {
        this.firstFlag = false;
        return;
      }
    }
    const { autoQuery = true } = this.props;
    const { queryParameter: oldQueryParameter, cacheFlag, initFlag } = this.state;

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
    this.setState({ queryParameter, initFlag: false });
    const { dataSet } = this.props;
    dataSet.forEach((ds) => {
      if (!ds.queryDataSet) {
        // eslint-disable-next-line no-param-reassign
        ds.queryDataSet = new DataSet();
      }
    });
    const { beforeQuery, onQuery } = this.props;
    const params = filterNullValueObject(queryParameter);
    if (beforeQuery) {
      const queryFlag = await beforeQuery({
        params,
        fields: filterTempFields(fields),
        dataSet: this.queryDs,
      });
      if (!queryFlag) {
        return;
      }
    }
    // 给dataSet打标记
    dataSet.forEach((ds) => {
      ds.setState('queryStatus', 'ready');
    });
    // 强制查询忽略关闭首次自动查询
    if (force) {
      this.firstFlag = false;
    } else if (this.firstFlag && !autoQuery) {
      // 关闭自动查询仅首次查询生效
      this.firstFlag = false;
      return;
    }
    this.handleDataSetLoading(false);

    if (params?.viewTimeRange && !params?.range_time_str) {
      if (params.viewTimeRange) {
        params.range_time_str = this.getDateRangeString(params.viewTimeRange);
      }
    }
    if (onQuery) {
      onQuery({
        params,
        fields: filterTempFields(fields),
        dataSet: this.queryDs,
      });
    } else {
      dataSet.forEach((ds) => {
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
    const searchInputFields = []; // 模糊查询框字段
    const optionalFields = []; // 可选
    const lockFields = []; // 固定字段
    const sortableFields = []; // 可排序字段
    let displayFields = []; // 显示字段,包含固定字段
    fields.forEach((field) => {
      if (field[FieldFlag.VIRTUAL]) {
        return;
      }
      if (field[FieldFlag.SORT]) {
        sortableFields.push(field);
      }
      if (field[FieldFlag.LOCK]) {
        lockFields.push(field);
        return;
      }
      if (field.merge) {
        searchInputFields.push(field);
        return;
      }
      if (!transformNilValue(field.visible, true)) {
        return;
      }
      optionalFields.push(field);
      if (field[FieldFlag.DISPLAY]) {
        displayFields.push(field);
      }
    });
    displayFields = [...sortFields(lockFields, 'rank'), ...sortFields(displayFields, 'rank')]; // 固定字段排在最前面
    return { displayFields, optionalFields, sortableFields, searchInputFields };
  }

  /**
   * 筛选字段选择回调
   * @param field 当前选中的字段
   */
  @Bind()
  handleSelectField(field) {
    const { name, display: oldDisplay, multiple, fieldWidget = 'INPUT' } = field;
    const { fields = [], displayFields = [], optionalFields = [], manualQuery } = this.state;
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
          const hasValueFlag = !!this.queryDs.current.get(name);
          if (hasValueFlag && !manualQuery) {
            this.handleQuery();
          }
        }
      } else {
        if (this.queryDs.current) {
          if (multiple) {
            // 隐藏字段时需重置的关联虚拟字段
            this.queryDs.current.set(targetField.name, undefined);
            this.queryDs.current.set(getMeaningFieldName(targetField.name), undefined);
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
        changeFlag: true,
      });
    }
  }

  /**
   * 筛选字段全选回调
   */
  @Bind()
  handleSelectAllField(selectFields) {
    const { fields = [], displayFields = [], optionalFields = [], manualQuery } = this.state;
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
          const hasValueFlag = selectableFields.some(
            (item) => !!this.queryDs.current && !!this.queryDs.current.get(item.name)
          );
          if (hasValueFlag && manualQuery) {
            this.handleQuery();
          }
        }
        newDisplayFields = unionWith(displayFields, selectableFields, (a, b) => a.name === b.name);
        this.setState({
          currentField: {},
          fields: newFields,
          displayFields: newDisplayFields,
          optionalFields: newOptionalFields,
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

  @Bind()
  handleCollpase() {
    this.setState({
      collpase: !this.state.collpase,
      // 展开收起时，重置 currentField
      currentField: {},
    });
  }

  /**
   * 清空筛选器字段值
   */
  @Bind()
  handleCleanFilter() {
    const { displayFields, changeFlag, manualQuery } = this.state;
    const { onClear } = this.props;
    const action = () => {
      let newChangeFlag = changeFlag;
      // 清空
      this.searchInputDs.loadData([{}]);
      this.customizeDs.reset();
      if (!isEmpty(displayFields)) {
        displayFields.forEach((item) => {
          if (
            !item[FieldFlag.SKIP_CLEAR] &&
            this.queryDs.current &&
            (checkValueValid(this.queryDs.current.get(item.name)) ||
              checkValueValid(this.queryDs.current.get(item.name)) ||
              checkValueValid(this.queryDs.current.get(getRangeAfterFieldName(item.name))) ||
              checkValueValid(this.queryDs.current.get(getRangeBeforeFieldName(item.name))) ||
              checkValueValid(this.queryDs.current.get(getMeaningFieldName(item.name))))
          ) {
            if (!newChangeFlag) {
              newChangeFlag = true;
            }
            this.queryDs.current.set(item.name, undefined);
            this.queryDs.current.set(item.name, undefined);
            this.queryDs.current.set(getRangeAfterFieldName(item.name), undefined);
            this.queryDs.current.set(getRangeBeforeFieldName(item.name), undefined);
            this.queryDs.current.set(getMeaningFieldName(item.name), undefined);
            this.queryDs.current.set(getMeaningFieldName(item.name), undefined);
          }
        });
      }
      if (this.queryDs.current) {
        this.queryDs.current.set(SortFieldName, undefined);
        this.queryDs.current.set('range_time_str', undefined);
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
      (this.searchInputDs.current &&
        !isEmpty(omit(this.searchInputDs.current.toData(), ['__dirty']))) ||
      (this.customizeDs.current &&
        !isEmpty(omit(this.customizeDs.current.toData(), ['__dirty']))) ||
      (displayFields &&
        displayFields.length > 0 &&
        displayFields.some(
          (field) => this.queryDs.current && !isEmpty(this.queryDs.current.get(field.name))
        ));
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
      const { onReset, defaultSortedField, defaultSortedOrder } = this.props;
      const { originFields, manualQuery } = this.state;
      const fields = cloneDeep(originFields);
      this.setState(
        {
          ...this.getFieldType(fields),
          fields,
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
          this.customizeDs.reset();
          // this.setSearchInputDs();
          // this.setCustomizeDs();
          if (!manualQuery) {
            this.handleQuery(true);
          }
          // 重置排序
          this.setState({
            sortFieldCode: defaultSortedField,
            sortFlag: defaultSortedOrder,
          });
          if (onReset) {
            onReset();
          }
        }
      );
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
  handleClearSelected() {
    const { displayFields = [], optionalFields = [] } = this.state;
    if (!isEmpty(optionalFields)) {
      optionalFields.map((item) => {
        const { name, multiple, fieldWidget = 'INPUT' } = item;
        if (this.queryDs.current) {
          if (multiple) {
            // 隐藏字段时需重置的关联虚拟字段
            this.queryDs.current.set(name, undefined);
            this.queryDs.current.set(getMeaningFieldName(name), undefined);
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
        changeFlag: true,
      });
    }
  }

  @Bind()
  checkDataSetBeforeAction(onOk, onCancel) {
    const { dataSet, checkDataSetStatus } = this.props;
    if (!checkDataSetStatus) {
      if (onOk) {
        onOk();
      }
      return;
    }
    const modifyDs = dataSet.filter(
      (ds) => !isEmpty(ds.created) || !isEmpty(ds.updated) || !isEmpty(ds.destroyed)
    );
    if (modifyDs.length > 0) {
      // Modal.confirm({
      //   title: intl.get('srm.filterBar.view.title.confirmActionTitle').d('提示'),
      //   children: intl
      //     .get('srm.filterBar.view.title.confirmAction')
      //     .d('当前操作将会清空变更过的数据，是否继续？'),
      //   onOk: () => {
      //     // 刷新时返回第一页
      //     dataSet.forEach((ds) => {
      //       ds.currentPage = 1;
      //     });
      //     if (onOk) {
      //       onOk();
      //     }
      //   },
      //   onCancel: () => {
      //     if (onCancel) {
      //       onCancel();
      //     }
      //   },
      // });
      // 刷新时返回第一页
      dataSet.forEach((ds) => {
        ds.currentPage = 1;
      });
      if (onOk) {
        onOk();
      } else if (onCancel) {
        onCancel();
      }
    } else if (onOk) {
      onOk();
    }
  }

  @Bind()
  handleResetCache() {
    const { cacheState, cacheKey = '' } = this.props;
    const { initFlag } = this.state;
    if (!cacheState || initFlag) {
      return;
    }
    this.setState({
      cacheFlag: false,
    });
    resetFilterBarCache(cacheKey);
  }

  @Bind()
  changeSorter({ sortFieldCode, sortFlag }) {
    this.setState({
      sortFieldCode,
      sortFlag,
    });
  }

  @Bind()
  renderFields() {
    const { expandable } = this.props;
    const { currentField, displayFields, optionalFields, manualQuery } = this.state;
    return (
      <div>
        {!expandable ? (
          <>
            {this.renderCustomLeft()}
            {this.renderMergeSearchInput()}
          </>
        ) : null}
        {!isEmpty(displayFields) &&
          displayFields.map((field) => (
            <Field
              key={field.name}
              autoFocus={currentField.name === field.name}
              dataSet={this.queryDs}
              field={field}
              onDelete={this.handleSelectField}
              onAction={this.checkDataSetBeforeAction}
              showUserPerferFormat={this.showUserPerferFormat}
            />
          ))}
        {optionalFields && optionalFields.length > 0 && (
          <FieldSelector
            displayFields={displayFields}
            optionalFields={optionalFields}
            queryDs={this.queryDs}
            onClearSelected={this.handleClearSelected}
            onAllSelected={this.handleSelectAllField}
            onSelectField={this.handleSelectField}
            onAction={this.checkDataSetBeforeAction}
          />
        )}
        {manualQuery && (
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
        )}
        {!manualQuery && !expandable && (
          <>
            {(!isEmpty(displayFields) || !isEmpty(optionalFields)) && (
              <Divider type="vertical" style={{ margin: '0 0.16rem', background: '#ccc' }} />
            )}
            {this.renderFixButtons()}
          </>
        )}
      </div>
    );
  }

  @Bind()
  renderMergeSearchInput() {
    const { searchInputFields } = this.state;
    if (isEmpty(searchInputFields)) {
      return null;
    }
    const mergeFieldName = searchInputFields
      .map((item) => item.label)
      .join(intl.get('srm.filterBar.view.message.separator').d('、'));
    const mergeFieldPlaceholder = intl
      .get('srm.filterBar.view.message.mergeSearchPlaceholder', {
        name: mergeFieldName,
      })
      .d(`请输入${mergeFieldName}查询`);
    return (
      <>
        <span className={`${stylePrefix}-merge-field`}>
          <TextField
            dataSet={this.searchInputDs}
            name={MergeFieldName}
            clearButton
            placeholder={mergeFieldPlaceholder}
            prefix={<Icon type="search" />}
          />
        </span>
        <Divider type="vertical" style={{ margin: '0 0.16rem', background: '#ccc' }} />
      </>
    );
  }

  @Bind()
  renderCustomLeft() {
    const { left = {} } = this.props;
    if (typeof left.render !== 'function') {
      return null;
    }
    return (
      <>
        <div className={`${stylePrefix}-operator-custom-wrap`}>
          {typeof left.render === 'function' && left.render(this.customizeDs)}
        </div>
        <Divider type="vertical" style={{ background: '#ccc', margin: '0 0.16rem' }} />
      </>
    );
  }

  @Bind()
  renderFixButtons() {
    const { refreshButton } = this.props;
    return (
      <>
        <Tooltip title={intl.get('hzero.common.button.clear').d('清空')}>
          <Icon
            style={{ fontSize: '14px', marginLeft: 0 }}
            type="cleaning_services"
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
    const { expand, manualQuery } = this.state;
    if (manualQuery) {
      return null;
    }
    return (
      <>
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
    return (
      <div className={`${stylePrefix}-operator-left`}>
        {this.renderCustomLeft()}
        {this.renderMergeSearchInput()}
        {this.renderButtons()}
      </div>
    );
  }

  @Bind()
  renderHeaderRight() {
    const { sortableFields = [], sortFieldCode, sortFlag } = this.state;
    const { right = {} } = this.props;
    const showSorterFlag = sortableFields.length > 0;
    return (
      <div
        className={`${stylePrefix}-operator-right`}
        style={{ display: typeof right.render === 'function' || showSorterFlag ? 'block' : 'none' }}
      >
        {showSorterFlag ? (
          <SortSelector
            sortFieldCode={sortFieldCode}
            sortFlag={sortFlag}
            fields={sortableFields}
            dataSet={this.queryDs}
            onAction={this.checkDataSetBeforeAction}
            onChange={this.changeSorter}
          />
        ) : null}
        {typeof right.render === 'function' ? (
          <>
            {showSorterFlag ? (
              <Divider type="vertical" style={{ margin: '0 0.16rem', background: '#ccc' }} />
            ) : null}
            {right.render(this.customizeDs)}
          </>
        ) : null}
      </div>
    );
  }

  render() {
    const { expand, collpase } = this.state;
    const { dataSet = [], tableButtons, tableRef, tableMode, expandable, collpaseble } = this.props;
    const headerLeft = this.renderHeaderLeft();
    const headerRight = this.renderHeaderRight();
    const wrapClsName = classnames(stylePrefix, {
      [`${stylePrefix}-expand`]: expand,
      [`${stylePrefix}-collpase`]: collpase,
      [`${stylePrefix}-expandable`]: expandable,
    });
    if (collpaseble) {
      return (
        <>
          <div className={wrapClsName}>
            <div>
              <CollpaseFilter collpase={collpase} handleCollpase={this.handleCollpase} />
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
            {collpase && (
              <div className={`${stylePrefix}-content`}>
                <FilterBarSpin dataSet={dataSet} />
                {expandable ? (
                  <div className={`${stylePrefix}-left`}>
                    <div className={`${stylePrefix}-operator`}>
                      {headerLeft}
                      {headerRight}
                    </div>
                    {expand && <div className={`${stylePrefix}-fields`}>{this.renderFields()}</div>}
                  </div>
                ) : (
                  <>
                    <div className={`${stylePrefix}-left`}>
                      <div className={`${stylePrefix}-fields`}>{this.renderFields()}</div>
                    </div>
                    <div className={`${stylePrefix}-right`}>{headerRight}</div>
                  </>
                )}
              </div>
            )}
          </div>
        </>
      );
    }
    if (expandable) {
      return (
        <div className={wrapClsName}>
          <FilterBarSpin dataSet={dataSet} />
          <div className={`${stylePrefix}-left`}>
            <div className={`${stylePrefix}-operator`}>
              {headerLeft}
              {headerRight}
            </div>
            {expand && <div className={`${stylePrefix}-fields`}>{this.renderFields()}</div>}
            {!isEmpty(tableButtons) && !isEmpty(dataSet) ? (
              <div>
                <TableButtonRenderer
                  dataSet={dataSet[0]}
                  tableRef={tableRef}
                  tableMode={tableMode}
                  buttons={tableButtons}
                />
              </div>
            ) : null}
          </div>
        </div>
      );
    } else {
      return (
        <>
          <div className={wrapClsName}>
            <FilterBarSpin dataSet={dataSet} />
            <div className={`${stylePrefix}-left`}>
              <div className={`${stylePrefix}-fields`}>{this.renderFields()}</div>
            </div>
            <div className={`${stylePrefix}-right`}>{headerRight}</div>
          </div>
          {!isEmpty(tableButtons) && !isEmpty(dataSet) ? (
            <div>
              <TableButtonRenderer
                dataSet={dataSet[0]}
                tableRef={tableRef}
                tableMode={tableMode}
                buttons={tableButtons}
              />
            </div>
          ) : null}
        </>
      );
    }
  }
}

const FilterBarSpin = observer(({ dataSet }) => {
  if (isEmpty(dataSet)) {
    return null;
  }
  const loading = dataSet.some((item) => item.status === 'loading');
  if (!loading) {
    return null;
  }
  return <div className={`${stylePrefix}-loading`} />;
});

export default withRouter(FilterBar);

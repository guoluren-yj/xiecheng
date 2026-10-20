/* eslint-disable no-unused-vars */
/* eslint-disable react/no-unused-state */
/* eslint-disable no-return-assign */
/* eslint-disable no-nested-ternary */
/**
 * 渲染筛选字段
 */
import React, { PureComponent } from 'react';
import classnames from 'classnames';
import { toJS } from 'mobx';
import moment from 'moment';
import { observer } from 'mobx-react';
import { DataSet, DatePicker, MonthPicker, DateTimePicker, Icon, Lov, Menu, NumberField, Output, Select, TextField, Tooltip } from 'choerodon-ui/pro';
import { Popover } from 'choerodon-ui';
import type Record from 'choerodon-ui/pro/lib/data-set/Record';
import { FieldType, FieldTrim, RecordStatus } from 'choerodon-ui/pro/lib/data-set/enum';
import { TriggerViewMode } from 'choerodon-ui/pro/lib/trigger-field/enum';
import type { DatePickerProps } from 'choerodon-ui/pro/lib/date-picker/interface';
import type { RenderProps } from 'choerodon-ui/pro/lib/field/interface';
import { $l } from 'choerodon-ui/pro/lib/locale-context';
import { Bind, Debounce } from 'lodash-decorators';
import { isArray, isEmpty, isNil, isString, omit, pick } from 'lodash';

import { DEFAULT_DATETIME_FORMAT, DEFAULT_DATE_FORMAT } from 'hzero-front/lib/utils/constants';
import { getDateFormat, getDateTimeFormat } from 'hzero-front/lib/utils/utils';
import { ShowValidation } from 'choerodon-ui/pro/lib/form/enum';

import type { fieldProperties } from '../util';
import intl from '../../../utils/intl';
import {
  checkComparsionWithNull,
  checkValueValid,
  ComponentDefaultComparsion,
  FieldEditMode,
  getComparsionFieldName,
  getLovQueryAxiosConfig,
  getMeaningFieldName,
  getTempFieldName,
  noop,
  RANGE_COMPONENTS,
  stylePrefix,
  LOV_CONDITION_GROUP_INDEX,
  getFieldName,
  DATE_RANGE_COMPARISON,
  setLocalLovQueryDefaultField,
} from '../util';
import LovPro from './LovPro';

interface FieldProps {
  autoFocus: boolean;
  dataSet?: DataSet; // ds
  field?: fieldProperties; // 字段属性
  comparisonSetObj?: object; // 关系符值集对象
  onDelete?: (field: fieldProperties) => void; // 字段删除回调函数
  onAction: (onOk?: Function, onCancel?: Function) => void;
  updateLovPatchQueryParam: (field: fieldProperties, fieldName: string, record: Record, param: any) => void;
  initFlag: boolean; // 初始状态
  cacheFlag: boolean; // 缓存标识
  cleanFlag: boolean; // 清空标识
  cacheData?: any; // 缓存数据
  searchCode: string;
  showUserPerferFormat: boolean;
  // onMultipleFlag: (name: string, flag: number) => void;
}

@observer
export default class Field extends PureComponent<FieldProps, any> {
  fieldContainerRef?: any;

  valueRenderRef?: any;

  editorRef?: any;

  fieldWrapRef?: any;

  lovSearchFieldRef?: any;

  lovSearchFormDs?: DataSet;

  constructor(props) {
    super(props);
    this.state = {
      popverContentVisible: props.autoFocus, // popver字段弹窗内容显示标识
      popupFieldEditMode: FieldEditMode.OUTPUT, // popup字段编辑模式
      comparisonSetMode: FieldEditMode.OUTPUT, // 筛选条件-显示模式
      textOverFlowFlag: false, // 多选lov，select文本是否超出最大宽度标识，若超出需显示气泡
      lovSearchPlaceholder: '', // lov searchField的placeholder
      readOnly: false,
      searchMatcher: props.field.defaultQueryField,
    };
    this.initLovSearchFormDs();
  }

  componentDidMount() {
    const { autoFocus, field, dataSet } = this.props;
    const comparison = dataSet && dataSet.current ? dataSet.current.get(getComparsionFieldName(field!.name)): undefined;
    const readOnly = checkComparsionWithNull(comparison);
    if (readOnly) {
      this.setState({ readOnly: true });
    } else if (autoFocus) {
      this.handleClickField();
    }
  }

  componentDidUpdate(prevProps) {
    // 修复字段props.autoFocus为true时且disabled改为true会自动弹出编辑器问题
    if (prevProps.autoFocus !== this.props.autoFocus) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({
        popverContentVisible: this.props.autoFocus,
      });
    }
    if (this.props.initFlag && this.props.initFlag !== prevProps.initFlag) {
      this.initLovSearchFormDs();
    } else if(this.props.cleanFlag && this.props.cleanFlag !== prevProps.cleanFlag) {
      this.initLovSearchFormDs(true);
    }
    this.checkTextOverFlow();
  }

  @Bind()
  initLovSearchFormDs(cleanFlag: boolean = false) {
    const { field = {}, cacheFlag, cacheData } = this.props;
    const { name = '', fieldWidget, queryFieldList, lovEnhanceFlag, defaultValue } = field;
    if (fieldWidget === 'LOV' && lovEnhanceFlag === 1) {
      let initData = defaultValue;
      if (cacheFlag && cacheData && cacheData.queryDsData) {
        initData = cacheData.queryDsData[name];
      }
      const { searchFieldList } = initData || {};
      this.lovSearchFormDs = new DataSet({
        forceValidate: true,
        fields: [
          {
            name: 'queryField',
            required: true,
            options: new DataSet({
              data: (queryFieldList || []).map(i => ({ value: i.field, meaning: i.label })),
            }),
          },
          {
            name: 'comparison',
            required: true,
            lookupCode: 'HPFM.CUST.FIELD_QUERY_REALTION',
          },
          {
            name: 'value',
            dynamicProps: {
              required: ({ record }) => !record || !checkComparsionWithNull(record.get('comparison')),
            },
          },
        ],
        events: {
          update: ({ record, name, value }) => {
            if (name === 'comparison' && checkComparsionWithNull(value)) {
              record.set('value', undefined);
            }
          },
        },
      });
      if (!cleanFlag && searchFieldList) {
        const group: string[] = [];
        searchFieldList.forEach(item => {
          let groupIndex = group.findIndex(g => g === item.queryField);
          if (groupIndex === -1) {
            group.push(item.queryField);
            groupIndex = group.findIndex(g => g === item.queryField);
          }
          this.lovSearchFormDs!.create(item).setState(LOV_CONDITION_GROUP_INDEX, groupIndex).status = RecordStatus.sync;
        });
      } else {
        this.lovSearchFormDs.create({}).setState(LOV_CONDITION_GROUP_INDEX, 1).status = RecordStatus.sync;
      }
    }
  }

  @Bind()
  handleFieldWrapRef(ref) {
    this.fieldWrapRef = ref;
  }

  @Bind()
  handleLovSeachFieldRef(ref) {
    this.lovSearchFieldRef = ref;
  }

  @Bind()
  @Debounce(100)
  handleLovSearchMatcherChange(searchFieldName: string | undefined = undefined) {
    const { field = {}, dataSet, searchCode } = this.props;
    const {
      name,
      multipleFlag,
      lovCode,
      textField: customizeTextField,
      lovInfo: { displayField: originTextField } = { displayField: '' },
    } = field;
    const textField = searchFieldName || customizeTextField || originTextField;
    const searchField = dataSet?.getField(getFieldName({ dataSet, field }));
    if (searchField) {
      // 更改查询字段时，需修改lov query请求的header
      searchField.set('lovQueryAxiosConfig', (code, config) =>
        getLovQueryAxiosConfig(code, config, {
          headers: {
            's-lov-view-code': lovCode,
            's-lov-display-field': textField,
          },
        }),
      );
    }
    try {
      const dsField =
        this.editorRef?.options?.queryDataSet?.getField(textField) ||
        this.editorRef?.options?.queryDataSet?.getField(this.editorRef?.searchMatcher);
      const textFieldLabel = dsField?.get('label');
      this.setState({
        searchMatcher: searchFieldName,
        lovSearchPlaceholder: textFieldLabel ? intl
          .get('srm.filterBar.view.placeholder.lovSearchTip', { name: textFieldLabel })
          .d(`请输入${textFieldLabel}`) : '',
      });
      setLocalLovQueryDefaultField(searchCode, lovCode, searchFieldName);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log(err);
    }
  }

  @Bind()
  handleComparisonSetMode() {
    this.setState({
      comparisonSetMode:
        this.state.comparisonSetMode === FieldEditMode.OUTPUT
          ? FieldEditMode.INPUT
          : FieldEditMode.OUTPUT,
    });
  }

  @Bind()
  handlePopupFieldEditorHidden(hidden: boolean, record: Record, dsFieldName: string) {
    const { popupFieldEditMode } = this.state;
    const { field = {}, updateLovPatchQueryParam } = this.props;
    const { name, modelCode, fieldCode, fieldWidget, multipleFlag, type, backgroundText: originPlaceholder } = field;
    const isModalField = modelCode && fieldCode;
    const comparisonField = record.get(getComparsionFieldName(name));
    const isRangeDate = isModalField ? DATE_RANGE_COMPARISON.includes(comparisonField) : multipleFlag;
    if (fieldWidget === 'DATE_PICKER') {
      let placeholder: string | string[] = '';
      if (isRangeDate) {
        placeholder =
          type === 'date'
            ? [
              intl.get('srm.filterBar.view.placeholder.startDate').d('开始日期'),
              intl.get('srm.filterBar.view.placeholder.endDate').d('结束日期'),
            ]
            : [
              intl.get('srm.filterBar.view.placeholder.startTime').d('开始时间'),
              intl.get('srm.filterBar.view.placeholder.endTime').d('结束时间'),
            ];
      } else if (popupFieldEditMode === FieldEditMode.INPUT) {
        placeholder =
          originPlaceholder ||
          (type === 'date'
            ? intl.get('srm.filterBar.view.placeholder.inputDate').d('请输入日期查询')
            : intl.get('srm.filterBar.view.placeholder.inputTime').d('请输入时间查询'));
      }
      // eslint-disable-next-line no-unused-expressions
      record?.dataSet?.getField(dsFieldName)?.set('placeholder', hidden ? undefined : placeholder);
    }
    if (hidden) {
      // lov组件点击清除按钮时会调用此处，导致点击不上清楚按钮，故增加延时
      if (fieldWidget === 'LOV') {
        setTimeout(() => {
          updateLovPatchQueryParam(field, dsFieldName, record, this.editorRef?.options?.patchingParams);
          this.handlePopupFieldEditMode(FieldEditMode.OUTPUT);
        }, 0);
      } else if (fieldWidget === 'DATE_PICKER' && isRangeDate) {
        // 日期范围popup隐藏时无法触发onChange更新值，故增加延时
        setTimeout(() => {
          // 调用失焦以触发onChange
          if (this.editorRef) {
            this.editorRef.blur();
          }
          this.handlePopupFieldEditMode(FieldEditMode.OUTPUT);
        }, 0);
      } else {
        this.handlePopupFieldEditMode(FieldEditMode.OUTPUT);
      }
    }
  }

  @Bind()
  getDisabledFlag(record?: Record): boolean {
    const { field = {}, dataSet } = this.props;
    const { name } = field;
    const ds = record ? record.dataSet : dataSet;
    if (ds) {
      const dsField = ds.getField(name);
      if (dsField) {
        return dsField.get('disabled', record || ds.current);
      }
    }
    return false;
  }

  @Bind()
  getPopupAlignTarget(): HTMLElement {
    return this.fieldWrapRef as HTMLElement;
  }

  @Bind()
  getPopupContainer() {
    const dom = document.getElementById('root');
    return dom as HTMLElement;
  }

  @Bind()
  checkTextOverFlow() {
    const el = this.valueRenderRef;
    if (el) {
      this.setState({
        textOverFlowFlag: el.scrollWidth && el.offsetWidth && el.scrollWidth > el.offsetWidth,
      });
    }
  }

  @Bind()
  handlePasteText(event, record: Record, fieldName: string) {
    const { field = {} } = this.props;
    const { multipleFlag } = field;
    // 只处理多选文本框
    if (!multipleFlag) {
      return;
    }
    try {
      const pasteText = event.clipboardData.getData('text');
      if (pasteText) {
        event.preventDefault();
        const originValue = record.get(fieldName);
        const textArr =
          pasteText
          .split(/\r?\n/)
          .filter(value => value !== null && value !== undefined && !/^\s*$/.test(value));
        record.set(fieldName, originValue.concat(textArr));
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log(err);
    }
  }

  @Bind()
  handleLovSearchPasteText(event) {
    if (!this.editorRef) {
      return;
    }
    try {
      const pasteText = event.clipboardData.getData('text');
      if (pasteText) {
        event.preventDefault();
        const originValue = toJS(this.editorRef.searchText) || [];
        const textArr =
          pasteText
          .split(/\r?\n/)
          .filter(value => value !== null && value !== undefined && !/^\s*$/.test(value));
        const newValue = originValue.concat(textArr);
        if (this.editorRef.handlePopupSearch) {
          this.editorRef.handlePopupSearch(newValue);
        }
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log(err);
    }
  }

  @Bind()
  handlePopupFieldEditMode(editMode: FieldEditMode, callback?: Function) {
    this.setState(
      {
        popupFieldEditMode: editMode,
      },
      () => {
        if (callback) {
          callback();
        }
      },
    );
  }

  @Bind()
  handleFocusFieldEditor() {
    const { field = {} } = this.props;
    const { fieldWidget = 'INPUT' } = field;
    if (this.editorRef) {
      if (this.editorRef.focus) {
        this.editorRef.focus();
      }
      if (this.editorRef.handleFocus) {
        this.editorRef.handleFocus();
      }
      if (fieldWidget === 'LOV' && this.lovSearchFieldRef && this.lovSearchFieldRef.focus) {
        this.lovSearchFieldRef.focus();
      }
    }
  }

  @Bind()
  handleClickField() {
    const disabledFlag = this.getDisabledFlag();
    const { field, dataSet } = this.props;
    const { fieldWidget, name, modelCode, fieldCode } = field as fieldProperties;
    if (disabledFlag) {
      return;
    }
    if (this.state.popupFieldEditMode !== FieldEditMode.INPUT) {
      if (this.fieldContainerRef && this.fieldContainerRef.handleMouseLeave) {
        this.fieldContainerRef.handleMouseLeave();
      }
      const isRangeDate = modelCode && fieldCode && fieldWidget === 'DATE_PICKER' && dataSet && dataSet.current && DATE_RANGE_COMPARISON.filter(i => i !== 'RANGE').includes(dataSet.current.get(getComparsionFieldName(name)));
      if (!isRangeDate) {
        this.handlePopupFieldEditMode(FieldEditMode.INPUT, this.handleFocusFieldEditor);
      } else {
        this.handlebBlurField(dataSet!.current!);
      }
    }
  }

  @Bind()
  async handlebBlurField(record: Record) {
    const { field = {} } = this.props;
    const { name = '', fieldWidget = 'INPUT' } = field;
    const disabledFlag = this.getDisabledFlag();
    if (disabledFlag) {
      return;
    }
    if (['INPUT', 'INPUT_NUMBER'].includes(fieldWidget)) {
      this.handlePopupFieldEditMode(FieldEditMode.OUTPUT);
    } else if (fieldWidget === 'LOV' && this.lovSearchFormDs) {
      await this.lovSearchFormDs.validate();
      const data: any[] = [];
      this.lovSearchFormDs.forEach(formRecord => {
        const errors = formRecord.getValidationErrors();
        if (!errors.length) {
          data.push(pick(formRecord.toData(), ['queryField', 'comparison', 'value']));
        }
      });
      if (!data.length) {
        record.set(name, undefined);
      } else {
        let { businessQueryParam } = record.get(name) || {};
        if (isEmpty(businessQueryParam)) {
          const lovPara = record.dataSet.getField(name)?.get('lovPara');
          businessQueryParam = lovPara || {};
        }
        record.set(name, {
          businessQueryParam,
          searchFieldList: data,
        });
      }
    }
  }

  @Bind()
  handleClearField(event) {
    const { onDelete = noop, field = {}, dataSet, onAction } = this.props;
    const { name, multipleFlag } = field;
    event.stopPropagation();
    const flag = dataSet && dataSet.current && !isEmpty(dataSet.current.get(getFieldName({ dataSet, field })));
    if (flag) {
      onAction(() => {
        onDelete(field);
      });
    } else {
      onDelete(field);
    }
  }

  @Bind()
  handleClearValue(event, record: Record) {
    event.stopPropagation();
    const { field = {} } = this.props;
    const { name = '', fieldWidget = 'INPUT', multipleFlag, modelCode, fieldCode } = field;
    const multiple = fieldWidget == 'DATE_PICKER' && modelCode && fieldCode ? DATE_RANGE_COMPARISON.includes(record.get(getComparsionFieldName(name))) : multipleFlag === 1;
    if (multiple) {
      // 范围类型字段值设置空数组
      if (RANGE_COMPONENTS.includes(fieldWidget)) {
        record.set(name, []);
      } else {
        record.set(getTempFieldName(name), undefined);
        record.set(name, undefined);
      }
    } else {
      record.set(name, undefined);
    }
  }

  @Bind()
  async handlePopverVisibleChange(record: Record) {
    const { popverContentVisible } = this.state;
    const newPopverContentVisible = !popverContentVisible;
    // 关闭时需要先触发onChange, 故此处增加延时
    setTimeout(() => {
      this.setState({ popverContentVisible: newPopverContentVisible });
      // input类型，点击隐藏时，未触发onBlur，因此在visible中调用失焦
      if (!newPopverContentVisible) {
        this.handlebBlurField(record);
      }
    }, 0);
  }

  @Bind()
  handleRangeComponentChange(value: any[], oldValue: any[], record: Record) {
    const { field = {}, dataSet } = this.props;
    const { name = '', fieldWidget = 'INPUT', multipleFlag, editorProps, modelCode, fieldCode } = field;
    const { onChange } = (editorProps || {}) as any;
    if (onChange) {
      onChange({ dataSet, record, value, name: getFieldName({ dataSet, field }), oldValue });
      return;
    }
    const rangeFlag = modelCode && fieldCode && fieldWidget === 'DATE_PICKER' ? DATE_RANGE_COMPARISON.includes(record.get(getComparsionFieldName(name))) : multipleFlag === 1 && RANGE_COMPONENTS.includes(fieldWidget);
    if (!rangeFlag) {
      return;
    }
    if (!record) {
      return;
    }
    if (!value || !isArray(value)) {
      record.set(name, undefined);
      return;
    }
    record.set(name, value);
  }

  @Bind()
  handleLovParamMatcher({ key, text }) {
    const { searchMatcher } = this.state;
    const { field = {}, dataSet } = this.props;
    const {
      name,
      multipleFlag,
      lovCode,
      textField: customizeTextField,
      lovInfo: { displayField: originTextField } = { displayField: '' },
    } = field;
    const textField = searchMatcher || customizeTextField || originTextField;
    // 处理第一次查询的时候，lov组件查询传key和textField不一致的情况
    // if (key !== textField) {
    const searchField = dataSet?.getField(getFieldName({ dataSet, field }));
    if (searchField) {
      this.setState({
        searchMatcher: key,
      });
      searchField.set('lovQueryAxiosConfig', (code, config) =>
        getLovQueryAxiosConfig(code, config, {
          headers: {
            's-lov-view-code': lovCode,
            's-lov-display-field': key,
          },
        }),
      );
    }
    // }
    return {
      [`${key}_LIKE`]: isString(text) ? text.trim() : isArray(text) ? text.map(i => i ? i.trim() : '').join(',') : '',
      [`${key}_LIKE_`]: isString(text) ? text.trim() : isArray(text) ? JSON.stringify(text.map(i => i ? i.trim() : '')) : '',
    };
  }

  @Bind()
  handleChangeComparsion(comparison, oldValue, record: Record) {
    const { readOnly } = this.state;
    const { field = {} } = this.props;
    // const { field = {}, onMultipleFlag } = this.props;
    const { name = '', fieldWidget, modelCode, fieldCode } = field;
    const newReadOnly = checkComparsionWithNull(comparison);
    // 日期类型切换筛选条件时，改变record值
    // if (fieldWidget === 'DATE_PICKER') {
    //   if (comparison === 'IN' || oldValue === 'IN') {
    //     // 单选切范围类型或范围切其他类型，清空值
    //     record.set(name, undefined);
    //   }
    //   onMultipleFlag(name, comparison === 'IN' ? 1 : 0);
    // }
    // 由为空、非空和其他类型切换时，清空字段值
    if (readOnly !== newReadOnly) {
      record.set(name, undefined);
    }
    if (fieldWidget === 'DATE_PICKER') {
      switch (comparison) {
        case 'PAST_ONE_MONTH':
          record.set(getTempFieldName(name), [moment().subtract(1, 'months'), moment()]);
          record.set(name, [moment().subtract(1, 'months'), moment()]);
          break;
        case 'PAST_TWO_MONTH':
          record.set(getTempFieldName(name), [moment().subtract(2, 'months'), moment()]);
          record.set(name, [moment().subtract(2, 'months'), moment()]);
          break;
        case 'PAST_THREE_MONTH':
          record.set(getTempFieldName(name), [moment().subtract(3, 'months'), moment()]);
          record.set(name, [moment().subtract(3, 'months'), moment()]);
          break;
        case 'PAST_SIX_MONTH':
          record.set(getTempFieldName(name), [moment().subtract(6, 'months'), moment()]);
          record.set(name, [moment().subtract(6, 'months'), moment()]);
          break;
        case 'PAST_ONE_YEAR':
          record.set(getTempFieldName(name), [moment().subtract(1, 'years'), moment()]);
          record.set(name, [moment().subtract(1, 'years'), moment()]);
          break;
        case 'RANGE':
          record.set(name, undefined);
          record.set(getTempFieldName(name), undefined);
          break;
        default:
          if (DATE_RANGE_COMPARISON.includes(oldValue)) {
            record.set(name, undefined);
            record.set(getTempFieldName(name), undefined);
          }
      }
    }
    this.setState({
      readOnly: newReadOnly,
      popupFieldEditMode: FieldEditMode.OUTPUT,
    });
    // 对于为空非空直接隐藏组件后，再切换至其他筛选条件的情况，
    // 为了切换其他筛选条件时能直接打开lov/datePicker，执行下段代码
    // if (!newReadOnly && (fieldWidget !== 'DATE_PICKER' || !modelCode || comparison === 'RANGE')) {
    //   this.setState({ popupFieldEditMode: FieldEditMode.OUTPUT }, this.handleClickField);
    // }
  }

  @Bind()
  renderPopoverField(record) {
    const { popverContentVisible, popupFieldEditMode, readOnly } = this.state;
    const { field = {} } = this.props;
    const { label, lock, fieldWidget = 'INPUT', editorProps, required, lovEnhanceFlag } = field;
    const disabledFlag = this.getDisabledFlag(record);
    const { clearButton } = editorProps || ({} as any);
    // 关闭时置气泡内容为空，防止切换筛选器时气泡内容未重置
    // 只读时不显示输入框
    const popverContent =
      popverContentVisible && !readOnly
        ? this.renderPopverFieldContent(record as Record)
        : undefined;
    const overlayClsNames = classnames({
      [`${stylePrefix}-field-editor`]: true,
      [`${stylePrefix}-field-editor-calendar`]: fieldWidget === 'DATE_PICKER',
      [`${stylePrefix}-field-editor-lov`]: fieldWidget === 'LOV',
      [`${stylePrefix}-field-editor-lov-pro`]: lovEnhanceFlag === 1 && this.lovSearchFormDs,
    });
    const fieldClsNames = classnames({
      [`${stylePrefix}-field`]: true,
      [`${stylePrefix}-field-disabled`]: disabledFlag,
      [`${stylePrefix}-field-focus`]:
        popupFieldEditMode === FieldEditMode.INPUT || popverContentVisible,
      [`${stylePrefix}-field-highlight`]: !disabledFlag && popverContentVisible,
    });
    const fieldValue = this.renderValue({ field, record });
    const canClearValue = !!fieldValue && clearButton !== false;
    return (
      <Popover
        placement="bottomLeft"
        trigger="click"
        visible={!disabledFlag && popverContentVisible}
        onVisibleChange={() => !disabledFlag && this.handlePopverVisibleChange(record)}
        content={popverContent}
        getPopupContainer={this.getPopupAlignTarget}
        overlayClassName={overlayClsNames}
      >
        <span
          className={fieldClsNames}
          ref={this.handleFieldWrapRef}
          style={{ cursor: disabledFlag ? 'not-allowed' : 'pointer' }}
          onClick={this.handleClickField}
          onBlur={() => this.handlebBlurField(record)}
        >
          {!lock && (
            <Icon
              type="close"
              className={`${stylePrefix}-field-clear`}
              onClick={this.handleClearField}
            />
          )}
          <span
            className={classnames(
              `${stylePrefix}-field-label`, {
              [`${stylePrefix}-field-label-required`]: required,
            })}
          >
            {label}
          </span>
          {this.renderComparison(record as Record)}
          {!readOnly && fieldValue && (
            <span className={`${stylePrefix}-field-value-render`}>{fieldValue}</span>
          )}
          {!readOnly && canClearValue && (
            <Icon
              type="close"
              className={`${stylePrefix}-field-value-clear`}
              onClick={e => this.handleClearValue(e, record)}
            />
          )}
          {!readOnly && (
            <Icon
              type={fieldWidget === 'DATE_PICKER' ? 'date_range-o' : 'expand_more'}
              className={classnames(`${stylePrefix}-field-place-holder-icon`, {
                [`${stylePrefix}-field-date-icon`]: fieldWidget === 'DATE_PICKER',
                [`${stylePrefix}-field-icon-hover`]: canClearValue,
              })}
            />
          )}
        </span>
      </Popover>
    );
  }

  @Bind()
  renderPopupField(record: Record) {
    const { lovSearchPlaceholder, searchMatcher } = this.state;
    const { field = {} } = this.props;
    const { name, multipleFlag, fieldWidget = 'INPUT', editorProps = {}, type, format = '', modelCode, fieldCode } = field;
    const dsFieldName: string = getFieldName({ record, field }) as string;
    const commonProps: any = {
      isFlat: true,
      clearButton: true,
      name: dsFieldName,
      ref: ref => (this.editorRef = ref),
      record: record as Record,
      maxTagCount: 3,
      maxTagTextLength: 120,
      showValidation: ShowValidation.tooltip,
      onPopupHiddenChange: hidden => this.handlePopupFieldEditorHidden(hidden, record, dsFieldName),
      getPopupAlignTarget: this.getPopupAlignTarget,
      getPopupContainer: this.getPopupContainer,
      ...editorProps,
    };

    switch (fieldWidget) {
      case 'SELECT':
        return <Select {...commonProps} suffix={null} popupCls={`${stylePrefix}-select-dropdown`} />;
      case 'LOV': {
        const clsName = classnames({
          [`${stylePrefix}-field-lov-popup`]: true,
          [`${stylePrefix}-field-lov-popup-single`]: multipleFlag !== 1,
        });
        const lovCommonProps = omit(commonProps, 'searchFieldProps');
        const searchFieldProps = {
          multiple: true,
          ref: this.handleLovSeachFieldRef,
          trim: FieldTrim.both,
          placeholder: lovSearchPlaceholder,
          onPaste: this.handleLovSearchPasteText,
        };
        const tableProps = {
          showCachedTips: false,
          pagination: {
            pageSizeOptions: ['10', '20', '50', '100', '200'],
          },
          ...((editorProps as any).tableProps || {}),
        };
        return (
          <Lov
            {...lovCommonProps}
            tableProps={tableProps}
            viewMode={TriggerViewMode.popup}
            searchFieldInPopup
            suffix={null}
            searchMatcher={searchMatcher}
            searchFieldProps={searchFieldProps}
            paramMatcher={this.handleLovParamMatcher}
            popupCls={clsName}
            onSearchMatcherChange={this.handleLovSearchMatcherChange}
          />
        );
      }
      case 'DATE_PICKER': {
        const isRangeDate = modelCode && fieldCode ? DATE_RANGE_COMPARISON.includes(record?.get(getComparsionFieldName(name))) : multipleFlag;
        const datePickerProps = {
          ...commonProps,
          popupCls: `${stylePrefix}-field-calendar-popup`,
          editorInPopup: true,
          placeholder: undefined,
          onChange: (value, oldValue) => {
            if (isRangeDate) {
              this.handleRangeComponentChange(value, oldValue, record);
            }
          },
        };
        const isMonthPicker = /^(YYYY)?[-/]?MM$/.test(format);
        if (isMonthPicker) {
          return <MonthPicker {...datePickerProps} />;
        } else if (type === 'date') {
          return <DatePicker {...datePickerProps} />;
        } else {
          const dateTimePickerProps: DatePickerProps = {
            ...datePickerProps,
            defaultTime: isRangeDate
              ? [moment('00:00:00', 'HH:mm:ss'), moment('23:59:59', 'HH:mm:ss')]
              : undefined,
          };
          return <DateTimePicker {...dateTimePickerProps} />;
        }
      }
      default:
        return null;
    }
  }

  @Bind()
  renderField(record: Record) {
    const { popupFieldEditMode, popverContentVisible, readOnly } = this.state;
    const { field = {} } = this.props;
    const { name, label, lock, fieldWidget = 'INPUT', lovCode, editorProps, required, lovEnhanceFlag, modelCode, fieldCode, multipleFlag } = field;
    const { clearButton } = editorProps || ({} as any);
    if (['INPUT_NUMBER', 'INPUT'].includes(fieldWidget) || (fieldWidget === 'LOV' && (!lovCode || lovEnhanceFlag === 1))) {
      return this.renderPopoverField(record);
    } else {
      const fieldValue = this.renderValue({ field, record });
      const canClearValue = !!fieldValue && clearButton !== false;
      const disabledFlag = this.getDisabledFlag(record as Record);
      const fieldClsNames = classnames({
        [`${stylePrefix}-field`]: true,
        [`${stylePrefix}-field-disabled`]: disabledFlag,
        [`${stylePrefix}-field-focus`]:
          popupFieldEditMode === FieldEditMode.INPUT || popverContentVisible,
      });
      const comparisonField = record && record.get(getComparsionFieldName(name));
      const isRangeDate = fieldWidget === 'DATE_PICKER' && (modelCode && fieldCode ? record && DATE_RANGE_COMPARISON.includes(comparisonField) : multipleFlag === 1);
      const noShowDateRangeFieldValue = DATE_RANGE_COMPARISON.filter(i => i !== 'RANGE').includes(comparisonField);
      return (
        <span
          className={fieldClsNames}
          ref={this.handleFieldWrapRef}
          style={{ cursor: disabledFlag ? 'not-allowed' : 'pointer' }}
          onClick={this.handleClickField}
          onBlur={() => this.handlebBlurField(record)}
        >
          {!lock && (
            <Icon
              type="close"
              className={`${stylePrefix}-field-clear`}
              onClick={this.handleClearField}
            />
          )}
          <span
            className={classnames(
              `${stylePrefix}-field-label`, {
              [`${stylePrefix}-field-label-required`]: required,
            })}
          >
            {label}
          </span>
          {this.renderComparison(record as Record)}
          {!readOnly && popupFieldEditMode === FieldEditMode.INPUT
            ? this.renderPopupField(record as Record)
            : fieldValue && !noShowDateRangeFieldValue && (
              <span className={`${stylePrefix}-field-value-render`}>{fieldValue}</span>
            )}
          {!readOnly && canClearValue && !noShowDateRangeFieldValue && (
            <Icon
              type="close"
              className={`${stylePrefix}-field-value-clear`}
              onClick={e => this.handleClearValue(e, record)}
            />
          )}
          {!readOnly && (fieldWidget !== 'DATE_PICKER' || (!isRangeDate || !noShowDateRangeFieldValue)) && (
            <Icon
              type={fieldWidget === 'DATE_PICKER' ? 'date_range-o' : 'expand_more'}
              className={classnames(`${stylePrefix}-field-place-holder-icon`, {
                [`${stylePrefix}-field-date-icon`]: fieldWidget === 'DATE_PICKER',
                [`${stylePrefix}-field-icon-hover`]: canClearValue,
              })}
            />
          )}
        </span>
      );
    }
  }

  @Bind()
  renderPopverFieldContent(record: Record) {
    const { field = {} } = this.props;
    const {
      name,
      fieldWidget = 'INPUT',
      multipleFlag,
      editorProps = {},
      backgroundText: placeholder,
      lovEnhanceFlag,
      queryFieldList,
    } = field;
    const commonProps = {
      record,
      name: getFieldName({ record, field }),
      autoFocus: true,
      clearButton: true,
      showValidation: ShowValidation.tooltip,
      ...editorProps,
      ref: ref => (this.editorRef = ref),
      // editorProps.onChange单独处理
      onChange: (value, oldValue) => this.handleRangeComponentChange(value, oldValue, record),
    };
    switch (fieldWidget) {
      case 'INPUT': {
        const text = record ? toJS(record.get(getMeaningFieldName(getTempFieldName(name)))) : '';
        return (
          <Tooltip title={text}>
            <TextField
              maxTagCount={3}
              maxTagTextLength={120}
              placeholder={
                placeholder || intl.get('srm.filterBar.view.message.pleaseInput').d('请输入')
              }
              onPaste={event => this.handlePasteText(event, record, getTempFieldName(name))}
              {...commonProps}
            />
          </Tooltip>
        );
      }
      case 'INPUT_NUMBER': {
        return (
          <NumberField
            placeholder={
              multipleFlag
                ? [
                  intl.get('srm.filterBar.view.placeholder.startValue').d('起始值'),
                  intl.get('srm.filterBar.view.placeholder.endValue').d('结束值'),
                ]
                : placeholder || intl.get('srm.filterBar.view.message.pleaseInput').d('请输入')
            }
            {...commonProps}
          />
        );
      }
      case 'LOV': {
        if (lovEnhanceFlag === 1 && this.lovSearchFormDs) {
          return (
            <LovPro formDs={this.lovSearchFormDs} queryFields={queryFieldList} />
          );
        }
        return (
          <Menu>
            <Menu.Item key="empty">{$l('Select', 'no_matching_results')}</Menu.Item>
          </Menu>
        );
      }
      default:
        return null;
    }
  }

  @Bind()
  renderLovProValue({ field, record }) {
    const { comparisonSetObj = {} } = this.props;
    const { queryFieldList, name } = field;
    const data = record.get(name);
    if (!data || !data.searchFieldList || !data.searchFieldList.length) {
      return;
    }
    const { searchFieldList } = data;
    const { queryField, comparison, value } = searchFieldList[0] || {};
    const queryFieldName = queryFieldList ? (queryFieldList.find(i => i.field === queryField) || {}).label : undefined;
    return (
      <>
        <span>{queryFieldName || ''}</span>
        {!comparison ? null : (
          <span className={`${stylePrefix}-lov-pro-comparison`}>{comparisonSetObj[comparison]}</span>
        )}
        {value && checkComparsionWithNull(comparison) ? null : (
          <span>{value}</span>
        )}
        {searchFieldList.length <= 1 ? null : (
          <span className={`${stylePrefix}-lov-pro-more`}>+{searchFieldList.length - 1}</span>
        )}
      </>
    );
  }

  @Bind()
  renderValue({ field, record }) {
    if (!record) {
      return;
    }
    const { textOverFlowFlag } = this.state;
    const { name, multipleFlag, fieldWidget, type, format, lovEnhanceFlag, modelCode, fieldCode } = field;
    const showFieldName = getFieldName({ field, record });
    let text = toJS(record.get(getMeaningFieldName(showFieldName)));
    if (lovEnhanceFlag === 1 && fieldWidget === 'LOV') {
      return this.renderLovProValue({ field, record });
    }
    const isRangeDate = fieldWidget === 'DATE_PICKER' && (modelCode && fieldCode ? DATE_RANGE_COMPARISON.includes(record.get(getComparsionFieldName(name))) : multipleFlag === 1);
    // 首次ds.create时拿不到lookup，需在此处设置一次
    if (fieldWidget === 'SELECT' && !text && checkValueValid(toJS(record.get(showFieldName)))) {
      const dsField = record.dataSet.getField(showFieldName);
      const lookupOptions = dsField.getLookup(record);
      const textField = dsField.get('textField', record);
      const valueField = dsField.get('valueField', record);
      const data = record.get(showFieldName);
      if (lookupOptions) {
        if (multipleFlag === 1 && isArray(toJS(data))) {
          text = data
            .map(item => {
              const option = lookupOptions.find(obj => obj[valueField] === item);
              return option ? option[textField] : null;
            })
            .join(',');
        } else {
          const option = lookupOptions.find(obj => obj[valueField] === data);
          text = option ? option[textField] : null;
        }
      } else {
        text = dsField.getLookupText(record.get(showFieldName), true, record);
      }
      if (text) {
        record.set(getMeaningFieldName(name), text);
        record.set(getMeaningFieldName(getTempFieldName(name)), text);
      }
    }
    if (fieldWidget === 'DATE_PICKER') {
      let showFormat = format || (type === FieldType.dateTime ? DEFAULT_DATETIME_FORMAT : DEFAULT_DATE_FORMAT);
      if (this.props.showUserPerferFormat) {
        showFormat = type === FieldType.dateTime ? getDateTimeFormat() : getDateFormat();
      }
      const enLocale = showFormat && showFormat.includes('MMM');
      if (isRangeDate) {
        text = toJS(record.get(getTempFieldName(name)));
        if (!text) {
          return;
        }
        if (!isArray(text)) {
          text = isString(text) ? text.split(',') : [];
        } else if (type === FieldType.dateTime || type === FieldType.date) {
          text = text.map(item =>
            item ? (enLocale ? moment(item).clone().locale('en') : moment(item)).format(showFormat) : undefined,
          );
        }
        if (text.every(item => isNil(item))) {
          return;
        }
      } else if (text){
        const val = moment(record.get(name) || text);
        text = (enLocale ? val.clone().locale('en') : val).format(showFormat);
      }
    } else if (multipleFlag === 1) {
      text = toJS(record.get(getMeaningFieldName(getTempFieldName(name)))) || text;
      if (RANGE_COMPONENTS.includes(fieldWidget)) {
        text = toJS(record.get(getTempFieldName(name)));
        if (!text) {
          return;
        }
        if (!isArray(text)) {
          text = isString(text) ? text.split(',') : [];
        } else if (type === FieldType.dateTime || type === FieldType.date) {
          const enLocale = format && format.includes('MMM');
          text = text.map(item =>
            item ? (enLocale ? moment(item).clone().locale('en') : moment(item)).format(format || DEFAULT_DATETIME_FORMAT) : undefined,
          );
        }
        if (text.every(item => isNil(item))) {
          return;
        }
      }
    }
    if (!text) {
      return;
    }
    if (['INPUT', 'SELECT', 'LOV'].includes(fieldWidget)) {
      text =
        (isString(text) && text.split(',').length > 5)
          ? text
            .split(',')
            .slice(0, 5)
            .join(',')
            .concat('...')
          : text;
      return textOverFlowFlag ? (
        <Tooltip
          title={
            // 防止事件冒泡
            <div
              onClick={event => {
                event.stopPropagation();
              }}
            >
              {text}
            </div>
          }
        >
          <span ref={ref => (this.valueRenderRef = ref)}>{text}</span>
        </Tooltip>
      ) : (
          <span ref={ref => (this.valueRenderRef = ref)}>{text}</span>
        );
    } else if (RANGE_COMPONENTS.includes(fieldWidget) && (fieldWidget === 'DATE_PICKER' ? isRangeDate : multipleFlag === 1)) {
      return (
        <span>
          <span>
            {text && checkValueValid(text[0]) ? (
              <span>{text[0]}</span>
            ) : (
                <span className={`${stylePrefix}-field-place-holder`}>
                  {type === 'number'
                    ? intl.get('srm.filterBar.view.placeholder.startValue').d('起始值')
                    : type === 'date'
                      ? intl.get('srm.filterBar.view.placeholder.startDate').d('开始日期')
                      : intl.get('srm.filterBar.view.placeholder.startTime').d('开始时间')}
                </span>
              )}
          </span>
          <span
            style={{
              display: 'inline-block',
              verticalAlign: 'middle',
              color: 'rgba(0,0,0,0.45)',
              margin: '0 4px',
            }}
          >
            {intl.get('srm.filterBar.view.message.rangTo').d('至')}
          </span>
          {text && checkValueValid(text[1]) ? (
            <span>{text[1]}</span>
          ) : (
              <span className={`${stylePrefix}-field-place-holder`}>
                {type === 'number'
                  ? intl.get('srm.filterBar.view.placeholder.endValue').d('结束值')
                  : type === 'date'
                    ? intl.get('srm.filterBar.view.placeholder.endDate').d('结束日期')
                    : intl.get('srm.filterBar.view.placeholder.endTime').d('结束时间')}
              </span>
            )}
        </span>
      );
    }
    return <span>{text}</span>;
  }

  @Bind()
  renderComparison(record: Record) {
    if (!record) {
      return null;
    }
    const { comparisonSetMode } = this.state;
    const { field = {}, comparisonSetObj = {} } = this.props;
    const { name, customComparisonSet = [], multipleFlag, modelCode, fieldCode, fieldWidget, lovEnhanceFlag } = field;
    // 虚拟字段不展示
    if (!modelCode || !fieldCode) {
      return null;
    }
    // 多选默认就是包含(=),不展示
    if (isEmpty(customComparisonSet) || (multipleFlag === 1 && fieldWidget !== "DATE_PICKER")) {
      return null;
    }
    // 值集类型字段开启高级筛选后 不展示筛选方式
    if (fieldWidget === 'LOV' && lovEnhanceFlag === 1) {
      return null;
    }
    if (customComparisonSet.length === 1) {
      // 如果是默认查询关系 不展示
      if (ComponentDefaultComparsion.includes(customComparisonSet[0])) {
        return null;
      }
      return (
        <span className={`${stylePrefix}-field-comparison-render`}>
          {comparisonSetObj[record.get(getComparsionFieldName(name))]}
        </span>
      );
    } else {
      return comparisonSetMode === FieldEditMode.OUTPUT ? (
        <span
          className={`${stylePrefix}-field-comparison-render`}
          onClick={event => {
            event.stopPropagation();
            this.handleComparisonSetMode();
          }}
        >
          {fieldWidget === "DATE_PICKER" && (record as Record).get(getComparsionFieldName(name)) === 'IN' ? intl.get('hzero.common.filter.range').d('范围') : comparisonSetObj[(record as Record).get(getComparsionFieldName(name))]}
          <Icon type="expand_more" className={`${stylePrefix}-field-comparison-icon`} />
        </span>
      ) : (
          <Select
            isFlat
            autoFocus
            onClick={event => {
              event.stopPropagation();
            }}
            onChange={(value, oldValue) => this.handleChangeComparsion(value, oldValue, record)}
            onBlur={event => {
              event.stopPropagation();
              // 此处会触发popver显示，故设置隐藏掉
              this.setState({ popverContentVisible: false });
              this.handleComparisonSetMode();
            }}
            popupCls={`${stylePrefix}-field-comparison-select-menu`}
            className={classnames(
              `${stylePrefix}-field-comparison-select`,
              `${stylePrefix}-select-customize`,
            )}
            record={record as Record}
            name={getComparsionFieldName(name)}
            suffix={<Icon type="expand_more" />}
            clearButton={false}
            optionsFilter={option => {
              return (customComparisonSet as String[]).includes(option.get('value'));
            }}
          />
        );
    }
  }

  @Bind()
  renderFieldWrapper({ record }: RenderProps) {
    const { field = {} } = this.props;
    const { helpMessage } = field;
    if (helpMessage) {
      return <Tooltip title={helpMessage}>{this.renderField(record as Record)}</Tooltip>;
    } else {
      return this.renderField(record as Record);
    }
  }

  render() {
    const { dataSet, field = {} } = this.props;
    const { name } = field;
    return (
      <Output
        // 解决字段校验失败后显示编辑器时 tooltip 和编辑器重叠问题
        onMouseEnter={() => {
          if (this.fieldContainerRef && this.fieldContainerRef.handleMouseLeave && this.state.popupFieldEditMode === FieldEditMode.INPUT) {
            this.fieldContainerRef.handleMouseLeave();
          }
        }}
        ref={ref => {
          this.fieldContainerRef = ref;
        }}
        tabIndex={-1}
        dataSet={dataSet}
        name={name}
        renderer={this.renderFieldWrapper}
      />
    );
  }
}

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
import {
  DataSet,
  YearPicker,
  DatePicker,
  MonthPicker,
  DateTimePicker,
  Lov,
  Menu,
  NumberField,
  Select,
  TextField,
  Tooltip,
  WeekPicker,
  TimePicker,
} from 'choerodon-ui/pro';
import { Popover, Icon } from 'choerodon-ui';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import { TriggerViewMode } from 'choerodon-ui/pro/lib/trigger-field/enum';
import { $l } from 'choerodon-ui/pro/lib/locale-context';
import { Bind, Debounce } from 'lodash-decorators';
import { isArray, isEmpty, isNil, isString, omit } from 'lodash';

import { DEFAULT_DATE_FORMAT, DEFAULT_DATETIME_FORMAT } from 'hzero-front/lib/utils/constants';
import { getDateFormat, getDateTimeFormat } from 'hzero-front/lib/utils/utils';
import { ShowValidation } from 'choerodon-ui/pro/lib/form/enum';
import intl from 'utils/intl';
import {
  checkValueValid,
  FieldEditMode,
  getLovQueryAxiosConfig,
  getMeaningFieldName,
  noop,
  RANGE_COMPONENTS,
  stylePrefix,
} from '../util';

import styles from './index.less';

@observer
export default class Field extends PureComponent {
  fieldContainerRef;

  valueRenderRef;

  editorRef;

  fieldWrapRef;

  lovSearchFieldRef;

  datePickerRef;

  constructor(props) {
    super(props);
    this.state = {
      popverContentVisible: props.autoFocus, // popver字段弹窗内容显示标识
      popupFieldEditMode: FieldEditMode.OUTPUT, // popup字段编辑模式
      textOverFlowFlag: false, // 多选lov，select文本是否超出最大宽度标识，若超出需显示气泡
      lovSearchPlaceholder: '', // lov searchField的placeholder
      readOnly: false,
      datePickerVisible: false, // 日期选择器显示状态
    };
  }

  componentDidMount() {
    const { autoFocus } = this.props;
    if (autoFocus) {
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
    this.checkTextOverFlow();
  }

  @Bind()
  handleFieldWrapRef(ref) {
    this.fieldWrapRef = ref;
  }

  @Bind()
  handleLovSeachFieldRef(ref) {
    this.lovSearchFieldRef = ref;
    this.handleLovSearchMatcherChange();
  }

  @Bind()
  @Debounce(100)
  handleLovSearchMatcherChange(searchFieldName = undefined) {
    const { field = {}, dataSet } = this.props;
    const {
      name,
      lovCode,
      textField: customizeTextField,
      lovInfo: { displayField: originTextField } = { displayField: '' },
    } = field;
    const textField = searchFieldName || customizeTextField || originTextField;
    const searchField = dataSet?.getField(name);

    if (searchField) {
      // 更改查询字段时，需修改lov query请求的header
      searchField.set('lovQueryAxiosConfig', (code, config) =>
        getLovQueryAxiosConfig(code, config, {
          headers: {
            's-lov-view-code': lovCode,
            's-lov-display-field': textField,
          },
        })
      );
    }
    try {
      const dsField =
        this.editorRef?.options?.queryDataSet?.getField(textField) ||
        this.editorRef?.options?.queryDataSet?.getField(this.editorRef?.searchMatcher);
      const textFieldLabel = dsField?.get('label') || textField;
      this.setState({
        searchMatcher: searchFieldName,
        lovSearchPlaceholder: intl
          .get('srm.filterBar.view.placeholder.lovSearchTip', { name: textFieldLabel })
          .d(`请输入${textFieldLabel}`),
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log(err);
    }
  }

  @Bind()
  handlePopupFieldEditorHidden(hidden, record, dsFieldName) {
    const { popupFieldEditMode } = this.state;
    const { field = {} } = this.props;
    const { fieldWidget, type, backgroundText: originPlaceholder, range } = field;
    if (fieldWidget === 'DATE_PICKER') {
      let placeholder = '';
      if (range) {
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
          this.handlePopupFieldEditMode(FieldEditMode.OUTPUT);
        }, 0);
      } else if (fieldWidget === 'DATE_PICKER' && range) {
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
  getDisabledFlag(record) {
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
  getPopupAlignTarget() {
    return this.fieldWrapRef;
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
  handlePasteText(event, record, fieldName) {
    const { field = {} } = this.props;
    const { multiple } = field;
    // 只处理多选文本框
    if (!multiple) {
      return;
    }
    try {
      const pasteText = event.clipboardData.getData('text');
      if (pasteText) {
        event.preventDefault();
        const originValue = record.get(fieldName);
        const textArr = pasteText
          .split('\r\n')
          .filter((value) => value !== null && value !== undefined && !/^\s*$/.test(value));
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
        const textArr = pasteText
          .split('\r\n')
          .filter((value) => value !== null && value !== undefined && !/^\s*$/.test(value));
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
  handlePopupFieldEditMode(editMode, callback) {
    this.setState(
      {
        popupFieldEditMode: editMode,
      },
      () => {
        if (callback) {
          callback();
        }
      }
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
    if (disabledFlag) {
      return;
    }
    if (this.state.popupFieldEditMode !== FieldEditMode.INPUT) {
      if (this.fieldContainerRef && this.fieldContainerRef.handleMouseLeave) {
        this.fieldContainerRef.handleMouseLeave();
      }
      this.handlePopupFieldEditMode(FieldEditMode.INPUT, this.handleFocusFieldEditor);
    }
  }

  @Bind()
  handlebBlurField() {
    const { field = {} } = this.props;
    const { fieldWidget = 'INPUT' } = field;
    const disabledFlag = this.getDisabledFlag();
    if (disabledFlag) {
      return;
    }
    if (['INPUT', 'INPUT_NUMBER'].includes(fieldWidget)) {
      this.handlePopupFieldEditMode(FieldEditMode.OUTPUT);
    }
  }

  @Bind()
  handleClearField(event) {
    const { onDelete = noop, field = {}, dataSet, onAction } = this.props;
    const { name } = field;
    event.stopPropagation();
    const flag = dataSet && dataSet.current && !isEmpty(dataSet.current.get(name));
    if (flag) {
      onAction(() => {
        onDelete(field);
      });
    } else {
      onDelete(field);
    }
  }

  @Bind()
  handleClearValue(event, record) {
    event.stopPropagation();
    const { field = {} } = this.props;
    const { name = '', fieldWidget = 'INPUT', multiple, range } = field;
    if (name === 'viewTimeRange') {
      record.set('range_time_str', undefined);
    }
    if (multiple || range) {
      // 范围类型字段值设置空数组
      if (RANGE_COMPONENTS.includes(fieldWidget)) {
        record.set(name, []);
      } else {
        record.set(name, undefined);
      }
    } else {
      record.set(name, undefined);
    }
  }

  @Bind()
  handlePopverVisibleChange() {
    const { popverContentVisible } = this.state;
    const newPopverContentVisible = !popverContentVisible;
    // 关闭时需要先触发onChange, 故此处增加延时
    setTimeout(() => {
      this.setState({ popverContentVisible: newPopverContentVisible });
      // input类型，点击隐藏时，未触发onBlur，因此在visible中调用失焦
      if (!newPopverContentVisible) {
        this.handlebBlurField();
      }
    }, 0);
  }

  @Bind()
  handleRangeComponentChange(value, oldValue, record) {
    const { field = {}, dataSet } = this.props;
    const { name = '', fieldWidget = 'INPUT', multiple, range, editorProps } = field;
    const { onChange } = editorProps || {};
    if (onChange) {
      onChange({ dataSet, record, value, name, oldValue });
      return;
    }
    // 单值直接return
    if (
      !(multiple && !RANGE_COMPONENTS.includes(fieldWidget)) &&
      !(range && RANGE_COMPONENTS.includes(fieldWidget))
    ) {
      return;
    }
    if (!record) {
      return;
    }
    // 值存在且为数组才能setValue,否则return
    if (!value || !isArray(value)) {
      record.set(name, undefined);
      return;
    }
    record.set(name, value);
  }

  @Bind()
  handleLovParamMatcher({ key, text }) {
    // const { searchMatcher } = this.state;
    const { field = {}, dataSet } = this.props;
    const {
      name,
      lovCode,
      // textField: customizeTextField,
      // lovInfo: { displayField: originTextField } = { displayField: '' },
    } = field;
    // const textField = searchMatcher || customizeTextField || originTextField;
    // 处理第一次查询的时候，lov组件查询传key和textField不一致的情况
    // if (key !== textField) {
    const searchField = dataSet?.getField(name);
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
        })
      );
    }
    // }
    return {
      [`${key}`]: isString(text) ? text : isArray(text) ? text.join(',') : '',
      [`${key}_LIKE`]: isString(text) ? text : isArray(text) ? text.join(',') : '',
      [`${key}_LIKE_`]: isString(text) ? text : isArray(text) ? JSON.stringify(text) : '',
    };
  }

  @Bind()
  renderPopoverField(record, isValid = true) {
    const { popverContentVisible, popupFieldEditMode, readOnly } = this.state;
    const { field = {} } = this.props;
    const { label, lock, fieldWidget = 'INPUT', editorProps, required } = field;
    const disabledFlag = this.getDisabledFlag(record);
    const { clearButton } = editorProps || {};
    // 关闭时置气泡内容为空，防止切换筛选器时气泡内容未重置
    // 只读时不显示输入框
    const popverContent =
      popverContentVisible && !readOnly ? this.renderPopverFieldContent(record) : undefined;
    const overlayClsNames = classnames({
      [`${stylePrefix}-field-editor`]: true,
      [`${stylePrefix}-field-editor-calendar`]: fieldWidget === 'DATE_PICKER',
      [`${stylePrefix}-field-editor-lov`]: fieldWidget === 'LOV',
    });
    const fieldClsNames = classnames({
      [`${stylePrefix}-field`]: true,
      [`${stylePrefix}-field-invalid`]: !isValid,
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
        onVisibleChange={() => !disabledFlag && this.handlePopverVisibleChange()}
        content={popverContent}
        overlayClassName={overlayClsNames}
      >
        <span
          className={fieldClsNames}
          ref={this.handleFieldWrapRef}
          style={{ cursor: disabledFlag ? 'not-allowed' : 'pointer' }}
          onClick={this.handleClickField}
          onBlur={this.handlebBlurField}
        >
          {!lock && (
            <Icon
              type="close"
              className={`${stylePrefix}-field-clear`}
              onClick={this.handleClearField}
            />
          )}
          <span
            className={classnames(`${stylePrefix}-field-label`, {
              [`${stylePrefix}-field-label-required`]: required,
            })}
          >
            {label}
          </span>
          {!readOnly && fieldValue && (
            <span className={`${stylePrefix}-field-value-render`}>{fieldValue}</span>
          )}
          {!readOnly && canClearValue && (
            <Icon
              type="close"
              className={`${stylePrefix}-field-value-clear`}
              onClick={(e) => this.handleClearValue(e, record)}
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

  @Bind()
  renderPopupField(record) {
    const { lovSearchPlaceholder, searchMatcher } = this.state;
    const { field = {} } = this.props;
    const {
      name,
      multiple,
      fieldWidget = 'INPUT',
      editorProps = {},
      type,
      range,
      lovParamProps,
      maxDate,
      searchMultiple = true,
    } = field;
    const dsFieldName = name;
    const commonProps = {
      isFlat: true,
      clearButton: true,
      name: dsFieldName,
      ref: (ref) => (this.editorRef = ref),
      record,
      maxTagCount: 3,
      showValidation: ShowValidation.tooltip,
      maxTagTextLength: 120,
      onPopupHiddenChange: (hidden) =>
        this.handlePopupFieldEditorHidden(hidden, record, dsFieldName),
      getPopupAlignTarget: this.getPopupAlignTarget,
      ...editorProps,
    };

    const handleSelect = (value) => {
      this.setState({ datePickerVisible: false }, () => {
        const dateRangeString = this.getDateRangeString(value);

        record.set(dsFieldName, value);
        if (dateRangeString) {
          record.set('range_time_str', dateRangeString);
        }
      });

      setTimeout(() => {
        this.editorRef.blur();
        if (this.datePickerRef?.blur) {
          this.datePickerRef.blur();
        }
      }, 200);
    };

    const handleDateChange = (value) => {
      const startTime = value?.start ? moment(value.start).format('YYYY-MM-DD 00:00:00') : null;
      const endTime = value?.end ? moment(value.end).format('YYYY-MM-DD 23:59:59') : null;

      // 这里可以添加日期范围选择后的逻辑
      const dateStr = startTime ? `${startTime},${endTime}` : startTime;

      if (dateStr) {
        this.setState({ datePickerVisible: false }, () => {
          record.set(dsFieldName, dateStr ? 'RANGE' : '');
          record.set('range_time_str', dateStr);
        });
      }
    };

    const handleRangeHover = () => {
      this.setState({ datePickerVisible: true });
      if (this.datePickerRef) {
        if (this.datePickerRef.focus) {
          this.datePickerRef.focus();
        }
        if (this.datePickerRef.handleFocus) {
          this.datePickerRef.handleFocus();
        }
      }
    };

    const handleRangeLeave = () => {
      this.setState({ datePickerVisible: false });
    };

    const renderPopupContent = ({ dataSet }) => {
      const optionList = dataSet?.toData() ?? [];

      return (
        <div id="lite-front-data-view-date-picker-container">
          {optionList?.map((item) => {
            return item.value !== 'RANGE' ? (
              <div
                key={item.value}
                className={styles['select-field-option']}
                onClick={() => handleSelect(item.value)}
              >
                {item.meaning}
              </div>
            ) : (
              <div
                key={item.value}
                className={styles['select-field-option']}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderTop: '1px solid #e8e8e8',
                  position: 'relative',
                }}
                onMouseEnter={handleRangeHover}
                onMouseLeave={handleRangeLeave}
              >
                <span>{item.meaning}</span>
                <Icon type="navigate_next" />
                <div
                  style={{
                    position: 'absolute',
                    right: '0',
                    top: '0',
                    width: 0,
                    display: this.state.datePickerVisible ? 'block' : 'none',
                  }}
                >
                  <DatePicker
                    isFlat
                    ref={(ref) => (this.datePickerRef = ref)}
                    range={['start', 'end']}
                    popupCls={`${stylePrefix}-field-calendar-popup`}
                    editorInPopup
                    onChange={handleDateChange}
                    max={maxDate}
                    style={{ width: '1px' }}
                    getPopupContainer={() =>
                      document.getElementById('lite-front-data-view-date-picker-container')
                    }
                  />
                </div>
              </div>
            );
          })}
        </div>
      );
    };

    switch (fieldWidget) {
      case 'SELECT':
        return (
          <Select
            {...commonProps}
            suffix={null}
            popupCls={`${stylePrefix}-select-dropdown`}
            // optionRenderer={renderOption}
            popupContent={renderPopupContent}
          />
        );
      case 'LOV': {
        const clsName = classnames({
          [`${stylePrefix}-field-lov-popup`]: true,
          [`${stylePrefix}-field-lov-popup-single`]: !multiple,
        });
        const customLovParamProps = lovParamProps || {};
        const lovCommonProps = omit(commonProps, 'searchFieldProps');
        const searchFieldProps = {
          multiple: searchMultiple,
          ref: this.handleLovSeachFieldRef,
          placeholder: lovSearchPlaceholder,
          onPaste: this.handleLovSearchPasteText,
          ...(customLovParamProps.searchFieldProps || {}),
        };
        const tableProps = {
          showCachedTips: false,
          pagination: {
            pageSizeOptions: ['10', '20', '50', '100', '200'],
          },
          ...(editorProps.tableProps || {}),
        };
        return (
          <Lov
            {...lovCommonProps}
            viewMode={TriggerViewMode.popup}
            searchFieldInPopup
            suffix={null}
            searchMatcher={searchMatcher}
            searchFieldProps={searchFieldProps}
            paramMatcher={this.handleLovParamMatcher}
            popupCls={clsName}
            tableProps={tableProps}
            onSearchMatcherChange={this.handleLovSearchMatcherChange}
            {...omit(customLovParamProps, 'searchFieldProps')}
          />
        );
      }
      case 'DATE_PICKER': {
        const pickerProps = {
          ...commonProps,
          popupCls: `${stylePrefix}-field-calendar-popup`,
          editorInPopup: true,
          placeholder: undefined,
          onChange: (value, oldValue) => {
            if (range) {
              this.handleRangeComponentChange(value, oldValue, record);
            }
          },
        };
        if (type === FieldType.year) {
          return <YearPicker {...pickerProps} />;
        } else if (type === FieldType.month) {
          return <MonthPicker {...pickerProps} />;
        } else if (type === FieldType.week) {
          return <WeekPicker {...pickerProps} />;
        } else if (type === FieldType.date) {
          return <DatePicker {...pickerProps} />;
        } else if (type === FieldType.time) {
          return <TimePicker {...pickerProps} />;
        } else {
          const dateTimePickerProps = {
            ...pickerProps,
            defaultTime: range
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
  renderField(record, isValid = true) {
    const { popupFieldEditMode, popverContentVisible, readOnly } = this.state;
    const { field = {} } = this.props;
    const {
      label,
      lock,
      fieldWidget = 'INPUT',
      lovCode,
      editorProps,
      required,
      defaultValue = '',
      showDatePicker,
    } = field;
    const { clearButton } = editorProps || {};
    if (['INPUT_NUMBER', 'INPUT'].includes(fieldWidget) || (fieldWidget === 'LOV' && !lovCode)) {
      return this.renderPopoverField(record, isValid);
    } else {
      const fieldValue = this.renderValue({ field, record });
      const canClearValue = !!fieldValue && clearButton !== false;
      const disabledFlag = this.getDisabledFlag(record);
      const fieldClsNames = classnames({
        [`${stylePrefix}-field`]: true,
        [`${stylePrefix}-field-invalid`]: !isValid,
        [`${stylePrefix}-field-disabled`]: disabledFlag,
        [`${stylePrefix}-field-focus`]:
          popupFieldEditMode === FieldEditMode.INPUT || popverContentVisible,
      });

      const selectVal = record?.get('range_time_str') ?? '';

      const showValueStr = this.getDateRangeString(defaultValue);
      const showSpan = selectVal ? '' : `(${showValueStr})`;

      return (
        <span
          className={fieldClsNames}
          ref={this.handleFieldWrapRef}
          style={{ cursor: disabledFlag ? 'not-allowed' : 'pointer' }}
          onClick={this.handleClickField}
          onBlur={this.handlebBlurField}
        >
          {!lock && (
            <Icon
              type="close"
              className={`${stylePrefix}-field-clear`}
              onClick={this.handleClearField}
            />
          )}
          <span
            className={classnames(`${stylePrefix}-field-label`, {
              [`${stylePrefix}-field-label-required`]: required,
            })}
          >
            {label}
          </span>
          {!readOnly && popupFieldEditMode === FieldEditMode.INPUT
            ? this.renderPopupField(record)
            : fieldValue && (
            <span className={`${stylePrefix}-field-value-render`}>
              {fieldValue}
              {showDatePicker ? showSpan : ''}
            </span>
              )}
          {!readOnly && canClearValue && (
            <Icon
              type="close"
              className={`${stylePrefix}-field-value-clear`}
              onClick={(e) => this.handleClearValue(e, record)}
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
      );
    }
  }

  @Bind()
  renderPopverFieldContent(record) {
    const { field = {} } = this.props;
    const {
      name,
      fieldWidget = 'INPUT',
      range,
      editorProps = {},
      backgroundText: placeholder,
    } = field;
    const commonProps = {
      record,
      name,
      autoFocus: true,
      clearButton: true,
      showValidation: ShowValidation.tooltip,
      ...editorProps,
      ref: (ref) => (this.editorRef = ref),
      // editorProps.onChange单独处理
      onChange: (value, oldValue) => this.handleRangeComponentChange(value, oldValue, record),
    };
    switch (fieldWidget) {
      case 'INPUT': {
        const text = record ? toJS(record.get(getMeaningFieldName(name))) : '';
        return (
          <Tooltip title={text}>
            <TextField
              maxTagCount={3}
              maxTagTextLength={120}
              placeholder={
                placeholder || intl.get('srm.filterBar.view.message.pleaseInput').d('请输入')
              }
              onPaste={(event) => this.handlePasteText(event, record, name || '')}
              {...commonProps}
            />
          </Tooltip>
        );
      }
      case 'INPUT_NUMBER': {
        return (
          <NumberField
            placeholder={
              range
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
  renderValue({ field, record }) {
    if (!record) {
      return;
    }

    const { textOverFlowFlag } = this.state;
    const { name, multiple, range, fieldWidget, type, format, optionsData, showDatePicker } = field;
    let text = toJS(record.get(getMeaningFieldName(name)));
    let showFormat =
      format || (type === FieldType.dateTime ? DEFAULT_DATETIME_FORMAT : DEFAULT_DATE_FORMAT);
    if (this.props.showUserPerferFormat) {
      if (type === FieldType.dateTime) {
        showFormat = getDateTimeFormat();
      } else if (type === FieldType.date) {
        showFormat = getDateFormat();
      }
    }
    // 首次ds.create时拿不到lookup，需在此处设置一次
    if (fieldWidget === 'SELECT' && !text && checkValueValid(toJS(record.get(name)))) {
      const dsField = record.dataSet.getField(name);
      let lookupOptions = dsField.getLookup(record);
      const textField = dsField.get('textField', record);
      const valueField = dsField.get('valueField', record);
      const data = record.get(name);
      if (!lookupOptions && isArray(optionsData)) {
        lookupOptions = optionsData;
      }
      if (lookupOptions) {
        if (multiple && isArray(toJS(data))) {
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
      } else {
        text = dsField.getLookupText(record.get(name), true, record);
      }
      if (text) {
        record.set(getMeaningFieldName(name), text);
      }
    }
    if (range || multiple) {
      text = toJS(record.get(getMeaningFieldName(name))) || text;
      // 范围类型字段值处理
      if (RANGE_COMPONENTS.includes(fieldWidget)) {
        const enLocale = showFormat && showFormat.includes('MMM');
        text = toJS(record.get(name));
        if (!text) {
          return;
        }
        if (!isArray(text)) {
          text = isString(text) ? text.split(',') : [];
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
          text = text.map((item) =>
            item
              ? (enLocale ? moment(item).clone().locale('en') : moment(item)).format(showFormat)
              : undefined
          );
        }
        if (text.every((item) => isNil(item))) {
          return;
        }
      }
    }
    if (!text) {
      return;
    }
    if (['INPUT', 'SELECT', 'LOV'].includes(fieldWidget)) {
      text =
        isString(text) && text.split(',').length > 5
          ? text.split(',').slice(0, 5).join(',').concat('...')
          : text;
      const rangeTimeStr = record?.get('range_time_str') ?? '';

      return textOverFlowFlag ? (
        <Tooltip
          title={
            // 防止事件冒泡
            <div
              onClick={(event) => {
                event.stopPropagation();
              }}
            >
              {rangeTimeStr && showDatePicker ? `${text}(${rangeTimeStr})` : text}
            </div>
          }
        >
          <span ref={(ref) => (this.valueRenderRef = ref)}>
            {rangeTimeStr && showDatePicker ? `${text}(${rangeTimeStr})` : text}
          </span>
        </Tooltip>
      ) : (
        <span ref={(ref) => (this.valueRenderRef = ref)}>
          {rangeTimeStr && showDatePicker ? `${text}(${rangeTimeStr})` : text}
        </span>
      );
    } else if (RANGE_COMPONENTS.includes(fieldWidget) && range) {
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
  renderFieldWrapper({ record }) {
    const { field = {}, dataSet } = this.props;
    const { name, helpMessage } = field;
    const isValid = dataSet?.getField(name)?.isValid(record);
    const validationMessage = !isValid
      ? record?.getField(name)?.getValidationErrorValues()?.[0]?.validationMessage
      : undefined;
    if (helpMessage) {
      return <Tooltip title={helpMessage}>{this.renderField(record)}</Tooltip>;
    } else {
      return (
        <Tooltip
          theme="light"
          title={!isValid && validationMessage}
          popupClassName={`${stylePrefix}-invalid-help`}
        >
          {this.renderField(record, isValid)}
        </Tooltip>
      );
    }
  }

  render() {
    const { dataSet } = this.props;
    return (
      <span
        // 解决字段校验失败后显示编辑器时 tooltip 和编辑器重叠问题
        onMouseEnter={() => {
          if (
            this.fieldContainerRef &&
            this.fieldContainerRef.handleMouseLeave &&
            this.state.popupFieldEditMode === FieldEditMode.INPUT
          ) {
            this.fieldContainerRef.handleMouseLeave();
          }
        }}
        ref={(ref) => {
          this.fieldContainerRef = ref;
        }}
        style={{ display: 'inline-block', height: '32px', lineHeight: '32px' }}
      >
        {this.renderFieldWrapper({ record: dataSet?.current })}
      </span>
    );
  }
}

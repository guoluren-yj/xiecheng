/**
 * 渲染筛选字段
 */
import React, { Component } from 'react';
import classnames from 'classnames';
import { toJS } from 'mobx';
import moment from 'moment';
import { observer } from 'mobx-react';
import {
  Output,
  Icon,
  DatePicker,
  Lov,
  Select,
  DateTimePicker,
  Tooltip,
  TextField,
  NumberField,
  Menu,
} from 'choerodon-ui/pro';
import { Popover } from 'choerodon-ui';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import { $l } from 'choerodon-ui/pro/lib/locale-context/index.js';
import { Bind, Debounce } from 'lodash-decorators';
import { isEmpty, isString, isArray, omit, isNil } from 'lodash';

import intl from 'utils/intl';
import { DEFAULT_DATETIME_FORMAT } from 'hzero-front/lib/utils/constants';

import { stylePrefix, RANGE_COMPONENTS, ComponentDefaultComparsion, noop } from '../utils/enum';

import {
  getComparsionFieldName,
  getTempFieldName,
  getMeaningFieldName,
  checkValueValid,
  getLovQueryAxiosConfig,
  checkComparsionWithNull,
  FieldEditMode,
} from '../utils/common';

// interface FieldProps {
//   autoFocus: boolean;
//   dataSet?: DataSet; // ds
//   field?: fieldProperties; // 字段属性
//   comparisonSetObj?: object; // 关系符值集对象
//   onDelete?: (field: fieldProperties) => void; // 字段删除回调函数
// }

@observer
export default class Field extends Component {
  valueRenderRef;

  editorRef;

  fieldWrapRef;

  lovSearchFieldRef;

  constructor(props) {
    super(props);
    this.state = {
      popverContentVisible: props.autoFocus, // popver字段弹窗内容显示标识
      popupFieldEditMode: FieldEditMode.OUTPUT, // popup字段编辑模式
      comparisonSetMode: FieldEditMode.OUTPUT, // 筛选条件-显示模式
      textOverFlowFlag: false, // 多选lov，select文本是否超出最大宽度标识，若超出需显示气泡
      lovSearchPlaceholder: '', // lov searchField的placeholder
      readOnly: false,
    };
  }

  componentDidMount() {
    const { autoFocus, field } = this.props;
    if (autoFocus) {
      this.handleClickField();
    }
    const { comparison, customComparisonSet = [] } = field || {};
    const defaultComparison = comparison || customComparisonSet[0];
    if (checkComparsionWithNull(defaultComparison)) {
      this.setState({ readOnly: true });
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
    // this.checkTextOverFlow();
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
  handleLovSearchMatcherChange(searchFieldName) {
    const { field = {}, dataSet } = this.props;
    const {
      name,
      multipleFlag,
      lovCode,
      textField: customizeTextField,
      lovInfo: { displayField: originTextField } = { displayField: '' },
      axiosConfig,
    } = field;
    const textField = searchFieldName || customizeTextField || originTextField;
    const searchField =
      multipleFlag === 1 ? dataSet?.getField(getTempFieldName(name)) : dataSet?.getField(name);

    if (searchField) {
      if (axiosConfig) {
        searchField.set('lovQueryAxiosConfig', () => {
          return {
            ...axiosConfig,
          };
        });
      } else {
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
  handleComparisonSetMode() {
    this.setState({
      comparisonSetMode:
        this.state.comparisonSetMode === FieldEditMode.OUTPUT
          ? FieldEditMode.INPUT
          : FieldEditMode.OUTPUT,
    });
  }

  @Bind()
  handlePopupFieldEditorHidden(hidden) {
    if (hidden) {
      const { field = {} } = this.props;
      const { fieldWidget, multipleFlag } = field;
      // lov组件点击清除按钮时会调用此处，导致点击不上清楚按钮，故增加延时
      if (fieldWidget === 'LOV') {
        setTimeout(() => {
          this.handlePopupFieldEditMode(FieldEditMode.OUTPUT);
        }, 0);
      } else if (fieldWidget === 'DATE_PICKER' && multipleFlag) {
        // 日期范围popup隐藏时无法触发onChange更新值，故增加延时
        setTimeout(() => {
          // 调用失焦以触发onChange
          this.editorRef.blur();
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
        const textArr = pasteText.split('\r\n').filter(Boolean);
        record.set(fieldName, originValue.concat(textArr));
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log(err);
    }
  }

  @Bind()
  handlePopupFieldEditMode(editMode, callback = () => {}) {
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
    const { field = {} } = this.props;
    const { fieldWidget = 'INPUT' } = field;
    const disabledFlag = this.getDisabledFlag();
    if (disabledFlag) {
      return;
    }
    if (['LOV', 'SELECT', 'DATE_PICKER'].includes(fieldWidget)) {
      if (this.state.popupFieldEditMode !== FieldEditMode.INPUT) {
        this.handlePopupFieldEditMode(FieldEditMode.INPUT, this.handleFocusFieldEditor);
      }
    } else {
      this.handleFocusFieldEditor();
    }
  }

  @Bind()
  handlebBlurField() {
    const { field = {} } = this.props;
    const { multipleFlag, fieldWidget = 'INPUT' } = field;
    const disabledFlag = this.getDisabledFlag();
    if (disabledFlag) {
      return;
    }
    // 单选select和日期组件触发不了onPopupHiddenChange,故使用失焦事件
    if (['SELECT', 'DATE_PICKER'].includes(fieldWidget) && !multipleFlag) {
      this.handlePopupFieldEditMode(FieldEditMode.OUTPUT);
    }
  }

  @Bind()
  handleClearField(event) {
    const { onDelete = noop, field = {} } = this.props;
    event.stopPropagation();
    onDelete(field);
  }

  @Bind()
  handleClearValue(event, record) {
    event.stopPropagation();
    const { field = {} } = this.props;
    const { name = '', fieldWidget = 'INPUT', multipleFlag } = field;
    if (multipleFlag === 1) {
      // 范围类型字段值设置空数组
      if (RANGE_COMPONENTS.includes(fieldWidget)) {
        record.set(name, []);
      } else {
        record.set(getTempFieldName(name), undefined);
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
    }, 0);
  }

  @Bind()
  handleRangeComponentChange(value, record) {
    const { field = {} } = this.props;
    const { name = '', fieldWidget = 'INPUT', multipleFlag } = field;
    if (!multipleFlag || !RANGE_COMPONENTS.includes(fieldWidget)) {
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
      axiosConfig,
      queryField,
    } = field;
    const textField = searchMatcher || customizeTextField || originTextField;

    // 处理第一次查询的时候，lov组件查询传key和textField不一致的情况
    if (key !== textField) {
      const searchField =
        multipleFlag === 1 ? dataSet?.getField(getTempFieldName(name)) : dataSet?.getField(name);

      if (searchField) {
        this.setState({
          searchMatcher: key,
        });
        if (axiosConfig) {
          searchField.set('lovQueryAxiosConfig', () => {
            return {
              ...axiosConfig,
            };
          });
        } else {
          searchField.set('lovQueryAxiosConfig', (code, config) =>
            getLovQueryAxiosConfig(code, config, {
              headers: {
                's-lov-view-code': lovCode,
                's-lov-display-field': key,
              },
            })
          );
        }
      }
    }

    if (queryField) {
      return {
        [`${queryField}`]: isString(text) ? text : isArray(text) ? text.join(',') : '',
      };
    }

    return {
      [`${key}_LIKE`]: isString(text) ? text : isArray(text) ? text.join(',') : '',
    };
  }

  @Bind()
  handleChangeComparsion(comparison, record) {
    const { readOnly } = this.state;
    const { field = {} } = this.props;
    const { name = '' } = field;
    const newReadOnly = checkComparsionWithNull(comparison);
    // 由为空、非空和其他类型切换时，清空字段值
    if (readOnly !== newReadOnly) {
      record.set(name, undefined);
    }
    this.setState({ readOnly: newReadOnly });
  }

  @Bind()
  renderPopoverField(record) {
    const { popverContentVisible, popupFieldEditMode, readOnly } = this.state;
    const { field = {} } = this.props;
    const { label, lock, fieldWidget = 'INPUT', editorProps } = field;
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
          <span className={`${stylePrefix}-field-label`}>{label}</span>
          {this.renderComparison(record)}
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

  @Bind()
  renderPopupField(record) {
    const { lovSearchPlaceholder, popupFieldEditMode, searchMatcher } = this.state;
    const { field = {} } = this.props;
    const { name, multipleFlag, fieldWidget = 'INPUT', editorProps = {}, type } = field;
    const commonProps = {
      isFlat: true,
      clearButton: true,
      name: multipleFlag ? getTempFieldName(name) : name,
      ref: (ref) => {
        this.editorRef = ref;
      },
      record,
      maxTagCount: 3,
      maxTagTextLength: 120,
      onPopupHiddenChange: this.handlePopupFieldEditorHidden,
      getPopupAlignTarget: this.getPopupAlignTarget,
      ...editorProps,
    };
    const fieldMeaingText = record
      ? toJS(record.get(getMeaningFieldName(getTempFieldName(name))))
      : '';
    switch (fieldWidget) {
      case 'SELECT':
        return (
          <Tooltip title={fieldMeaingText}>
            <Select {...commonProps} suffix={null} />
          </Tooltip>
        );
      case 'LOV': {
        const clsName = classnames({
          [`${stylePrefix}-field-lov-popup`]: true,
          [`${stylePrefix}-field-lov-popup-single`]: multipleFlag !== 1,
        });
        const lovCommonProps = omit(commonProps, 'searchFieldProps');
        // 优先取自定义的placeholder
        const searchFieldProps = {
          multiple: true,
          ref: this.handleLovSeachFieldRef,
          placeholder: lovSearchPlaceholder,
        };

        return (
          <Tooltip title={fieldMeaingText}>
            <Lov
              {...lovCommonProps}
              viewMode="popup"
              searchFieldInPopup
              suffix={null}
              searchMatcher={searchMatcher}
              searchFieldProps={searchFieldProps}
              paramMatcher={this.handleLovParamMatcher}
              popupCls={clsName}
              onSearchMatcherChange={this.handleLovSearchMatcherChange}
            />
          </Tooltip>
        );
      }
      case 'DATE_PICKER': {
        let placeholder = '';
        if (multipleFlag) {
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
            type === 'date'
              ? intl.get('srm.filterBar.view.placeholder.inputDate').d('请输入日期查询')
              : intl.get('srm.filterBar.view.placeholder.inputTime').d('请输入时间查询');
        }
        const datePickerProps = {
          ...commonProps,
          popupCls: `${stylePrefix}-field-calendar-popup`,
          editorInPopup: true,
          placeholder,
          onChange: (value) => {
            if (multipleFlag) {
              this.handleRangeComponentChange(value, record);
            }
          },
        };
        if (type === 'date') {
          return <DatePicker {...datePickerProps} />;
        } else {
          const dateTimePickerProps = {
            ...datePickerProps,
            defaultTime: multipleFlag
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
  renderField(record) {
    const { popupFieldEditMode, popverContentVisible, readOnly } = this.state;
    const { field = {} } = this.props;
    const { label, lock, fieldWidget = 'INPUT', lovCode, editorProps } = field;
    const { clearButton } = editorProps || {};
    if (['INPUT_NUMBER', 'INPUT'].includes(fieldWidget) || (fieldWidget === 'LOV' && !lovCode)) {
      return this.renderPopoverField(record);
    } else {
      const fieldValue = this.renderValue({ field, record });
      const canClearValue = !!fieldValue && clearButton !== false;
      const disabledFlag = this.getDisabledFlag(record);
      const fieldClsNames = classnames({
        [`${stylePrefix}-field`]: true,
        [`${stylePrefix}-field-disabled`]: disabledFlag,
        [`${stylePrefix}-field-focus`]:
          popupFieldEditMode === FieldEditMode.INPUT || popverContentVisible,
      });
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
          <span className={`${stylePrefix}-field-label`}>{label}</span>
          {this.renderComparison(record)}
          {!readOnly && popupFieldEditMode === FieldEditMode.INPUT
            ? this.renderPopupField(record)
            : fieldValue && (
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
      );
    }
  }

  @Bind()
  renderPopverFieldContent(record) {
    const { field = {} } = this.props;
    const { name, fieldWidget = 'INPUT', multipleFlag, editorProps = {} } = field;
    const commonProps = {
      record,
      name: multipleFlag ? getTempFieldName(name) : name,
      autoFocus: true,
      clearButton: true,
      ref: (ref) => {
        this.editorRef = ref;
      },
      onChange: (value) => this.handleRangeComponentChange(value, record),
      ...editorProps,
    };
    switch (fieldWidget) {
      case 'INPUT': {
        const text = record ? toJS(record.get(getMeaningFieldName(getTempFieldName(name)))) : '';
        return (
          <Tooltip title={text}>
            <TextField
              maxTagCount={3}
              maxTagTextLength={120}
              placeholder={intl.get('srm.filterBar.view.message.pleaseInput').d('请输入')}
              onPaste={(event) => this.handlePasteText(event, record, getTempFieldName(name))}
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
                : intl.get('srm.filterBar.view.message.pleaseInput').d('请输入')
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
    const { name, multipleFlag, fieldWidget, type, format } = field;
    const showFieldName = multipleFlag === 1 ? getTempFieldName(name) : name;
    let text = toJS(record.get(getMeaningFieldName(showFieldName)));
    // 首次ds.create时拿不到lookup，需在此处设置一次
    if (fieldWidget === 'SELECT' && !text && checkValueValid(toJS(record.get(showFieldName)))) {
      const dsField = record.dataSet.getField(showFieldName);
      text =
        dsField && dsField.getLookupText
          ? dsField.getLookupText(record.get(showFieldName), true, record)
          : null;
      if (text) {
        record.set(getMeaningFieldName(name), text);
        record.set(getMeaningFieldName(getTempFieldName(name)), text);
      }
    }
    if (multipleFlag === 1) {
      text = toJS(record.get(getMeaningFieldName(getTempFieldName(name)))) || text;
      if (RANGE_COMPONENTS.includes(fieldWidget)) {
        text = toJS(record.get(getTempFieldName(name)));
        if (!text) {
          return;
        }
        if (!isArray(text)) {
          text = isString(text) ? text.split(',') : [];
        } else if (type === FieldType.dateTime || type === FieldType.date) {
          text = text.map((item) =>
            item ? moment(item).format(format || DEFAULT_DATETIME_FORMAT) : undefined
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
      return textOverFlowFlag ? (
        <Tooltip
          title={
            // 防止事件冒泡
            <div
              onClick={(event) => {
                event.stopPropagation();
              }}
            >
              {text}
            </div>
          }
        >
          <span
            ref={(ref) => {
              this.valueRenderRef = ref;
            }}
          >
            {text}
          </span>
        </Tooltip>
      ) : (
        <span
          ref={(ref) => {
            this.valueRenderRef = ref;
          }}
        >
          {text}
        </span>
      );
    } else if (RANGE_COMPONENTS.includes(fieldWidget) && multipleFlag === 1) {
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
  renderComparison(record) {
    if (!record) {
      return null;
    }
    const { comparisonSetMode } = this.state;
    const { field = {}, comparisonSetObj = {} } = this.props;
    const { name, customComparisonSet = [], multipleFlag, modelCode, fieldCode } = field;
    // 虚拟字段不展示
    if (!modelCode || !fieldCode) {
      return null;
    }
    // 多选默认就是包含(=),不展示
    if (isEmpty(customComparisonSet) || multipleFlag === 1) {
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
          onClick={(event) => {
            event.stopPropagation();
            this.handleComparisonSetMode();
          }}
        >
          {comparisonSetObj[record.get(getComparsionFieldName(name))]}
          <Icon type="expand_more" className={`${stylePrefix}-field-comparison-icon`} />
        </span>
      ) : (
        <Select
          isFlat
          autoFocus
          onClick={(event) => {
            event.stopPropagation();
          }}
          onChange={(value) => this.handleChangeComparsion(value, record)}
          onBlur={(event) => {
            event.stopPropagation();
            // 此处会触发popver显示，故设置隐藏掉
            this.setState({ popverContentVisible: false });
            this.handleComparisonSetMode();
          }}
          popupCls={`${stylePrefix}-field-comparison-select-menu`}
          className={classnames(
            `${stylePrefix}-field-comparison-select`,
            `${stylePrefix}-select-customize`
          )}
          record={record}
          name={getComparsionFieldName(name)}
          suffix={<Icon type="expand_more" />}
          clearButton={false}
          optionsFilter={(option) => {
            return customComparisonSet.includes(option.get('value'));
          }}
        />
      );
    }
  }

  @Bind()
  renderFieldWrapper({ record }) {
    const { field = {} } = this.props;
    const { helpMessage } = field;
    if (helpMessage) {
      return <Tooltip title={helpMessage}>{this.renderField(record)}</Tooltip>;
    } else {
      return this.renderField(record);
    }
  }

  render() {
    const { dataSet, field = {} } = this.props;
    const { name } = field;
    return <Output dataSet={dataSet} name={name} renderer={this.renderFieldWrapper} />;
  }
}

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
import type { DataSet } from 'choerodon-ui/pro';
import { DatePicker, MonthPicker, DateTimePicker, Icon, Lov, Menu, NumberField, Output, Select, TextField, Tooltip } from 'choerodon-ui/pro';
import { Popover } from 'choerodon-ui';
import type Record from 'choerodon-ui/pro/lib/data-set/Record';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import { TriggerViewMode } from 'choerodon-ui/pro/lib/trigger-field/enum';
import type { DatePickerProps } from 'choerodon-ui/pro/lib/date-picker/interface';
import type { RenderProps } from 'choerodon-ui/pro/lib/field/interface';
import { $l } from 'choerodon-ui/pro/lib/locale-context';
import { Bind, Debounce } from 'lodash-decorators';
import { isArray, isEmpty, isNil, isString, omit } from 'lodash';

import intl from 'srm-front-boot/lib/utils/intl';

import { DEFAULT_DATETIME_FORMAT } from 'hzero-front/lib/utils/constants';

import type { fieldProperties } from '../util';
import {
    checkValueValid,
    FieldEditMode,
    noop,
    getLovQueryAxiosConfig,
    RANGE_COMPONENTS,
    stylePrefix,
} from '../util';

interface FieldProps {
    autoFocus: boolean;
    dataSet?: DataSet; // ds
    field?: fieldProperties; // 字段属性
    onDelete?: (field: fieldProperties) => void; // 字段删除回调函数
    onAction: (callback: Function) => void;
}

@observer
export default class Field extends PureComponent<FieldProps, any> {
    valueRenderRef?: any;

    editorRef?: any;

    fieldWrapRef?: any;

    lovSearchFieldRef?: any;

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
    handleLovSearchMatcherChange(searchFieldName: string | undefined = undefined) {
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
                }),
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
        const { field = {} } = this.props;
        const { fieldWidget, multipleFlag, type, backgroundText: originPlaceholder } = field;
        if (fieldWidget === 'DATE_PICKER') {
            let placeholder: string | string[] = '';
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
            } else if (fieldWidget === 'DATE_PICKER' && multipleFlag) {
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
    getPopupContainer() {
      const dom = document.getElementById('root');
      return dom as HTMLElement;
    }

    @Bind()
    getPopupAlignTarget(): HTMLElement {
        return this.fieldWrapRef as HTMLElement;
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
                const textArr = pasteText.split('\r\n').filter(Boolean);
                record.set(fieldName, originValue.concat(textArr));
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
    handleClickField(event?:any) {
        if(event){
            event.stopPropagation();
        }
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
    handlebBlurField(event?: any) {
        if(event){
            event.stopPropagation();
        }
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
    handleClearValue(event, record: Record) {
        event.stopPropagation();
        const { field = {} } = this.props;
        const { name = '', fieldWidget = 'INPUT', multipleFlag } = field;
        if (multipleFlag === 1) {
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
        }, 0);
    }

    @Bind()
    handleLovParamMatcher({ key, text }) {
        const { field = {}, dataSet } = this.props;
        const {
            name,
            lovCode,
        } = field;

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
                }),
            );
        }
        return {
            [`${key}_LIKE`]: isString(text) ? text : isArray(text) ? text.join(',') : '',
        };
    }

    @Bind()
    renderPopoverField(record) {
        const { popverContentVisible, popupFieldEditMode, readOnly } = this.state;
        const { field = {} } = this.props;
        const { label, lock, fieldWidget = 'INPUT' } = field;
        const disabledFlag = this.getDisabledFlag(record);
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
        });
        const fieldClsNames = classnames({
            [`${stylePrefix}-field`]: true,
            [`${stylePrefix}-field-disabled`]: disabledFlag,
            [`${stylePrefix}-field-focus`]:
                popupFieldEditMode === FieldEditMode.INPUT || popverContentVisible,
            [`${stylePrefix}-field-highlight`]: !disabledFlag && popverContentVisible,
        });
        const fieldValue = this.renderValue({ field, record });
        const canClearValue = !!fieldValue;
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
              {/* {!lock && (
                <Icon
                  type="close"
                  className={`${stylePrefix}-field-clear`}
                  onClick={this.handleClearField}
                />
                    )} */}
              <span className={`${stylePrefix}-field-label`}>{label}</span>

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
        const { name, multipleFlag, fieldWidget = 'INPUT', type, format = '' } = field;
        const dsFieldName: string = ( name as string );
        const commonProps: any = {
            key: name,
            isFlat: true,
            clearButton: true,
            name: dsFieldName,
            ref: ref => (this.editorRef = ref),
            record: record as Record,
            maxTagCount: 3,
            maxTagTextLength: 120,
            getPopupContainer: this.getPopupContainer,
            onPopupHiddenChange: hidden => this.handlePopupFieldEditorHidden(hidden, record, dsFieldName),
            getPopupAlignTarget: this.getPopupAlignTarget,
        };

        switch (fieldWidget) {
            case 'SELECT':
                return <Select {...commonProps} suffix={null} />;
            case 'LOV': {
                const clsName = classnames({
                    [`${stylePrefix}-field-lov-popup`]: true,
                    [`${stylePrefix}-field-lov-popup-single`]: multipleFlag !== 1,
                });
                const lovCommonProps = omit(commonProps, 'searchFieldProps');
                const searchFieldProps = {
                    multiple: true,
                    ref: this.handleLovSeachFieldRef,
                    placeholder: lovSearchPlaceholder,
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
                    onSearchMatcherChange={this.handleLovSearchMatcherChange}
                  />
                );
            }
            case 'DATE_PICKER': {
                const datePickerProps = {
                    ...commonProps,
                    popupCls: `${stylePrefix}-field-calendar-popup`,
                    editorInPopup: true,
                    placeholder: undefined,
                };
                const isMonthPicker = /^(YYYY)?[-/]?MM$/.test(format);
                if (isMonthPicker) {
                    return <MonthPicker {...datePickerProps} />;
                } else if (type === 'date') {
                    return <DatePicker {...datePickerProps} />;
                } else {
                    const dateTimePickerProps: DatePickerProps = {
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
    renderField(record: Record) {
        const { popupFieldEditMode, popverContentVisible, readOnly } = this.state;
        const { field = {} } = this.props;
        const { label, lock, fieldWidget = 'INPUT', lovCode } = field;
        if (['INPUT_NUMBER', 'INPUT'].includes(fieldWidget) || (fieldWidget === 'LOV' && !lovCode)) {
            return this.renderPopoverField(record);
        } else {
            const fieldValue = this.renderValue({ field, record });
            const canClearValue = !!fieldValue;
            const disabledFlag = this.getDisabledFlag(record as Record);
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
                {/* {!lock && (
                <Icon
                  type="close"
                  className={`${stylePrefix}-field-clear`}
                  onClick={this.handleClearField}
                />
                    )} */}
                <span className={`${stylePrefix}-field-label`}>{label}</span>
                {!readOnly && popupFieldEditMode === FieldEditMode.INPUT
                        ? this.renderPopupField(record as Record)
                        : fieldValue && (
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
            );
        }
    }

    @Bind()
    renderPopverFieldContent(record: Record) {
        const { field = {} } = this.props;
        const {
            name = "",
            fieldWidget = 'INPUT',
            multipleFlag,
            backgroundText: placeholder,
        } = field;
        const commonProps = {
            record,
            name,
            autoFocus: true,
            clearButton: true,
            ref: ref => (this.editorRef = ref),
        };
        switch (fieldWidget) {
            case 'INPUT': {
                const text = record ? record.get(name) : '';
                return (
                  <Tooltip title={text}>
                    <TextField
                      maxTagCount={3}
                      maxTagTextLength={120}
                      placeholder={
                                placeholder || intl.get('srm.filterBar.view.message.pleaseInput').d('请输入')
                            }
                      onPaste={event => this.handlePasteText(event, record, name)}
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
        const { name, multipleFlag, fieldWidget, type, range, format } = field;
        const showFieldName = name;
        let text = record.getField(name).getText();
        // 首次ds.create时拿不到lookup，需在此处设置一次
        if (fieldWidget === 'SELECT' && !text && checkValueValid(toJS(record.get(showFieldName)))) {
            const dsField = record.dataSet.getField(showFieldName);
            text = dsField.getLookupText(record.get(showFieldName), true, record);
        }

        if (multipleFlag === 1) {
            if (RANGE_COMPONENTS.includes(fieldWidget)) {
                const value = record.get(name);
                if (!value) {
                    text = undefined;
                    return;
                }

                if (type === FieldType.dateTime || type === FieldType.date) {
                    text = range.map(item =>
                        value[item] ? moment(value[item]).format(format || DEFAULT_DATETIME_FORMAT) : undefined,
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
        } else if (RANGE_COMPONENTS.includes(fieldWidget) && multipleFlag === 1) {
            return (
              <span>
                <span key={range[0]}>
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
                <span key={range[1]}>
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
              </span>
            );
        }
        return <span>{text}</span>;
    }

    @Bind()
    renderFieldWrapper({ record }: RenderProps) {
        const { field = {} } = this.props;
        const { help } = field;
        if (help) {
            return <Tooltip title={help}>{this.renderField(record as Record)}</Tooltip>;
        } else {
            return this.renderField(record as Record);
        }
    }

    render() {
        const { dataSet, field = {} } = this.props;
        const { name } = field;
        return <Output dataSet={dataSet} key={name} renderer={this.renderFieldWrapper} />;
    }
}

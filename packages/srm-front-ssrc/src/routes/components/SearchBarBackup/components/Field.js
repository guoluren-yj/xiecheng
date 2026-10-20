/**
 * Field - 自定义单元Field组件  映射 ds Field
 * @date: 2021-11-10
 * @author: Goku<xu.pan01@going-link.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2021, ZhenYun
 */
import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  Output,
  TextField,
  NumberField,
  DatePicker,
  DateTimePicker,
  Lov,
  Select,
  Menu,
} from 'choerodon-ui/pro';
import { Tooltip, Icon, Popover } from 'choerodon-ui';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import { isNil, isArray, isString, noop, isEmpty, omit } from 'lodash';
import { toJS } from 'mobx';
import moment from 'moment';
import classnames from 'classnames';
import { $l } from 'choerodon-ui/pro/lib/locale-context/index.js';

import intl from 'utils/intl';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';

import {
  getMeaningFieldName,
  checkValueValid,
  getTempFieldName,
  getComparsionFieldName,
  getLovQueryAxiosConfig,
} from '../utils/helpers';
import {
  clsPrefix,
  RANGE_COMPONENTS,
  FIELD_EDIT_MODE,
  ComponentDefaultComparsion,
} from '../utils/constant';

export default function Field(props) {
  const { dataSet, field = {}, onDelete = noop, comparisonSetObj } = props;

  const valueRenderRef = useRef();
  const fieldWrapRef = useRef();
  const editorRef = useRef();
  const lovSearchFieldRef = useRef();

  const [textOverFlowFlag] = useState(0);
  const [popupFieldEditMode, setPopupFieldEditMode] = useState(FIELD_EDIT_MODE.OUTPUT); // popup字段编辑模式
  const [popverContentVisible, setPopverContentVisible] = useState(false);
  const [comparisonSetMode, setComparisonSetMode] = useState(false);
  const [searchMatcher, setSearchMatcher] = useState(''); // 搜索匹配器
  const [lovSearchPlaceholder, setLovSearchPlaceholder] = useState(''); // lov searchField的placeholder

  /**
   * 改变弹窗显隐
   */
  const handlePopverVisibleChange = () => {
    // 关闭时需要先触发onChange, 故此处增加延时
    setTimeout(() => {
      setPopverContentVisible(!popverContentVisible);
    }, 0);
  };

  const handleRangeComponentChange = (value, record) => {
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
  };

  /**
   * 渲染弹窗题体
   */
  const renderPopverFieldContent = (record) => {
    const { name, fieldWidget = 'INPUT', multipleFlag, editorProps = {} } = field;
    const commonProps = {
      record,
      name: multipleFlag ? getTempFieldName(name) : name,
      autoFocus: true,
      clearButton: true,
      ref: editorRef,
      onChange: (value) => handleRangeComponentChange(value, record),
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
              placeholder={intl.get('ssrc.searchBar.view.message.pleaseInput').d('请输入')}
              onPaste={(event) => handlePasteText(event, record, getTempFieldName(name))}
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
                    intl.get('ssrc.searchBar.view.placeholder.startValue').d('起始值'),
                    intl.get('ssrc.searchBar.view.placeholder.endValue').d('结束值'),
                  ]
                : intl.get('ssrc.searchBar.view.message.pleaseInput').d('请输入')
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
  };

  const renderPopoverField = useCallback(
    (record) => {
      const { label, lock = true, fieldWidget = 'INPUT' } = field;
      const disabledFlag = getDisabledFlag(record);
      // 关闭时置气泡内容为空，防止切换筛选器时气泡内容未重置
      const popverContent = popverContentVisible ? renderPopverFieldContent(record) : undefined;
      const overlayClsNames = classnames({
        [`${clsPrefix}-field-editor`]: true,
        [`${clsPrefix}-field-editor-calendar`]: fieldWidget === 'DATE_PICKER',
        [`${clsPrefix}-field-editor-lov`]: fieldWidget === 'LOV',
      });
      const fieldClsNames = classnames({
        [`${clsPrefix}-field`]: true,
        [`${clsPrefix}-field-disabled`]: disabledFlag,
        [`${clsPrefix}-field-highlight`]: !disabledFlag && popverContentVisible,
      });
      const fieldValue = renderFieldValue({ field, record });
      return (
        <Popover
          placement="bottomLeft"
          trigger="click"
          visible={!disabledFlag && popverContentVisible}
          onVisibleChange={() => !disabledFlag && handlePopverVisibleChange()}
          content={popverContent}
          overlayClassName={overlayClsNames}
        >
          <span
            className={fieldClsNames}
            ref={fieldWrapRef}
            style={{ cursor: disabledFlag ? 'not-allowed' : 'pointer' }}
            onClick={handleClickField}
            onBlur={handlebBlurField}
          >
            {/* 是否默认查询条件 */}
            {!lock && (
              <Icon
                type="close"
                className={`${clsPrefix}-field-clear`}
                onClick={handleClearField}
              />
            )}
            <span className={`${clsPrefix}-field-label`}>{label}</span>
            {renderComparison(record)}
            {fieldValue && <span className={`${clsPrefix}-field-value-render`}>{fieldValue}</span>}
            <Icon
              type={fieldWidget === 'DATE_PICKER' ? 'date_range-o' : 'expand_more'}
              className={`${clsPrefix}-field-place-holder-icon`}
              style={{
                fontSize: fieldWidget === 'DATE_PICKER' ? '13px' : '18px',
                marginLeft: fieldWidget === 'DATE_PICKER' ? '2px' : 0, // 日期组件小一点
                marginRight: fieldWidget === 'DATE_PICKER' ? '2px' : 0, // 日期组件小一点
              }}
            />
          </span>
        </Popover>
      );
    },
    [popverContentVisible]
  );

  // 渲染控件Field value
  const renderFieldValue = useCallback(
    ({ record }) => {
      if (!record) {
        return;
      }

      const { name, multipleFlag, fieldWidget, type, format } = field;

      const showFieldName = multipleFlag === 1 ? getTempFieldName(name) : name;
      let text = toJS(record.get(getMeaningFieldName(showFieldName)));
      // 首次ds.create时拿不到lookup，需在此处设置一次
      if (fieldWidget === 'SELECT' && !text && checkValueValid(toJS(record.get(showFieldName)))) {
        const dsField = record.dataSet.getField(showFieldName);
        text = dsField.getLookupText(record.get(showFieldName), true, record);
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
            <span ref={valueRenderRef}>{text}</span>
          </Tooltip>
        ) : (
          <span ref={valueRenderRef}>{text}</span>
        );
      } else if (RANGE_COMPONENTS.includes(fieldWidget) && multipleFlag === 1) {
        return (
          <span>
            <span>
              {text && checkValueValid(text[0]) ? (
                <span>{text[0]}</span>
              ) : (
                <span className={`${clsPrefix}-field-place-holder`}>
                  {type === 'number'
                    ? intl.get('ssrc.searchBar.view.placeholder.startValue').d('起始值')
                    : type === 'date'
                    ? intl.get('ssrc.searchBar.view.placeholder.startDate').d('开始日期')
                    : intl.get('ssrc.searchBar.view.placeholder.startTime').d('开始时间')}
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
              {intl.get('ssrc.searchBar.view.message.rangTo').d('至')}
            </span>
            {text && checkValueValid(text[1]) ? (
              <span>{text[1]}</span>
            ) : (
              <span className={`${clsPrefix}-field-place-holder`}>
                {type === 'number'
                  ? intl.get('ssrc.searchBar.view.placeholder.endValue').d('结束值')
                  : type === 'date'
                  ? intl.get('ssrc.searchBar.view.placeholder.endDate').d('结束日期')
                  : intl.get('ssrc.searchBar.view.placeholder.endTime').d('结束时间')}
              </span>
            )}
          </span>
        );
      }
      return <span>{text}</span>;
    },
    [field]
  );

  const handlePasteText = (event, record, fieldName) => {
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
      throw err;
    }
  };

  const handlePopupFieldEditorHidden = (hidden) => {
    if (hidden) {
      const { fieldWidget, multipleFlag } = field;
      // lov组件点击清除按钮时会调用此处，导致点击不上清楚按钮，故增加延时
      if (fieldWidget === 'LOV') {
        setTimeout(() => {
          setPopupFieldEditMode(FIELD_EDIT_MODE.OUTPUT);
        }, 0);
      } else if (fieldWidget === 'DATE_PICKER' && multipleFlag) {
        // 日期范围popup隐藏时无法触发onChange更新值，故增加延时
        setTimeout(() => {
          // 调用失焦以触发onChange
          editorRef.current.blur();
          setPopupFieldEditMode(FIELD_EDIT_MODE.OUTPUT);
        }, 0);
      } else {
        setPopupFieldEditMode(FIELD_EDIT_MODE.OUTPUT);
      }
    }
  };
  /**
   * 渲染Select/Lov等弹窗
   */
  const renderPopupField = useCallback(
    (record) => {
      const { name, multipleFlag, fieldWidget = 'INPUT', editorProps = {}, type } = field;
      const commonProps = {
        isFlat: true,
        clearButton: true,
        name: multipleFlag ? getTempFieldName(name) : name,
        ref: editorRef,
        record,
        maxTagCount: 3,
        maxTagTextLength: 120,
        onPopupHiddenChange: handlePopupFieldEditorHidden,
        getPopupAlignTarget,
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
            [`${clsPrefix}-field-lov-popup`]: true,
            [`${clsPrefix}-field-lov-popup-single`]: multipleFlag !== 1,
          });
          const lovCommonProps = omit(commonProps, 'searchFieldProps');
          // 优先取自定义的placeholder
          // const placeholder = commonProps?.searchFieldProps?.placeholder || lovSearchPlaceholder;
          const searchFieldProps = {
            multiple: true,
            ref: handleLovSeachFieldRef,
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
                paramMatcher={handleLovParamMatcher}
                popupCls={clsName}
                onSearchMatcherChange={handleLovSearchMatcherChange}
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
                    intl.get('ssrc.searchBar.view.placeholder.startDate').d('开始日期'),
                    intl.get('ssrc.searchBar.view.placeholder.endDate').d('结束日期'),
                  ]
                : [
                    intl.get('ssrc.searchBar.view.placeholder.startTime').d('开始时间'),
                    intl.get('ssrc.searchBar.view.placeholder.endTime').d('结束时间'),
                  ];
          } else if (popupFieldEditMode === FIELD_EDIT_MODE.INPUT) {
            placeholder =
              type === 'date'
                ? intl.get('ssrc.searchBar.view.placeholder.inputDate').d('请输入日期查询')
                : intl.get('ssrc.searchBar.view.placeholder.inputTime').d('请输入时间查询');
          }
          const datePickerProps = {
            ...commonProps,
            popupCls: `${clsPrefix}-field-calendar-popup`,
            editorInPopup: true,
            placeholder,
            onChange: (value) => {
              if (multipleFlag) {
                handleRangeComponentChange(value, record);
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
    },
    [lovSearchPlaceholder, popupFieldEditMode, searchMatcher]
  );

  const handleLovSearchMatcherChange = useCallback(
    (searchFieldName) => {
      const {
        name,
        multipleFlag,
        lovCode,
        textField: customizeTextField,
        lovInfo: { displayField: originTextField } = { displayField: '' },
      } = field;
      const textField = searchFieldName || customizeTextField || originTextField;
      const searchField =
        multipleFlag === 1 ? dataSet?.getField(getTempFieldName(name)) : dataSet?.getField(name);
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
          editorRef?.current?.options?.queryDataSet?.getField(textField) ||
          editorRef?.current?.options?.queryDataSet?.getField(editorRef?.current?.searchMatcher);
        const textFieldLabel = dsField?.get('label') || textField;
        setSearchMatcher(searchFieldName);
        setLovSearchPlaceholder(
          intl
            .get('ssrc.searchBar.view.placeholder.lovSearchTip', { name: textFieldLabel })
            .d(`请输入${textFieldLabel}`)
        );
      } catch (err) {
        throw err;
      }
    },
    [field, dataSet]
  );

  const handleLovParamMatcher = useCallback(
    ({ key, text }) => {
      const {
        name,
        multipleFlag,
        lovCode,
        textField: customizeTextField,
        lovInfo: { displayField: originTextField } = { displayField: '' },
      } = field;
      const textField = searchMatcher || customizeTextField || originTextField;
      // 处理第一次查询的时候，lov组件查询传key和textField不一致的情况
      if (key !== textField) {
        const searchField =
          multipleFlag === 1 ? dataSet?.getField(getTempFieldName(name)) : dataSet?.getField(name);
        if (searchField) {
          setSearchMatcher(key);
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
      return {
        [`${key}_LIKE`]: isString(text) ? text : isArray(text) ? text.join(',') : '',
      };
    },
    [searchMatcher, field, dataSet]
  );

  const handleLovSeachFieldRef = (searchFieldName) => {
    const {
      name,
      multipleFlag,
      lovCode,
      textField: customizeTextField,
      lovInfo: { displayField: originTextField } = { displayField: '' },
    } = field;
    const textField = searchFieldName || customizeTextField || originTextField;
    const searchField =
      multipleFlag === 1 ? dataSet?.getField(getTempFieldName(name)) : dataSet?.getField(name);
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
        editorRef?.current?.options?.queryDataSet?.getField(textField) ||
        editorRef?.current?.options?.queryDataSet?.getField(editorRef?.current?.searchMatcher);
      const textFieldLabel = dsField?.get('label') || textField;
      setSearchMatcher(searchFieldName);
      setLovSearchPlaceholder(
        intl
          .get('ssrc.searchBar.view.placeholder.lovSearchTip', { name: textFieldLabel })
          .d(`请输入${textFieldLabel}`)
      );
    } catch (err) {
      throw err;
    }
  };
  /**
   * 渲染具体的field
   */
  const renderField = useCallback(
    (record) => {
      // switch (fieldWidget) {
      //   case 'INPUT':
      //     return <TextField />;
      //   case 'INPUT_NUMBER':
      //     return <NumberField />;
      //   case 'DATE_PICKER':
      //     if (dateFormat === 'yyyy/MM/dd hh:mm:ss' || dateFormat === 'yyyy-MM-dd hh:mm:ss') return <DateTimePicker />;
      //     return <DatePicker />;
      //   case 'LOV':
      //     return <Lov />;
      //   case 'SELECT':
      //     return <Select />;
      //   default:
      //     return <TextField />;
      // }
      const { label, lock = true, fieldWidget = 'INPUT', lovCode } = field;
      if (['INPUT_NUMBER', 'INPUT'].includes(fieldWidget) || (fieldWidget === 'LOV' && !lovCode)) {
        return renderPopoverField(record);
      } else {
        const fieldValue = renderFieldValue({ field, record });
        const disabledFlag = getDisabledFlag(record);
        const fieldClsNames = classnames({
          [`${clsPrefix}-field`]: true,
          [`${clsPrefix}-field-disabled`]: disabledFlag,
        });
        return (
          <span
            className={fieldClsNames}
            ref={fieldWrapRef}
            style={{ cursor: disabledFlag ? 'not-allowed' : 'pointer' }}
            onClick={handleClickField}
            onBlur={handlebBlurField}
          >
            {!lock && (
              <Icon
                type="close"
                className={`${clsPrefix}-field-clear`}
                onClick={handleClearField}
              />
            )}
            <span className={`${clsPrefix}-field-label`}>{label}</span>
            {renderComparison(record)}
            {popupFieldEditMode === FIELD_EDIT_MODE.INPUT
              ? renderPopupField(record)
              : fieldValue && (
              <span className={`${clsPrefix}-field-value-render`}>{fieldValue}</span>
                )}
            <Icon
              type={fieldWidget === 'DATE_PICKER' ? 'date_range-o' : 'expand_more'}
              className={`${clsPrefix}-field-place-holder-icon`}
              style={{
                fontSize: fieldWidget === 'DATE_PICKER' ? '13px' : '18px',
                marginLeft: fieldWidget === 'DATE_PICKER' ? '2px' : '0', // 日期组件小一点
                marginRight: fieldWidget === 'DATE_PICKER' ? '2px' : 0, // 日期组件小一点
              }}
            />
          </span>
        );
      }
    },
    [popupFieldEditMode, renderPopoverField, renderPopupField]
  );

  const renderFieldWrapper = useCallback(
    ({ record }) => {
      const { helpMessage } = field;
      if (helpMessage) {
        return <Tooltip title={helpMessage}>{renderField(record)}</Tooltip>;
      } else {
        return renderField(record);
      }
    },
    [field, renderField]
  );

  /**
   * 比较规则
   */
  const renderComparison = useCallback(
    (record) => {
      if (!record) {
        return null;
      }
      const { name, customComparisonSet = [], multipleFlag, modelId, fieldId } = field;
      // 虚拟字段不展示
      if (modelId === -1 && fieldId === -1) {
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
          <span className={`${clsPrefix}-field-comparison-render`}>
            {comparisonSetObj[record.get(getComparsionFieldName(name))]}
          </span>
        );
      } else {
        return comparisonSetMode === FIELD_EDIT_MODE.OUTPUT ? (
          <span
            className={`${clsPrefix}-field-comparison-render`}
            onClick={(event) => {
              event.stopPropagation();
              handleComparisonSetMode();
            }}
          >
            {comparisonSetObj[record.get(getComparsionFieldName(name))]}
            <Icon type="expand_more" className={`${clsPrefix}-field-place-holder-icon`} />
          </span>
        ) : (
          <Select
            isFlat
            autoFocus
            onClick={(event) => {
              event.stopPropagation();
            }}
            onBlur={(event) => {
              event.stopPropagation();
              // 此处会触发popver显示，故设置隐藏掉
              // setState({ popverContentVisible: false });
              handleComparisonSetMode();
            }}
            popupCls={`${clsPrefix}-field-comparison-select-menu`}
            className={classnames(
              `${clsPrefix}-field-comparison-select`,
              `${clsPrefix}-select-customize`
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
    },
    [field]
  );

  const getDisabledFlag = useCallback(
    (record) => {
      const { name } = field;
      const ds = record ? record.dataSet : dataSet;
      if (ds) {
        const dsField = ds.getField(name);
        if (dsField) {
          return dsField.get('disabled', record || ds.current);
        }
      }
      return false;
    },
    [dataSet, field]
  );

  const handleComparisonSetMode = () => {
    setComparisonSetMode(
      comparisonSetMode === FIELD_EDIT_MODE.OUTPUT ? FIELD_EDIT_MODE.INPUT : FIELD_EDIT_MODE.OUTPUT
    );
  };

  /**
   * 聚焦编辑Field
   */
  const handleFocusFieldEditor = () => {
    const { fieldWidget = 'INPUT' } = field;
    if (editorRef.current) {
      if (editorRef.current.focus) {
        editorRef.current.focus();
      }
      if (editorRef.current.handleFocus) {
        editorRef.current.handleFocus();
      }
      if (fieldWidget === 'LOV' && lovSearchFieldRef?.current?.focus) {
        // eslint-disable-next-line no-unused-expressions
        lovSearchFieldRef?.current?.focus();
      }
    }
  };

  /**
   * 当编辑方式改变后
   */
  useEffect(() => {
    if (popupFieldEditMode !== FIELD_EDIT_MODE.INPUT) return;
    handleFocusFieldEditor();
  }, [popupFieldEditMode]);

  /**
   * 点击
   */
  const handleClickField = () => {
    const { fieldWidget = 'INPUT' } = field;
    const disabledFlag = getDisabledFlag();
    if (disabledFlag) {
      return;
    }
    if (['LOV', 'SELECT', 'DATE_PICKER'].includes(fieldWidget)) {
      if (popupFieldEditMode !== FIELD_EDIT_MODE.INPUT) {
        setPopupFieldEditMode(FIELD_EDIT_MODE.INPUT);
      }
    } else {
      handleFocusFieldEditor();
    }
  };

  /**
   * 失焦
   */
  const handlebBlurField = () => {
    const { multipleFlag, fieldWidget = 'INPUT' } = field;
    const disabledFlag = getDisabledFlag();
    if (disabledFlag) {
      return;
    }
    // 单选select和日期组件触发不了onPopupHiddenChange,故使用失焦事件
    if (['SELECT', 'DATE_PICKER'].includes(fieldWidget) && !multipleFlag) {
      setPopupFieldEditMode(FIELD_EDIT_MODE.OUTPUT);
    }
  };

  /**
   * 清空value
   */
  const handleClearField = (event) => {
    event.stopPropagation();
    onDelete(field);
  };

  const getPopupAlignTarget = () => {
    return fieldWrapRef.current;
  };

  return <Output dataSet={dataSet} name={name} renderer={renderFieldWrapper} />;
}

import React, { ReactNode } from 'react';
import { Form, Row, Col, Tooltip, Icon } from 'hzero-ui';
import { isNil } from 'lodash';
import {
  getFormItemComponent,
  coverConfig,
  adjustRowAndCol,
  getComputeComp,
  defaultValueFx,
  customizeFormRules,
  getContextParams,
  traversalFormItems,
  preAdapterInitValue,
} from '../../customizeTool';
import { UnitConfig, FieldConfig, FormItem } from '../../interfaces';

export default function generateForm(rows = {}, config: UnitConfig = {}, options) {
  const {
    fields = [],
    readOnly: _readOnly2,
    maxCol = 3,
    labelCol: unitLabelCol = 9,
    wrapperCol: unitWrapperCol = 15,
  } = config;
  const allConfigFields: string[] = [];
  const newFields: FieldConfig[] = [];
  fields.forEach((i: FieldConfig) => {
    allConfigFields.push(i.fieldCode);
    newFields.push(i);
  });
  const {
    form,
    gutter,
    dataSource = {},
    getValueFromCache,
    code,
    className,
    unitData,
    readOnly: _readOnly1,
  } = options;
  const readOnly = _readOnly1 || _readOnly2;
  const parseRows = {};
  const tempItems: FormItem[] = []; // 存放位置冲突或者未配置位置的扩展字段的FormItem
  Object.keys(rows).forEach((i) => {
    if (!allConfigFields.includes(i)) {
      newFields.push({ fieldCode: i });
    }
  });
  const baseCol = Math.floor(24 / maxCol);
  newFields.forEach((i) => {
    const {
      conditionHeaderDTOs,
      fieldType,
      fieldCode,
      fieldName,
      formRow,
      formCol,
      textMaxLength,
      textMinLength,
      renderOptions,
      labelCol,
      wrapperCol,
      renderRule,
      dateFormat,
      colSpan,
      paramList = [],
      helpMessage,
      columnLength,
      numberMax,
      numberMin,
    } = i;
    const { required, visible, editable } = coverConfig(
      { required: i.required, visible: i.visible, editable: i.editable },
      conditionHeaderDTOs,
      { getValueFromCache, code }
    );
    if (visible === 0) {
      if (renderOptions === 'WIDGET' && form) {
        form.getFieldDecorator(fieldCode, {
          initialValue: undefined,
          rules: [],
        });
      }
      return;
    }
    const rules = customizeFormRules({ ...i, required }, { getValueFromCache, code });
    const { defaultValue, defaultValueMeaning } = defaultValueFx({ getValueFromCache, code }, i);
    if (!rows[fieldCode]) {
      // 排除保留原有逻辑的显示控制
      if (visible === -1) return;
      const newRowProps = {
        className: 'writable-row',
        // individualProps.rowProps
      };
      const newColProps = {
        span: colSpan !== undefined ? baseCol * colSpan : baseCol,
        // individualProps.colProps
      };
      let formItem;
      const formOptions = {
        fieldType,
        required,
        textMaxLength,
        textMinLength,
        fieldName,
        rules,
        dateFormat,
      };
      if (columnLength && (!textMaxLength || textMaxLength > columnLength)) {
        formOptions.textMaxLength = columnLength;
      }
      const wrapProps = {
        label: helpMessage ? (
          <>
            {fieldName}
            <Tooltip title={helpMessage}>
              <Icon type="question-circle-o" style={{ verticalAlign: 'unset' }} />
            </Tooltip>
          </>
        ) : (
          fieldName
        ),
        className: `cust-field-${fieldCode}`,
        labelCol: { span: labelCol || unitLabelCol },
        wrapperCol: { span: wrapperCol || unitWrapperCol },
      };
      if (renderRule) {
        formItem = getComputeComp(renderRule, { wrapProps, unitData });
      } else {
        formItem = getFormItemComponent(
          fieldType,
          renderOptions
        )({
          form,
          readOnly,
          fieldCode,
          formOptions,
          rules,
          contentProps: {
            ...i,
            defaultValue,
            defaultValueMeaning,
            style: { width: '100%' },
            getValueFromCache,
            editable,
            unitLabelCol,
            unitWrapperCol,
            dataSource,
          },
          wrapProps,
          numberMax,
          numberMin,
        });
      }
      adjustRowAndCol(parseRows, formItem, {
        row: formRow,
        col: formCol,
        tempItems,
        rowProps: newRowProps,
        colProps: newColProps,
      });
    } else {
      let { formItem } = rows[fieldCode];
      const { rowProps, colProps, row, col } = rows[fieldCode];
      const mergeFieldConfig: FieldConfig = { ...i, editable, required, defaultValueMeaning };
      const {
        // eslint-disable-next-line no-shadow
        formRow = row,
        // eslint-disable-next-line no-shadow
        formCol = col,
        // eslint-disable-next-line no-shadow
        visible,
        // eslint-disable-next-line no-shadow
        labelCol,
        // eslint-disable-next-line no-shadow
        wrapperCol,
        // eslint-disable-next-line no-shadow
        fieldType,
        // eslint-disable-next-line no-shadow
        colSpan = 1,
      } = mergeFieldConfig;
      if (visible === 0 || isNil(row)) return;
      const newColProps = { ...colProps };
      if ((rowProps.className || '').indexOf('half-row') > -1) {
        newColProps.span = 12;
      } else {
        newColProps.span = colSpan * baseCol;
        newColProps.className = colSpan > 1 ? 'col-span' : '';
      }
      formItem = traversalFormItems(formItem, {
        ...mergeFieldConfig,
        defaultValue: preAdapterInitValue(fieldType, defaultValue),
        initNewFormItemProps: {
          labelCol: { span: labelCol || unitLabelCol },
          wrapperCol: { span: wrapperCol || unitWrapperCol },
        },
        rules,
        form,
        queryParams:
          paramList.length > 0
            ? getContextParams(paramList, {
                getValueFromCache,
                targetForm: form,
                targetDataSource: dataSource,
              })
            : undefined,
        dataSource,
      });
      adjustRowAndCol(parseRows, formItem, {
        row: formRow,
        col: formCol,
        tempItems,
        rowProps,
        colProps: newColProps,
      });
    }
  });
  const configRows: any[] = Object.keys(parseRows).sort(
    (prev, next) => Number(prev) - Number(next)
  );
  const tempRowStart = Number(configRows[configRows.length > 0 ? configRows.length - 1 : 0]) + 1;
  tempItems.forEach((item, index) => {
    const row = Math.floor(index / maxCol) + tempRowStart;
    const col = index % maxCol;
    if (!parseRows[row]) {
      parseRows[row] = {
        rowProps: {},
        formItemList: [],
      };
      configRows.push(row);
    }
    parseRows[row].rowProps = item.rowProps;
    parseRows[row].formItemList[col] = {
      colProps: item.colProps,
      formItem: item.formItem,
    };
  });
  return (
    <Form className={className || 'writable-row-custom'}>
      {configRows.map((key) => (
        <Row {...parseRows[key].rowProps} gutter={gutter}>
          {
            // eslint-disable-next-line func-names
            (function (row) {
              const cols: ReactNode[] = [];
              const oldCols = row.formItemList;
              for (let i = 0; i < oldCols.length; i++) {
                if (!oldCols[i] && (row.rowProps.className || '').indexOf('half-row') === -1) {
                  cols.push(<Col span={Math.floor(24 / maxCol)} />);
                } else if (oldCols[i]) {
                  const { formItem, colProps } = oldCols[i];
                  cols.push(<Col {...colProps}>{formItem}</Col>);
                }
              }
              return cols;
            })(parseRows[key])
          }
        </Row>
      ))}
    </Form>
  );
}

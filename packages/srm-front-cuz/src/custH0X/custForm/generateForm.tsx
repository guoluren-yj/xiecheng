import React from 'react';
import { Icon, Tooltip } from 'hzero-ui';
import {
  coverConfig,
  defaultValueFx,
  fieldNameFx,
  getParams,
  preAdapterInitValue,
} from '../../customizeTool';
import Customize from '../../Customize';
import { FieldConfig, FormItem } from '../../interfaces';
import getComponent, { getComputeComp } from '../getComponent';
import { adjustRowAndCol, customizeFormRules, traversalFormItems } from '../common';

type GenerateFormOptions = {
  code: string;
  readOnly?: boolean;
  customizeWidgetHook?: (fieldType: string) => Function;
  customFieldPropsIntercept?: { [k: string]: (props: any) => any };
};
export default function generateForm(
  this: Customize,
  rows: { [k: string]: FormItem },
  options: GenerateFormOptions
) {
  const { code, readOnly: _readOnly1, customizeWidgetHook, customFieldPropsIntercept } = options;
  const { custConfig, cache, contextParams: ctxParams } = this;
  const config = custConfig[code];
  const {
    fields = [],
    readOnly: _readOnly2,
    maxCol = 3,
    labelCol: unitLabelCol = 9,
    wrapperCol: unitWrapperCol = 15,
  } = config;

  const { form, dataSource, cacheKey } = cache[code];
  const tools = { cache, code, ctxParams, relatedList: config.unitAlias, rowKey: cacheKey, attachmentsCount: this.attachmentsCount![code] };
  const newFields: FieldConfig[] = [...fields];
  const readOnly = _readOnly1 || _readOnly2;
  const parseRows = {};
  const tempItems: FormItem[] = []; // 存放位置冲突或者未配置位置的扩展字段的FormItem
  const baseCol = Math.floor(24 / maxCol);
  Object.keys(rows).forEach((i) => {
    const configField = newFields.find((j) => j.fieldCode === i);
    if (!configField) {
      newFields.push({ fieldCode: i } as any);
    }
  });
  newFields.forEach((i) => {
    const {
      conditionHeaderDTOs,
      fieldCode,
      formRow,
      formCol,
      labelCol,
      wrapperCol,
      renderRule,
      colSpan = 1,
      paramList,
      defaultValue: v,
      defaultValueConDTO,
      defaultValueMeaning: m,
      proDefaultFlag,
      fieldNameConDTO,
      helpMessageConDTO,
    } = i;
    const {
      required = i.required,
      visible = i.visible,
      editable = i.editable,
    } = coverConfig(conditionHeaderDTOs, { cache, code, ctxParams, attachmentsCount: this.attachmentsCount![code] });
    if (visible === 0) {
      if (form && !readOnly && cache[code].hiddenFields && !cache[code].hiddenFields.includes(fieldCode)) {
        cache[code].hiddenFields.push(fieldCode);
      }
      return;
    }
    let { defaultValue = v, defaultValueMeaning = m } = defaultValueFx(
      tools,
      defaultValueConDTO,
      proDefaultFlag
    );
    const fieldName = fieldNameFx(tools, fieldNameConDTO) || i.fieldName;
    const helpMessage = fieldNameFx(tools, helpMessageConDTO) || i.helpMessage;
    if (proDefaultFlag && typeof defaultValue === 'function') {
      defaultValue = defaultValue();
    }
    const defaultLabel = rows[fieldCode] && rows[fieldCode].defaultLabel;
    const rules = customizeFormRules(
      { ...i, required, fieldName: fieldName || defaultLabel },
      tools
    );
    if (!rows[fieldCode]) {
      // 排除保留原有逻辑的显示控制
      if (visible === -1) {
        if (form) {
          // 等价于不显示，此处将值注册到form中，但注意一点，此处注册进去的值为接口数据中的原始值
          form.getFieldDecorator(fieldCode, {
            initialValue: dataSource[fieldCode],
            rules: [],
          });
        }
        return;
      }
      const newRowProps = {
        className: 'writable-row',
        // individualProps.rowProps
      };
      const newColProps = {
        span: colSpan !== undefined ? baseCol * colSpan : baseCol,
        // individualProps.colProps
      };
      let formItem;
      const wrapProps = {
        // eslint-disable-next-line no-nested-ternary
        label: helpMessage ? (
          helpMessage ? (
            <>
              {fieldName}
              <Tooltip title={helpMessage}>
                <Icon type="question-circle-o" style={{ verticalAlign: 'unset' }} />
              </Tooltip>
            </>
          ) : (
            fieldName
          )
        ) : (
          fieldName
        ),
        className: `cust-field-${fieldCode}`,
        labelCol: { span: labelCol || unitLabelCol },
        wrapperCol: { span: wrapperCol || unitWrapperCol },
      };
      if (renderRule) {
        formItem = getComputeComp(renderRule, { ...tools, wrapProps });
      } else {
        formItem = getComponent(
          {
            ...i,
            editable,
            defaultValue,
            defaultValueMeaning,
          },
          {
            ...tools,
            form,
            dataSource,
            customizeWidgetHook,
            customFieldPropsIntercept,
            isEdit: true,
            wrapProps,
            readOnly,
            rules,
          }
        );
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
      if (row === undefined) return;
      // const newRowProps = { ...rowProps, ..._rowProps };
      const newColProps = { ...colProps };
      if ((rowProps.className || '').indexOf('half-row') > -1) {
        newColProps.span = 12;
      } else {
        newColProps.span = colSpan * baseCol;
        newColProps.className = colSpan > 1 ? 'col-span' : '';
      }
      const params = getParams({ ...tools, paramList });
      formItem = traversalFormItems(
        formItem,
        {
          ...i,
          fieldName,
          editable,
          visible,
          helpMessage,
          defaultValue: preAdapterInitValue(i, defaultValue, true),
          defaultValueMeaning,
          initNewFormItemProps: {
            labelCol: { span: labelCol || unitLabelCol },
            wrapperCol: { span: wrapperCol || unitWrapperCol },
          },
        },
        {
          form,
          rules,
          dataSource,
          params,
          tools,
          customFieldPropsIntercept,
        }
      );
      adjustRowAndCol(parseRows, formItem, {
        row: formRow === undefined ? row : formRow,
        col: formCol === undefined ? col : formCol,
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
  return { parseRows, configRows };
}

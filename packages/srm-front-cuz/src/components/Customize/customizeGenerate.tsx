import { Icon, Tooltip } from 'hzero-ui';
import React from 'react';
import {
  getFormItemComponent,
  preAdapterInitValue,
  traversalFormItems,
  customizeFormRules,
  getComputeComp,
  getContextParams,
} from './customizeTool';
import { FieldConfig } from './interfaces';

export function generateFilterForm(formMap = {}, fields: FieldConfig[] = [], options) {
  const {
    form,
    unitLabelCol = 10,
    unitWrapperCol = 14,
    unitData,
    getValueFromCache,
    code,
  } = options;
  const individualField: any[] = []; // 个性化处理后的列对象，key值为调整后的顺序
  const allConfigFields: string[] = [];
  const newFields: FieldConfig[] = [];
  fields.forEach((i) => {
    allConfigFields.push(i.fieldCode);
    newFields.push(i);
  });
  Object.keys(formMap).forEach((i) => {
    if (!allConfigFields.includes(i)) {
      newFields.push({ fieldCode: i });
    }
  });
  newFields.sort((pre, next) => (pre.seq || 0) - (next.seq || 0));
  // 配置拆分
  newFields.forEach((i) => {
    const {
      fieldCode,
      fieldType,
      required,
      editable,
      fieldName,
      visible,
      textMaxLength,
      textMinLength,
      labelCol,
      wrapperCol,
      defaultValue,
      renderRule,
      renderOptions,
      dateFormat,
      paramList = [],
      helpMessage,
      numberMax,
      numberMin,
      trimFlag,
    } = i;
    if (visible === 0) {
      form &&
        form.getFieldDecorator(fieldCode, {
          initialValue: undefined,
          rules: [{ required: false }],
        });
      return;
    }
    if (formMap[fieldCode] !== undefined) {
      const rules = customizeFormRules(i, { getValueFromCache, code });
      // eslint-disable-next-line no-param-reassign
      formMap[fieldCode] = traversalFormItems(formMap[fieldCode], {
        ...i,
        defaultValue: preAdapterInitValue(fieldType, defaultValue),
        rules,
        queryParams:
          paramList.length > 0
            ? getContextParams(paramList, {
                getValueFromCache,
                code,
                targetForm: form,
                targetDataSource: {},
              })
            : undefined,
        editable,
        form,
      });
      individualField.push(formMap[fieldCode]);
    } else {
      if (visible === -1) return;
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
        labelCol: { span: labelCol || unitLabelCol },
        wrapperCol: { span: wrapperCol || unitWrapperCol },
      };
      if (renderRule) {
        formItem = getComputeComp(renderRule, { isGrid: true, unitData });
      } else {
        formItem = getFormItemComponent(
          fieldType,
          renderOptions
        )({
          form,
          fieldCode,
          formOptions: {
            fieldType,
            required,
            textMaxLength,
            textMinLength,
            fieldName,
            dateFormat,
            trimFlag,
          },
          contentProps: {
            ...i,
            style: { width: '100%' },
            getValueFromCache,
            editable,
          },
          wrapProps,
          numberMax,
          numberMin,
        });
      }
      individualField.push(formItem);
    }
  });
  return individualField;
}

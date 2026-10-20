import { isEmpty, isArray } from 'lodash';
import React, { cloneElement, createContext } from 'react';
import { Col, Icon, Row, Tooltip } from 'hzero-ui';
import { FieldConfig } from '../interfaces';
import Customize, { Cache } from '../Customize';
import { traversalFormItems } from './common';
import { getParams, preAdapterInitValue } from '../customizeTool';
import getComponent, { getComputeComp } from './getComponent';
import FieldContext from '../components/Field/FieldContext';

const Ctx = createContext<{ [code: string]: Cache }>({});

export default function customizeFilterForm(this: Customize, options: any = {}, formComponent) {
  const { code = '', form, expand, dataSource = {} } = options;
  const { custConfig, cache } = this;
  if (this.state.loading) return null;
  if (!code || isEmpty(custConfig[code])) return formComponent;
  if (!cache[code].init) {
    cache[code].init = true;
    const { unitAlias = [] } = custConfig[code];
    cache[code].relatedUnit = unitAlias.filter((k) => k.unitCode !== code);
    cache[code].getValue = function (fieldCode) {
      let values = this.dataSource || {};
      if (this.form) {
        values = { ...values, ...this.form.getFieldsValue() };
      }
      return values[fieldCode];
    };
    cache[code].getAllValue = function () {
      let values = this.dataSource || {};
      if (this.form) {
        values = { ...values, ...this.form.getFieldsValue() };
      }
      return values;
    };
  }
  cache[code].form = form;
  cache[code].dataSource = dataSource;
  const { maxCol = 3, labelCol: unitLabelCol = 10, wrapperCol: unitWrapperCol = 14 } = custConfig[
    code
  ];
  const { props: { children: wrapRow } = { children: {} } } = formComponent;
  const filter = wrapRow.props ? wrapRow.props.children : [];
  if (filter.length < 2) return formComponent;
  if (
    !filter[0].props ||
    !filter[1].props ||
    !filter[0].props.children ||
    !filter[1].props.children ||
    !(filter[1].props.children.props || {}).children
  ) {
    return formComponent;
  }
  const controller = filter[1].props.children;
  const formItemObj = {};
  const order = [];
  (
    isArray(filter[0].props.children)
    ? [...filter[0].props.children]
    : [filter[0].props.children]
  ).forEach(({ props }) => {
    traversalFilterForm(props.children, formItemObj, order);
  });
  const newFormItem = generateFilterForm.call(this, {
    code,
    formItemObj,
    unitLabelCol,
    unitWrapperCol,
  });
  const fieldRows: any[] = [[]];
  if (newFormItem.length > maxCol) {
    fieldRows[1] = [];
  }
  const rowLimit = maxCol - 1;
  newFormItem.forEach((i, index) => {
    let target = -1;
    if (index > rowLimit) {
      target = 1;
    } else {
      target = 0;
    }
    fieldRows[target].push(<Col span={Math.floor(24 / maxCol)}>{i}</Col>);
  });
  return (
    <Ctx.Provider value={cache}>
      <FieldContext.Provider value={{form}}>
        {cloneElement(formComponent, {
          children: [
            cloneElement(wrapRow, {
              children: [
                cloneElement(filter[0], {
                  children: [
                    <Row>{fieldRows[0]}</Row>,
                    <Row style={{ display: expand ? 'block' : 'none' }}>{fieldRows[1]}</Row>,
                  ],
                }),
                cloneElement(filter[1], {
                  children: isArray(filter[1].props.children) ? filter[1].props.children.slice(1) : filter[1].props.children,
                }),
              ],
            }),
          ],
        })}
      </FieldContext.Provider>
    </Ctx.Provider>
  );
}

function traversalFilterForm(reactElement, formObj = {}, order: string[] = []) {
  if (!reactElement) return;
  if (isArray(reactElement)) {
    reactElement.forEach((i) => traversalFilterForm(i, formObj, order));
  } else if (reactElement.props.span) {
    const { children: singleFormItem } = reactElement.props;
    let fieldCode;
    if (!singleFormItem || !singleFormItem.props || !singleFormItem.props.children) return;
    const formChildren = singleFormItem.props.children;
    if (isArray(formChildren)) {
      for (let i = 0; i < formChildren.length; i++) {
        if (formChildren[i].props && formChildren[i].props['data-__field'] !== undefined) {
          fieldCode = formChildren[i].props['data-__field'].name;
          break;
        }
      }
    } else if (formChildren.props && formChildren.props['data-__field']) {
      fieldCode = formChildren.props['data-__field'].name;
    }
    // eslint-disable-next-line no-param-reassign
    formObj[fieldCode] = singleFormItem;
    order.push(fieldCode);
  }
}

function generateFilterForm(this: Customize, options) {
  const { code, formItemObj, unitLabelCol, unitWrapperCol } = options;
  const { custConfig, cache, contextParams: ctxParams } = this;
  const { form, dataSource } = cache[code];
  const { fields = [], unitAlias = [] } = custConfig[code];
  const tools = { cache, code, ctxParams, relatedList: unitAlias };
  const individualField: any[] = []; // 个性化处理后的列对象，key值为调整后的顺序
  const allConfigFields: string[] = [];
  const newFields: FieldConfig[] = [];
  fields.forEach((i) => {
    allConfigFields.push(i.fieldCode);
    newFields.push(i);
  });
  Object.keys(formItemObj).forEach((i) => {
    if (!allConfigFields.includes(i)) {
      newFields.push({ fieldCode: i } as any);
    }
  });
  newFields.sort((pre, next) => (pre.seq || 0) - (next.seq || 0));
  // 配置拆分
  newFields.forEach((i) => {
    const {
      fieldCode,
      editable,
      visible,
      labelCol,
      wrapperCol,
      proDefaultFlag,
      defaultValueMeaning,
      renderRule,
      renderOptions,
      paramList,
      helpMessage,
      readOnly,
      fieldName,
    } = i;
    let { defaultValue } = i;
    if (visible === 0) {
      if (renderOptions === 'WIDGET' && cache[code].form) {
        cache[code].form.getFieldDecorator(fieldCode, { rules: [] });
      }
      return;
    }
    if (proDefaultFlag && typeof defaultValue === 'function') {
      defaultValue = defaultValue();
    }
    if (formItemObj[fieldCode] !== undefined) {
      const params = getParams({ ...tools, paramList });
      formItemObj[fieldCode] = traversalFormItems(
        formItemObj[fieldCode],
        {
          ...i,
          editable,
          visible,
          defaultValue: preAdapterInitValue(i, defaultValue, true),
          defaultValueMeaning,
        },
        {
          form,
          rules: [],
          dataSource,
          params,
        }
      );
      individualField.push(formItemObj[fieldCode]);
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
            isEdit: true,
            wrapProps,
            readOnly,
            rules: [],
          }
        );
      }
      individualField.push(formItem);
    }
  });
  return individualField;
}

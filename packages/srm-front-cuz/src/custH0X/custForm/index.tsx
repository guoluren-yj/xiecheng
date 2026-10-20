import { isArray, omit, isEmpty, isNil } from 'lodash';
// import generateForm from "./generateForm";
import React, { cloneElement, createContext, ReactNode } from 'react';
import { Col, Row } from 'hzero-ui';
import Customize, { Cache } from '../../Customize';
import generateForm from './generateForm';
import FieldContext from '../../components/Field/FieldContext';
// @ts-ignore
import H0CustomizeContext from 'srm-front-boot/lib/components/CustomizeContext/H0CustomizeContext';

const Ctx = createContext<{ [code: string]: Cache }>({});
export default function customizeForm(
  this: Customize & { cacheKeyMap: any },
  options: any = {},
  formComponent
) {
  const {
    code,
    form,
    dataSource,
    readOnly = false,
    gutter = 48,
    customizeWidgetHook,
    customFieldPropsIntercept,
    // cacheKey = code, // 请将cacheKey影响范围缩小到本单元内，因为单元间关联时要感知cacheKey的定义会增加很多冗余逻辑，增大维护难度
    // dataSourceLoading, // 解决在dataSource查询完成前缓存dataSource的问题
  } = options;
  const { custConfig, cache } = this;
  if (this.state.loading) return null;
  if (!code || isEmpty(custConfig[code])) return formComponent;

  if (!cache[code].init) {
    cache[code].init = true;
    const { unitAlias = [] } = custConfig[code];
    cache[code].relatedUnit = unitAlias.filter((k) => k.unitCode !== code);
    cache[code].getValue = function (fieldCode) {
      let values = this.dataSource;
      if (this.form) {
        values = { ...values, ...this.form.getFieldsValue() };
      }
      return values[fieldCode];
    };
    cache[code].getAllValue = function () {
      let values = this.dataSource;
      if (this.form) {
        values = { ...values, ...this.form.getFieldsValue() };
      }
      return values;
    };
    cache[code].hiddenFields = [];
    this.attachmentsCount![code] = {};
  }
  const { maxCol = 3 } = custConfig[code];
  // cache内的dataSource保持最新
  cache[code].form = form;
  cache[code].dataSource = dataSource || {};
  const formItemObj = customizeFormCompatible(formComponent);
  const { parseRows, configRows } = generateForm.call(this, formItemObj, {
    code,
    readOnly,
    customizeWidgetHook,
    customFieldPropsIntercept,
  });
  const newProps: any = {};
  if (!formComponent.props.className) {
    newProps.className = 'writable-row-custom';
  }
  const children = configRows.map((key) => (
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
  ));
  newProps.children = children;
  if (cache[code].hiddenFields.length > 0) {
    setTimeout(() => {
      const realTimeDataSource = cache[code].dataSource;
      cache[code].hiddenFields.forEach((field) => {
        // 不安全，存在配置的字段和数据源中的字段不对应的情况，目前暂且认为时没有问题的
        const oldValue = form.getFieldValue(field) || (realTimeDataSource || {})[field];
        form.getFieldDecorator(field, { initialValue: oldValue, rules: [] });
      });
      cache[code].hiddenFields = [];
      // 在dataSource数据加载后触发一次表单更新，解决使用隐藏字段作为条件、参数时，部分场景无效的问题
      if (!cache[code].dataLoadedUpdate && !isEmpty(realTimeDataSource || {})) {
        cache[code].dataLoadedUpdate = true;
        cache[code].form.setFieldsValue({});
        if (options.forceUpdate) {
          options.forceUpdate();
        }
      }
    }, 0);
  }
  return (
    <H0CustomizeContext.Provider value={{attachmentsCount: this.attachmentsCount![code]}}>
      <Ctx.Provider value={cache}>
        <FieldContext.Provider value={{form}}>
          {cloneElement(formComponent, newProps)}
        </FieldContext.Provider>
      </Ctx.Provider>
    </H0CustomizeContext.Provider>
  );
}

function customizeFormCompatible(formComponent: any) {
  const { props: { children: rowChildren } = { children: undefined } } = formComponent;
  const formItemObj = {};
  // eslint-disable-next-line no-param-reassign
  if (isArray(rowChildren)) {
    rowChildren.forEach((row, index) => {
      if (!isNil(row) && typeof row === 'object') {
        traversalStandardForm(
          row.props.children,
          formItemObj,
          index,
          0,
          omit(row.props, ['children'])
        );
      }
    });
  } else {
    traversalStandardForm(
      (rowChildren.props || {}).children,
      formItemObj,
      0,
      0,
      omit(rowChildren.props, ['children'])
    );
  }
  return formItemObj;
}

function traversalStandardForm(reactElement, formObj = {}, row, col = 0, rowProps) {
  if (!reactElement) return;
  if (isArray(reactElement)) {
    reactElement.forEach((i, _index) => traversalStandardForm(i, formObj, row, _index, rowProps));
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
    formObj[fieldCode] = {
      formItem: singleFormItem,
      defaultLabel: singleFormItem.props.label,
      row: row + 1,
      col: col + 1,
      rowProps,
      colProps: reactElement.props,
    };
  }
}

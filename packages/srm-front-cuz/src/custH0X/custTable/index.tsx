import { isEmpty } from 'lodash';
import React, { cloneElement, createContext } from 'react';
// @ts-ignore
import H0CustomizeContext from 'srm-front-boot/lib/components/CustomizeContext/H0CustomizeContext';
import generateTableColumns from './generateTableColumns';
import Customize, { Cache } from '../../Customize';

type Options = {
  code: string;
  readOnly?: boolean;
  namespace?: string;
  /** 指定标准动态列插入到最终表格列的位置, 0开始 */
  dynamicIndex?: number;
  customFieldPropsIntercept?: { [k: string]: (props: any) => any };
};

const Ctx = createContext<{ [code: string]: Cache }>({});

export default function customizeTable(this: Customize, options: Options, table) {
  const { custConfig, cache } = this;
  const { code, namespace } = options;
  if (this.state.loading) return cloneElement(table, { columns: [], scroll: { x: 0 } });
  if (!code || isEmpty(custConfig[code])) return table;
  const newProps: any = {};
  cache[code].dataSource = table.props.dataSource;
  if (!cache[code]._DSs) cache[code]._DSs = {};
  if (namespace) {
    cache[code]._DSs[namespace] = table.props.dataSource;
  } else cache[code].dataSource = table.props.dataSource;
  if (!cache[code].init) {
    cache[code].init = true;
    const { unitAlias = [] } = custConfig[code];
    cache[code].relatedUnit = unitAlias.filter((k) => k.unitCode !== code);
    // eslint-disable-next-line no-shadow
    cache[code].getValue = function (fieldCode, rowKey, namespace) {
      let _dataSource = this.dataSource;
      if (namespace) _dataSource = this._DSs[namespace];
      // 同组可能有两个带namespace的表格单元，即使不带，拿的也是错误的数据
      // 以当前逻辑，A表格会去拿B表格的数据（没有实际意义，但这一步目前不能避免），会报错
      // 故增加一个_dataSource存在性检验
      let values = (_dataSource && findNestDataSourceByIndex(_dataSource, rowKey)) || {};
      if (values && values.$form) {
        values = { ...values, ...values.$form.getFieldsValue() };
      }
      return values[fieldCode];
    };
    // eslint-disable-next-line no-shadow
    cache[code].getAllValue = function (rowKey: string | number, namespace) {
      let _dataSource = this.dataSource;
      if (namespace) _dataSource = this._DSs[namespace];
      let values = (_dataSource && findNestDataSourceByIndex(_dataSource, rowKey)) || {};
      if (values && values.$form) {
        values = { ...values, ...values.$form.getFieldsValue() };
      }
      return values;
    };
    this.attachmentsCount![`${namespace || ""}_${code}`] = {};
  }

  const { columns, scroll } = table.props;
  const { columns: newColumns, noWidthCount, scrollWidth } = generateTableColumns.call(
    this,
    columns,
    options
  );
  // eslint-disable-next-line no-param-reassign
  newProps.columns = newColumns;
  if (scroll !== undefined) {
    const originScroll = table.props.scroll;
    // eslint-disable-next-line no-param-reassign
    newProps.scroll = { ...originScroll, x: scrollWidth + noWidthCount * 200 };
  }
  return (
    <H0CustomizeContext.Provider value={{attachmentsCount: this.attachmentsCount![`${namespace || ""}_${code}`]}}>
      <Ctx.Provider value={cache}>
        {cloneElement(table, newProps)}
      </Ctx.Provider>
    </H0CustomizeContext.Provider>
  );
}

function findNestDataSourceByIndex(dataSource: any[], index: string | number) {
  let rowCount = -1;
  function traversal(dataSource: any[]) {
    for (let row of dataSource) {
      rowCount++;
      if (rowCount == index) return row;
      if (row.children && row.children.length > 0) {
        const subRow = traversal(row.children);
        if (subRow) return subRow;
      }
    }
  }
  return traversal(dataSource);
}

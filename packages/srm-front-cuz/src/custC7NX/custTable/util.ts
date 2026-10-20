import {
  useMemo,
  useContext,
  ReactNode,
} from 'react';
import moment from "moment";
import { isObservableObject } from "mobx";
import { isPlainObject } from 'lodash';
import { DataSet } from 'choerodon-ui/pro';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/interface';
import { CustomizeContext } from '../../Customize';
import {
  FieldPlainMap,
} from '../common';
import { useCustomizeDataSet } from '../hooks';

export function parseNestColumnns(
  plainMap: Map<string, FieldPlainMap<ColumnProps>>,
  originColumns: Array<ColumnProps & { isStdDynamic?: boolean }>,
  parent?: FieldPlainMap<ColumnProps>
) {
  originColumns.forEach(column => {
    if (!column) return;
    const { name = '', key = '', aggregation, children, ...others } = column;
    const currentField: FieldPlainMap<ColumnProps> = {
      column: {
        aggregation,
        ...others,
      },
      parent,
    };
    if (aggregation) {
      currentField.column.key = String(key || name);
    } else currentField.column.name = name;
    // 标准动态聚合列还原初始属性
    if (column.isStdDynamic && children) {
      currentField.column.children = children;
    }
    plainMap.set(String(name || key), currentField);
    if (children) {
      parseNestColumnns(plainMap, children, currentField);
    }
  });
}

export function setColumn(plainMap: Map<string, FieldPlainMap<any>>, column: ColumnProps) {
  const { name = '', key = '', aggregation, children, ...others } = column;
  let currentField = plainMap.get(String(name || key)) as FieldPlainMap<ColumnProps>;
  if (currentField) {
    currentField.column = others;
  } else currentField = { column };
  if (aggregation) {
    currentField.column.aggregation = aggregation;
    currentField.column.key = key;
  } else currentField.column.name = name;
  const newKey = String(name || key);
  plainMap.set(newKey, currentField as FieldPlainMap<any>);
}

export function useTableDataSet(code, options, dataSet) {
  const customize = useContext(CustomizeContext);
  const { cache, contextParams: ctxParams, custConfig } = customize;
  const { mainGroupCode, viceGroupCode, namespace, proxyQuery } = options;
  return useMemo(() => {
    // eslint-disable-next-line no-shadow
    const { unitAlias = [], readOnly: readOnly2, fields = [], autoNewlineFlag, gridSummary, gridMaxPageCount } = custConfig[code];
    // 根据列顺序属性排序
    const newFields = [...fields].sort((before, after) => {
      if (before.seq === undefined && after.seq === undefined) return 0;
      if (before.seq === undefined) return 1;
      if (after.seq === undefined) return -1;
      return before.seq - after.seq;
    });
    cache[code].init = true;
    cache[code].type = 'table';
    if (!cache[code]._DSs) cache[code]._DSs = {};
    if (namespace) {
      cache[code]._DSs[namespace] = dataSet;
    } else cache[code].dataSet = dataSet;
    // eslint-disable-next-line no-shadow
    cache[code].getValue = function (fieldCode, rowKey, namespace, options) {
      if (rowKey === undefined) return undefined;
      // eslint-disable-next-line no-shadow
      let dataSet: DataSet | undefined;
      if (namespace) dataSet = this._DSs[namespace];
      // eslint-disable-next-line prefer-destructuring
      else dataSet = this.dataSet;
      if (!dataSet) return;
      const current = dataSet.all.find(record => record.id === rowKey);
      if (current) {
        const field = dataSet.getField(fieldCode);
        const value = current.get(fieldCode);
        if (field && value) {
          const { getPristineValue } = options || {};
          const multiple = field.get('multiple');
          const valueField = field.get('valueField') || '__notconfig__';
          if (multiple && typeof value === 'object' && value.toJS) {
            if (getPristineValue) {
              return value.toJS();
            }
            return value
              .toJS()
              .map(i => (typeof i === 'object' ? i[valueField] || '' : i))
              .join(',');
          }
          if (isPlainObject(value) || isObservableObject(value)) {
            if (getPristineValue) {
              return value;
            }
            return value[valueField];
          }
          if (moment.isMoment(value)) {
            switch (field.type) {
              case 'dateTime':
                return value.format('YYYY-MM-DD HH:mm:ss');
              case 'date':
              default:
                return value.format('YYYY-MM-DD');
            }
          }
        }
        return value;
        // eslint-disable-next-line no-useless-return
      }
    };
    cache[code].getAllValue = function (rowKey, namespace) {
      if (rowKey === undefined) return {};
      // eslint-disable-next-line no-shadow
      let dataSet: DataSet | undefined;
      if (namespace) dataSet = this._DSs[namespace];
      // eslint-disable-next-line prefer-destructuring
      else dataSet = this.dataSet;
      if (!dataSet) return {};
      const current = dataSet.all.find(record => record.id === rowKey);
      if (current) {
        return current.toData();
      } else return {};
    };
    // eslint-disable-next-line no-shadow
    const reactionFields = useCustomizeDataSet({ dataSet, ...options, code }, customize);
    if (proxyQuery && mainGroupCode !== code && viceGroupCode !== code) dataSet.query();
    // eslint-disable-next-line no-shadow
    const tools = { cache, code, ctxParams, namespace };
    return { fields: newFields, unitAlias, readOnly2, tools, reactionFields, autoNewlineFlag, gridSummary, gridMaxPageCount };
  }, [code, dataSet, cache && cache[code]]);
}
export type Options = {
  code: string;
  readOnly?: boolean;
  /** @deprecated */
  readOnlyMode?: 'disabled' | 'output';
  filterCode?: string;
  buttonCode?: string;
  // 主分组单元编码，左侧垂直方向字段控制
  mainGroupCode?: string;
  // 副分组单元编码，顶部水平方向字段控制
  viceGroupCode?: string;
  /** row模式保留主分组，打散副分组 */
  groupMode?: GroupMode;
  proxyQuery?: boolean;
  namespace?: string;
  afterCustomizeDs?: (code: string, dataSet: DataSet) => void;
  proxyDsCreate?: { createNow?: boolean; createData?: object; proxyQuery?: Function };
  proxyQueryDsCreate?: { createNow?: boolean; createData?: object };
  /** 部分场景强制更改sync状态的record为update状态 */
  __force_record_to_update__?: boolean;
  /** 指定标准动态列插入到最终表格列的位置, 0开始 */
  dynamicIndex?: number;
  /** 因为对表格列使用了memo，所以需要兼容个别列部分属性更新的情况;
   * 一般情况列属性不会动态变化，这里认为属性的变化一定是通过一些API调用完成;
   * 故需随着生成一个随机key;
   * 建议给Date.now().valueOf();
   */
  columnsCacheKey?: string;
  extTextRenderIntercept?: ({ value, text, name, record, dataSet }, node) => ReactNode;
  groupColumnPropsIntercept?: (groupId: string, customizeColumnProps: ColumnProps) => ColumnProps;
  customFieldPropsIntercept?: { [key: string]: ({ fieldProps, record }) => any };
  /**
   * 
   * @param {ColumnProps[]} options.std code对应的标准列
   * @param {ColumnProps[]} options.ext code对应的扩展列
   * @param {ColumnProps[]} options.mainStd mainCode对应的标准列
   * @param {ColumnProps[]} options.mainExt mainCode对应的扩展列
   * @param {ColumnProps[]} options.viceStd viceCode对应的标准列
   * @param {ColumnProps[]} options.viceExt viceCode对应的扩展列
   * @returns {ColumnProps[]} ColumnProps[]
   */
  reCombineGroupColumns?: (
    options: {
      /** code对应的标准列 */
      std,
      /** code对应的扩展列 */
      ext,
      /** mainCode对应的标准列 */
      mainStd,
      /** mainCode对应的扩展列 */
      mainExt,
      /** viceCode对应的标准列 */
      viceStd,
      /** viceCode对应的扩展列 */
      viceExt,
    }
    ) => ColumnProps[];
};

export const isStd = Symbol("isStd");

export enum GroupMode {
  None = "none",
  HC = "head-col",
  CC = "col-col",
};
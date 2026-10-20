import React, { CSSProperties, isValidElement } from 'react';
import { Icon, Tooltip } from 'hzero-ui';
import { Popover } from 'choerodon-ui';
import { isNumber, isNil } from 'lodash';
import {
  coverConfig,
  defaultValueFx,
  computeConfig,
  getParams,
  fieldNameFx,
  preAdapterInitValue,
} from '../../customizeTool';
import { getComputeComp } from '../../CommonFlexComp';
import { customizeFormRules, getRender, traversalFormItems } from '../common';
import getComponent, { parseTextProps } from '../getComponent';
import Customize from '../../Customize';
import { ColumnProps } from 'hzero-ui/lib/table';

const SymbolNull = Symbol.for("NULL");
const fixedMap = {
  L: 'left',
  R: 'right',
  N: SymbolNull,
};
function filterSymbolNull(obj) {
  Object.keys(obj).forEach(k => {
    if (obj[k] === SymbolNull) obj[k] = undefined;
  });
}
type Options = {
  code: string;
  readOnly?: boolean;
  namespace?: string;
  /** 指定标准动态列插入到最终表格列的位置, 0开始 */
  dynamicIndex?: number;
  customFieldPropsIntercept?: { [k: string]: (props: any) => any };
};

export default function generateTableColumns(this: Customize, columns, options: Options) {
  const { code, readOnly: _readOnly1, dynamicIndex, namespace, customFieldPropsIntercept } = options;
  const { custConfig, cache, contextParams: ctxParams } = this;
  const config = custConfig[code];
  const { fields = [], readOnly: _readOnly2 } = config;
  const readOnly = _readOnly1 || _readOnly2;
  let noWidthCount = 0;
  let noneStandardSeq = 1;
  let scrollWidth = 0;
  const columnsObj = {};
  const noConfigColumns: number[] = [];
  const allConfigFields = fields.map((i) => i.fieldCode);
  columns.forEach((i, index) => {
    if (allConfigFields.includes(i.dataIndex)) {
      columnsObj[i.dataIndex] = index;
    } else {
      scrollWidth += i.width || 0;
      noConfigColumns.push(index);
    }
  });
  let maxConfigSeq = -Infinity;
  const tools = { cache, code, ctxParams, relatedList: config.unitAlias, namespace };
  const columnsMap = new Map<string, ColumnProps<any>>();
  const noSeqColumnsMap = new Map<string, ColumnProps<any>>();
  // 配置拆分
  fields.forEach((i) => {
    const {
      conditionHeaderDTOs = [],
      fieldCode,
      fieldType,
      fixed,
      seq,
      sorter,
      renderOptions,
      renderRule,
      paramList,
      proDefaultFlag,
      fieldNameConDTO,
      defaultValue: m,
      defaultValueMeaning: v,
      helpMessageConDTO,
    } = i;
    const condVisible = (conditionHeaderDTOs || []).find((item) => item.conType === 'visible');
    let { visible } = i;
    if (condVisible) {
      visible = computeConfig(condVisible, tools);
    }
    // 直接返回和使用hidden有点区别，hidden的列会导致列宽计算异常，总大于实际列宽
    if (visible === 0) return;
    const fieldName = fieldNameFx(tools, fieldNameConDTO) || i.fieldName;
    const helpMessage = fieldNameFx(tools, helpMessageConDTO) || i.helpMessage;
    let columnProps: ColumnProps<any> = {
      dataIndex: fieldCode,
    };
    if (i.width !== undefined) columnProps.width = i.width;
    if (fixed && fixedMap[fixed]) columnProps.fixed = fixedMap[fixed];
    if (sorter !== undefined) columnProps.sorter = !!sorter;
    if (fieldName !== undefined) {
      columnProps.title = fieldName;
    }
    let order;
    columnProps.hidden = !visible;
    if (seq !== undefined) {
      order = seq - 1;
      maxConfigSeq = maxConfigSeq < seq ? seq : maxConfigSeq;
    }
    // 不做判断直接自增
    noneStandardSeq ++;
    if (columnsObj[i.fieldCode] === undefined) {
      if (visible === -1) return;
      if (i.width !== undefined) {
        scrollWidth += i.width;
      } else {
        noWidthCount++;
        columnProps.width = 200;
      }
      if (i.fieldCode.startsWith("attribute")) {
        columnProps.onCell = (record) => {
          if (renderRule || renderOptions === "TEXT" || readOnly || !record || !record.$form) {
            return {
              tooltip: true
            }
          }
        }
      }
      columnProps.render = (_val, record, index) => {
        const { _status, $form } = record;
        let meaning = record[`${fieldCode}Meaning`];
        const innerTools = { ...tools, rowKey: index, attachmentsCount: this.attachmentsCount![`${namespace || ""}_${code}`] };
        if (meaning === undefined) meaning = record[fieldCode];
        if (renderRule && (renderOptions !== 'WIDGET' || readOnly)) {
          return getComputeComp(renderRule, innerTools);
        }
        const wrapProps = {
          className: `cust-field-${fieldCode}`,
        };
        let isEdit = false;
        let rules: any[] = [];
        const { required = i.required, editable = i.editable } = coverConfig(
          conditionHeaderDTOs,
          innerTools,
          ['visible']
        );
        let { defaultValue = m, defaultValueMeaning = v } = defaultValueFx(
          innerTools,
          i.defaultValueConDTO,
          proDefaultFlag
        );
        if (proDefaultFlag && typeof defaultValue === 'function') {
          defaultValue = defaultValue(index, namespace);
        }
        const newConfig = { editable, defaultValue, defaultValueMeaning };
        if (['update', 'create'].includes(_status)) {
          isEdit = true;
          rules = customizeFormRules({ ...i, required }, innerTools);
        }
        return getComponent(
          { ...i, ...newConfig },
          {
            ...innerTools,
            form: $form,
            dataSource: record,
            isEdit,
            wrapProps,
            readOnly,
            rules,
            customFieldPropsIntercept,
          }
        );
      };
    } else {
      columnProps = Object.assign({ ...columns[columnsObj[i.fieldCode]] }, columnProps)
      const oldRender = columnProps.render;
      if (order === undefined) order = columnsObj[i.fieldCode];
      if ((columnProps as any).isStdDynamic) {
        columnsMap.set(order, columnProps);
        return;
      }
      if (isNumber(columnProps.width)) {
        scrollWidth += columnProps.width;
      } else noWidthCount++;
      let cacheTitle = columnProps.title;
      if (isValidElement(cacheTitle)) {
        cacheTitle = (columnProps as any).textForTitle;
      }

      if (renderRule && renderOptions === 'TEXT') {
        columnProps.render = (_, _1, index) => getComputeComp(renderRule, { ...tools, rowKey: index });
      } else {
        columnProps.render = (val, record, index) => {
          let meaning = record[`${fieldCode}Meaning`];
          if (meaning === undefined) meaning = record[fieldCode];
          const { _status } = record;
          if (['update', 'create'].includes(_status) && oldRender) {
            // 考虑到以后非EditTable的兼容，需要把这里计算相关的提到外面
            const innerTools = { ...tools, rowKey: index, attachmentsCount: this.attachmentsCount![`${namespace || ""}_${code}`] };
            const {
              required = i.required,
              editable = i.editable,
            } = coverConfig(conditionHeaderDTOs, innerTools, ['visible']);
            let { defaultValue = m, defaultValueMeaning = v } = defaultValueFx(
              innerTools,
              i.defaultValueConDTO,
              proDefaultFlag
            );
            if (proDefaultFlag && typeof defaultValue === 'function') {
              defaultValue = defaultValue(index, namespace);
            }
            const rules = customizeFormRules(
              { ...i, required, fieldName: cacheTitle as string },
              innerTools
            );
            const formItem = oldRender(val, record, index);
            if (isNil(formItem)) return formItem;
            return traversalFormItems(
              formItem,
              {
                ...i,
                fieldName,
                editable,
                defaultValue: preAdapterInitValue(i, defaultValue, true),
                defaultValueMeaning,
              },
              {
                form: record.$form,
                rules,
                dataSource: record,
                params: getParams({ ...innerTools, paramList }),
                tools: innerTools,
                noLabel: true,
                customFieldPropsIntercept,
              }
            );
          }
          return oldRender
            ? oldRender(val, record, index)
            : getRender(
                fieldType,
                parseTextProps(i)
              )(fieldType === 'LOV' || fieldType === 'SELECT' ? meaning : val);
        };
      }
    }

    if (helpMessage) {
      columnProps.title = (
        <>
          {columnProps.title}
          <Tooltip title={helpMessage}>
            <Icon type="question-circle-o" style={{ verticalAlign: 'unset' }} />
          </Tooltip>
        </>
      );
    }
    /**
     * 对标记NULL做undefined赋值，目前有冻结属性需要如此处理
     */
    filterSymbolNull(columnProps);
    if (order === undefined || columnsMap.get(order)) {
      noSeqColumnsMap.set(String(noneStandardSeq), columnProps);
    } else columnsMap.set(order, columnProps);
  });
  noConfigColumns.forEach((i) => {
    noneStandardSeq ++;
    noSeqColumnsMap.set(String(noneStandardSeq), columns[i]);
  });
  const left: any[] = [];
  const right: any[] = [];
  const normal: any[] = [];
  const stdDynamicCol: any[] = [];
  Array.from(columnsMap.keys()).sort((pre, next) => Number(pre || 0) - Number(next || 0)).forEach((key) => callback(key, true));
  Array.from(noSeqColumnsMap.keys()).sort((pre, next) => Number(pre || 0) - Number(next || 0)).forEach((key) => callback(key, false));
  function callback(key, hasSeq = false) {
    const i = hasSeq ? columnsMap.get(key)! : noSeqColumnsMap.get(key)!;
    if ((i as any).isStdDynamic) {
      stdDynamicCol.push(i);
      return;
    }
    if (i.fixed === 'left') {
      left.push(i);
    } else if (i.fixed === 'right') {
      right.push(i);
    } else {
      normal.push(i);
    }
  };
  if (normal.length > 0 && (left.length > 0 || right.length > 0)) {
    // 减去原本列宽，给予初始150的预留宽度
    scrollWidth -= normal[normal.length - 1].width || 0 + 150;
    noWidthCount++;
    lastColumnFixProps(normal[normal.length - 1])
  }
  return {
    noWidthCount,
    scrollWidth,
    columns: left
      .concat(
        dynamicIndex !== undefined
          ? normal.splice(dynamicIndex, 0, ...stdDynamicCol)
          : normal.concat(stdDynamicCol)
      )
      .concat(right),
  };
}

const styleProps: CSSProperties = {
  position: "relative",
  // 固定宽度为150，要求scrollWidth计算时预留宽度大于等于150，118是减去表格32px间距的值
  maxWidth: "118px",
  minWidth: "118px",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

function lastColumnFixProps(originProps) {
  const { title, render: oldRender } = originProps;
  originProps.width = undefined;
  const newTitle = typeof title === 'function' ? title() : title;
  originProps.title = (
    <div style={styleProps}>
      <Popover content={newTitle}>
        {newTitle}
      </Popover>
    </div>
  );
  originProps.render = (...args) => {
    const newContent = oldRender ? oldRender.apply(undefined, args) : args[0];
    return (
      <div style={styleProps}>
        <Popover content={newContent}>
          {newContent}
        </Popover>
      </div>
    )
  }
}
import React, {
  useMemo,
} from 'react';
import moment from "moment";
import { numberRender } from '../../utils';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/interface';
import { TableGroup } from 'choerodon-ui/pro/lib/table/interface';
import { getFieldValueObject, renderCheckBox, fieldNameFx } from '../../customizeTool';
import template from '../../utils/template';
import {
  transformCompProps,
  getColumnsConfig,
  FieldPlainMap,
  setColumnParent,
  toNest,
} from '../common';
import getComponent from '../getComponent';
import { useComputed } from '../hooks';
import { FieldConfig, UnitAlias } from '../../interfaces';
import { GroupMode, isStd, Options, parseNestColumnns, setColumn, useTableDataSet } from './util';

function calculateGroup(f: FieldConfig[], { tools, group, dataSet, unitAlias, readOnly, isNest, groupColumnPropsIntercept }, isVice = false) {
  const newColumns: string[] = [];
  let maxSeq = 0;
  const fieldMap = new Map<string, FieldPlainMap<ColumnProps>>(); // 标准列
  // 个性化不校验columnProps是否存在，其下的children属性至少是一个空数组
  let { children = [] } = group.columnProps!;
  if (isNest) {
    children = children[0].children || [];
  }
  parseNestColumnns(fieldMap, children);
  const aggregationColumns: string[][] = [];
  f.forEach(item => {
    const {
      fieldCode,
      renderOptions,
      renderRule,
      fieldType = '',
      fieldNameConDTO,
      numberPrecision,
      allowThousandth,
      aggregationCode,
      helpMessageConDTO,
    } = item;
    // seq不存在的列在前面已经被放倒了field末尾
    if (item.seq === undefined) {
      maxSeq = item.seq = maxSeq + 1;
    } else if (item.seq > maxSeq) maxSeq = item.seq;
    const stdCol = fieldMap.get(fieldCode);
    const { column } = stdCol || {};
    const field = dataSet.getField(fieldCode);
    let visible = field ? field.get('visible') : item.visible;
    if (visible === undefined) visible = -1;
    // 标准动态列跳过处理
    if (column && column.isStdDynamic) return;
    if ((!column && visible === -1) || (fieldType !== 'EMPTY' && visible === 0)) {
      stdCol && (stdCol.hidden = true);
      return;
    }
    if (column && visible === 1) column.hidden = false;
    let { fieldName, helpMessage } = item;
    if (fieldNameConDTO) {
      fieldName = fieldNameFx(tools, fieldNameConDTO) || fieldName;
    }
    if (helpMessageConDTO) {
      helpMessage = fieldNameFx(tools, helpMessageConDTO) || helpMessage;
    }
    let newColumnsConfig: ColumnProps = {
      name: fieldCode,
      sort: item.seq,
      aggregationTreeIndex: item.formCol !== undefined && item.formCol > 1 ? 1 : 0,
      ...getColumnsConfig({...item, helpMessage}),
    };
    if(groupColumnPropsIntercept) {
      newColumnsConfig = groupColumnPropsIntercept(group.name, newColumnsConfig);
    }
    // 原表格columns配置覆盖
    if (fieldName !== undefined) {
      newColumnsConfig.header = fieldName;
    }
    if (column && column.header) {
      if (typeof column.header === 'function') {
        // @ts-ignore
        newColumnsConfig.header = (records, name) => column.header(records, fieldName, name);
      } else if (typeof column.header === 'object') {
        newColumnsConfig.header = column.header;
      }
    }
    // 20210731迭代改动，渲染方式为文本的受计算规则控制
    if (renderOptions === 'TEXT' && renderRule) {
      newColumnsConfig.editor = false;
      const dataGets = getFieldValueObject({
        relatedList: unitAlias || [],
        ...tools,
      });
      newColumnsConfig.renderer = (line) => {
        return (
          <span
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{
              __html: template.render(renderRule, dataGets, line!.record!.id),
            }}
          />
        );
      };
    } else if (!column) {
      const compProps = transformCompProps(item, {
        viewOnly: !isVice,
        isGrid: true,
        unitCode: tools.code,
        ...tools,
      });
      newColumnsConfig.editor = false;
      const isExecptFieldType = ['UPLOAD', 'LINK'].includes(fieldType || '');
      if (!isExecptFieldType && (renderOptions === 'TEXT' || readOnly)) {
        if (fieldType === 'DATE_PICKER') {
          newColumnsConfig.renderer = ({ value }) =>
            value && moment(value).format(item.dateFormat);
        } else if (fieldType === 'CHECKBOX' || fieldType === 'SWITCH') {
          newColumnsConfig.renderer = ({ value }) => renderCheckBox(value);
        } else if (['INPUT_NUMBER', 'CURRENCY'].includes(fieldType)) {
          newColumnsConfig.renderer = ({ value }) =>
            numberRender(value, numberPrecision, !!allowThousandth, true);
        }
      } else if (isVice) {
        newColumnsConfig.renderer = ({ record }) => getComponent(fieldType)({ ...compProps, record });
      } else {
        newColumnsConfig.editor = getComponent(fieldType)(compProps);
      }
    }
    const finalColumn = {
      ...column,
      ...newColumnsConfig,
      [isStd]: !!stdCol,
    };
    newColumns.push(fieldCode);
    setColumn(fieldMap, finalColumn);
    if (aggregationCode) aggregationColumns.push([fieldCode, aggregationCode]);
  });
  newColumns.sort((field1, field2) => {
    // newColumns中存在的字段一定在fieldMap中存在
    const treeIndex1 = fieldMap.get(field1)!.column.aggregationTreeIndex || 0;
    const treeIndex2 = fieldMap.get(field2)!.column.aggregationTreeIndex || 0;
    return treeIndex1 - treeIndex2;
  })
  aggregationColumns.forEach(([fieldCode, aggregationCode]) =>
    setColumnParent(fieldMap, fieldCode, aggregationCode)
  );
  return {
    columns: newColumns,
    fieldMap,
  }
}
/** 二维表格 */
export function useGroupColumns(
  options: Options & { stdColumns, extColumns },
  dataSet,
  groups: TableGroup[]
): { groups?: TableGroup[] } {
  const { readOnly, stdColumns, extColumns, groupMode = GroupMode.HC, groupColumnPropsIntercept, reCombineGroupColumns } = options;
  // 动态切换分组编码必须变更dataSet实例
  const [mainGroupCode, viceGroupCode] = useMemo(() => [options.mainGroupCode, options.viceGroupCode], [dataSet]);
  const isGroupMode = mainGroupCode || viceGroupCode;
  if (!isGroupMode) return {};
  if (groups.length < 2)
    throw new Error(`the property groups may not correct!we get ${JSON.stringify(groups)}`);
  let { oriMainGroup, oriViceGroup, otherGroup } = useMemo(() => {
    const result = {
      oriMainGroup: undefined as TableGroup | undefined,
      oriViceGroup: undefined as TableGroup | undefined,
      otherGroup: [] as TableGroup[],
    };
    groups.forEach(g => {
      if (!result.oriMainGroup && g.type === "column") result.oriMainGroup = g;
      else if (!result.oriViceGroup && g.type === "header") result.oriViceGroup = g;
      else result.otherGroup.push(g);
    })
    return result;
  }, [groups]);
  if (!oriMainGroup) {
    oriMainGroup = groups[1];
    oriViceGroup = groups[0];
    otherGroup = groups.slice(2);
  }
  // 为dataSet初始化mainGroupCode对应的字段
  let fields: FieldConfig[] = [];
  let unitAlias: UnitAlias[] = [];
  let tools: any = {};
  let viceGroupFields: FieldConfig[] = [];
  let viceUnitAlias: UnitAlias[] = [];
  let viceTools: any = {};
  if (mainGroupCode) {
    const mainData = useTableDataSet(mainGroupCode, options, dataSet);
    fields = mainData.fields || [];
    unitAlias = mainData.unitAlias || [];
    tools = mainData.tools || {};
  }
  if (viceGroupCode) {
    const viceData = useTableDataSet(viceGroupCode, options, dataSet)
    viceGroupFields = viceData.fields || [];
    viceUnitAlias = viceData.unitAlias || [];
    viceTools = viceData.tools || {};
  };

  const memoData = useComputed(() => {

    const res: any = {};
    let normalChildren: ColumnProps[] = [];
    if (mainGroupCode) {
      const isNest = oriMainGroup!.columnProps!.children && oriMainGroup!.columnProps!.children[0] && oriMainGroup!.columnProps!.children[0].children;
      const { columns: newColumnsMain, fieldMap: fieldMapMain } = calculateGroup(fields, {
        tools, dataSet, group: oriMainGroup, unitAlias, readOnly, isNest, groupColumnPropsIntercept,
      });
      normalChildren = toNest(newColumnsMain, fieldMapMain);

      const { newGroup, groupExtColumns = [], groupStdColumns = [] } = processGroup({
       oriGroup: oriMainGroup, children: normalChildren, isNest, groupMode, isMain: true
      });
      res.newMainGroup = newGroup;
      res.mainExtColumns = groupExtColumns;
      res.mainStdColumns = groupStdColumns;
    }
    if (viceGroupCode) {
      const isNest = oriViceGroup!.columnProps!.children && oriViceGroup!.columnProps!.children[0] && oriViceGroup!.columnProps!.children[0].children;
      const { columns: newColumnsVice, fieldMap: fieldMapVice } = calculateGroup(viceGroupFields, {
        tools: viceTools, dataSet, group: oriViceGroup, unitAlias: viceUnitAlias, readOnly, isNest, groupColumnPropsIntercept
      }, true);
      normalChildren = toNest(newColumnsVice, fieldMapVice);
      const { newGroup, groupExtColumns = [], groupStdColumns = [] } = processGroup({
        oriGroup: oriViceGroup, children: normalChildren, isNest, groupMode
      });
      res.newViceGroup = newGroup;
      res.viceExtColumns = groupExtColumns;
      res.viceStdColumns = groupStdColumns;
    }
    return res;
  }, [groups, groupMode]);

  const { newMainGroup, newViceGroup } = memoData;
  const res: any = {
    groups: [newViceGroup || oriViceGroup, newMainGroup || oriMainGroup],
  }
  switch(groupMode){
    case GroupMode.HC:
      res.groups = res.groups.concat(otherGroup);
      break;
    case GroupMode.CC:
      res.groups = res.groups.concat(otherGroup);
      res.columns = stdColumns.concat(memoData.viceExtColumns).concat(extColumns);
      break;
    case GroupMode.None:
      res.groups = res.groups.concat(otherGroup);
      if (reCombineGroupColumns) {
        res.columns = reCombineGroupColumns({
          std: stdColumns, ext: extColumns,
          mainStd: memoData.mainStdColumns, mainExt: memoData.mainExtColumns,
          viceStd: memoData.viceStdColumns, viceExt: memoData.viceExtColumns,
        });
      } else {
        res.columns = memoData.mainStdColumns.concat(stdColumns, memoData.mainExtColumns, extColumns, memoData.viceStdColumns, memoData.viceExtColumns);
      }
      break;
  }
  return res;
}

function processGroup({ oriGroup, children, isNest, groupMode, isMain }: {[x: string]: any}) {
  const res: any = {};
  if (!oriGroup.columnProps || !oriGroup.columnProps.children || !oriGroup.columnProps.children.length) return res;

  res.newGroup = {
    ...oriGroup,
    columnProps: {
      ...oriGroup.columnProps,
    },
  };
  switch (groupMode) {
    case GroupMode.HC:
      res.newGroup.columnProps.children = isNest ? [
        {
          ...oriGroup.columnProps.children![0],
          children: children,
        }
      ] : children;
      break;
    case GroupMode.CC:
      // 二维表格平铺模式用这两个columns
      res.groupStdColumns = [] as ColumnProps[];
      res.groupExtColumns = [] as ColumnProps[];
      children.forEach(c => {
        const newC = { ...c }
        delete newC[isStd];
        delete c[isStd];
        if (c[isStd]) res.groupStdColumns.push(newC);
        else res.groupExtColumns.push(newC);
      });
      res.newGroup.type = "column";
      res.newGroup.columnProps.children = isNest ? [
        {
          ...oriGroup.columnProps.children![0],
          children: isMain ? res.groupStdColumns : children,
        }
      ] : isMain ? res.groupStdColumns : children;
      if(isNest) {
        res.newGroup.columnProps.children[0] = {
          ...oriGroup.columnProps.children![0],
          aggregation: true,
        }
      } else res.newGroup.columnProps.aggregation = true;
      break;
    case GroupMode.None:
      // 二维表格平铺模式用这两个columns
      res.groupStdColumns = [] as ColumnProps[];
      res.groupExtColumns = [] as ColumnProps[];
      children.forEach(c => {
        const newC = { ...c }
        delete newC[isStd];
        if (c[isStd]) res.groupStdColumns.push(newC);
        else res.groupExtColumns.push(newC);
      });
      res.newGroup.type = "none";
      res.newGroup.columnProps.children = isNest ? [
        {
          ...oriGroup.columnProps.children![0],
          children: undefined,
        }
      ] : undefined;
      break;
      default:;
  }

  return res;
}
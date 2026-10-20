import React, {
  cloneElement,
  FunctionComponent,
  isValidElement,
  ReactElement,
  useContext,
} from 'react';
import { isEmpty, isPlainObject } from 'lodash';
import { observer } from 'mobx-react-lite';
import moment from "moment";
import { getDateTimeFormat } from 'utils/utils';
import { numberRender } from '../../utils';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/interface';
// @ts-ignore
import { pagination } from "srm-front-boot/lib/utils/loadUiConfig";
import Customize, { CustomizeContext } from '../../Customize';
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
import { useComputed, useDefaultValueReaction } from '../hooks';
import { GroupMode, isStd, Options, parseNestColumnns, setColumn, useTableDataSet } from './util';
import { useGroupColumns } from './useGroupColumns';
import { useTableFilter } from './useTableFilter';
import { useTableButtons } from './useTableButtons';

export default function custTable(
  this: Customize,
  options: Options = { code: '' },
  table: ReactElement
) {
  const { cache, custConfig, contextParams } = this;
  const { code = '', mainGroupCode, viceGroupCode } = options;
  const isIncrement = this.manualQuery === "INCREMENT";
  if (
    isIncrement && (this.state.willUpdateCode || []).includes(code) ||
    !isIncrement && this.manualQuery && this.state.loading
  ) {
    return cloneElement(table, { customizedCode: code });
  }
  const validateCode = code || mainGroupCode || viceGroupCode || "";
  if (!validateCode || isEmpty(custConfig[validateCode]) || !table || !table.props.dataSet) {
    return cloneElement(table, { customizedCode: validateCode });
  }
  return (
    <CustomizeContext.Provider value={{ cache, custConfig, contextParams }}>
      <ObserverWrapper component={table} options={options} />
    </CustomizeContext.Provider>
  );
}


const ObserverWrapper: FunctionComponent<{
  component: any;
  options: Options;
}> = observer(props => {
  const { component, options } = props;
  const customize = useContext(CustomizeContext);
  const { cache, contextParams: ctxParams } = customize;
  const {
    readOnly: readOnly1,
    filterCode,
    buttonCode,
    mainGroupCode,
    viceGroupCode,
    code,
    proxyDsCreate,
    proxyQueryDsCreate,
    dynamicIndex,
    namespace,
    __force_record_to_update__,
    extTextRenderIntercept,
    groupMode = GroupMode.HC,
    columnsCacheKey,
    customFieldPropsIntercept,
  } = options;
  const { dataSet, buttons, groups } = component.props;
  let { columns } = component.props;
  const isGroupMode = mainGroupCode || viceGroupCode;
  let parseColumns = columns;
  let groupNest = false;
  if (isGroupMode) {
    if(columns[0].__nest__) {
      parseColumns = columns[0].children;
      groupNest = true;
    }
    // 二维表格限制columns只能有一列
    columns = [columns[0]];
  }
  // 当code不存在时必定走此逻辑
  if (!code && (mainGroupCode || viceGroupCode)) {
    return cloneElement(component, {
      ...useGroupColumns({...options, stdColumns: parseColumns, extColumns: [] }, dataSet, groups),
    });
  }
  const { fields, unitAlias, readOnly2, tools, reactionFields, autoNewlineFlag, gridSummary = -1, gridMaxPageCount } = useTableDataSet(
    code,
    options,
    dataSet
  );
  const filterProps = useTableFilter({
    code: filterCode,
    table: component,
    customize,
    proxyQueryDsCreate,
    namespace,
  });
  const newButtons = useTableButtons(buttons, { code: buttonCode, namespace });
  useDefaultValueReaction(dataSet, reactionFields, code, { __force_record_to_update__ });
  if (proxyDsCreate && proxyDsCreate.createNow) {
    // eslint-disable-next-line no-shadow
    const { createData, proxyQuery } = proxyDsCreate;
    if (typeof proxyQuery === 'function') {
      proxyQuery();
    } else {
      dataSet.loadData([]);
      dataSet.create(createData);
    }
    proxyDsCreate.createNow = false;
  }
  const readOnly = readOnly1 || readOnly2;
  // 二维表格平铺模式用这两个columns
  const stdColumns: ColumnProps[] = [];
  const extColumns: ColumnProps[] = [];
  const memoColumns: ColumnProps[] = useComputed(() => {
    const newColumns: string[] = [];
    let maxSeq = 0;
    const fieldMap = new Map<string, FieldPlainMap<ColumnProps>>(); // 标准列
    parseNestColumnns(fieldMap, isGroupMode ? parseColumns[0].children : columns);
    const aggregationColumns: string[][] = [];
    fields.forEach(item => {
      const {
        fieldCode,
        renderOptions,
        renderRule,
        fieldType = '',
        fieldNameConDTO,
        numberPrecision,
        allowThousandth,
        aggregationCode,
        formCol,
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
      let cuszFieldNameFlag = !!item.fieldName;
      let { fieldName, helpMessage } = item;
      if (fieldNameConDTO) {
        fieldName = fieldNameFx(tools, fieldNameConDTO) || fieldName;
        cuszFieldNameFlag = true;
      }
      if (helpMessageConDTO) {
        helpMessage = fieldNameFx(tools, helpMessageConDTO) || helpMessage;
      }
      const newColumnsConfig = {
        name: fieldCode,
        sort: item.seq,
        aggregationTreeIndex: formCol !== undefined && formCol > 1 ? 1 : 0,
        ...getColumnsConfig({...item, helpMessage}),
      };
      if (cuszFieldNameFlag) {
        newColumnsConfig.title = undefined;
      }
      if (["INPUT_NUMBER", "CURRENCY"].includes(fieldType) && gridSummary !== -1) {
        newColumnsConfig.footerSummary = !!gridSummary
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
          cache,
          code,
          // rowKey: line.record.id,
          ctxParams,
          namespace,
        });
        newColumnsConfig.renderer = line => {
          const node = (
            <span
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{
                __html: template.render(renderRule, dataGets, line.record.id),
              }}
            />
          );
          return extTextRenderIntercept ? extTextRenderIntercept(line, node) : node;
        };
      } else if (!column) {
        let formFieldGen = (record) => {
          let editorProps = transformCompProps(item, {
            ctxParams,
            cache,
            viewOnly: readOnly || renderOptions === 'TEXT',
            isGrid: true,
            unitCode: code,
          });
          if (customFieldPropsIntercept && customFieldPropsIntercept[fieldCode]) {
            const newEditorProps = customFieldPropsIntercept[fieldCode]({ fieldProps: editorProps, record });
            editorProps = {
              ...(editorProps || {}),
              ...newEditorProps,
            }
          }
          return getComponent(fieldType)(editorProps);
        };
        newColumnsConfig.editor = false;
        // 用于编辑组件的renderer函数，当使用行只读模式时，直接返回空，而文本渲染字段会覆盖此renderer
        newColumnsConfig.renderer = (options) => {
          const { text, record } = options;
          if (record && record.getState("readOnly")) return " ";
          if (extTextRenderIntercept) {
            return extTextRenderIntercept(options, text);
          }
          return text;
        };
        const isExecptFieldType = ['UPLOAD', 'LINK'].includes(fieldType || '');
        if (!isExecptFieldType && (readOnly || renderOptions === 'TEXT')) {
          if (fieldType === 'DATE_PICKER') {
            newColumnsConfig.renderer = ({ value }) =>
              value && moment(value).format(item.dateFormat || getDateTimeFormat());
          } else if (fieldType === 'CHECKBOX' || fieldType === 'SWITCH') {
            newColumnsConfig.renderer = ({ value }) => renderCheckBox(value);
          } else if (['INPUT_NUMBER', 'CURRENCY'].includes(fieldType)) {
            newColumnsConfig.renderer = ({ value }) =>
              numberRender(value, numberPrecision, !!allowThousandth, true);
          } else {
            newColumnsConfig.renderer = ({ text, value }) => {
              if(typeof value === "object" && !isValidElement(text) && isPlainObject(text)) return JSON.stringify(text)
              return text;
            }
          }
          const tempRender = newColumnsConfig.renderer;
          if (extTextRenderIntercept) {
            newColumnsConfig.renderer = options =>
              extTextRenderIntercept(options, tempRender ? tempRender(options) : options.text);
          }
        } else {
          newColumnsConfig.editor = (record) => { if(record && record.getState("readOnly")) return false; return formFieldGen(record)};
        }
      }
      const finalColumn = {
        ...column,
        ...newColumnsConfig,
      };
      if(isGroupMode) {
        finalColumn[isStd] = !!stdCol;
      }
      newColumns.push(fieldCode);
      setColumn(fieldMap, finalColumn);
      if (aggregationCode) aggregationColumns.push([fieldCode, aggregationCode]);
    });
    newColumns.sort((field1, field2) => {
      // newColumns中存在的字段一定在fieldMap中存在
      const treeIndex1 = fieldMap.get(field1)!.column.aggregationTreeIndex || 0;
      const treeIndex2 = fieldMap.get(field2)!.column.aggregationTreeIndex || 0;
      return treeIndex1 - treeIndex2;
    });
    aggregationColumns.forEach(([fieldCode, aggregationCode]) =>
      setColumnParent(fieldMap, fieldCode, aggregationCode)
    );
    // 目前只给二维表模式使用
    const noConfigLeafColumns = [];
    const res = toNest(newColumns, fieldMap, dynamicIndex, "children", noConfigLeafColumns);
    // 如果是分组模式，res只是columns[0]的children
    if (isGroupMode) {
      switch(groupMode){
        case GroupMode.HC:
          // 分组嵌套模式
          if (groupNest) {
            return [{ ...columns[0], children: [{ ...columns[0].children[0], children: res }] }];
          }
          break;
        case GroupMode.CC:
        case GroupMode.None:
          res.forEach(c => {
            const newC = {...c}
            delete newC[isStd];
            if(c[isStd]) stdColumns.push(newC);
            else extColumns.push(newC);
          });
          stdColumns.push(...noConfigLeafColumns);
          break;
      }
      return [{ ...columns[0], children: res }];
    }
    return res;
  }, [columns, readOnly, parseColumns, columnsCacheKey]);

  const coverConfig: any = {
    ...filterProps,
    columns: memoColumns, // columns放在useGroupColumns前，使得可以被useGroupColumns覆盖
    ...useGroupColumns({...options, stdColumns, extColumns }, dataSet, groups),
    buttons: newButtons,
    customizedCode: code,
  }
  if (gridMaxPageCount && component.props.pagination !== false && dataSet.paging) {
    coverConfig.pagination = {
      ...(pagination || {}),
      /** component.props应该不至于为空吧.... */
      ...component.props.pagination,
      maxPageSize: gridMaxPageCount,
    }
  }
  if(autoNewlineFlag) coverConfig.rowHeight = "auto";
  return cloneElement(component, coverConfig);
});

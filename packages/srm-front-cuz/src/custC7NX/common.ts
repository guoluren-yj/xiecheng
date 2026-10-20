/* eslint-disable no-shadow */
import { Children, isValidElement, ReactNode } from 'react';
import { isNil, isNumber } from 'lodash';
import { DataSet, Row } from 'choerodon-ui/pro';
import { FormField, FormFieldProps } from 'choerodon-ui/pro/lib/field/FormField';
import { FieldType, RecordStatus } from 'choerodon-ui/pro/lib/data-set/enum';
import type Record from 'choerodon-ui/pro/lib/data-set/Record';
import { FieldConfig } from '../interfaces';
import { ComponentGenProps } from './interface';

export function getFieldConfig({ required, editable, visible }) {
  const newFieldConfig: any = { visible };
  if (required !== -1) {
    newFieldConfig.required = !!required;
  }

  // if (visible === 0) {
  //   newFieldConfig.required = false;
  // }

  if (editable !== -1 && !isNil(editable)) {
    newFieldConfig.disabled = !editable;
  }
  return newFieldConfig;
}

export function getColumnsConfig(fieldConfig: FieldConfig) {
  const { fieldCode, fixed, width, aggregationFlag, helpMessage } = fieldConfig;
  const newColumnsConfig: any = {};
  if (fixed === 'L') {
    newColumnsConfig.lock = 'left';
  } else if (fixed === 'R') {
    newColumnsConfig.lock = 'right';
  } else if (fixed === 'N') {
    newColumnsConfig.lock = undefined;
  }
  if (width !== undefined) {
    newColumnsConfig.width = width;
  }
  if (aggregationFlag) {
    newColumnsConfig.name = undefined;
    newColumnsConfig.key = fieldCode;
    newColumnsConfig.aggregation = true;
    newColumnsConfig.align = 'left';
  }
  if (helpMessage) {
    newColumnsConfig.help = helpMessage;
    newColumnsConfig.showHelp = 'tooltip';
  }
  return newColumnsConfig;
}

/**
 * 根据类型参数生成不同的表单组件
 * 字段类型，可选值：boolean number string date dateTime time week month year email url intl object
 * @param type 组件类型
 */
export function getComponentType(type?: string) {
  switch (type) {
    case 'UPLOAD':
      return FieldType.attachment;
    case 'SELECT':
    case 'RADIOGROUP':
    case 'LINK':
    case 'INPUT':
      return FieldType.string;
    case 'CURRENCY':
      return FieldType.currency;
    case 'INPUT_NUMBER':
    case 'RATE':
      return FieldType.number;
    case 'CHECKBOX':
    case 'SWITCH':
      return FieldType.boolean;
    case 'LOV':
      return FieldType.object;
    case 'DATE_PICKER':
      return FieldType.date;
    case 'TL_EDITOR':
      return FieldType.intl;
    case 'TEL_FIELD':
      return FieldType.tel;
    case 'EMAIL_FIELD':
      return FieldType.email;  
    default:
  }
}

export function transformStdCompProps(props: any = {}, options: any = {}) {
  const { showHelp = 'tooltip' } = options;
  const { fieldType, textAreaMaxLine, placeholder, helpMessage, uploadShowFlag, uploadRecordFlag, attachmentType } = props;
  const commonProps: any = {};
  placeholder !== undefined && (commonProps.placeholder = placeholder);
  if (helpMessage) {
    commonProps.help = helpMessage;
    commonProps.showHelp = showHelp;
  }
  switch (fieldType) {
    case 'TEXT_AREA':
      textAreaMaxLine !== undefined && (commonProps.rows = textAreaMaxLine);
      break;
    
    case 'UPLOAD':
      if (uploadShowFlag !== undefined) {
        commonProps.viewMode = uploadShowFlag ? 'list' : 'popup';
        commonProps.newLine = !!uploadShowFlag
      }
      if (!isNil(uploadRecordFlag) && uploadRecordFlag !== -1) {
        commonProps.showHistory = !!uploadRecordFlag;
      }
    default:
  }
  return commonProps;
}

export function transformCompProps(props: FieldConfig, options?: any): ComponentGenProps {
  const {
    fieldType,
    linkTitle,
    fieldName = '',
    dateFormat = '',
    linkHref,
    linkNewWindow,
    linkType,
    modalWidth,
    textAreaMaxLine,
    placeholder,
    helpMessage,
    fieldCode,
    uploadShowFlag,
    bucketName,
    uploadRecordFlag,
    attachmentType,
  } = props;
  const { isGrid = false, viewOnly, disableOutput, unitCode, cache, showHelp = 'tooltip' } = options || {};
  const commonProps: { name: string; label: string;[x: string]: any } = {
    name: fieldCode,
    label: fieldName,
    placeholder,
  };
  if (helpMessage && !isGrid) {
    commonProps.help = helpMessage;
    commonProps.showHelp = showHelp;
  }
  if (disableOutput && viewOnly) {
    // 如果直接富裕组件disabled为true，不会执行ds中的disabled计算逻辑
    commonProps.disabled = true;
  }

  if (options && options.record) {
    commonProps.record = options.record;
  }
  let tempProps;
  switch (fieldType) {
    case 'LINK':
      // 链接组件仅接受可编辑配置控制的禁用属性
      delete commonProps.disabled;
      tempProps = {
        ...options,
        bucketName,
        unitCode,
        cache,
        linkTitle,
        linkHref,
        linkNewWindow,
        linkType,
        modalWidth,
      };
      break;
    case 'UPLOAD':
      tempProps = {
        readOnly: options.viewOnly,
        viewMode: uploadShowFlag ? 'list' : 'popup',
        newLine: uploadShowFlag,
      };
      if (!isNil(uploadRecordFlag) && uploadRecordFlag !== -1) {
        tempProps.showHistory = !!uploadRecordFlag;
      }
      if (attachmentType === "picture") {
        tempProps.accept = ['image/*'];
        tempProps.listType = 'picture-card';
        tempProps.viewMode = 'list';
      }
      if (isGrid) tempProps.funcType = 'link';
      break;
    case 'TEXT_AREA':
      tempProps = {
        rows: textAreaMaxLine,
        resize: 'both',
      };
      break;
    case 'DATE_PICKER':
      tempProps = {
        ...commonProps,
      };
      if (/^(YYYY)?[-/]?MM$/.test(dateFormat)) tempProps.mode = 'month';
      else if (/hh|mm|ss|HH/g.test(dateFormat)) tempProps.mode = 'dateTime';
      else tempProps.mode = 'date';
      break;
    case 'LOV':
      tempProps = {
        maxTagCount: 5,
      };
      break;
    case 'RATE':
      tempProps = {
        allowHalf: true,
        allowClear: true,
      };
      break;
    default:
  }
  return {
    ...commonProps,
    ...tempProps,
  };
}

export function recordsInit(dataSet: DataSet) {
  dataSet.fields.forEach((field) => {
    (dataSet.records || []).forEach((record) => {
      // 20211127迭代优化项，必输且为空的字段将status改为update
      if (record.status === RecordStatus.sync && field.get('required', record)) {
        let value = record.get(field.name);
        const transformRequest = field.get('transformRequest');
        if (transformRequest) value = transformRequest(value, record);
        if (isNil(value)) record.status = RecordStatus.update;
      }
    });
  });
}

// 解析栅格模式节点
export function parseNoneLayoutNode(children) {
  const fieldMap = {};
  let colTargetChild;
  Children.forEach(children, (rowChild: Row, rowIndex) => {
    if (isValidElement(rowChild)) {
      Children.forEach(rowChild.props.children, (colChild: ReactNode, colIndex) => {
        if (
          isValidElement(colChild) &&
          isValidElement(colChild.props.children) &&
          colChild.props.children.props &&
          isValidElement(colChild.props.children.props.children)
        ) {
          colTargetChild = colChild.props.children.props.children;
          if (colTargetChild.props.name) {
            fieldMap[colTargetChild.props.name || `__anonymous${rowIndex}_${colIndex}__`] = {
              item: colTargetChild,
              parentNode: colChild.props.children,
              rowIndex: (rowIndex + 1) * 10,
              colIndex,
              colSpan: colChild.props.span,
            };
          }
        }
      });
    }
  });
  return fieldMap;
}

export function parseTableLayoutNode(children) {
  const fieldMap = {};
  Children.forEach(children, (child: FormField<FormFieldProps>, index) => {
    if (isValidElement(child) && child.props.name) {
      fieldMap[child.props.name] = { item: child, seq: index + 1 };
    }
  });
  return fieldMap;
}

export function assignOrderToField(fieldMap, fields: FieldConfig[], columns: number) {
  const configFields: FieldConfig[] = [];
  const missFields: any[] = [];
  const tempFields: FieldConfig[] = [];
  fields.forEach((i) => {
    const { fieldCode, formRow, formCol } = i;
    let originSeq: number | undefined;
    let seq: number | undefined;
    if (fieldMap[fieldCode]) {
      originSeq = fieldMap[fieldCode].seq;
      // eslint-disable-next-line no-param-reassign
      fieldMap[fieldCode].config = true;
    }
    if (formRow !== undefined && formCol !== undefined) {
      seq = (formRow - 1) * columns + formCol;
    } else if (originSeq === undefined) {
      tempFields.push(i);
      return;
    }
    configFields.push({ ...i, seq: typeof seq === 'number' ? seq : originSeq });
  });
  Object.keys(fieldMap).forEach((k) => {
    if (!fieldMap[k].config) {
      missFields.push({ fieldCode: k, seq: fieldMap[k].seq, editable: -1 });
    }
  });
  return [...configFields, ...missFields, ...tempFields];
}

export function assignRowColToField(fieldMap, fields: FieldConfig[], columns: number) {
  const rowMap = new Map<number, [{ fieldCode: string; colIndex: number, colSpan?: number; }[], {fieldCode: string; colSpan?:number;}[]]>();
  const conflictRowMap = new Map<number, {fieldCode: string; colSpan?:number;}[]>();
  let conflictRowNum = 0;
  let currentRow;
  let rowIndex;
  let colIndex;
  fields.forEach((i) => {
    const { fieldCode, formRow = rowIndex, formCol = colIndex } = i;
    let colSpan;
    if (fieldMap[fieldCode]) {
      // eslint-disable-next-line prefer-destructuring
      rowIndex = fieldMap[fieldCode].rowIndex;
      // eslint-disable-next-line prefer-destructuring
      colIndex = fieldMap[fieldCode].colIndex;
      // eslint-disable-next-line no-param-reassign
      fieldMap[fieldCode].config = true;
      colSpan = fieldMap[fieldCode].colSpan;
      if (i.colSpan) {
        fieldMap[fieldCode].colSpan = colSpan = i.colSpan;
      }
    }
    let isConflictRow = false;
    if (isNumber(formRow)) {
      currentRow = (rowMap.has(formRow) ? rowMap : rowMap.set(formRow, [[], []])).get(formRow);
      if (currentRow![0].length + currentRow![1].length < columns) {
        if (isNumber(formCol)) {
          currentRow![0].push({ fieldCode, colIndex: formCol, colSpan });
          currentRow![0].sort((col1, col2) => col1.colIndex - col2.colIndex);
        } else {
          currentRow![1].push({fieldCode, colSpan});
        }
      } else isConflictRow = true;
    } else isConflictRow = true;
    if (isConflictRow) {
      while (1) {
        currentRow = (conflictRowMap.has(conflictRowNum)
          ? conflictRowMap
          : conflictRowMap.set(conflictRowNum, [])
        ).get(conflictRowNum);
        if (currentRow!.length < columns) {
          currentRow!.push({fieldCode, colSpan});
          break;
        } else conflictRowNum++;
      }
    }
  });
  Object.keys(fieldMap).forEach((k) => {
    if (!fieldMap[k].config) {
      while (1) {
        currentRow = (conflictRowMap.has(conflictRowNum)
          ? conflictRowMap
          : conflictRowMap.set(conflictRowNum, [])
        ).get(conflictRowNum);
        if (currentRow!.length < columns) {
          currentRow!.push({fieldCode: k, colSpan: fieldMap[k].colSpan});
          break;
        } else conflictRowNum++;
      }
    }
  });
  // eslint-disable-next-line no-shadow
  const fieldToRowCol = new Map<string, { rowIndex: number; colIndex: number, colSpan?: number }>();
  const normalRow = Array.from(rowMap.entries());
  // eslint-disable-next-line no-shadow
  normalRow
    .sort((row1, row2) => row1[0] - row2[0])
    .forEach((row, rowIndex) => {
      // eslint-disable-next-line no-shadow
      row[1][0].forEach((field, colIndex) =>
        fieldToRowCol.set(field.fieldCode, { rowIndex, colIndex, colSpan: field.colSpan, })
      );
      // eslint-disable-next-line no-shadow
      row[1][1].forEach((field, colIndex) =>
        fieldToRowCol.set(field.fieldCode, {
          rowIndex,
          colIndex: colIndex + row[1][0].length,
          colSpan: field.colSpan,
        })
      );
    });
  // eslint-disable-next-line no-shadow
  Array.from(conflictRowMap.entries())
    .sort((row1, row2) => row1[0] - row2[0])
    .forEach((row, rowIndex) => {
      // eslint-disable-next-line no-shadow
      row[1].forEach((field, colIndex) =>
        fieldToRowCol.set(field.fieldCode, { rowIndex: rowIndex + normalRow.length, colIndex, colSpan: field.colSpan })
      );
    });
  const missFields: {
    fieldCode: string;
    required: number;
    editable: number;
    visible: number;
    colSpan?: number;
  }[] = [];
  Object.keys(fieldMap).forEach((k) => {
    if (!fieldMap[k].config) {
      missFields.push({ fieldCode: k, required: -1, editable: -1, visible: -1, colSpan: fieldMap[k].colSpan });
    }
  });
  return { fieldToRowCol, missFields };
}

export type FieldPlainMap<T> = {
  hidden?: boolean;
  column: T & { isStdDynamic?: boolean };
  parent?: FieldPlainMap<T>;
};

export function setColumnParent<T>(
  plainMap: Map<string, FieldPlainMap<T>>,
  name: string,
  parent: string
) {
  const currentField = plainMap.get(name);
  if (!currentField) return;
  if (parent === '__no_aggregation__') {
    currentField.parent = undefined;
  } else if (parent) {
    const parentColumn = plainMap.get(parent);
    currentField.parent = parentColumn;
  }
}

export function parseNest<T>(
  plainMap: Map<string, FieldPlainMap<any>>,
  originColumns: Array<T & { name: string }>,
  parent?: FieldPlainMap<any>,
  childPropName = 'children'
) {
  originColumns.forEach((column) => {
    if (!column) return;
    const { name = '', ...others } = column;
    others[childPropName] = undefined;
    const currentField: FieldPlainMap<any> = {
      column: {
        name,
        ...others,
      },
      parent,
    };
    plainMap.set(name, currentField);
    if (column[childPropName]) {
      parseNest(plainMap, column[childPropName], currentField);
    }
  });
}

export function toNest<T>(
  columnsSeq: string[],
  plainMap: Map<string, FieldPlainMap<T>>,
  dynamicIndex?: number,
  childPropName = 'children',
  noConfigColumns: T[] = [],
) {
  const finalColumns: T[] = [];
  columnsSeq.forEach((field) => {
    const col = plainMap.get(field) as any;
    if (col && !col.hidden) {
      if (col.parent) {
        if (!col.parent.column[childPropName]) col.parent.column[childPropName] = [];
        col.parent.column[childPropName].push(col.column);
      } else finalColumns.push(col.column);
    }
    plainMap.delete(field);
  });
  const dynamicColumns: T[] = [];
  plainMap.forEach((col: any) => {
    if (col.column.isStdDynamic) {
      dynamicColumns.push(col.column);
    } else if (!col.hidden) {
      if (col.parent) {
        // eslint-disable-next-line no-param-reassign
        if (!col.parent.column[childPropName]) col.parent.column[childPropName] = [];
        col.parent.column[childPropName].push(col.column);
      } else {
        finalColumns.push(col.column);
        noConfigColumns.push(col.column)
      }
    }
  });

  if (dynamicIndex !== undefined) {
    const lastColumns = finalColumns.splice(dynamicIndex);
    return finalColumns.concat(dynamicColumns, lastColumns);
  }
  return finalColumns;
}

export function setColumn<T>(
  plainMap: Map<string, FieldPlainMap<T>>,
  column: T & { name: string }
) {
  let currentField = plainMap.get(column.name);
  if (currentField) {
    currentField.column = column;
  } else currentField = { column };
  plainMap.set(column.name, currentField);
}

export function replace(mappings: ArrayLike<any>, targetString: string, ctx: any, record?: Record | undefined) {
  let newString = targetString;
  for (let i = 0; i < mappings.length; i++) {
    if (mappings[i] === '{organizationId}' || mappings[i] === '{tenantId}') {
      // eslint-disable-next-line no-continue
      continue;
    }
    const key = mappings[i].match(/{([^{}]*)}/)[1];
    const field = record && record.dataSet.getField(key);
    const transformRequest = field && field.get('transformRequest');
    let value = record && record.get(key);
    if (transformRequest) {
      value = transformRequest(value, record);
    }
    if (value === null || value === undefined) value = '';
    newString = newString.replace(`{${key}}`, value);
  }
  newString = newString.replace(/{organizationId}/, ctx.organizationId);
  newString = newString.replace(/{tenantId}/, ctx.tenantId);
  return newString;
}
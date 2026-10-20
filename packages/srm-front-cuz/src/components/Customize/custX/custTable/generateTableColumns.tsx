import { Icon, Tooltip } from 'hzero-ui';
import { isNumber, isNil, omit } from 'lodash';
import React from 'react';
import {
  getRender,
  getFormItemComponent,
  preAdapterInitValue,
  traversalFormItems,
  customizeFormRules,
  coverConfig,
  getComputeComp,
  defaultValueFx,
  getContextParams,
} from '../../customizeTool';

const fixedMap = {
  L: 'left',
  R: 'right',
};
export default function generateTableColumns(
  columns,
  config: any = {},
  { unitData, code, getValueFromCache, readOnly: _readOnly1 }
) {
  const { fields = [], readOnly: _readOnly2 } = config;
  const readOnly = _readOnly1 || _readOnly2;
  let noWidthCount = 0;
  let noneStandardSeq = columns.length;
  let scrollWidth = 0;
  const configOrder: number[] = []; // 记录租户个性化的位置信息，个性化顺序优先级高于原有配置
  const individualColumns = {}; // 个性化处理后的列对象，key值为调整后的顺序
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
  // 配置拆分
  fields.forEach((i) => {
    const {
      conditionHeaderDTOs = [],
      fieldCode,
      fieldType,
      fixed,
      fieldName,
      seq,
      sorter,
      textMaxLength,
      columnLength,
      textMinLength,
      renderOptions,
      renderRule,
      paramList = [],
      dateFormat,
      helpMessage,
      numberMax,
      numberMin,
      trimFlag,
    } = i;
    const { visible } = coverConfig(
      { visible: i.visible },
      conditionHeaderDTOs.filter((k) => k.conType === 'visible'),
      { getValueFromCache, isGridVisible: true, code }
    );
    if (visible === 0) return;
    if (columnsObj[i.fieldCode] !== undefined) {
      const oldItem = columns[columnsObj[i.fieldCode]];
      const oldRender = oldItem.render;
      const width = i.width === undefined ? oldItem.width : i.width;
      let order = columnsObj[i.fieldCode];
      if (isNumber(seq)) {
        configOrder.push(seq - 1);
        order = seq - 1;
      }
      if (isNumber(width)) {
        oldItem.width = width;
        scrollWidth += width;
      } else noWidthCount++;
      if (fixed) {
        oldItem.fixed = fixedMap[fixed];
      }
      if (fieldName) {
        oldItem.title = fieldName;
      }
      if (helpMessage) {
        oldItem.title = (
          <>
            {oldItem.title}
            <Tooltip title={helpMessage}>
              <Icon type="question-circle-o" style={{ verticalAlign: 'unset' }} />
            </Tooltip>
          </>
        );
      }
      if (sorter) {
        oldItem.sorter = true;
      }
      oldItem.render = (val, record, index) => {
        let meaning = record[`${fieldCode}Meaning`];
        if (meaning === undefined) meaning = record[fieldCode];
        const { _status } = record;
        if (['update', 'create'].includes(_status) && oldRender) {
          // 考虑到以后非EditTable的兼容，需要把这里计算相关的提到外面
          const toolsObj = {
            isGrid: true,
            targetForm: record.$form,
            targetDataSource: record,
            getValueFromCache,
            code,
          };
          const { required, editable } = coverConfig(
            { required: i.required, editable: i.editable },
            conditionHeaderDTOs.filter((k) => k.conType !== 'visible'),
            toolsObj
          );
          const { defaultValue, defaultValueMeaning } = defaultValueFx(toolsObj, i);
          const rules = customizeFormRules(
            {
              ...i,
              required,
              fieldName: i.fieldName || oldItem.title,
            },
            toolsObj
          );
          let formItem = oldRender(val, record, index);
          formItem = isNil(formItem) ? {} : formItem;
          return traversalFormItems(formItem, {
            ...omit(i, ['fieldName']),
            defaultValue: preAdapterInitValue(i, defaultValue),
            defaultValueMeaning,
            rules,
            editable,
            queryParams: paramList.length > 0 ? getContextParams(paramList, toolsObj) : undefined,
            form: record.$form,
            dataSource: record,
          } as any);
        }
        return oldRender
          ? oldRender(val, record, index)
          : getRender(fieldType, { precision: i.numberPrecision, format: dateFormat })(
              fieldType === 'LOV' || fieldType === 'SELECT' ? meaning : val
            );
      };
      if (individualColumns[order] === undefined) {
        individualColumns[order] = [];
      }
      individualColumns[order].push(oldItem);
    } else {
      if (visible === -1) return;
      noneStandardSeq++;
      let order = noneStandardSeq;
      if (isNumber(i.width)) {
        scrollWidth += i.width;
      } else noWidthCount++;
      if (isNumber(seq)) {
        configOrder.push(seq - 1);
        order = seq - 1;
      }
      const render = (val, record) => {
        const { _status, $form } = record;
        let meaning = record[`${fieldCode}Meaning`];
        if (meaning === undefined) meaning = record[fieldCode];
        if (renderRule && (renderOptions !== 'WIDGET' || readOnly)) {
          return getComputeComp(renderRule, {
            isGrid: true,
            dataSource: record,
            unitData,
            form: $form,
          });
        }
        const wrapProps = {
          className: `cust-field-${fieldCode}`,
        };
        const formOptions: any = {
          fieldType,
          textMaxLength,
          textMinLength,
          fieldName,
          dateFormat,
          trimFlag,
        };
        if (columnLength && (!textMaxLength || textMaxLength > columnLength)) {
          formOptions.textMaxLength = columnLength;
        }
        let isEdit = false;
        const toolsObj = {
          isGrid: true,
          targetForm: $form,
          targetDataSource: record,
          getValueFromCache,
          code,
        };
        const { required, editable } = coverConfig(
          { required: i.required, editable: i.editable },
          conditionHeaderDTOs.filter((k) => k.conType !== 'visible'),
          toolsObj
        );
        const { defaultValue: v, defaultValueMeaning: m } = defaultValueFx(toolsObj, i);
        const contentProps = {
          ...i,
          style: { width: '100%' },
          getValueFromCache,
          isGrid: true,
          dataSource: record,
          defaultValue: v,
          defaultValueMeaning: m,
          editable,
        };
        let rules: any[] = [];
        if (['update', 'create'].includes(_status)) {
          isEdit = true;
          formOptions.required = required;
          rules = customizeFormRules(
            {
              ...i,
              required,
            },
            toolsObj
          );
        }
        return getFormItemComponent(
          fieldType,
          renderOptions,
          code
        )({
          isEdit,
          readOnly,
          rules,
          form: $form,
          formOptions,
          contentProps,
          fieldCode,
          wrapProps,
          numberMax,
          numberMin,
          trimFlag,
        });
      };
      if (individualColumns[order] === undefined) {
        individualColumns[order] = [];
      }
      individualColumns[order].push({
        width: i.width === undefined ? 200 : i.width,
        fixed: fixedMap[fixed],
        title: helpMessage ? <Tooltip title={helpMessage}>{fieldName}</Tooltip> : fieldName,
        sorter: !!sorter,
        dataIndex: fieldCode,
        render,
      });
    }
  });
  noConfigColumns.forEach((i) => {
    if (individualColumns[i] !== undefined) {
      individualColumns[i].push(columns[i]);
    } else {
      individualColumns[i] = [columns[i]];
    }
  });
  const left: any[] = [];
  const right: any[] = [];
  const normal: any[] = [];
  Object.keys(individualColumns)
    .sort((pre, next) => Number(pre || 0) - Number(next || 0))
    .forEach((key) => {
      const item = individualColumns[key];
      // eslint-disable-next-line eqeqeq
      if (key == undefined) {
        item.forEach((i) => {
          if (i.fixed === 'left') {
            left.unshift(i);
          } else if (i.fixed === 'right') {
            right.unshift(i);
          } else {
            normal.unshift(i);
          }
        });
      } else {
        item.forEach((i) => {
          if (i.fixed === 'left') {
            left.push(i);
          } else if (i.fixed === 'right') {
            right.push(i);
          } else {
            normal.push(i);
          }
        });
      }
    });
  if (normal.length > 0 && (left.length > 0 || right.length > 0)) {
    scrollWidth -= normal[normal.length - 1].width || 0;
    noWidthCount++;
    normal[normal.length - 1].width = undefined;
  }
  return {
    noWidthCount,
    scrollWidth,
    columns: left.concat(normal).concat(right),
  };
}

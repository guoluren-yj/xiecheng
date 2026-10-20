/* eslint-disable no-unused-vars */
import React, { ReactNode, FormEventHandler, ReactInstance } from 'react';
import moment from 'moment';
import {
  DataSet,
  Select,
  Lov,
  CheckBox,
  NumberField,
  TextField,
  DatePicker,
  TimePicker,
  Currency,
  WeekPicker,
  DateTimePicker,
  MonthPicker,
  YearPicker,
  IntlField,
  EmailField,
  UrlField,
  ColorPicker,
  Icon,
} from 'choerodon-ui/pro';
import warning from 'choerodon-ui/lib/_util/warning';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import { isString, isEmpty, isNil, isEqual, isArray, keys } from 'lodash';

import { lovQueryAxiosConfig } from '_utils/c7nUiConfig';

import {
  selectOrLovPopupCls,
  FieldFlag,
  ComparisonSetFieldSuffix,
  MeaingFieldSuffix,
  RangeStartFieldSuffix,
  RangeEndFieldSuffix,
} from './enum';

export const FieldEditMode = {
  OUTPUT: 'output', // 文本展示
  INPUT: 'input', // 输入
};

// 默认值类型
export const DefaultValueType = {
  CONSTANT: 0, // 常量
  EXPRESSION: 1, // 公式
};

// 通用范围日期字段-开始时间字段name
export function getRangeBeforeFieldName(fieldName) {
  return `_${fieldName}${RangeStartFieldSuffix}`;
}

// 通用范围日期字段-结算时间字段name
export function getRangeAfterFieldName(fieldName) {
  return `_${fieldName}${RangeEndFieldSuffix}`;
}

// lov,select组件多选字段虚拟字段name
export function getTempFieldName(fieldName) {
  return `${fieldName}_tmp`;
}

// 通用字段-关系符字段name
export function getComparsionFieldName(fieldName) {
  return `_${fieldName}${ComparisonSetFieldSuffix}`;
}

export function getRangeFieldName(fieldName) {
  return `${fieldName}_range`;
}

export function getInFieldName(fieldName) {
  return `_${fieldName}_In`;
}

export function getDateTimeMinFormat(format) {
  return `${format} 00:00:00`;
}

export function getDateTimeMaxFormat(format) {
  return `${format} 23:59:59`;
}

export function getMeaningFieldName(fieldName) {
  return `${fieldName}${MeaingFieldSuffix}`;
}

export function filterTempFields(fields) {
  if (isEmpty(fields)) {
    return [];
  }
  return fields.filter((item) => !item[FieldFlag.VIRTUAL]);
}

export function checkValueValid(value) {
  if (value === 0) {
    return true;
  }
  if (!value) {
    return false;
  }
  if (isArray(value)) {
    return value.filter(Boolean).length > 0;
  }
  if (typeof value === 'object' && isEmpty(value)) {
    return false;
  }
  return true;
}

/**
 * 获取字段编辑组件
 * @param fieldPorps
 */
export function getEditorByField(props) {
  const {
    name,
    type,
    lookupCode,
    lookupUrl,
    lovCode,
    options,
    record,
    ref,
    onInput,
    onChange,
    normalEditorWidth,
    editorProps: originEditorProps = {},
  } = props;
  const editorProps = {
    ...originEditorProps,
    name,
    record,
    autoFocus: true,
  };
  const normalEditorProps = {
    ref,
    style: {
      width: normalEditorWidth,
    },
    onInput,
    onChange,
  };
  if (lookupCode || isString(lookupUrl) || (type !== FieldType.object && (lovCode || options))) {
    return (
      <Select
        {...editorProps}
        suffix={<Icon type="arrow_drop_down" />}
        popupCls={selectOrLovPopupCls}
      />
    );
  }
  if (lovCode) {
    return <Lov {...editorProps} popupCls={selectOrLovPopupCls} />;
  }
  switch (type) {
    case FieldType.boolean:
      return <CheckBox {...editorProps} />;
    case FieldType.number:
      return <NumberField {...editorProps} {...normalEditorProps} />;
    case FieldType.currency:
      return <Currency {...editorProps} />;
    case FieldType.date:
      return <DatePicker {...editorProps} />;
    case FieldType.dateTime:
      return <DateTimePicker {...editorProps} />;
    case FieldType.time:
      return <TimePicker {...editorProps} />;
    case FieldType.week:
      return <WeekPicker {...editorProps} />;
    case FieldType.month:
      return <MonthPicker {...editorProps} />;
    case FieldType.year:
      return <YearPicker {...editorProps} />;
    case FieldType.intl:
      return <IntlField {...editorProps} />;
    case FieldType.email:
      return <EmailField {...editorProps} />;
    case FieldType.url:
      return <UrlField {...editorProps} />;
    case FieldType.color:
      return <ColorPicker {...editorProps} />;
    case FieldType.string:
      return <TextField {...editorProps} {...normalEditorProps} />;
    default:
      warning(
        false,
        `Table auto editor: No editor exists on the field<${name}>'s type<${type}>, so use the TextField as default editor`
      );
      return <TextField {...editorProps} />;
  }
}

export function sortFields(fields, sortBy) {
  fields.sort((before, after) => {
    // if (!before[sortBy]) {
    //   return true;
    // }
    // if (!after[sortBy]) {
    //   return false;
    // }
    return before[sortBy] - after[sortBy];
  });
  return fields;
}

// 根据字段name获取所有关联字段
export function getRelatedFilterFields(fields = [], targetFeild) {
  const { name } = targetFeild;
  const relatedFields = fields.filter((item) => {
    const { name: fieldName } = item;
    return (
      fieldName === name ||
      fieldName === getTempFieldName(name) ||
      fieldName === getRangeAfterFieldName(name) ||
      fieldName === getRangeBeforeFieldName(name) ||
      fieldName === getComparsionFieldName(name)
    );
  });
  // rank, display, proDefaultFlag 属性保留
  return relatedFields.map((item) => ({
    ...item,
    defaultValue: undefined,
    defaultValueMeaning: undefined,
    rank: targetFeild.rank,
    display: targetFeild.display,
    proDefaultFlag: targetFeild.proDefaultFlag,
    // defaultValueCon: targetFeild.defaultValueCon,
  }));
}

// 比较字段值是否发生更改
export function checkFieldValueModified(field, value, oldValue) {
  const { fieldWidget, format, multipleFlag } = field;
  let newValue = !isNil(value) ? value : undefined;
  let originValue = !isNil(oldValue) ? oldValue : undefined;
  if (fieldWidget === 'DATE_PICKER') {
    const formatMoment = (momentValue, formatter) => {
      if (momentValue instanceof moment) {
        return momentValue.format(formatter);
      } else if (isString(momentValue)) {
        return moment(momentValue).format(formatter);
      } else {
        return momentValue;
      }
    };
    if (multipleFlag !== 1) {
      newValue = !isNil(newValue) ? formatMoment(newValue, format) : undefined;
      originValue = !isNil(originValue) ? formatMoment(originValue, format) : undefined;
    } else {
      newValue =
        !isNil(newValue) && isArray(newValue)
          ? newValue.map((item) => (!isNil(item) ? formatMoment(item, format) : '')).join(',')
          : undefined;
      originValue =
        !isNil(originValue) && isArray(originValue)
          ? originValue.map((item) => (!isNil(item) ? formatMoment(item, format) : '')).join(',')
          : undefined;
    }
  } else if (fieldWidget === 'INPUT_NUMBER' && multipleFlag === 1) {
    newValue =
      !isNil(newValue) && isArray(newValue)
        ? newValue.filter((item) => !isNil(item)).join(',')
        : undefined;
    originValue =
      !isNil(originValue) && isArray(originValue)
        ? originValue.filter((item) => !isNil(item)).join(',')
        : undefined;
  }
  return newValue !== originValue;
}

// 比较字段配置是否发生更改
export function checkFieldConfigModified(oldField, newField) {
  if (isNil(oldField) || isNil(newField)) {
    return true;
  }
  const configArr = [
    'label', // 字段名称
    'customComparisonSet', // 筛选条件
    'fieldWidget', // 组件
    'multipleFlag', // 多选/范围
    'type', // 字段类型
    'fieldVisible', // 是否显示
    'format', // 日期格式
    'sourceCode', // 值集编码
    'textField', // 值集显示字段
    'valueField', // 值集值字段
    'sortFlag', // 是否可排序
    'gridSeq', // 位置
    'proDefaultFlag', // 默认值类型
    'disabled', // 是否可编辑
    'helpMessage', // 气泡提示,
    'defaultValueCon', // 默认值条件
  ];
  return configArr.some(
    (item) =>
      !isEqual(
        !isNil(oldField[item]) ? oldField[item] : '',
        !isNil(newField[item]) ? newField[item] : ''
      )
  );
}

export const getLovQueryAxiosConfig = (code, config, options) => {
  const axiosConfig = lovQueryAxiosConfig(code, config);
  return {
    ...axiosConfig,
    headers: {
      ...axiosConfig.headers,
      ...options.headers,
    },
  };
};

export const isObjectEqual = (targetObj, sourceObj) => {
  const objKeys = keys(targetObj);
  if (!isEqual(objKeys, keys(sourceObj))) {
    return false;
  }
  if (objKeys.length < 1) {
    return true;
  }
  return objKeys.every((item) => {
    const targetValue = isNil(targetObj[item]) ? undefined : targetObj[item];
    const sourceValue = isNil(sourceObj[item]) ? undefined : sourceObj[item];
    return targetValue === sourceValue;
  });
};

export const transformNilValue = (value, nilValue) => {
  return isNil(value) ? nilValue : value;
};

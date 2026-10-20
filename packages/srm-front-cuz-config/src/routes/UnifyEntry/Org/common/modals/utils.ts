import { isEmpty, isArray, omit, isNil } from 'lodash';

export function transformRequestFieldData(fieldData, isSeachBarType = false) {
  let data = fieldData;
  if (isSeachBarType) {
    const { custType, whereOptions, mergeFlag, sortedFlag, widget } = data;
    const { multipleFlag, defaultValue, fieldWidget } = widget || {};
    const newWhereOption = isArray(whereOptions) ? whereOptions.join(',') : whereOptions;
    data = {
      ...data,
      mergeFlag: !isNil(mergeFlag) ? mergeFlag : 0, // 空值传0
      sortedFlag: !isNil(sortedFlag) ? sortedFlag : -1, // 空值传-1
      whereOption:
        // eslint-disable-next-line no-nested-ternary
        Number(multipleFlag) === 1 && fieldWidget !== 'DATE_PICKER'
          ? 'IN'
          : mergeFlag === 1
          ? 'LIKE'
          : newWhereOption,
    };
    data = omit(data, ['whereOptions']);
    if (custType === 'STD') {
      data = omit(data, ['displayField', 'valueField']);
    }
    if (defaultValue) {
      delete data.widget.defaultValue;
    }
  }
  if (isEmpty(data.widget)) delete data.widget;
  if (data.fieldNameType === 'MODEL') {
    data.modelFieldCode = data.fieldCode;
  }
  // 虚拟字段 modelCode保存为-1
  // eslint-disable-next-line eqeqeq
  if (isNil(data.modelCode)) {
    data.modelCode = -1;
    data.fieldId = -1;
  }
  if (isNil(data.fieldCode)) {
    data.fieldCode = data.fieldAlias || data.fieldCodeAlias;
  }
  if (isNil(data.field)) {
    data.field = {};
  }
  if (isNil(data.field.fieldCode)) {
    data.field.fieldCode = data.fieldCode;
  }
  if (!['DEFAULT', 'CUSTOMIZE'].includes(data.fieldNameType) && data.cuszFieldName) {
    // 保存时 将cuszFieldName 填充到fieldName字段上
    data.fieldName = data.cuszFieldName;
  }
  // 链接标题多语言移动到 widget 内
  if (data._tls && data._tls.linkTitle) {
    data.widget._tls = {
      ...(data.widget._tls || {}),
      linkTitle: data._tls.linkTitle,
    };
    delete data._tls.linkTitle;
  }
  // 链接标题多语言移动到 widget 内
  if (data._tls && data._tls.placeholder) {
    data.widget._tls = {
      ...(data.widget._tls || {}),
      placeholder: data._tls.placeholder,
    };
    delete data._tls.placeholder;
  }
  return data;
}

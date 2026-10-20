import { yesOrNoRender } from 'utils/renderer';
import { isFunction, isObject } from 'lodash';

import { PRIVATE_BUCKET } from '@/utils/config';

export const getCommonTableProps = (fieldProps = {}) => {
  const { componentType } = fieldProps;
  let tableProps = {};
  switch (componentType) {
    case 'Switch':
    case 'Checkbox':
      tableProps = {
        renderer: ({ value }) => {
          const formatValue = Number(value) ? 1 : 0;
          return yesOrNoRender(formatValue);
        },
      };
      break;
    default:
      break;
  }
  return tableProps;
};

export const getDataSetType = (componentType, fieldCode) => {
  switch (componentType) {
    case 'Lov':
    case 'TransferLov': // 多选lov
      return 'object';
    case 'Upload':
      return 'attachment';
    case 'Switch':
    case 'Checkbox':
      return 'boolean';
    case 'InputNumber':
      return 'number';
    case 'DateTimePicker':
      return 'dateTime';
    case 'DatePicker':
      return 'date';
    case 'TLEditor':
      return 'intl';
    default:
      return 'string';
  }
};

// 附件上传组件额外属性
const getUploadProps = () => {
  return {
    viewMode: 'popup',
    bucketName: PRIVATE_BUCKET,
  };
};

// checkbox组件额外属性
const getCheckboxProps = () => {
  return {
    trueValue: 1,
    falseValue: 0,
  };
};

const propUtils = {
  Upload: getUploadProps,
  Checkbox: getCheckboxProps,
  Switch: getCheckboxProps,
};

// 获取组件属性
export const getComponentProps = (componentType) => {
  const propFunc = propUtils[componentType];
  let componentProps = {};
  if (isFunction(propFunc)) {
    componentProps = propFunc();
  }
  return { ...componentProps };
};

export const hanldeMultipleLovMeaning = ({ record, fieldCode, displayField }) => {
  const fieldCodeMeaning = record[displayField] || record[`${fieldCode}Meaning`];
  const arr = [];
  if (isObject(fieldCodeMeaning)) {
    for (const key in fieldCodeMeaning) {
      if (Object.hasOwnProperty.call(fieldCodeMeaning, key)) {
        const meaning = fieldCodeMeaning[key];
        arr.push(meaning);
      }
    }
  }
  return arr.join(',');
};

/**
 * 通用help function
 */
import { isEmpty, isArray, isObject } from 'lodash';

import { lovQueryAxiosConfig } from '_utils/c7nUiConfig';

import { meaingFieldSuffix, comparisonSetFieldSuffix } from './constant';

/**
 * 字段meaning
 * @param {*} fieldName - field名称
 */
export const getMeaningFieldName = (fieldName) => {
  return `${fieldName}${meaingFieldSuffix}`;
};

// lov,select组件多选字段虚拟字段name
export function getTempFieldName(fieldName) {
  return `${fieldName}_tmp`;
}

/**
 * 校验数据有效性
 * @param {*} value - 待check值
 */
export const checkValueValid = (value) => {
  if (value === 0) {
    return true;
  }
  if (!value) {
    return false;
  }
  if (isArray(value)) {
    return value.filter(Boolean).length > 0;
  }
  if (isObject(value) && isEmpty(value)) {
    return false;
  }
  return true;
};

// 通用字段-关系符字段name
export function getComparsionFieldName(fieldName) {
  return `_${fieldName}${comparisonSetFieldSuffix}`;
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

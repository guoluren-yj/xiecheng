import React from 'react';
import moment from 'moment';
import { isString, isEmpty, isNil, isEqual, isArray, keys } from 'lodash';

import { lovQueryAxiosConfig } from '@/utils/c7nUiConfig';
import styles from '../index.less';

import { FieldFlag, MeaingFieldSuffix, RangeStartFieldSuffix, RangeEndFieldSuffix } from './enum';

// 通用范围日期字段-开始时间字段name
export function getRangeBeforeFieldName(fieldName) {
  return `_${fieldName}${RangeStartFieldSuffix}`;
}

// 通用范围日期字段-结算时间字段name
export function getRangeAfterFieldName(fieldName) {
  return `_${fieldName}${RangeEndFieldSuffix}`;
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
  if (value === null || value === undefined || value === '') {
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

export function sortFields(fields, sortBy) {
  fields.sort((before, after) => before[sortBy] - after[sortBy]);
  return fields;
}

// 根据字段name获取所有关联字段
export function getRelatedFilterFields(fields = [], targetFeild) {
  const { name } = targetFeild;
  const relatedFields = fields.filter((item) => {
    const { name: fieldName } = item;
    return (
      fieldName === name ||
      fieldName === getRangeAfterFieldName(name) ||
      fieldName === getRangeBeforeFieldName(name)
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
  const { fieldWidget, format, multiple } = field;
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
    if (!multiple) {
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
  } else if (fieldWidget === 'INPUT_NUMBER' && multiple) {
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

export const getSortUpIcon = () => {
  return (
    <svg width="14px" height="14px" viewBox="0 0 14 14" version="1.1">
      <g id="组件" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
        <g id="Search/Components/Sort" transform="translate(-94.000000, -9.000000)">
          <g id="编组-8" transform="translate(8.000000, 7.000000)">
            <g id="icon-ascending" transform="translate(86.000000, 2.000000)">
              <rect id="矩形" x="0" y="0" width="16" height="16" />
              <g id="编组-22" transform="translate(1.300000, 2.500000)">
                <path
                  d="M7,7.05064905 L7,8.28268429 L0,8.28268429 L0,7.05064905 L7,7.05064905 Z M5.6,4.38398238 L5.6,5.61601762 L0,5.61601762 L0,4.38398238 L5.6,4.38398238 Z M4.2,1.71731571 L4.2,2.94935095 L0,2.94935095 L0,1.71731571 L4.2,1.71731571 Z"
                  id="形状结合"
                  fillOpacity="0.85"
                  fill="#000000"
                  fillRule="nonzero"
                />
                <polygon
                  id="路径"
                  className={styles['sort-up-or-down-icon-them']}
                  fill="#00B8CC"
                  points="9.7 2.33333333 11.3666667 2.33333333 9.03333333 0 6.7 2.33333333 8.36666667 2.33333333 8.36666667 8.9849916 9.7 8.9849916"
                />
              </g>
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
};

export const getSortDownIcon = () => {
  return (
    <svg width="14px" height="14px" viewBox="0 0 14 14" version="1.1" style={{ marginTop: '2px' }}>
      <g id="组件" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
        <g id="Search/Components/Sort" transform="translate(-94.000000, -9.000000)">
          <g id="编组-8" transform="translate(8.000000, 7.000000)">
            <g id="icon-ascending" transform="translate(86.000000, 2.000000)">
              <rect id="矩形" x="0" y="0" width="16" height="16" />
              <g
                id="编组-22"
                transform="translate(6.983333, 6.992496) scale(1, -1) translate(-6.983333, -6.992496) translate(1.300000, 2.500000)"
              >
                <path
                  d="M7,7.05064905 L7,8.28268429 L0,8.28268429 L0,7.05064905 L7,7.05064905 Z M5.6,4.38398238 L5.6,5.61601762 L0,5.61601762 L0,4.38398238 L5.6,4.38398238 Z M4.2,1.71731571 L4.2,2.94935095 L0,2.94935095 L0,1.71731571 L4.2,1.71731571 Z"
                  id="形状结合"
                  fillOpacity="0.85"
                  fill="#000000"
                  fillRule="nonzero"
                />
                <polygon
                  className={styles['sort-up-or-down-icon-them']}
                  id="路径"
                  fill="#00B8CC"
                  points="9.7 2.33333333 11.3666667 2.33333333 9.03333333 0 6.7 2.33333333 8.36666667 2.33333333 8.36666667 8.9849916 9.7 8.9849916"
                />
              </g>
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
};

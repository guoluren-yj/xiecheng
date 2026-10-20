import moment from 'moment';
import BigNumber from 'bignumber.js';
import { math } from 'choerodon-ui/dataset';

import { PRIVATE_BUCKET } from '_utils/config';
import { ChunkUploadProps } from '@/utils/SsrcRegx';

/**
 * 渲染时间日期渲染格式
 */
function dateFormatRender(dateFormat) {
  let format;
  switch (dateFormat) {
    case 'yyyy-MM-dd':
      format = 'YYYY-MM-DD';
      break;
    case 'yyyy/MM/dd':
      format = 'YYYY/MM/DD';
      break;
    case 'yyyy-MM-dd hh:mm:ss':
      format = 'YYYY-MM-DD HH:mm:ss';
      break;
    case 'yyyy/MM/dd hh:mm:ss':
      format = 'YYYY/MM/DD HH:mm:ss';
      break;
    default:
      break;
  }
  return format;
}

function logicDetailPropsRender(record) {
  const {
    dimensionCode,
    fieldWidget,
    priceLibDimMaps,
    textMaxLength,
    textMinLength,
    sourceCode,
    numberMin,
    numberMax,
    dateFormat,
    numberPrecision,
    bucketName,
    bucketDirectory,
    currencyCode,
  } = record.get([
    'dimensionCode',
    'fieldWidget',
    'priceLibDimMaps',
    'textMaxLength',
    'textMinLength',
    'sourceCode',
    'numberMin',
    'numberMax',
    'dateFormat',
    'numberPrecision',
    'bucketName',
    'bucketDirectory',
    'currencyCode',
  ]);
  let fieldConfig = {};

  const displayField = priceLibDimMaps?.find((n) => n.targetDimensionCode === dimensionCode)
    ?.sourceFromFieldMeaning;
  const valueField = priceLibDimMaps?.find((n) => n.targetDimensionCode === dimensionCode)
    ?.sourceFromFieldName;

  switch (fieldWidget) {
    case 'LINK':
      fieldConfig = {
        type: 'string',
      };
      break;
    case 'INPUT':
      fieldConfig = {
        type: 'string',
        maxLength: textMaxLength,
        minLength: textMinLength,
      };
      break;
    case 'LONG_INPUT':
      fieldConfig = {
        type: 'string',
      };
      break;
    case 'SELECT':
      fieldConfig = {
        type: 'string',
        lookupCode: sourceCode,
      };
      break;
    case 'LOV':
      fieldConfig = {
        type: 'object',
        lovCode: sourceCode,
        textField: displayField || record.get('displayField'),
        valueField: valueField || record.get('valueField'),
        // defaultValue,
        // multiple: Number(field.multipleFlag) === 1,
        // transformRequest: value => (isObject(value) ? value[field.valueField] : value),
      };
      break;
    case 'INPUT_NUMBER':
      fieldConfig = {
        type: 'number',
        nonStrictStep: true,
        min: numberMin !== null ? new BigNumber(numberMin) : undefined,
        max: numberMax !== null ? new BigNumber(numberMax) : undefined,
        step:
          currencyCode &&
          ['taxIncludedPrice', 'netPrice', 'perTaxIncludedPrice', 'perNetPrice'].includes(
            dimensionCode
          )
            ? null
            : numberPrecision || numberPrecision === 0
            ? math.div(1, math.pow(10, numberPrecision))
            : null,
      };
      break;
    case 'DATE_PICKER':
      fieldConfig = {
        type:
          dateFormat === 'yyyy/MM/dd hh:mm:ss' || dateFormat === 'yyyy-MM-dd hh:mm:ss'
            ? 'dateTime'
            : 'date',
        format: dateFormatRender(dateFormat),
        transformRequest: (val) =>
          val &&
          moment(val).format(
            dateFormat === 'yyyy/MM/dd hh:mm:ss' || dateFormat === 'yyyy-MM-dd hh:mm:ss'
              ? 'YYYY-MM-DD HH:mm:ss'
              : 'YYYY-MM-DD 00:00:00'
          ),
      };
      break;
    case 'SWITCH':
      fieldConfig = {
        type: 'boolean',
        transformResponse: (val) => {
          if (Number(val)) {
            return true;
          } else {
            return false;
          }
        },
        transformRequest: (val) => {
          if (val) {
            return '1';
          } else {
            return '0';
          }
        },
        // defaultValue,
      };
      break;
    case 'UPLOAD':
      fieldConfig = {
        type: 'attachment',
        bucketName: bucketName || PRIVATE_BUCKET,
        bucketDirectory,
        ...(ChunkUploadProps || {}),
      };
      break;
    default:
      fieldConfig = {
        type: 'string',
      };
      break;
  }
  return fieldConfig;
}

// 代码转换
function codeTransfer(code = '', mappingList = []) {
  if (Array.isArray(mappingList) && mappingList.length > 0) {
    // 自定义设置一个变量存储映射
    const objMap = {};
    mappingList.forEach((item) => {
      if (!objMap[item.value]) {
        Object.assign(objMap, {
          [`\${${item.value}}`]: item.meaning,
        });
      }
    });

    // 使用正则解析字符串 并得到有多少个${xxx}
    const pattern = /\$\{(.*?)\}/g;
    // 对字符串中的每个${xxx}替换成objMap映射中的中文
    const _newCode = code.replace(pattern, (r) => {
      if (objMap[r]) {
        return `<span style="display: inline-block;margin: 0 4px 8px;background: rgba(0,184,204,0.1);border-radius: 1px;font-size: 12px;color: #1D2129;letter-spacing: 0;font-weight: 600;padding: 4px 8px">${objMap[r]}</span>`;
      }
      return `<span style="display: inline-block;margin: 0 4px 8px;background: rgba(230,67,34,0.1);border-radius: 1px;font-size: 12px;color: #1D2129;letter-spacing: 0;font-weight: 600;padding: 4px 8px">${
        r.match(/(?<=\$\{).*(?=\})/)?.[0]
      }</span>`;
    });

    return _newCode;
  }
  return code;
}

export { logicDetailPropsRender, dateFormatRender, codeTransfer };

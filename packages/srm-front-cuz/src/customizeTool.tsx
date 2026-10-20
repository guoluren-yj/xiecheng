import React from 'react';
import { isArray, isNil, isString, isNumber } from 'lodash';
import moment from "moment";
import BigNumber from 'bignumber.js';
import {
  getCurrentOrganizationId,
  getUserOrganizationId,
  getCurrentUser,
} from 'hzero-front/lib/utils/utils';
import { yesOrNoRender } from 'hzero-front/lib/utils/renderer';
import { math } from 'choerodon-ui/dataset';
import { FieldType } from 'choerodon-ui/dataset/data-set/enum';
import { Cache } from './Customize';
import { ConditionHeaderDTO, ConValid, CtxParams, FieldConfig, ParamList } from './interfaces';
import { specMap, statementToJs, innerFunctionMap } from './utils';

export function renderCheckBox(val) {
  return yesOrNoRender(Number(val || 0));
}

export function getContext() {
  return {
    ...getCurrentUser(),
    organizationId: getCurrentOrganizationId(),
    tenantId: getUserOrganizationId(),
  };
}

/**
 * 对initialValue进行预处理
 * @param type 处理类型
 * @param value 表单值
 */
export function preAdapterInitValue(config: FieldConfig, value, isStd?: boolean) {
  const { fieldType, multipleFlag, numberPrecision, isStandardField, isH0 } = config;
  switch (fieldType) {
    case 'CHECKBOX':
    case 'SWITCH':
      // eslint-disable-next-line eqeqeq
      return isNil(value) ? value : Number(value);
    case 'SELECT':
      return multipleFlag === 1 && isStd && isString(value)
        ? value.split(',')
        : value;
    case 'INPUT_NUMBER':
      let finalValue = isNil(value) || isNumber(value) || math.isBigNumber(value) ? value : math.fix(new BigNumber(value));
      // 小数位数超过13位则会视为大数字
      if (!isNil(finalValue) && !isStandardField && !isNil(numberPrecision) && numberPrecision < 13  && (
        !isH0 ? math.isBigNumber(finalValue) : checkNumberDecimal(finalValue, numberPrecision)
      )) {
        finalValue = roundDecimal(finalValue, numberPrecision);
      }
      return finalValue;
    default:
      return value;
  }
}

export function computeConfig(condition: ConditionHeaderDTO, config) {
  let { conExpression = '' } = condition || {};
  const { lines = [] } = condition || {};
  if (conExpression !== '') {
    const isErr = isErrConExpression(conExpression);
    if (!isErr) {
      const conNoList = conExpression.match(/\s?\d+\s?/g) || [];
      const result = calculateExpression(lines, config);
      if (lines.length > 0) {
        conNoList.forEach((k) => {
          const newKey = k.trim();
          conExpression = conExpression.replace(newKey, result[newKey] || false);
        });
        conExpression = conExpression.replace(/AND|and/g, '&&').replace(/OR|or/g, '||');
        // eslint-disable-next-line no-eval
        return eval(conExpression) ? 1 : 0;
      }
    }
  }
  return -1;
}

export function coverConfig(
  conditions: ConditionHeaderDTO[] = [],
  config: CalculateConfig,
  ignore: string[] = []
) {
  const newConfig: any = {};
  conditions.forEach((i) => {
    let { conExpression = '' } = i;
    if (conExpression !== '') {
      const isErr = isErrConExpression(conExpression);
      if (!isErr && !ignore.includes(i.conType)) {
        const conNoList = conExpression.match(/\s?\d+\s?/g) || [];
        const result = calculateExpression(i.lines || [], config);
        if ((i.lines || []).length > 0) {
          conNoList.forEach((k) => {
            const newKey = k.trim();
            conExpression = conExpression.replace(newKey, result[newKey] || false);
          });
          conExpression = conExpression.replace(/AND|and/g, '&&').replace(/OR|or/g, '||');
          // eslint-disable-next-line no-eval
          newConfig[i.conType] = eval(conExpression) ? 1 : 0;
        }
      }
    }
  });
  return newConfig;
}

function isErrConExpression(exp) {
  const leftBracketNum = (exp.match(/\(/g) || []).length;
  const rightBracketNum = (exp.match(/\)/g) || []).length;
  const ruleConNo = /\s*\d+\s+\d+\s*/g.test(exp);
  const ruleConLogic =
    /\s*(AND|OR|and|or)\s*(AND|OR|and|or)\s*/g.test(exp) || /(^(AND|OR|and|or))|((AND|OR|and|or)$)/g.test(exp);
  const illegalChar = /^(?!AND|OR|and|or|\(|\)|\d)/g.test(exp);
  if (leftBracketNum !== rightBracketNum || ruleConNo || ruleConLogic || illegalChar) return true;
  return false;
}

type CalculateConfig = {
  cache: { [k: string]: Cache };
  code: string;
  rowKey?: number | string;
  ctxParams: CtxParams;
  namespace?: string;
  attachmentsCount?: any;
};

function calculateExpression(
  conditionList,
  { ctxParams, cache, code, rowKey, namespace, attachmentsCount }: CalculateConfig
) {
  const result = {};
  conditionList.forEach((i) => {
    const {
      sourceType: _sourceType = '',
      conCode,
      sourceFieldCode = '',
      sourceUnitCode,
      conExpression,
      targetType,
      targetUnitCode = code,
      targetFieldCode = '',
      targetValue,
    } = i;
    let left;
    let right = targetValue;
    const splitData = _sourceType.split('-');
    const [sourceType, ctxValue] = splitData;
    const encryptValues: [string?, string?] = [];
    // 兼容历史数据处理，sourceType不存在则等价于单元字段
    if (sourceType === 'CUZ_UNIT' || !sourceType) {
      if (!sourceUnitCode) return;
      left = getFieldValueByCode(sourceUnitCode, sourceFieldCode, { cache, rowKey, namespace });
      // 附件字段为空或不为空，需单独处理，不仅判断字段值，还要判断附件数量
      if (!isNil(left)) {
        if (conExpression === 'NOTNULL') {
          // 不支持表格
          const field =  cache[sourceUnitCode]?.type !== 'table' && cache[sourceUnitCode]?.dataSet?.current?.getField(sourceFieldCode);
          if (field && field.get('type') === FieldType.attachment && !field.getAttachmentCount()) {
            return result[conCode] = false; 
          }
          if (attachmentsCount) {
            const target =  Object.keys(attachmentsCount).find(key => key && key.startsWith(`${left}#`));
            if (target && attachmentsCount[target] === 0) {
              return result[conCode] = false;
            }
          }
        } else if (conExpression === 'ISNULL') {
          // 不支持表格
          const field = cache[sourceUnitCode]?.type !== 'table' && cache[sourceUnitCode]?.dataSet?.current?.getField(sourceFieldCode);
          if (field && field.get('type') === FieldType.attachment && !field.getAttachmentCount()) {
            return result[conCode] = true; 
          }
          if (attachmentsCount) {
            const target =  Object.keys(attachmentsCount).find(key => key && key.startsWith(`${left}#`));
            if (target && attachmentsCount[target] === 0) {
              return result[conCode] = true;
            }
          }
        }
      }
    }
    if (sourceType === 'CTX') {
      if (!ctxValue) return result;
      switch (ctxValue) {
        case 'defaultCompany':
          left = ctxParams.ctx.additionInfo.defaultCompanyId;
          break;
        case 'ownTenantId':
          left = ctxParams.ctx.organizationId;
          break;
        case 'userId':
          left = ctxParams.ctx.id;
          encryptValues[0] = ctxParams.ctx.encryptId;
          break;
        case 'ownTenantNum':
          left = ctxParams.ctx.additionInfo.organizationNum;
          break;
        default:
          left = ctxParams.ctx[ctxValue];
      }
    }

    if (targetType === 'formNow') {
      right = getFieldValueByCode(targetUnitCode, targetFieldCode, { cache, rowKey, namespace });
    } else if (targetType === 'time') {
      // eslint-disable-next-line no-new-func
      right = new Function(`try{return ${specMap.DATE[targetValue]};}catch(e){console.log(e);}`)();
    }
    if (["!=", "NOTSAME", "NOTNULL", "UNLIKE", "~UNLIKE", "NOTIN", "UNACTIVE"].includes(conExpression)) {
      result[conCode] = logicCompute(conExpression, left, right) && logicCompute(conExpression, encryptValues[0] || left, encryptValues[1] || right);
    } else {
      result[conCode] = logicCompute(conExpression, left, right) || logicCompute(conExpression, encryptValues[0] || left, encryptValues[1] || right);
    }

  });
  return result;
}

function logicCompute(type, left, right) {
  if (math.isBigNumber(left) || math.isBigNumber(right)) {
    switch (type) {
      case '=':
        return math.eq(left, right);
      case '>=':
        return math.gte(left, right);
      case '<=':
        return math.lte(left, right);
      case '!=':
        return !math.eq(left, right);
      case '>':
        return math.gt(left, right);
      case '<':
        return math.lt(left, right);
      default:
        return false;
    }
  }
  // 只要是日期的条件判断，left和right任意一个为空则返回false
  if (['BEFORE', '~BEFORE', 'AFTER', '~AFTER', 'SAME', 'NOTSAME'].includes(type) && (isNil(left) || isNil(right))) return false;

  let leftCollection = new Set();
  let rightCollection = new Set();
  switch (type) {
    case '=':
      return left == right;
    case '>=':
      return left >= right;
    case '<=':
      return left <= right;
    case '!=':
      return left != right;
    case '>':
      return left > right;
    case '<':
      return left < right;
    case 'UNACTIVE':
    case 'ISNULL':
      return left === undefined || left === null || left === "";
    case 'ACTIVE':
    case 'NOTNULL':
      return left !== undefined && left !== null && left !== "";
    case 'BEFORE':
      return moment(left).isBefore(moment(right));
    case 'AFTER':
      return moment(left).isAfter(moment(right));
    case 'SAME':
      return moment(left).isSame(moment(right));
    case 'NOTSAME':
      return !moment(left).isSame(moment(right));
    case '~BEFORE':
      return !moment(left).isBefore(moment(right));
    case '~AFTER':
      return !moment(left).isAfter(moment(right));
    case 'LIKE':
      return new RegExp(right, 'g').test(String(left));
    case 'UNLIKE':
      return !new RegExp(right, 'g').test(String(left));
    case '~LIKE':
      return new RegExp(left, 'g').test(String(right));
    case '~UNLIKE':
      return !new RegExp(left, 'g').test(String(right));
    case 'IN':
      if (left === 0) leftCollection.add("0");
      if (!left || !right) return false;
      String(right).split(",").forEach(v => rightCollection.add(v));
      return String(left).split(",").reduce((res, v) => res && rightCollection.has(v), true);
    case 'NOTIN':
      if (left === 0) leftCollection.add("0");
      if (!left || !right) return true;
      String(right).split(",").forEach(v => rightCollection.add(v));
      return String(left).split(",").reduce((res, v) => res && !rightCollection.has(v), true);
    default:
      return false;
  }
}

export function getParams(options: {
  paramList?: ParamList[];
  ctxParams: any;
  cache: { [k: string]: Cache };
  rowKey?: any;
  namespace?: string;
}) {
  const { paramList = [], ctxParams, cache, rowKey, namespace } = options;
  const paramObj: any = {};
  paramList.forEach((item) => {
    if (item.paramType === 'context') {
      switch (item.paramValue) {
        case 'organizationId':
          paramObj[item.paramKey] = ctxParams.ctx.organizationId;
          break;
        case 'tenantId':
          paramObj[item.paramKey] = ctxParams.ctx.tenantId;
          break;
        default:
      }
    } else if (item.paramType === 'url') {
      paramObj[item.paramKey] = ctxParams.url[item.paramKey];
    } else if (item.paramType === 'fixed') {
      paramObj[item.paramKey] = item.paramValue;
    } else if (item.paramType === 'self') {
      paramObj[item.paramKey] = ctxParams.self[item.paramValue as string];
    } else {
      paramObj[item.paramKey] = getFieldValueByCode(
        item.paramUnitCode || '',
        item.paramFieldCode || '',
        { cache, rowKey, namespace }
      );
    }
  });
  return paramObj;
}

type VOOptions = {
  relatedList: any[];
  cache: { [k: string]: Cache };
  code: string;
  ctxParams: any;
  rowKey?: string | number;
  namespace?: string;
};

export function getFieldValueObject(options: VOOptions) {
  const { relatedList = [], cache, code, ctxParams, namespace } = options;
  const obj = {};
  relatedList.forEach(({ unitCode, alias }) => {
    const newAlias = unitCode === code ? 'self' : alias;
    if (alias === "c") {
      obj[newAlias] = (fieldCode) => (ctxParams.ctx || {})[fieldCode];
      return;
    }
    // @ts-ignore
    if (cache[unitCode] && cache[unitCode].getValue) {
      obj[newAlias] = (fieldCode, rowKey) => cache[unitCode].getValue(fieldCode, rowKey, namespace);
    }
  });
  return obj;
}

function getFieldValueByCode(unitCode: string, fieldCode: string, { cache, rowKey, namespace }) {
  if (cache[unitCode] && cache[unitCode].init) {
    return cache[unitCode].getValue(fieldCode, rowKey, namespace);
  }
}

export function selfValidator(conValid: ConValid = {} as any, config: CalculateConfig) {
  const { errorMessage } = fxComplex(config, conValid, true);
  return errorMessage;
}

export function fxComplex(
  config: CalculateConfig,
  valueConDTO: ConValid = {} as any,
  anti?: boolean
) {
  let { conLineList = [], conValidList = [] } = valueConDTO;
  conLineList = isArray(conLineList) ? conLineList : [];
  conValidList = isArray(conValidList) ? conValidList : [];
  const result = calculateExpression(conLineList, config);
  for (let i = 0; i < conValidList.length; i++) {
    const condition = conValidList[i];
    let { conExpression = '' } = condition;
    const isErr = isErrConExpression(conExpression);
    if (!isErr) {
      const conNoReg = /(\d+)/g;
      conExpression = conExpression.replace(conNoReg, (_, m) => result[m] || false);
      conExpression = conExpression.replace(/AND|and/g, '&&').replace(/OR|or/g, '||');
      // eslint-disable-next-line no-extra-boolean-cast,no-new-func
      const cmpValue = new Function(`try {return ${conExpression};}catch(e){console.error(e)}`)();
      if ((!anti && cmpValue) || (anti && !cmpValue)) {
        return condition;
      }
    }
  }
  return {};
}

export function defaultValueFx(
  config: CalculateConfig,
  defaultValueConDTO: ConValid = {} as any,
  proDefaultFlag?: number
) {
  let { value: defaultValue, valueMeaning: defaultValueMeaning } = fxComplex(
    config,
    defaultValueConDTO
  );
  if (proDefaultFlag && defaultValue) {
    const str = defaultValue;
    const { ctxParams, cache, rowKey, namespace } = config;
    try {
      // eslint-disable-next-line no-new-func
      defaultValue = new Function(
        'ctx,cache,innerFunctionMap,namespace',
        statementToJs(str).join('\r\n')
      )(
        ctxParams,
        cache,
        innerFunctionMap,
        namespace
      )(rowKey);
      defaultValueMeaning = undefined;
    } catch (error) {
      console.log(error);
    }
  }
  return { defaultValue, defaultValueMeaning };
}

/**
 * 所有类似求字段名称fx的场景都可以调用该api，如气泡提示
 * @param config
 * @param fieldNameConDTO
 * @returns {string | void} name
 */
export function fieldNameFx(config: CalculateConfig, fieldNameConDTO: ConValid = {} as any): string | void {
  const { errorMessage } = fxComplex(config, fieldNameConDTO);
  return errorMessage;
}

/**
 * 所有类似附件模板fx的场景都可以调用该api
 * @param config
 * @param fieldNameConDTO
 * @returns {string | void} name
 */
export function attachmentTplFx(config: CalculateConfig, fieldNameConDTO: ConValid = {} as any): string | void {
  const { value } = fxComplex(config, fieldNameConDTO);
  return value;
}

export function filterNull(obj, ignores?: string[]) {
  Object.keys(obj).forEach((k) => {
    if (ignores && ignores.includes(k)) return;
    if (obj[k] === undefined || obj[k] === null) {
      // eslint-disable-next-line no-param-reassign
      delete obj[k];
    }
  });
}

function roundDecimal(number, decimalPlaces) {  
  const str = number.toString();
  const parts = str.split('.');  
  if (parts.length === 1) return number; // 如果没有小数点，直接返回原数字
  const decimalPart = parts[1];  
  const roundedDecimalPart = Math.round(parseFloat('0.' + decimalPart) * Math.pow(10, decimalPlaces)) / Math.pow(10, decimalPlaces);  
  return Number((Number(parts[0]) + Number(roundedDecimalPart)).toFixed(decimalPlaces));  
}  

function checkNumberDecimal(number, decimalPlaces) {
  const str = number.toString();
  const parts = str.split('.');  
  if (parts.length === 1) return false;
  return parts[1].length > decimalPlaces;
}

export function renderTelFieldOutput({ name, record }) {
  const value: string = record && record.get(name);
  if (!isNil(value)) {
    const telCode: string =  (record && record.get(`${name}TelCode`)) || (!isNil(value) ? '+86' : undefined);
    return (
      <>
        {telCode} 
        <span style={{ margin: '0 2px' }}>|</span>
        {value} 
      </>
    );
  }
  return null;
}
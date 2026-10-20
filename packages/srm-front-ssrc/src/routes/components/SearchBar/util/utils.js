/* eslint-disable no-new-func */
/* eslint-disable eqeqeq */
import moment from 'moment';
import { isArray } from 'lodash';
import {
  getCurrentOrganizationId,
  getUserOrganizationId,
  getCurrentUser,
} from 'hzero-front/lib/utils/utils';
import { MergeFieldName } from './enum';

export function eatChar(str) {
  const dataArr = [];
  let currentLine = [];
  let currentShort = '';
  let lock;
  for (let i = 0; i < str.length; i++) {
    const cur = str[i];
    const preChar = str[i > 1 ? i : 0];
    switch (cur) {
      case "'":
      case '"':
      case '`':
        if (!lock && preChar !== '\\') {
          currentShort += cur;
          lock = cur;
        } else if (preChar === '\\' || cur !== lock) {
          currentShort += cur;
        } else {
          currentShort += cur;
          currentLine.push(currentShort);
          currentShort = '';
          lock = undefined;
        }
        break;
      case ';':
        if (!lock) {
          currentLine.push(currentShort);
          dataArr.push(currentLine);
          currentLine = [];
          currentShort = '';
        } else {
          currentShort += cur;
        }
        break;
      case ' ':
        if (!lock) {
          currentLine.push(currentShort);
          currentShort = '';
        } else {
          currentShort += cur;
        }
        break;
      default:
        currentShort += cur;
    }
  }
  return dataArr;
}
export function* eatShort(shorts) {
  for (let offset = 0; offset < shorts.length; offset++) {
    const current = shorts[offset];
    if (current) {
      yield current;
    }
  }
}
export function statementToJs(str) {
  if (!window.moment) {
    window.moment = moment;
  }
  const dataArr = [];
  Object.keys(innerFunctionMap).forEach((funName) => {
    dataArr.push(`var ${funName} = innerFunctionMap.${funName};`);
  });
  dataArr.push(
    'var getFieldValueFunc = getFieldValue || new Function();',
    'return function inner(){',
    'try {'
  );
  let finsh;
  let uniqueKey;
  let varType;
  let source;
  let sourceField;
  const statementArr = eatChar(str);
  for (let offset = 0; offset < statementArr.length; offset++) {
    let currentData = '';
    const shorts = eatShort(statementArr[offset]);
    let tmp2 = shorts.next();
    if (tmp2.value === 'THEN') {
      dataArr[dataArr.length - 1] += '{';
      // eslint-disable-next-line no-continue
      continue;
    }
    if (tmp2.value === 'DONE') {
      dataArr.push('}');
      // eslint-disable-next-line no-continue
      continue;
    }
    while (!tmp2.done) {
      finsh = false;
      uniqueKey = undefined;
      varType = undefined;
      source = undefined;
      sourceField = undefined;
      switch (tmp2.value) {
        case 'DEF':
          uniqueKey = shorts.next().value;
          varType = shorts.next().value;
          source = shorts.next().value;
          sourceField = shorts.next().value;
          if (varType === 'FUN') {
            currentData = `function ${uniqueKey}(${source})`;
            finsh = true;
          } else {
            currentData = `var ${uniqueKey} = ${getValue(varType, source, sourceField)};`;
          }
          tmp2 = shorts.next();
          break;
        case 'EXEC':
          do {
            tmp2 = shorts.next();
            currentData += `${tmp2.value || ''}`;
          } while (!tmp2.done);
          currentData = ';';
          break;
        case 'RES':
          currentData = `return `;
          do {
            tmp2 = shorts.next();
            currentData += `${tmp2.value || ''}`;
          } while (!tmp2.done);
          currentData += ';';
          break;
        default:
          tmp2 = shorts.next();
      }
      if (finsh) break;
    }
    dataArr.push(currentData);
  }
  dataArr.push('} catch(e) {console.error(e)}');
  dataArr.push('}');
  return dataArr;
}
function getValue(type, source, sourceField) {
  /**
   * source可对应valueType/source/unit
   * sourceField可对应sourceField/unitField
   */
  switch (type) {
    case 'CTX':
      return `ctx["${ctxMap[source]}"].${sourceField}`;
    case 'UNIT':
      return `getFieldValueFunc("${sourceField}")`;
    case 'VAR':
      return `${source === 'DEFAULT' ? 'undefined' : '{}'}`;
    case 'SPEC':
      return `${(specMap[source] || {})[sourceField]}`;
    default:
      return 'undefined';
  }
}

const ctxMap = {
  ACC: 'ctx',
  URL: 'url',
  CUS: 'self',
};
export const specMap = {
  DATE: {
    FIRST_MON_DAY_END:
      'moment(new Date(new Date().getFullYear(), new Date().getMonth(), 1)).format("YYYY-MM-DD 23:59:59")',
    FIRST_MON_DAY:
      'moment(new Date(new Date().getFullYear(), new Date().getMonth(), 1)).format("YYYY-MM-DD 00:00:00")',
    LAST_MON_DAY:
      'moment(new Date(new Date(new Date().getFullYear(), new Date().getMonth()+1, 1).getTime()-86400000)).format("YYYY-MM-DD 00:00:00")',
    LAST_MON_DAY_END:
      'moment(new Date(new Date(new Date().getFullYear(), new Date().getMonth()+1, 1).getTime()-86400000)).format("YYYY-MM-DD 23:59:59")',
    NOW: 'moment(new Date()).format("YYYY-MM-DD hh:mm:ss")',
    NOW_DAY: 'moment(new Date()).format("YYYY-MM-DD")',
  },
};
export const innerFunctionMap = {
  OFFSET_DATE(date) {
    const argsLength = arguments.length;
    if (argsLength < 2) throw new Error('this function of delay need two arguments at least!');
    // eslint-disable-next-line prefer-rest-params
    const args = Array.prototype.slice.call(arguments, 1);
    const reg = /(-?\d+)([s|m|h|D|W|M|Y])/;
    // eslint-disable-next-line one-var
    let s = 0,
      mon = 0,
      year = 0;
    args.forEach((offset) => {
      const [, value, unit] = offset.match(reg);
      switch (unit) {
        case 's':
          s += Number(value);
          break;
        case 'm':
          s += 60 * Number(value);
          break;
        case 'h':
          s += 3600 * Number(value);
          break;
        case 'D':
          s += Number(value) * 86400;
          break;
        case 'W':
          s += Number(value) * 604800;
          break;
        case 'M':
          mon += Number(value);
          break;
        case 'Y':
          year += Number(value);
          break;
        default:
      }
    });
    if (!date) return undefined;
    const originDate = new Date(date);
    const newYear = originDate.getFullYear() + year;
    const newMon = (12 + originDate.getMonth() + mon) % 12;
    originDate.setFullYear(newYear);
    originDate.setMonth(newMon);
    originDate.setTime(originDate.getTime() + s * 1000);
    return window.moment
      ? window.moment(originDate).format('YYYY-MM-DD hh:mm:ss')
      : originDate.toISOString();
  },
};

export function getContext() {
  return {
    ...getCurrentUser(),
    organizationId: getCurrentOrganizationId(),
    tenantId: getUserOrganizationId(),
  };
}

export function getFieldValueById({
  fieldId,
  queryDsRecord,
  searchInputDsRecord,
  queryDsFields = [],
  searchInputDsFields = [],
}) {
  const queryFieldTmp = queryDsFields.find((item) => item.fieldId === fieldId);
  if (queryFieldTmp) {
    return queryDsRecord.get(queryFieldTmp.name);
  } else {
    const searchInputFieldTmp = searchInputDsFields.find((item) => item.fieldId === fieldId);
    if (searchInputFieldTmp) {
      return searchInputDsRecord.get(MergeFieldName);
    } else {
      return undefined;
    }
  }
}

export function fxComplex(valueConDTO = {}, config) {
  let { lines: conLineList = [], valids: conValidList = [] } = valueConDTO;
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
      conExpression = conExpression.replace(/AND/g, '&&').replace(/OR/g, '||');
      // eslint-disable-next-line no-extra-boolean-cast
      const cmpValue = new Function(`return ${conExpression};`)();
      if (cmpValue) {
        return condition;
      }
    }
  }
  return {};
}

function calculateExpression(conditionList, config) {
  const result = {};
  conditionList.forEach((i) => {
    const {
      sourceType: _sourceType = '',
      conCode,
      sourceFieldId = '',
      sourceUnitCode,
      conExpression,
      targetType,
      targetFieldId = '',
      targetValue,
    } = i;
    let left;
    let right = targetValue;
    const splitData = _sourceType.split('-');
    const [sourceType, ctxValue] = splitData;
    // 兼容历史数据处理，sourceType不存在则等价于单元字段
    if (sourceType === 'CUZ_UNIT' || !sourceType) {
      if (!sourceUnitCode) return;
      left = getFieldValueById({ ...config, fieldId: sourceFieldId });
    }
    if (sourceType === 'CTX') {
      if (!ctxValue) return result;
      const { ctxParams } = config;
      switch (ctxValue) {
        case 'defaultCompany':
          left = ctxParams.ctx.additionInfo.defaultCompanyId;
          break;
        default:
          left = ctxParams.ctx[ctxValue];
      }
    }

    if (targetType === 'formNow') {
      right = getFieldValueById({ ...config, fieldId: targetFieldId });
    } else if (targetType === 'time') {
      if (['NOW_DAY', 'FIRST_MON_DAY', 'LAST_MON_DAY'].includes(targetValue)) {
        left = moment(left).format('YYYY-MM-DD');
      }
      right = new Function(`try{return ${specMap.DATE[targetValue]};}catch(e){console.log(e);}`)();
    }
    result[conCode] = logicCompute(conExpression, left, right);
  });
  return result;
}

function isErrConExpression(exp) {
  const leftBracketNum = (exp.match(/\(/g) || []).length;
  const rightBracketNum = (exp.match(/\)/g) || []).length;
  const ruleConNo = /\s*\d+\s+\d+\s*/g.test(exp);
  const ruleConLogic =
    /\s*(AND|OR)\s*(AND|OR)\s*/g.test(exp) || /(^(AND|OR))|((AND|OR)$)/g.test(exp);
  const illegalChar = /^(?!AND|OR|\(|\)|\d)/g.test(exp);
  if (leftBracketNum !== rightBracketNum || ruleConNo || ruleConLogic || illegalChar) return true;
  return false;
}

function logicCompute(type, left, right) {
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
    case 'ISNULL':
      return left === undefined || left === null;
    case 'NOTNULL':
      return left !== undefined && left !== null;
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
    default:
      return false;
  }
}

export function defaultValueFx(config, defaultValueConDTO = {}, proDefaultFlag) {
  let { value: defaultValue, valueMeaning: defaultValueMeaning } = fxComplex(
    defaultValueConDTO,
    config
  );
  if (proDefaultFlag && defaultValue) {
    const str = defaultValue;
    const { ctxParams, getFieldValue } = config;
    try {
      defaultValue = new Function(
        'ctx,innerFunctionMap,getFieldValue',
        statementToJs(str).join('\r\n')
      )(ctxParams, innerFunctionMap, getFieldValue);
      defaultValueMeaning = undefined;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);
    }
  }
  return { defaultValue, defaultValueMeaning };
}

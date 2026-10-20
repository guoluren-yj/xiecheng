import React from 'react';
import { math } from 'choerodon-ui/dataset';
import moment from "moment";
import Big from "big.js";

// 此文件内需要用到全局moment，做一次兼容处理
if(!window.moment){
  window.moment = moment;
}

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

export function statementToJs(str, options) {
  const { getPristineValue } = options || {};
  const dataArr = [];
  Object.keys(innerFunctionMap).forEach((funName) => {
    dataArr.push(`var ${funName} = innerFunctionMap.${funName};`);
  });
  dataArr.push(
    'var innerCache = cache || {};',
    'return function inner(rowKey, namespace){',
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
            currentData = `var ${uniqueKey} = ${getValue(varType, source, sourceField, { getPristineValue })};`;
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

function getValue(type, source, sourceField, options) {
  /**
   * source可对应valueType/source/unit
   * sourceField可对应sourceField/unitField
   */
  const { getPristineValue } = options || {};
  switch (type) {
    case 'CTX':
      return `ctx["${ctxMap[source]}"].${sourceField}`;
    case 'UNIT':
      return `(innerCache["${source}"]||{getValue(){}}).getValue("${sourceField}", rowKey, namespace, { getPristineValue: ${getPristineValue} })`;
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
      'moment(moment([moment().year(), moment().month(), 1])).format("YYYY-MM-DD 23:59:59")',
    FIRST_MON_DAY:
      'moment(moment([moment().year(), moment().month(), 1])).format("YYYY-MM-DD 00:00:00")',
    LAST_MON_DAY: `moment().endOf('month').format("YYYY-MM-DD 00:00:00")`,
    LAST_MON_DAY_END: `moment().endOf('month').format("YYYY-MM-DD 23:59:59")`,
    NOW: 'moment().format("YYYY-MM-DD HH:mm:ss")',
    NOW_DAY: 'moment().format("YYYY-MM-DD")',
    LAST_YEAR_DAY: 'moment().endOf("year").format("YYYY-MM-DD 00:00:00")',
    LAST_YEAR_DAY_END: 'moment().endOf("year").format("YYYY-MM-DD 23:59:59")',
  },
};

export const innerFunctionMap = {
  OFFSET_DATE(date) {
    const argsLength = arguments.length;
    if (argsLength < 2) throw new Error('this function need two arguments at least!');
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
    const hourOffset = originDate.getTimezoneOffset() - moment().zone();
    originDate.setHours(originDate.getHours() - hourOffset / 60);
    originDate.setTime(originDate.getTime() + s * 1000);
    const relativeMonth = originDate.getMonth() + mon;
    originDate.setMonth(relativeMonth);
    const newYear = originDate.getFullYear() + year;
    originDate.setFullYear(newYear);
    return window.moment
      ? window.moment(originDate).format('YYYY-MM-DD HH:mm:ss')
      : originDate.toISOString();
  },
  TIME_DIFF(date1, date2, timeUnit){
    if (!date1 || !date2) return NaN;
    let d1 = moment(date1);
    let d2 = moment(date2);
    if ([d1.toString(), d2.toString()].includes(moment.invalid().toString()) || !timeUnit) return NaN;
    switch (timeUnit) {
      case 'm':
        d1 = moment(d1.format("YYYY-MM-DD HH:mm:00"));
        d2 = moment(d2.format("YYYY-MM-DD HH:mm:00"));
        return (d1.valueOf() - d2.valueOf())/60000;
      case 'h':
        d1 = moment(d1.format("YYYY-MM-DD HH:00:00"));
        d2 = moment(d2.format("YYYY-MM-DD HH:00:00"));
        return (d1.valueOf() - d2.valueOf())/3600000;
      case 'D':
        d1 = moment(d1.format("YYYY-MM-DD 00:00:00"));
        d2 = moment(d2.format("YYYY-MM-DD 00:00:00"));
        return (d1.valueOf() - d2.valueOf())/86400000;
      case 'W':
        d1 = moment(d1.format("YYYY-MM-DD 00:00:00"));
        d2 = moment(d2.format("YYYY-MM-DD 00:00:00"));
        return Math.round((d1.valueOf() - d2.valueOf())/604800000);
      case 'M':
        return (Number(d1.format("YYYY")) - Number(d2.format("YYYY"))) * 12 + d1.month() - d2.month();
      case 'Y':
        return Number(d1.format("YYYY")) - Number(d2.format("YYYY"));
      default:
        return (d1.valueOf() - d2.valueOf())/1000;
    }
  },
  MATH_SUM: math.sum,
  MATH_ABS: math.abs,
  MATH_FIX: math.fix,
  MATH_PLUS: math.plus,
  MATH_MINUS: math.minus,
  MATH_TIMES: math.multipliedBy,
  MATH_DIV: math.div,
  MATH_MOD: math.mod,
  MATH_POW: math.pow,
  MATH_SQRT: math.sqrt,
  MATH_TOFIXED: math.toFixed,
  MATH_LT: math.lt,
  MATH_LTE: math.lte,
  MATH_GT: math.gt,
  MATH_GTE: math.gte,
  MATH_EQ: math.eq,
  MATH_ROUND: math.round,
  MATH_FLOOR: math.floor,
  MATH_CEIL: math.ceil,
  MATH_DP: math.dp,
  MATH_MAX: math.max,
  MATH_MIN: math.min,
  MATH_NEGATED: math.negated,
  MATH_ISFINITE: math.isFinite,
  MATH_ISNAN: math.isNaN,
  MATH_ISNEGATIVE: math.isNegative,
  MATH_ISZERO: math.isZero,
  // MATH_ISNEGATIVEZERO: math.isNegativeZero,
  MATH_ISBIGNUMBER: math.isBigNumber,
  // MATH_ISVALIDBIGNUMBER: math.isValidBigNumber,
};

export function registerEvent(eventConfig) {
  if (!window.CUSTEVENTCOLLECTION) {
    window.CUSTEVENTCOLLECTION = { __lazy_init__: [] };
  }
  const unitCodes = Object.keys(eventConfig);
  unitCodes.forEach((unitCode) => {
    window.CUSTEVENTCOLLECTION[unitCode] = eventConfig[unitCode];
  });
  const lazyInit = window.CUSTEVENTCOLLECTION.__lazy_init__;
  if (lazyInit && lazyInit.length > 0) {
    // 两个模块先后注册时，必须保证事件的单元编码只出现一次
    window.CUSTEVENTCOLLECTION.__lazy_init__ = lazyInit.filter((eventCenter) => {
      if (unitCodes.includes(eventCenter.unitCode)) {
        eventCenter.lazyInitEvents();
        return false;
      }
      return true;
    });
  }
}
export const ExternalCustomizeContext = React.createContext({});


/**
 * 格式化数值
 * 当 value 为 undefined,null,'',NaN,Infinity,-Infinity时 返回 ''
 * @param {string|number} value 需要格式化的数
 * @param {?number} [precision] 数值精度
 * @param {boolean} [allowThousandth=true] 是否加上千分位
 * @param {boolean} [allowEndZero=true] 是否补全末尾0
 * @return {string}
 */
 export function numberRender(value, precision, allowThousandth = true, allowEndZero = true) {
  if (
    // 空检查
    value === null ||
    value === undefined ||
    value === '' ||
    // 非法数值的检查
    +value === Infinity ||
    +value === -Infinity ||
    isNaN(+value)
  ) {
    return '';
  }

  // 将 value 转为字符串并移除千分位
  const valueObject = new Big(String(value).replace(/,/g, ''));
  let ret;
  if (precision === undefined || precision === null) {
    ret = valueObject.toString();
  } else {
    ret = valueObject.toFixed(precision);
  }

  if (allowThousandth) {
    const retList = ret.split('.');
    const commaValue = retList[0].replace(/\B(?=(\d{3})+(?!\d))/g, ','); // 整数部分千分位替换

    if (retList.length > 1) {
      ret = [commaValue, retList[1]].join('.');
    } else {
      ret = commaValue;
    }
  }
  if (!allowEndZero && ret.indexOf('.')) {
    return ret.replace(/(0|\.0)*$/, '');
  }
  return ret;
}

export function parseUrlParams(url) {
  const urlParams = {};
  if (url) {
    url
      .substr(1)
      .split('&')
      .forEach((item) => {
        if (item) {
          const [key, value] = item.split('=');
          urlParams[key] = value;
        }
      });
  }
  return urlParams;
}
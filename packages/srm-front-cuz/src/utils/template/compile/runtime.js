import { math } from 'choerodon-ui/dataset';
import { capitalAmount, capitalAmountByVIE } from "srm-front-boot/lib/utils/utils";
/*! art-template@runtime | https://github.com/aui/art-template */

const globalThis =
  // eslint-disable-next-line no-nested-ternary
  typeof self !== 'undefined'
    ? self
    : // eslint-disable-next-line no-nested-ternary
    typeof window !== 'undefined'
    ? window
    : typeof global !== 'undefined'
    ? global
    : {};

const runtime = Object.create(globalThis);
const ESCAPE_REG = /["&'<>]/;

/**
 * 编码模板输出的内容
 * @param  {any}        content
 * @return {string}
 */
runtime.$escape = (content) => xmlEscape(toString(content));

/**
 * 迭代器，支持数组与对象
 * @param {array|Object} data
 * @param {function}     callback
 */
runtime.$each = (data, callback) => {
  if (Array.isArray(data)) {
    for (let i = 0, len = data.length; i < len; i++) {
      callback(data[i], i);
    }
  } else {
    // eslint-disable-next-line guard-for-in
    for (const i in data) {
      callback(data[i], i);
    }
  }
};

// 将目标转成字符
function toString(value) {
  if (typeof value !== 'string') {
    if (value === undefined || value === null) {
      return '';
    } else if (typeof value === 'function') {
      return toString(value.call(value));
    } else {
      return JSON.stringify(value);
    }
  }

  return value;
}

// 编码 HTML 内容
function xmlEscape(content) {
  const html = `${content}`;
  const regexResult = ESCAPE_REG.exec(html);
  if (!regexResult) {
    return content;
  }

  let result = '';
  let i;
  let lastIndex;
  let char;
  for (i = regexResult.index, lastIndex = 0; i < html.length; i++) {
    switch (html.charCodeAt(i)) {
      case 34:
        char = '&#34;';
        break;
      case 38:
        char = '&#38;';
        break;
      case 39:
        char = '&#39;';
        break;
      case 60:
        char = '&#60;';
        break;
      case 62:
        char = '&#62;';
        break;
      // eslint-disable-next-line no-continue
      default:
        // eslint-disable-next-line no-continue
        continue;
    }

    if (lastIndex !== i) {
      result += html.substring(lastIndex, i);
    }

    lastIndex = i + 1;
    result += char;
  }

  if (lastIndex !== i) {
    return result + html.substring(lastIndex, i);
  } else {
    return result;
  }
}

runtime.$MATH = {
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

runtime.$sboot = {
  capitalAmount,
  capitalAmountByVIE,
};
export default runtime;

// import { numberRender } from 'utils/renderer'; // yesOrNoRender
import { getCurrentLanguage } from 'utils/utils/user';
import { isNil, isNumber } from 'lodash';
import BigNumber from 'bignumber.js';
import { math } from 'choerodon-ui/dataset';
import { NumberField } from 'choerodon-ui/pro';

const lang = getCurrentLanguage();
const language = getCurrentLanguage().split('_').join('-');
const THROTTLE_TIME = 500;

export function thousandBitSeparator(num, precision, flag) {
  // if (precision) {
  //   return numberRender(num, precision);
  // } else {
  //   return num && num.toString().replace(/(\d)(?=(\d{3})+\.)/g, ($0, $1) => `${$1},`);
  // }
  if (flag) {
    if (isNumber(num)) {
      const strArr = BigNumber(num)
        ?.toFormat(precision > 10 || !precision ? 10 : precision)
        .split('.');
      if (strArr.length === 1) {
        return strArr[0];
      } else {
        return strArr[1].replace(/[0]*$/g, '')
          ? `${strArr[0]}.${strArr[1].replace(/[0]*$/g, '')}`
          : strArr[0];
      }
    }

    if (BigNumber.isBigNumber(num)) {
      const strArr = num.toFormat(precision > 10 || !precision ? 10 : precision).split('.');
      if (strArr.length === 1) {
        return strArr[0];
      } else {
        return strArr[1].replace(/[0]*$/g, '')
          ? `${strArr[0]}.${strArr[1].replace(/[0]*$/g, '')}`
          : strArr[0];
      }
    }

    return num;
  }

  if (typeof num !== 'number' && !BigNumber.isBigNumber(num)) {
    return num;
  } else {
    return num || num === 0
      ? num.toLocaleString(language, {
          maximumFractionDigits: precision > 10 || !precision ? 10 : precision,
          minimumFractionDigits: precision > 10 || !precision ? 0 : precision,
        })
      : '';
  }
}

/**
 * InputNumber精度控制
 * @param {String} aumontStr 金额字符串
 * @param {*} precision 精度
 * @returns
 */
export function parseAumont(aumontStr, precision) {
  const arr = aumontStr.split('.');
  if (
    arr.length === 2 &&
    !isNaN(precision) &&
    precision !== null &&
    arr[1].length > Number(precision)
  ) {
    return `${arr[0]}.${arr[1].substr(0, Number(precision))}`;
  }
  return aumontStr;
}

/**
 * 字段金额格式化配置, 用于 dynamicProps.formatterOptions
 * 无需isSupplement: type: currency -> 自动补0， type: number -> 不补0
 * @param {Function} getPrecision 获取精度， props参考 dynamicProps
 * @returns
 */
export function c7nAmountFormatterOptions(getPrecision) {
  return (props) => {
    const precision = getPrecision(props);
    const options = {
      maximumFractionDigits: precision || 20,
    };
    if (precision || precision === 0) {
      options.minimumFractionDigits = precision;
    }
    return { options };
  };
}

// 对于数字进行精度截取
export function numberPrecision(num, precision) {
  if (isNumber(num)) {
    const strArr = num?.toFixed(precision ?? 10).split('.');
    if (strArr && strArr.length === 1) {
      return strArr[0];
    } else {
      return strArr[1].replace(/[0]*$/g, '')
        ? `${strArr[0]}.${strArr[1].replace(/[0]*$/g, '')}`
        : strArr[0];
    }
  }

  if (BigNumber.isBigNumber(num)) {
    const strArr = num?.toFixed(precision ?? 10).split('.');
    if (strArr && strArr.length === 1) {
      return strArr[0];
    } else {
      return strArr[1].replace(/[0]*$/g, '')
        ? `${strArr[0]}.${strArr[1].replace(/[0]*$/g, '')}`
        : strArr[0];
    }
  }

  return num;
}

export function formatNumber(value, precision) {
  if (math.isNaN(value) || math.isZero(value) || !math.isValidNumber(value)) return value;
  const options = { maximumFractionDigits: 20 };
  if (!isNil(precision)) Object.assign(options, { minimumFractionDigits: precision });
  return NumberField.format(value, lang, options);
}

export { THROTTLE_TIME };

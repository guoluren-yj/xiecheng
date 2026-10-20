import { isNil } from 'lodash';
// import { expression } from 'mathjs';
import { NumberField } from 'choerodon-ui/pro';
import { math } from 'choerodon-ui/dataset';
import { getCurrentLanguage } from 'utils/utils/user';
import { getResponse } from 'utils/utils';

import notification from 'utils/notification';

import { formatNumber } from '../../utils/utils';

const language = getCurrentLanguage().split('_').join('-');

export function decimalPointAccuracy(value, precision, bools) {
  if (
    isNil(value) ||
    math.isNaN(value) ||
    math.isZero(value) ||
    (typeof value === 'number' && typeof precision === 'undefined') ||
    typeof precision === 'object'
  ) {
    if (
      typeof value === 'number' &&
      (typeof precision === 'undefined' || typeof precision === 'object')
    ) {
      return formatNumber(value);
    }
    return value;
  }
  const oldLength = math.dp(value);
  const arr = math.toFixed(value, oldLength).split('.');
  if (oldLength >= precision) {
    // 四舍五入
    if (bools && bools.rounding) {
      return NumberField.format(value, language, {
        maximumFractionDigits: precision,
      });
    }
    if (bools && bools.check) {
      // 浮点数大于精准的不截取
      return NumberField.format(value, language, {
        maximumFractionDigits: 20,
      });
    } else {
      {
        const value = precision !== 0 ? `${arr[0]}.${arr[1].slice(0, precision)}` : arr[0];
        return formatNumber(value);
      }
    }
  }
  // 补零
  if (bools && bools.repair) {
    // js中小数值，不能大于20为
    const precisionRelut = precision > 20 ? 20 : precision;
    const num = NumberField.format(value, language, {
      maximumFractionDigits: precisionRelut || 20,
      minimumFractionDigits: precisionRelut || 0,
    });
    return num;
  } else {
    return formatNumber(math.toFixed(value, oldLength));
  }
}

export function getUrlVars(url) {
  let hash;
  const myJson = {};
  const hashes = url.slice(url.indexOf('?') + 1).split('&');
  for (let i = 0; i < hashes.length; i++) {
    hash = hashes[i].split('=');
    // eslint-disable-next-line
    myJson[hash[0]] = hash[1];
  }
  return myJson;
}

// 费用单对账单详情增加了折叠面板个性化，根据个性化更新fieldName
export function getAnchorName(list = [], fields = []) {
  list.map((item) => {
    const obj = fields.find((v) => {
      return v.fieldName && v.fieldCode === item.code;
    });
    if (obj) {
      // eslint-disable-next-line
      item.title = obj.fieldName;
    }
    return item;
  });
  return list;
}

// 获取title
export function getName(list = [], code = '') {
  const obj = list.find((v) => v.code === code);
  return obj?.title;
}

export function formatBigNumber(value, precision, bools) {
  if (
    isNil(value) ||
    math.isNaN(value) ||
    math.isZero(value) ||
    (typeof value === 'number' && typeof precision === 'undefined') ||
    typeof precision === 'object'
  ) {
    return value;
  }
  const oldLength = math.dp(value);
  const arr = math.toFixed(value, oldLength).split('.');
  if (oldLength >= precision) {
    // 四舍五入
    if (bools && bools.rounding) {
      return NumberField.format(value, language, {
        maximumFractionDigits: precision,
      });
    }
    if (bools && bools.check) {
      // 浮点数大于精准的不截取
      return NumberField.format(value, language, {
        maximumFractionDigits: 20,
      });
    } else {
      return precision !== 0 ? `${arr[0]}.${arr[1].slice(0, precision)}` : arr[0];
    }
  }
  // 补零
  if (bools && bools.repair) {
    // js中小数值，不能大于20为
    const precisionRelut = precision > 20 ? 20 : precision;
    const num = NumberField.format(value, language, {
      maximumFractionDigits: precisionRelut || 20,
      minimumFractionDigits: precisionRelut || 0,
    });
    return num;
  } else {
    return math.toFixed(value, oldLength);
  }
}

// 拦截text报错
export function getTextResponseApi(str) {
  if (!str) return false;
  try {
    getResponse(JSON.parse(str));
    return false;
  } catch (e) {
    notification.success();
    return str;
  }
}

/* eslint-disable */
import { math } from 'choerodon-ui/dataset';
import { NumberField, Modal as C7NModal } from 'choerodon-ui/pro';
import { getCurrentLanguage } from 'utils/utils/user';
import CF from './cf';
import commonStyles from './common.less';
import InvoiceDetail from './components/InvoiceDetail';

const language = getCurrentLanguage().split('_').join('-');
const cf = new CF({
  locales: language,
});

export function thousandBitSeparator(num, precision) {
  if (math.isNaN(num)) return num;
  const oldLength = math.dp(num);
  if (oldLength >= precision) {
    return NumberField.format(num, language, {
      maximumFractionDigits: precision || 20,
    });
  }
  if (typeof num !== 'number' && !math.isBigNumber(num)) {
    return num;
  }
  return num
    ? NumberField.format(num, language, {
        maximumFractionDigits: precision || 20,
        minimumFractionDigits: precision || 0,
      })
    : num;
}

export function thousandBitSeparatorCut(num, precision) {
  if (math.isNaN(num)) return num;
  const oldLength = math.dp(num);
  if (precision >= oldLength) {
    return cutZero(
      NumberField.format(num, language, {
        maximumFractionDigits: oldLength,
      })
    );
  }

  if (typeof num !== 'number' && !math.isBigNumber(num)) {
    return cutZero(num);
  }
  return cutZero(
    num
      ? NumberField.format(num, language, {
          maximumFractionDigits: precision || 20,
          minimumFractionDigits: precision || 0,
        })
      : num
  );
}

// inputNumber的调整
export const precisionParams = (precision = 2, bool) => {
  return bool
    ? {
        allowThousandth: true,
        formatter: (value) => {
          return cf.format(value);
        },
        parser: (value) => {
          return cf.unformat(value);
        },
      }
    : {
        precision,
        formatter: (value) => {
          // console.log('formatter', value, cf.format(value));
          return cf.format(value);
        },
        parser: (value) => {
          // console.log('parser', value, cf.unformat(value));
          return cf.unformat(value);
        },
      };
};

// // inputNumber的调整
export const precisionNum = (val, record, meaning) => {
  if (math.isNaN(val)) return val;
  const oldLength = math.dp(val);
  return record.$form.isFieldTouched(meaning) || oldLength < record.amountPrecision
    ? record.amountPrecision
    : oldLength;
};
export const precisionNums = (val, record, meaning) => {
  if (math.isNaN(val)) return val;
  const oldLength = math.dp(val);
  return record.$form.isFieldTouched(meaning) || oldLength < record.pricePrecision
    ? record.pricePrecision
    : oldLength;
};

export function thousandBitSeparatorIsNew(num, precision) {
  if (math.isNaN(num)) return num;
  if (typeof num !== 'number' && !math.isBigNumber(num)) {
    return num;
  }
  return num
    ? NumberField.format(num, language, {
        maximumFractionDigits: precision || 20,
        minimumFractionDigits: precision || 0,
      })
    : 0;
}
export function thousandBitSeparatorDJ(num, precision) {
  if (math.isNaN(num)) return num;
  const oldLength = math.dp(num);
  if (precision >= oldLength) {
    return NumberField.format(num, language, {
      maximumFractionDigits: oldLength,
    });
  }

  if (typeof num !== 'number' && !math.isBigNumber(num)) {
    return num;
  }
  return num
    ? NumberField.format(num, language, {
        maximumFractionDigits: precision || 20,
        minimumFractionDigits: precision || 0,
      })
    : '';
}

export function thousandBitSeparatorDJCutZore(num, precision) {
  if (math.isNaN(num)) return num;
  const oldLength = math.dp(num);
  if (precision >= oldLength) {
    return cutZero(
      NumberField.format(num, language, {
        maximumFractionDigits: oldLength,
      })
    );
  }

  if (typeof num !== 'number' && !math.isBigNumber(num)) {
    return num;
  }
  return cutZero(
    num
      ? NumberField.format(num, language, {
          maximumFractionDigits: precision || 20,
          minimumFractionDigits: precision || 0,
        })
      : ''
  );
}

export function cutZero(num) {
  if (math.isNaN(num)) return num;
  const len = math.dp(num);
  const old = math.toFixed(num, len);
  let newstr = old;
  const leng = old.length - old.indexOf('.') - 1;
  if (old.indexOf('.') > -1) {
    for (var i = leng; i > 0; i--) {
      if (newstr.lastIndexOf('0') > -1 && newstr.substr(newstr.length - 1, 1) === 0) {
        var k = newstr.lastIndexOf('0');
        if (newstr.charAt(k - 1) === '.') {
          return newstr.substring(0, k - 1);
        } else {
          newstr = newstr.substring(0, k);
        }
      } else {
        return newstr;
      }
    }
  }
  return old;
}

export function decimalPointAccuracy(num, precision) {
  if (math.isNaN(num)) return num;
  if (
    (typeof num === 'number' && typeof precision === 'undefined') ||
    typeof precision === 'object'
  ) {
    return num;
  }
  const oldLength = math.dp(num);
  const arr = math.toFixed(num, oldLength).split('.');

  if (oldLength >= precision) {
    // 四舍五入
    return precision !== 0 ? `${arr[0]}.${arr[1].slice(0, precision)}` : arr[0];
  }

  return num;
}
export function delcommafy(num) {
  if (!math.isNaN(num)) {
    const len = math.dp(num);
    num = math.toFixed(num, len);
    num = num.replace(/[ ]/g, ''); // 去除空格
    num = num.replace(/,/gi, '');
    return num;
  }
}

export function viewInvoiceDetail(invoiceDetailProps) {
  C7NModal.open({
    drawer: true,
    closable: false,
    className: commonStyles['sfin-large-modal'],
    bodyStyle: { padding: 0, backgroundColor: '#f4f4f4' },
    title: intl.get('sfin.common.view.title.invoiceDetail').d('发票明细'),
    children: <InvoiceDetail {...invoiceDetailProps} />,
    okCancel: false,
    okText: intl.get('hzero.common.button.close').d('关闭'),
  });
}

// 根据不含税单价，计算出含税单价
export function getIncTaxAmountByNetPrice(
  netPrice,
  quantity,
  taxRate,
  price,
  unitPriceBatch,
  taxAmountUpdFlag,
  amountPrecision
) {
  // 如果税额可编辑，使用币种精度
  const num = taxAmountUpdFlag ? amountPrecision : 10;
  const rate = math.div(taxRate, 100);
  const newNetAmount = math.toFixed(
    math.div(math.multipliedBy(netPrice, quantity), unitPriceBatch),
    10
  );
  const newTaxAmount = math.toFixed(math.multipliedBy(newNetAmount, rate), num);
  const taxIncludedAmount = math.plus(newNetAmount, newTaxAmount);
  const taxIncludedPrice = math.toFixed(
    math.multipliedBy(math.div(taxIncludedAmount, quantity), unitPriceBatch),
    price
  );
  return taxIncludedPrice;
}
// 根据含税单价，计算出不含税单价
export function getNetPriceByTaxIncPrice(
  taxIncludedPrice,
  quantity,
  taxRate,
  price,
  unitPriceBatch,
  taxAmountUpdFlag,
  amountPrecision
) {
  const num = taxAmountUpdFlag ? amountPrecision : 10;
  const rate = math.div(taxRate, 100);
  const newTaxIncludedAmount = math.toFixed(
    math.div(math.multipliedBy(taxIncludedPrice, quantity), unitPriceBatch),
    10
  );
  const newTaxAmount = math.toFixed(
    math.multipliedBy(math.div(newTaxIncludedAmount, math.plus(1, rate)), rate),
    num
  );
  const newNetAmount = math.minus(newTaxIncludedAmount, newTaxAmount);
  return math.toFixed(math.multipliedBy(math.div(newNetAmount, quantity), unitPriceBatch), price);
}

import intl from 'utils/intl';
import { isCustomNumber } from '@/utils/precision';
import { math } from 'choerodon-ui/dataset';

export function tempererNumberValidator(value, record, precision = 6) {
  if (value) {
    const isFixedField = record.get('pricingType')?.includes('FIXED');
    // const valueStr = String(value);
    const prevLength = math.floor(value).toLocaleString().replace(/,/g, '').length;
    const nextLength = math.dp(value) || 0;
    // const [prev, next] = valueStr.split('.');
    if (!nextLength) {
      return null;
    }
    if (isFixedField && prevLength > 10) {
      return intl.get('sagm.common.view.price.integarOverLength').d('价格整数位不能超过二十位');
    } else if (isFixedField && nextLength > 10) {
      return intl.get('sagm.common.view.price.decimalOverLength').d('价格小数位不能超过十位');
    } else if (!isFixedField && nextLength > precision) {
      return intl
        .get('sagm.common.model.numberPointLimit', { value: precision })
        .d(`小数位限制${precision}位`);
    }
  }
}

// 小数精确度校验
export function numberValidator(value, precision = 6) {
  if (value) {
    // const valueStr = String(value);
    // const point = valueStr.split('.')[1];
    const nextLength = math.dp(value) || 0;
    if (nextLength > precision) {
      return intl
        .get('sagm.common.model.numberPointLimit', { value: precision })
        .d(`小数位限制${precision}位`);
    }
  }
}

export function priceValidator(price) {
  if (isCustomNumber(price)) {
    // const priceStr = String(price);
    // const [prev, next] = priceStr.split('.');
    const prevLength = math.floor(price)?.toLocaleString().replace(/,/g, '').length;
    const nextLength = math.dp(price) || 0;
    if (prevLength > 20) {
      return intl.get('sagm.common.view.price.integarOverLength').d('价格整数位不能超过二十位');
    }
    if (nextLength > 10) {
      return intl.get('sagm.common.view.price.decimalOverLength').d('价格小数位不能超过十位');
    }
  }
}

export function weightValidator(price) {
  if (isCustomNumber(price)) {
    const priceStr = String(price);
    const [, next] = priceStr.split('.');
    // if (prev && prev.length > 10) {
    //   return intl.get('sagm.common.view.price.integarOverLength').d('价格整数位不能超过十位');
    // }
    if (next && next.length > 10) {
      return intl.get('sagm.common.view.price.decimalOverLength').d('价格小数位不能超过十位');
    }
  }
}

export function boundValidator(rule, value = '', callback) {
  const prevLength = math.floor(value).toLocaleString().replace(/,/g, '').length;
  const nextLength = math.dp(value) || 0;
  if (prevLength > 20) {
    callback(
      new Error(intl.get(`small.common.model.pointIntLengthTen`).d('整数位最多不超过二十位'))
    );
  } else if (nextLength > 10) {
    callback(
      new Error(intl.get(`small.common.model.pointDecimalLengthTen`).d('小数位最多不超过十位'))
    );
  } else {
    callback();
  }
}

export function maxSMALLMessageValidator(val) {
  if (math.gte(val, '100000000000000000000')) {
    return intl.get('small.common.view.maxMessage').d('值必须小于100000000000000000000');
  }
}

export function maxSAGMMessageValidator(val) {
  if (math.gte(val, '100000000000000000000')) {
    return intl.get('sagm.common.view.maxMessage').d('值必须小于100000000000000000000');
  }
}

export function c7nBoundValidator(val = '') {
  const prevLength = math.floor(val).toLocaleString().replace(/,/g, '').length;
  const nextLength = math.dp(val) || 0;
  if (prevLength > 20) {
    return intl.get(`sagm.common.model.pointIntLengthTen`).d('整数位最多不超过二十位');
  }
  if (nextLength > 10) {
    return intl.get(`sagm.common.model.pointDecimalLengthTen`).d('小数位最多不超过十位');
  }
}

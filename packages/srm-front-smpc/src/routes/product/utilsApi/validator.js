import intl from 'utils/intl';
import { isCustomNumber } from '@/utils/precision';
import { math } from 'choerodon-ui/dataset';

// 小数精确度校验
export function numberValidator(value, precision = 10) {
  if (value) {
    const valueStr = String(value);
    const point = valueStr.split('.')[1];
    if (point && point.length > precision) {
      return intl
        .get('smpc.product.model.numberPointLimit', { value: precision })
        .d(`小数位限制${precision}位`);
    }
  }
}

export function priceValidator(price) {
  if (isCustomNumber(price)) {
    const prevLength = math.floor(price).toLocaleString().replace(/,/g, '').length;
    const nextLength = math.dp(price) || 0;
    if (prevLength > 20) {
      return intl.get('smpc.product.view.price.integarOverLength').d('价格整数位不能超过二十位');
    }
    if (nextLength > 10) {
      return intl.get('smpc.product.view.price.decimalOverLength').d('价格小数位不能超过十位');
    }
  }
}

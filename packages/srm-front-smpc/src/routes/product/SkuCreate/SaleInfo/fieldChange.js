import { math } from 'choerodon-ui/dataset';
import BigNumber from 'bignumber.js';

// 税率规则 批量维护框 || 协议行 || 0
// 精度规则 数量精度 || 6 / 金额精度 || 10 / 财务精度 || 10
// 价格计算
// 1、未税单价存在，根据税率规则计算出含税单价再根据精度规则获取最终含税单价
// 2、未税单价不存在，含税单价存在，根据税率规则计算出未税单价再根据精度规则获取最终未税单价
// 变更联动 单位、税率、币种变更都要相应联动阶梯价格内值。

function isCustomNumber(val) {
  return typeof val === 'number' || math.isBigNumber(val);
}

// 精度控制方法
export function getPrecisionVal(val, precision) {
  return math.toFixed(val, precision >= 0 ? precision : 10);
}

// 未税单价可修改获得含税
export function getTaxPrice({ tax, unitPrice, precision }) {
  const _tax = math.plus(math.multipliedBy(tax || 0, 0.01), 1);
  const taxPrice = math.multipliedBy(unitPrice || 0, _tax);
  return getPrecisionVal(taxPrice, precision);
}

// 含税单价可修改获得未税
export function getUnitPrice({ tax, taxPrice, precision }) {
  const _tax = math.plus(math.multipliedBy(tax || 0, 0.01), 1);
  const unitPrice = math.div(taxPrice || 0, _tax);
  return getPrecisionVal(unitPrice, precision);
}

// 未税单价变更
export function unitPriceChange(unitPrice, record, precision, tax) {
  const _tax = new BigNumber(tax || record.get('tax')) || 0;
  const _unitPrice = new BigNumber(unitPrice) || 0;
  const taxPrice = getTaxPrice({ tax: _tax, unitPrice: _unitPrice, precision });
  record.set('agreementTaxedPrice', taxPrice);
}

// 含税单价变更
export function taxPriceChange(taxPrice, record, precision, tax) {
  const _tax = new BigNumber(tax || record.get('tax')) || 0;
  const _taxPrice = new BigNumber(taxPrice) || 0;
  // 未税单价*(1+税率) = 含税单价
  const unitPrice = getUnitPrice({ tax: _tax, taxPrice: _taxPrice, precision });
  record.set('agreementPrice', unitPrice);
}

// 阶梯价格变更
export function ladderChange(record, ladders) {
  const firstLadder = (ladders || [])[0];
  if (record.get('priceType') === 'LADDER_PRICE' && firstLadder) {
    record.set('agreementPrice', firstLadder.unitPrice);
    record.set('agreementTaxedPrice', firstLadder.taxPrice);
  }
}

// 税率变更
export function taxChange(record, lovInfo, changeField) {
  const precision = record.get('defaultPrecision');
  const item = lovInfo || {};
  // 改变相应价格
  const price = record.get(changeField);
  const priceChangeFn = changeField === 'agreementPrice' ? unitPriceChange : taxPriceChange;
  if (isCustomNumber(price)) {
    priceChangeFn(price, record, precision, item.taxRate);
  }
  const skuSalesLadders = record.get('skuSalesLadders');
  if (skuSalesLadders && skuSalesLadders.length > 0 && item.taxRate !== undefined) {
    const newList = skuSalesLadders.map((m) => {
      const prices = {};
      if (changeField === 'agreementPrice') {
        prices.taxPrice = getTaxPrice({ tax: item.taxRate, precision, unitPrice: m.unitPrice });
      } else {
        prices.unitPrice = getUnitPrice({ tax: item.taxRate, precision, taxPrice: m.taxPrice });
      }
      return {
        ...m,
        ...prices,
      };
    });
    record.set('skuSalesLadders', newList);
    ladderChange(record, newList);
  }
}

// 币种变更
export function currencyChange(record, lovInfo, changeField) {
  const item = lovInfo || {};
  const skuSalesLadders = record.get('skuSalesLadders');
  const precision = item.defaultPrecision;

  // 改变相应价格
  // 改变相应价格
  const price = record.get(changeField);
  const priceChangeFn = changeField === 'agreementPrice' ? unitPriceChange : taxPriceChange;
  if (isCustomNumber(price)) {
    priceChangeFn(price, record, precision);
  }

  if (skuSalesLadders && skuSalesLadders.length > 0 && item.currencyId) {
    const tax = record.get('tax');
    const newList = skuSalesLadders.map((m) => {
      const prices = {};
      if (changeField === 'agreementPrice') {
        prices.taxPrice = getTaxPrice({ tax, precision, unitPrice: m.unitPrice });
      } else {
        prices.unitPrice = getUnitPrice({ tax, precision, taxPrice: m.taxPrice });
      }
      return {
        ...m,
        ...prices,
      };
    });
    record.set('skuSalesLadders', newList);
    ladderChange(record, newList);
  }
}

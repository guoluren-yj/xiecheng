import { isNumber, isNil, isEmpty } from 'lodash';
import { filterNullValueObject, getCurrentTenant, getResponse } from 'utils/utils';
import { queryNewFunctionWhiteList } from '@/services/workspaceService';

/**
 * 标的行取价优先级
 * pricePriority 值为
 * "ONE", 默认逻辑，开启推荐供应商，推荐价格>申请预估价；不开启推荐供应商，申请预估价>六要素取价
 * "TWO" 推荐价格>申请预估价>六要素取价
 * "THREE" 推荐价格>六要素取价>申请预估价
 * */
export const handleUnitPrice = (params = {}) => {
  const {
    purchaseNeedObj,
    recommendObj,
    sixElementsObj = {}, // 六要素编码
    pricePriority,
    doubleUnitField,
    priceField,
    recommendSupplierFlag,
    hasTaxInclude,
    unitPriceObj = {},
    doubleUnitEnabled,
  } = params || {};
  // 六要素
  const { taxIncludedUnitPrice, unitPrice, unitPriceBatch, currencyCode, taxRate, taxId, taxCode } =
    sixElementsObj || {};

  let purchaseNeedPriorityObj = {}; // 申请预估价优先六要素
  let sixElementsPriorityObj = {}; // 六要素优先申请预估价
  // 申请预估价字段处理
  const {
    // 含税原币
    taxIncludedUnitPrice: purTaxIncludeUnitPrice,
    // 不含税原币
    originalUnitPrice: purUnitPrice,
    // 价格批量
    unitPriceBatch: purUnitPriceBatch,
    // 税率id
    taxId: purTaxId,
    // 税率code
    taxCode: purTaxCode,
    // 税率值
    taxRate: purTaxRate,
    // 原币币种
    currencyCode: purCurrencyCode,
  } = purchaseNeedObj || {};

  // 申请预估价优先
  const requestTaxIncludedPrice = isNumber(purTaxIncludeUnitPrice)
    ? purTaxIncludeUnitPrice
    : taxIncludedUnitPrice;
  const requestUnitPrice = isNumber(purUnitPrice) ? purUnitPrice : unitPrice;
  // 预估价默认取价值
  let requestPriceInfo = {
    unitPriceBatch: purUnitPriceBatch,
    taxId: purTaxId,
    taxCode: purTaxCode,
    taxRate: purTaxRate,
    currencyCode: purCurrencyCode,
  };
  if (hasTaxInclude && !isNil(requestTaxIncludedPrice)) {
    // 预估价的含税原币单价有值，就取预估价的对应字段，如果预估价的对应字段没值，就取6要素的价格批量。
    // 预估价的含税原币单价没值，就取6要素的价格批量。
    requestPriceInfo = !isNil(purTaxIncludeUnitPrice)
      ? {
          unitPriceBatch: purUnitPriceBatch,
          taxId: purTaxId,
          taxCode: purTaxCode,
          taxRate: purTaxRate,
          currencyCode: purCurrencyCode,
        }
      : {
          unitPriceBatch,
          taxId,
          taxCode,
          taxRate,
          currencyCode,
        };
  } else if (!hasTaxInclude && !isNil(requestUnitPrice)) {
    // 不含税同上
    requestPriceInfo = !isNil(purUnitPrice)
      ? {
          unitPriceBatch: purUnitPriceBatch,
          taxId: purTaxId,
          taxCode: purTaxCode,
          taxRate: purTaxRate,
          currencyCode: purCurrencyCode,
        }
      : {
          unitPriceBatch,
          taxId,
          taxCode,
          taxRate,
          currencyCode,
        };
  }
  purchaseNeedPriorityObj = {
    ...purchaseNeedPriorityObj,
    ...requestPriceInfo,
  };
  purchaseNeedPriorityObj[priceField] = hasTaxInclude ? requestTaxIncludedPrice : requestUnitPrice;
  purchaseNeedPriorityObj.benchmarkPrice = hasTaxInclude
    ? requestTaxIncludedPrice
    : requestUnitPrice;
  if (doubleUnitEnabled) {
    const doubleUnitPrice = isNumber(purchaseNeedObj[doubleUnitField])
      ? purchaseNeedObj[doubleUnitField]
      : sixElementsObj[doubleUnitField];
    purchaseNeedPriorityObj[doubleUnitField] = doubleUnitPrice;
    purchaseNeedPriorityObj.benchmarkPrice = doubleUnitPrice;
  }

  // 六要素优先申请预估价
  const sixElementsTaxIncludedPrice = isNumber(taxIncludedUnitPrice)
    ? taxIncludedUnitPrice
    : purTaxIncludeUnitPrice;
  const sixElementsUnitPrice = isNumber(unitPrice) ? unitPrice : purUnitPrice;

  // 6要素默认取价值
  let sixElementsPriceInfo = {
    unitPriceBatch: purUnitPriceBatch,
    taxId: purTaxId,
    taxCode: purTaxCode,
    taxRate: purTaxRate,
    currencyCode: purCurrencyCode,
  };

  if (hasTaxInclude && !isNil(sixElementsTaxIncludedPrice)) {
    // 6要素的含税原币单价有值，就取6要素的，否则取预估价的
    sixElementsPriceInfo = isNil(taxIncludedUnitPrice)
      ? {
          unitPriceBatch: purUnitPriceBatch,
          taxId: purTaxId,
          taxCode: purTaxCode,
          taxRate: purTaxRate,
          currencyCode: purCurrencyCode,
        }
      : {
          unitPriceBatch,
          taxId,
          taxCode,
          taxRate,
          currencyCode,
        };
  } else if (!hasTaxInclude && !isNil(sixElementsUnitPrice)) {
    // 不含税同上
    sixElementsPriceInfo = isNil(unitPrice)
      ? {
          unitPriceBatch: purUnitPriceBatch,
          taxId: purTaxId,
          taxCode: purTaxCode,
          taxRate: purTaxRate,
          currencyCode: purCurrencyCode,
        }
      : {
          unitPriceBatch,
          taxId,
          taxCode,
          taxRate,
          currencyCode,
        };
  }
  sixElementsPriorityObj = {
    ...sixElementsPriorityObj,
    ...sixElementsPriceInfo,
  };
  sixElementsPriorityObj[priceField] = hasTaxInclude
    ? sixElementsTaxIncludedPrice
    : sixElementsUnitPrice;
  sixElementsPriorityObj.benchmarkPrice = hasTaxInclude
    ? sixElementsTaxIncludedPrice
    : sixElementsUnitPrice;
  if (doubleUnitEnabled) {
    const doubleUnitPrice = isNumber(sixElementsObj[doubleUnitField])
      ? sixElementsObj[doubleUnitField]
      : purchaseNeedObj[doubleUnitField];
    sixElementsPriorityObj[doubleUnitField] = doubleUnitPrice;
    sixElementsPriorityObj.benchmarkPrice = doubleUnitPrice;
  }
  let allPriceObj = {
    unitPriceObj,
  };

  let recommendPriceBatchObj = {};
  // 推荐供应商价格处理
  // 含税/不含税价格有值，就取对应的字段值
  if (
    (hasTaxInclude && !isNil(recommendObj.taxIncludedUnitPrice)) ||
    (!hasTaxInclude && !isNil(recommendObj.unitPrice))
  ) {
    recommendPriceBatchObj = {
      unitPriceBatch: purUnitPriceBatch,
      taxId: purTaxId,
      taxCode: purTaxCode,
      taxRate: purTaxRate,
      currencyCode: purCurrencyCode,
    };
  }
  // 推荐价格
  const recommendPrice = {
    ...recommendObj,
    ...recommendPriceBatchObj,
  };

  if (pricePriority === 'TWO') {
    allPriceObj = {
      ...purchaseNeedPriorityObj,
      ...filterNullValueObject(recommendPrice),
    };
  } else if (pricePriority === 'THREE') {
    allPriceObj = {
      ...sixElementsPriorityObj,
      ...filterNullValueObject(recommendPrice),
    };
  } else if (recommendSupplierFlag === 1) {
    allPriceObj = { ...recommendPrice };
  } else {
    allPriceObj = { ...purchaseNeedPriorityObj };
  }
  return allPriceObj;
};

// 获取值集字段转换后的值
export const getLovTransformValue = (params = {}) => {
  const { name = '', oldValue, record } = params;
  if (!name || !record) {
    return oldValue;
  }
  let newValue = oldValue;
  switch (name) {
    case 'companyId':
      newValue = record.get('companyNameDiffValue');
      break;
    case 'supplierCompanyId':
      newValue = record.get('supplierCompanyNameDiffValue');
      break;
    default:
      break;
  }
  return newValue;
};

export const fetchNewFunWhiteList = async ({ functionCode, callback }) => {
  const { tenantNum } = getCurrentTenant() || {};
  const payload = {
    tenantNum,
    functionCode,
  };
  const res = await queryNewFunctionWhiteList(payload);
  if (getResponse(res)) {
    const { content = [] } = res;
    if (!isEmpty(content)) {
      const firstData = content[0];
      const { enableFlag = '0' } = firstData || {};
      callback({
        firstData,
        enableFlag,
      });
    }
  }
  return res;
};

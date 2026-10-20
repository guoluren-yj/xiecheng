// import { useCallback } from 'react';
import { formatAumont } from '@/routes/components/utils';
import { isNil, isObject, isEmpty } from 'lodash';

// 销售方订单工作台精度控制--（含税、不含税金额，含税、不含税单价，含税、不含税本币单价，含税不含税本币金额）
export function usePrecisionRender(header = {}, name, options = {}) {
  return ({ record, value, dataSet }) => {
    if (isObject(header || record) && !isEmpty(header || record)) {
      const { poSourcePlatform, sourceBillTypeCode, sourceCode } = (header || record).get([
        'poSourcePlatform',
        'sourceBillTypeCode',
        'sourceCode',
      ]);
      if (
        record.get('priceShieldFlag') === 1 &&
        ['amount', 'localAmount', 'price', 'localPrice'].includes(name)
      ) {
        return '******';
      }
      const { bySourceCode = true } = options;
      const usePrecision = bySourceCode && sourceCode && sourceCode === 'SRM';
      if (
        (['CATALOGUE', 'E-COMMERCE'].includes(poSourcePlatform) &&
          sourceBillTypeCode === 'PURCHASE_REQUEST') ||
        !usePrecision
      ) {
        return formatAumont(value);
      }
    }
    let precisiontype;
    let isSupplement;
    switch (name) {
      case 'amount':
        precisiontype = 'financialPrecision';
        isSupplement = true;
        break;
      case 'localAmount':
        precisiontype = 'domesticFinancialPrecision';
        isSupplement = true;
        break;
      case 'price':
        precisiontype = 'defaultPrecision';
        break;
      case 'localPrice':
        precisiontype = 'domesticDefaultPrecision';
        break;
      case 'quantity':
        precisiontype = 'uomPrecision';
        break;
      case 'secondaryQuantity':
        precisiontype = 'secondaryUomPrecision';
        break;
      default:
        break;
    }
    const headerInfo = dataSet.getState('basicInfoDs')?.current;
    const headerPrecision = headerInfo?.get(precisiontype);
    const precision = headerPrecision !== undefined ? headerPrecision : record.get(precisiontype);
    const text = !isNil(precision)
      ? formatAumont(value, precision, isSupplement)
      : formatAumont(value);
    return text;
  };
}

// 工作台只读行-单位
export function useUomRender({ record }) {
  return record?.get('uomCodeAndName');
}

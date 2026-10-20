import { isNil } from 'lodash';
import { formatAumont } from '.';

/**
 * 工作台只读头或行-含税不含税单价 不补零
 * @param {Object} header 头信息Record
 * @param {Boolean} bySourceCode 是否根据sourceCode做精度控制
 * @returns
 */
export function usePriceRender(header, options = {}) {
  return ({ record, value }) => {
    const { bySourceCode = true } = options;
    const sourceCode = (header || record)?.get('sourceCode');
    const usePrecision = bySourceCode && sourceCode ? sourceCode === 'SRM' : true;
    if (record.get('priceShieldFlag') === 1) return '******';
    const precision = record.get('defaultPrecision');
    const text =
      !isNil(precision) && usePrecision ? formatAumont(value, precision) : formatAumont(value);
    return text ? String(text) : null;
  };
}

/**
 * 工作台只读头或行-含税不含税金额
 * @param {Object} header 头信息Record
 * @param {Boolean} bySourceCode 是否根据sourceCode做精度控制
 * @returns
 */
export function useAmountRender(header, options = {}) {
  return ({ record, value }) => {
    const { bySourceCode = true } = options;
    if (record.get('priceShieldFlag') === 1) return '******';
    const { poSourcePlatform, sourceBillTypeCode, sourceCode } = (header || record).get([
      'poSourcePlatform',
      'sourceBillTypeCode',
      'sourceCode',
    ]);
    if (
      (['CATALOGUE', 'E-COMMERCE'].includes(poSourcePlatform) &&
        sourceBillTypeCode === 'PURCHASE_REQUEST') ||
      (bySourceCode && sourceCode && sourceCode !== 'SRM')
    ) {
      return formatAumont(value);
    }
    const precision = record.get('financialPrecision');
    const text = !isNil(precision) ? formatAumont(value, precision, true) : formatAumont(value);
    return text ? String(text) : null;
  };
}

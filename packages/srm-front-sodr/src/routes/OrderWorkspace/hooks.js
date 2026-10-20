import React from 'react';
import { formatAumont } from '@/routes/components/utils';
import { isNil, isObject, isEmpty } from 'lodash';

import rise from '@/assets/rise.svg';
import decline from '@/assets/decline.svg';

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
 * 工作台只读头或行-本币含税不含税 金额
 * @param {Object} header 头信息Record
 * @param {Boolean} bySourceCode 是否根据sourceCode做精度控制
 * @returns
 */
export function useLocalAmountRender(header, options = {}) {
  return ({ record, value, dataSet }) => {
    const { bySourceCode = true } = options;
    if (record.get('priceShieldFlag') === 1) return '******';
    const usePrecision = bySourceCode ? (header || record)?.get('sourceCode') === 'SRM' : true;
    const { poSourcePlatform, sourceBillTypeCode } = (header || record).get([
      'poSourcePlatform',
      'sourceBillTypeCode',
    ]);
    if (
      (['CATALOGUE', 'E-COMMERCE'].includes(poSourcePlatform) &&
        sourceBillTypeCode === 'PURCHASE_REQUEST') ||
      !usePrecision
    ) {
      return formatAumont(value);
    }
    const headerInfo = dataSet.getState('basicInfoDs')?.current;
    const headerPrecision = headerInfo?.get('domesticFinancialPrecision');
    const precision = headerPrecision || record.get('domesticFinancialPrecision');
    const text = !isNil(precision) ? formatAumont(value, precision, true) : formatAumont(value);
    return text ? String(text) : null;
  };
}

/**
 * 工作台只读头或行-本币含税不含税 单价
 * @param {Object} header 头信息Record
 * @param {Boolean} bySourceCode 是否根据sourceCode做精度控制
 * @returns
 */
export function useLocalPriceRender(header, options = {}) {
  return ({ record, value }) => {
    const { bySourceCode = true } = options;
    if (record.get('priceShieldFlag') === 1) return '******';
    const usePrecision = bySourceCode ? (header || record)?.get('sourceCode') === 'SRM' : true;
    const headerPrecision = header?.get('domesticDefaultPrecision');
    const precision = headerPrecision || record.get('domesticDefaultPrecision');
    const text =
      !isNil(precision) && usePrecision ? formatAumont(value, precision) : formatAumont(value);
    return text ? String(text) : null;
  };
}

// 工作台只读行-单位
export function useUomRender({ record }) {
  return record?.get('uomCodeAndName');
}

export function useDoubleUomRender({ record }) {
  return record?.get('secondaryUomCodeAndName');
}

// 工作台头行-数量
export function useQuantityRender(header = {}, precisionField = 'uomPrecision') {
  return ({ record, value }) => {
    if (isObject(header) && !isEmpty(header)) {
      const { poSourcePlatform, sourceBillTypeCode } = (header || record).get([
        'poSourcePlatform',
        'sourceBillTypeCode',
      ]);
      if (
        ['CATALOGUE', 'E-COMMERCE'].includes(poSourcePlatform) &&
        sourceBillTypeCode === 'PURCHASE_REQUEST'
      ) {
        return value;
      }
    }
    const precision = record.get(precisionField);
    const text = !isNil(precision) ? formatAumont(value, precision) : formatAumont(value);
    return text ? String(text) : null;
  };
}

export function priceChangeTip(_record, header) {
  const { record, name } = _record;
  const { modifyPriceFlag, benchmarkPriceType, priceShieldFlag } = record.get([
    'priceShieldFlag',
    'modifyPriceFlag',
    'benchmarkPriceType',
  ]);
  const isShield = priceShieldFlag && Number(priceShieldFlag) === 1;
  const isNet = name === 'unitPrice' && benchmarkPriceType === 'NET_PRICE';
  const isTax = name === 'enteredTaxIncludedPrice' && benchmarkPriceType === 'TAX_INCLUDED_PRICE';
  // const shieldFlag = poSourcePlatform !== 'CATALOGUE';
  const dom = (
    <span>
      {usePriceRender(header)(_record)}
      {[-1, 1].includes(modifyPriceFlag) && !isShield && (isNet || isTax) && (
        <img
          style={{ marginBottom: '2px' }}
          src={modifyPriceFlag === 1 ? rise : decline}
          alt="img"
        />
      )}
    </span>
  );
  return dom;
}

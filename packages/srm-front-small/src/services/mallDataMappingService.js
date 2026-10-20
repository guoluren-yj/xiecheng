/**
 * mallDataMapping - 商城主数据映射
 * @date: 2020-5-19
 * @author hl <li.huang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { parseParameters, getCurrentOrganizationId } from 'utils/utils';
import { SRM_MALL } from '_utils/config';

const organizationId = getCurrentOrganizationId(); // 租户ID
/**
 * 查询单位映射
 */
export async function fetchUnitList(params) {
  const param = parseParameters(params);
  return request(`${SRM_MALL}/v1/${organizationId}/plat-uom-refs`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 查询税率映射
 */
export async function fetchTaxRateList(params) {
  const param = parseParameters(params);
  return request(`${SRM_MALL}/v1/${organizationId}/plat-tax-refs`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 查询币种映射
 */
export async function fetchCurrencyList(params) {
  const param = parseParameters(params);
  return request(`${SRM_MALL}/v1/${organizationId}/plat-currency-refs`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 保存单位映射
 */
export async function saveUnitMap(params) {
  const url = `${SRM_MALL}/v1/${organizationId}/plat-uom-refs`;
  return request(url, {
    method: 'POST',
    body: params,
  });
}

/**
 * 保存税率映射
 */
export async function saveTaxRateMap(params) {
  const url = `${SRM_MALL}/v1/${organizationId}/plat-tax-refs`;
  return request(url, {
    method: 'POST',
    body: params,
  });
}

/**
 * 保存币种映射
 */
export async function saveCurrencyMap(params) {
  const url = `${SRM_MALL}/v1/${organizationId}/plat-currency-refs`;
  return request(url, {
    method: 'POST',
    body: params,
  });
}

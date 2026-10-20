/**
 * service - 寻源结果查询
 * @date: 2019-2-18
 * @version: 0.0.1
 * @author: HZL <zili.hou@hand-china.com>
 * @copyright Copyright (c) 2019, Hand
 */

import request from 'utils/request';
import { SRM_SSRC } from '_utils/config';
import { getCurrentOrganizationId, parseParameters } from 'utils/utils';
import { PrefixV2 } from '@/utils/globalVariable';

/**
 * 请求API前缀
 * @type {string}
 */
const prefix = `${SRM_SSRC}/v1`;

/**
 * 询报价查询
 * @async
 * @function fetchRfqDataList
 * @param {object} params - 查询条件
 * @param {!number} [params.page = 0] - 数据页码
 * @param {!number} [params.size = 10] - 分页大小
 * @returns {object} fetch Promise
 */
export async function fetchEntranceList(params) {
  const { organizationId, ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(`${prefix}/${organizationId}/source/result/result-list`, {
    method: 'GET',
    query: { ...param },
  });
}

/**
 * 询价结果-明细页面头
 * @async
 * @function fetchResultsHeaderDetail
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function fetchResultsHeaderDetail(params) {
  return request(`${prefix}/${params.organizationId}/rfx/${params.rfxHeaderId}`, {
    method: 'GET',
  });
}
/**
 * 询价结果全部报价明细-数据查询
 * @async
 * @function fetchQuoteLine
 * @param {object} params - 查询条件
 * @param {!number} [params.page = 0] - 数据页码
 * @param {!number} [params.size = 10] - 分页大小
 * @returns {object} fetch Promise
 */
export async function fetchQuoteLine(params) {
  const { organizationId, sourceHeaderId, routerParam, ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(`${prefix}/${organizationId}/source/result/${sourceHeaderId}/details`, {
    method: 'GET',
    query: { ...param },
  });
}

/**
 * 保存行上的寻源执行策略
 * @async
 * @function saveExecutiveStrategy
 * @param {string} organizationId
 * @param {array} resultsList
 * @returns {object} fetch Promise
 */
export async function saveExecutiveStrategy(params) {
  const { organizationId, data, customizeUnitCode } = params;
  return request(`${prefix}/${organizationId}/source/result/save`, {
    method: 'POST',
    body: data,
    query: { customizeUnitCode },
  });
}

/**
 * 导入预算
 * @async
 * @function importBudgetService
 * @param {array} resultsList
 * @returns {object} fetch Promise
 */
export async function importBudgetService(params) {
  const { organizationId, data } = params;
  return request(`${prefix}/${organizationId}/source/result/budget-import`, {
    method: 'POST',
    body: data,
  });
}

/**
 * 导入预算
 * @async
 * @function supplyAbilityService
 * @param {array} resultsList
 * @returns {object} fetch Promise
 */
export async function supplyAbilityService(params) {
  const { organizationId, data } = params;
  return request(`${prefix}/${organizationId}/source/result/generate/supply-ability`, {
    method: 'POST',
    body: data,
  });
}

/**
 * 导入外部系统
 */
export async function importAnExternalSystem(params) {
  return request(`${prefix}/${getCurrentOrganizationId()}/source/result/import-erp/manual`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 导入价格库
 */
export async function importPriceLibrary(params) {
  return request(`${prefix}/${getCurrentOrganizationId()}/source/result/sync-price/manual`, {
    method: 'POST',
    body: params,
  });
}

export async function fetchAllotted(params) {
  const { organizationId } = params || {};
  return request(`${PrefixV2}/${organizationId}/source/result-pool/allocate-list`, {
    method: 'GET',
    query: params,
  });
}

export async function saveAllotted(params) {
  const { organizationId, querys = {}, ...others } = params || {};
  return request(`${PrefixV2}/${organizationId}/source/result-pool/allocate-save`, {
    method: 'POST',
    query: querys || {},
    body: others,
  });
}

/**
 *
 * VALIDATE
 */
export async function validateResultPool(params) {
  const { organizationId, querys = {}, ...others } = params || {};
  return request(`${PrefixV2}/${organizationId}/source/result-pool/submit-validate`, {
    method: 'POST',
    query: querys || {},
    body: others,
  });
}

/**
 * SUBMIT
 */
export async function submitResultPool(params) {
  const { organizationId, querys = {}, ...others } = params || {};
  return request(`${PrefixV2}/${organizationId}/source/result-pool/submit`, {
    method: 'POST',
    query: querys || {},
    body: others,
  });
}

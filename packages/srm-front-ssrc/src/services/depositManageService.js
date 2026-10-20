/**
 * depositManageService - 保证金管理service层
 * @date: 2020-04-01
 * @author: Goku<xu.pan01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import request from 'utils/request';
import { SRM_SSRC } from '_utils/config';
import { getCurrentOrganizationId, parseParameters } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

/**
 * 查询需缴纳保证金的寻源单列表查询
 * @async
 * @function queryRfxListWithDeposit
 * @param {Object} params - 查询条件
 * @returns {Object} fetch Promise
 */
export async function queryRfxListWithDeposit(params) {
  const query = parseParameters(params);
  return request(`${SRM_SSRC}/v1/${organizationId}/expenses-headers/source-summary`, {
    method: 'GET',
    query,
  });
}

/**
 * 查询询价单基本信息
 * @async
 * @function queryRfxHeaderInfo
 * @param {Object} params - 查询条件
 * @returns {Object} fetch Promise
 */
export async function queryRfxHeaderInfo(params) {
  return request(`${SRM_SSRC}/v1/${organizationId}/expenses-headers/info`, {
    method: 'GET',
    query: {
      ...params,
    },
  });
}

/**
 * 查询需缴纳保证金的供应商查询
 * @async
 * @function querySupplierListWithDeposit
 * @param {Object} params - 查询条件
 * @returns {Object} fetch Promise
 */
export async function querySupplierListWithDeposit(params) {
  const query = parseParameters(params);
  return request(`${SRM_SSRC}/v1/${organizationId}/expenses-headers/source-supplier-summary`, {
    method: 'GET',
    query,
  });
}

/**
 * 保存保证金行
 * @async
 * @function saveDepositInfo
 * @param {Object} params - 查询条件
 * @returns {Object} fetch Promise
 */
export async function saveDepositInfo(params) {
  const { customizeUnitCode, ...otherParams } = params;
  return request(`${SRM_SSRC}/v1/${organizationId}/expenses-headers`, {
    method: 'POST',
    query: { customizeUnitCode },
    body: otherParams,
  });
}

/**
 * 删除保证金行
 * @async
 * @function deleteDeposit
 */
export async function deleteDeposit(params) {
  return request(`${SRM_SSRC}/v1/${organizationId}/expenses-rel-docs/delete`, {
    method: 'DELETE',
    body: params,
  });
}

/**
 * 批量维护
 * @async
 * @function saveBatchMaintain
 */
export async function saveBatchMaintain(params) {
  return request(`${SRM_SSRC}/v1/${organizationId}/expenses-headers/batch-update`, {
    method: 'POST',
    body: params,
  });
}

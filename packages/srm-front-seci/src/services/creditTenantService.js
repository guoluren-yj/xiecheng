/**
 * creditTenantService - 租户配置 - service
 * @date: 2018-12-26
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { parseParameters } from 'utils/utils';
import { SRM_CREDIT } from '_utils/config';

/**
 *租户数据查询
 *
 * @export
 * @param {Object} params 查询参数
 */
export async function fetchCreditTenant(params) {
  const param = parseParameters(params);
  return request(`${SRM_CREDIT}/v1/credit-tenant`, {
    method: 'GET',
    query: param,
  });
}

/**
 *添加租户数据
 *
 * @export
 * @param {Object} params 保存数据
 * @returns
 */
export async function addCreditTenant(params) {
  return request(`${SRM_CREDIT}/v1/credit-tenant`, {
    method: 'POST',
    body: params,
  });
}

/**
 *禁用/启用租户数据
 *
 * @export
 * @param {Object} params 保存数据
 * @returns
 */
export async function handleDisabledTenant(params) {
  return request(`${SRM_CREDIT}/v1/credit-tenant`, {
    method: 'PUT',
    body: params,
  });
}

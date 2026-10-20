/**
 * creditTenantService - 产品配置 - service
 * @date: 2018-12-26
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { parseParameters } from 'utils/utils';
import { SRM_CREDIT } from '_utils/config';

/**
 *产品数据查询
 *
 * @export
 * @param {Object} params 查询参数
 */
export async function fetchProductAssign(params) {
  const param = parseParameters(params);
  return request(`${SRM_CREDIT}/v1/tenant-product-assigns`, {
    method: 'GET',
    query: param,
  });
}

/**
 *产品数据查询
 *
 * @export
 * @param {Object} params 查询参数
 */
export async function fetchProduct(params) {
  const param = parseParameters(params);
  return request(`${SRM_CREDIT}/v1/products/add`, {
    method: 'GET',
    query: param,
  });
}

/**
 *查询租户信息
 *
 * @export
 * @param {Object} params 查询参数
 */
export async function fetchTenantInfo(params) {
  return request(`${SRM_CREDIT}/v1/credit-tenant`, {
    method: 'GET',
    query: params,
  });
}

/**
 *添加产品数据
 *
 * @export
 * @param {Object} params 保存数据
 * @returns
 */
export async function addProductAssign(params) {
  return request(`${SRM_CREDIT}/v1/tenant-product-assigns`, {
    method: 'POST',
    body: params,
  });
}

/**
 *启用/禁用产品
 *
 * @export
 * @param {Object} params 保存数据
 * @returns
 */
export async function handleDisabledProductAssign(params) {
  return request(`${SRM_CREDIT}/v1/tenant-product-assigns/toggle`, {
    method: 'POST',
    body: params,
  });
}

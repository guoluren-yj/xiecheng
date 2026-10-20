/**
 * customBarService - 平台自定义栏管理 - service 平台级
 * @date: 2019年2月19日 17:20:11
 * @author: Jehu <zhihao.zeng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { SRM_SCEC } from '_utils/config';
import { HZERO_PLATFORM } from 'utils/config';
import { parseParameters, getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';

const organizationId = getCurrentOrganizationId(); // 租户ID

/**
 * 查询自定义栏列表
 * @export
 * @param {object} params 查询参数
 * @returns
 */
export async function fetchCustomBarList(params) {
  const param = parseParameters(params);
  const url = !isTenantRoleLevel()
    ? `${SRM_SCEC}/v1/platform-custom-bars`
    : `${SRM_SCEC}/v1/${organizationId}/custom-bars`;
  return request(url, {
    method: 'GET',
    query: param,
  });
}

/**
 * 查询自定义栏明细
 * @export
 * @param {object} params
 * @returns customBar对象
 */
export async function fetchCustomBar(params) {
  const param = parseParameters(params);
  const url = !isTenantRoleLevel()
    ? `${SRM_SCEC}/v1/platform-custom-bars/${params.barId}`
    : `${SRM_SCEC}/v1/${organizationId}/custom-bars/${params.barId}`;
  return request(url, {
    method: 'GET',
    query: param,
  });
}

/**
 * 新增或修改自定义栏
 * @export
 * @param {object} params 编辑更新参数
 * @returns
 */
export async function updateCustomBar(params) {
  const url = !isTenantRoleLevel()
    ? `${SRM_SCEC}/v1/platform-custom-bars`
    : `${SRM_SCEC}/v1/${organizationId}/custom-bars`;
  return request(url, {
    method: 'POST',
    body: params,
  });
}

/**
 * 平台自定义栏上下架
 * @export
 * @param {object} params 更新参数
 * @returns
 */
export async function shelfAction(params) {
  const url = !isTenantRoleLevel()
    ? `${SRM_SCEC}/v1/platform-custom-bars/shelf`
    : `${SRM_SCEC}/v1/${organizationId}/custom-bars/shelf`;
  return request(url, {
    method: 'POST',
    body: params,
  });
}

/**
 * 查询平台操作记录
 * @export
 * @param params
 * @returns {Promise<void>}
 */
export async function fetchCustomBarHistory(params) {
  const param = parseParameters(params);
  const url = !isTenantRoleLevel()
    ? `${SRM_SCEC}/v1/platform-custom-bars/${params.barId}/history`
    : `${SRM_SCEC}/v1/${organizationId}/custom-bars/${params.barId}/history`;
  return request(url, {
    method: 'GET',
    query: param,
  });
}

/**
 * 商城自定义栏商品分配列表
 * @export
 * @param {object} params 查询参数
 * @returns
 */
export async function fetchCustomBarAssignList(params) {
  const param = parseParameters(params);
  const url = !isTenantRoleLevel()
    ? `${SRM_SCEC}/v1/custom-bar-assigns`
    : `${SRM_SCEC}/v1/${organizationId}/custom-bar-assigns`;
  return request(url, {
    method: 'GET',
    query: param,
  });
}

/**
 * 批量创建或修改商城自定义栏商品分配
 * @export
 * @param {object} params 编辑更新参数
 * @returns
 */
export async function createOrUpdateCustomBarAssign(params) {
  const url = !isTenantRoleLevel()
    ? `${SRM_SCEC}/v1/custom-bar-assigns`
    : `${SRM_SCEC}/v1/${organizationId}/custom-bar-assigns`;
  return request(url, {
    method: 'POST',
    body: params,
  });
}

/**
 * 批量创建或修改商城自定义栏商品分配
 * @export
 * @param {object} params 编辑更新参数
 * @returns
 */
export async function deleteCustomBarAssign(params) {
  const url = !isTenantRoleLevel()
    ? `${SRM_SCEC}/v1/custom-bar-assigns/remove`
    : `${SRM_SCEC}/v1/${organizationId}/custom-bar-assigns/remove`;
  return request(url, {
    method: 'DELETE',
    body: params,
  });
}

/**
 * 当前公司值集查询
 * @async
 * @function fetchCurrentCompanyValue
 * @returns {object} fetch Promise
 */
export async function fetchCurrentCompanyValue(params) {
  return request(`${HZERO_PLATFORM}/v1/lovs/data`, {
    method: 'GET',
    query: { ...params },
  });
}

/**
 * 调用搜索引擎查询商品
 * @async
 * @function fetchAllProduct
 * @returns {object} fetch Promise
 */
export async function fetchAllProduct(params) {
  const url = !isTenantRoleLevel()
    ? `${SRM_SCEC}/v1/tourist`
    : `${SRM_SCEC}/v1/${organizationId}/multi`;
  return request(url, {
    method: 'GET',
    query: { ...params },
  });
}

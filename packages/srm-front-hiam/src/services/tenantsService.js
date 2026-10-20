/**
 * service - 租户维护
 * @date: 2018-8-10
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { HZERO_IAM, HZERO_PLATFORM } from 'utils/config';
import { parseParameters, filterNullValueObject } from 'hzero-front/lib/utils/utils';
/**
 *获取数据
 * @async
 * @function queryTenant
 * @param {String} params.tenantNum 组织编码
 * @param {String} params.tenantName 组织名称
 * @param {Number} [params.page = 0] - 数据页码
 * @param {Number} [params.size = 10] - 分页大小
 * @returns {Obejct}  fetch Promise
 */
export async function queryTenant(params) {
  const param = filterNullValueObject(parseParameters(params));
  return request(`${HZERO_IAM}/v1/tenants`, {
    method: 'GET',
    query: param,
  });
}

/**
 *修改组织
 * @async
 * @function updateTenant
 * @returns {Obejct}  fetch Promise
 */
export async function queryTenantDetail(params) {
  const { tenantId } = params;
  return request(`${HZERO_IAM}/v1/tenants/${tenantId}`, {
    method: 'GET',
  });
}

/**
 *修改组织
 * @async
 * @function updateTenant
 * @param {Number} params.tenantId 组织Id
 * @param {String} params.tenantNum 组织编码
 * @param {String} params.tenantName 组织名称
 * @param {Number} params.enabledFlag 是否启用
 * @param {Number} params.objectVersionNumber 版本号
 * @returns {Obejct}  fetch Promise
 */
export async function updateTenant(params) {
  const { tenantId } = params;
  return request(`${HZERO_IAM}/v1/tenants/${tenantId}`, {
    method: 'PUT',
    body: params,
  });
}
/**
 *新建组织
 * @async
 * @function addTenant
 * @param {String} params.tenantNum 组织编码
 * @param {String} params.tenantName 组织名称
 * @param {Number} params.enabledFlag 是否启用
 * @param {Number} params.objectVersionNumber 版本号
 * @returns {Obejct}  fetch Promise
 */
export async function addTenant(params) {
  return request(`${HZERO_IAM}/v1/tenants`, {
    method: 'POST',
    body: params,
  });
}

/**
 *转为核企
 * @async
 * @function convertCoreEnterprise
 * @returns {Obejct}  fetch Promise
 */
export async function convertCoreEnterprise(params) {
  return request(`/spfm/v1/tenant-info/convert-core-enterprise`, {
    method: 'POST',
    body: params,
  });
}

export async function queryLanguage() {
  return request(`${HZERO_PLATFORM}/v1/languages/list`, {
    method: 'GET',
  });
}

export async function deleteTenantLanguage(params) {
  return request(`${HZERO_PLATFORM}/v1/tenant-languages`, {
    method: 'DELETE',
    query: params,
  });
}

export async function saveTenantLanguage(params) {
  return request(`${HZERO_PLATFORM}/v1/tenant-languages`, {
    method: 'POST',
    body: params,
  });
}

export async function saveTenantLanguageConfig(params) {
  return request(`${HZERO_PLATFORM}/v1/tenant-languages/config`, {
    method: 'POST',
    body: params,
  });
}

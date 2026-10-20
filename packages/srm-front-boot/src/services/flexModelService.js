/**
 * service 弹性域模型
 * @date: 2019-4-25
 * @version: 0.0.1
 * @author: lijun <heng.wei@hand-china.com>
 * @copyright Copyright (c) 2018, Hands
 */

import request from 'utils/request';
import { HZERO_PLATFORM } from 'utils/config';
import {
  parseParameters,
  filterNullValueObject,
  getCurrentOrganizationId,
  isTenantRoleLevel,
} from 'utils/utils';

function checkApiTenantPrefix() {
  const organizationId = getCurrentOrganizationId();
  return isTenantRoleLevel() ? `/${organizationId}` : '';
}

/**
 * 弹性域模型列表
 * @async
 * @function queryList
 * @param {object} params - 查询条件
 * @param {!number} [params.page = 0] - 数据页码
 * @param {!number} [params.size = 10] - 分页大小
 * @returns {object} fetch Promise
 */
export async function queryList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${HZERO_PLATFORM}/v1${checkApiTenantPrefix()}/flex-models`, {
    query,
  });
}

/**
 * 弹性域模型明细
 * @async
 * @function queryList
 * @param {number} modelId - 主键ID
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function queryDetail(modelId) {
  return request(`${HZERO_PLATFORM}/v1${checkApiTenantPrefix()}/flex-models/${modelId}`);
}

/**
 * 创建弹性域模型
 * @async
 * @function create
 * @param {object} params - 保存数据
 * @returns {object} fetch Promise
 */
export async function create(data) {
  return request(`${HZERO_PLATFORM}/v1${checkApiTenantPrefix()}/flex-models`, {
    method: 'POST',
    body: data,
  });
}

/**
 * 修改弹性域模型
 * @async
 * @function create
 * @param {object} data - 更新数据
 * @returns {object} fetch Promise
 */
export async function update(data) {
  return request(`${HZERO_PLATFORM}/v1${checkApiTenantPrefix()}/flex-models`, {
    method: 'PUT',
    body: data,
  });
}

/**
 * 删除弹性域模型
 * @async
 * @function deleteDatabase
 * @param {number} data - 数据
 * @returns {object} fetch Promise
 */
export async function deleteRows(data) {
  return request(`${HZERO_PLATFORM}/v1${checkApiTenantPrefix()}/flex-models`, {
    method: 'DELETE',
    body: data,
  });
}

/**
 * 弹性域模型字段列表
 * @async
 * @function queryFieldsList
 * @param {object} params - 查询条件
 * @param {!number} [params.page = 0] - 数据页码
 * @param {!number} [params.size = 10] - 分页大小
 * @returns {object} fetch Promise
 */
export async function queryFieldsList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${HZERO_PLATFORM}/v1${checkApiTenantPrefix()}/flex-model-fields`, {
    query,
  });
}

/**
 * 删除弹性域模型字段
 * @async
 * @function deleteFieldsRows
 * @param {number} data - 数据
 * @returns {object} fetch Promise
 */
export async function deleteFieldsRows(data) {
  return request(`${HZERO_PLATFORM}/v1${checkApiTenantPrefix()}/flex-model-fields`, {
    method: 'DELETE',
    body: data,
  });
}

/**
 * 创建弹性域模型字段
 * @async
 * @function create
 * @param {object} params - 保存数据
 * @returns {object} fetch Promise
 */
export async function createFields(data) {
  return request(`${HZERO_PLATFORM}/v1${checkApiTenantPrefix()}/flex-model-fields`, {
    method: 'POST',
    body: data,
  });
}

/**
 * 修改弹性域模型字段
 * @async
 * @function create
 * @param {object} data - 更新数据
 * @returns {object} fetch Promise
 */
export async function updateFields(data) {
  return request(`${HZERO_PLATFORM}/v1${checkApiTenantPrefix()}/flex-model-fields`, {
    method: 'PUT',
    body: data,
  });
}

/**
 * 初始化弹性域字段
 * @async
 * @function queryFieldsList
 * @param {object} modelId - 查询条件
 * @returns {object} fetch Promise
 */
export async function queryFieldsListInit(modelId) {
  return request(`${HZERO_PLATFORM}/v1${checkApiTenantPrefix()}/flex-model-fields/${modelId}/init`);
}

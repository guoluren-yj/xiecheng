/**
 * rulesDefinitionService
 * @date: 2020-06-16
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { SRM_PLATFORM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

/**
 * 查询树数据
 * @param {Object} params
 */
export async function fetchTreeMenu(params = {}) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/cnf/tree`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 保存参数配置
 * @param {Object} params
 */
export async function savePolicyConfigData(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/cnf-actions`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 删除参数配置
 * @param {Object} params
 */
export async function deletePolicyConfigData(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/cnf-actions`, {
    method: 'DELETE',
    body: params,
  });
}

/**
 * 更新参数配置
 * @param {Object} params
 */
export async function updatePolicyConfigData(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/cnf-actions`, {
    method: 'PUT',
    body: params,
  });
}

/**
 * 保存参数配置
 * @param {Object} params
 */
export async function addImportDefaultConfig(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/cnf-actions/import-default`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 导入数据
 * @param {Object} params
 */
export async function importData(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/cnf-import/data-import`, {
    method: 'POST',
    query: params,
  });
}

/**
 * 导入匹配
 * @param {Object} params
 */
export async function importMatch(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/cnf-import/data-match`, {
    method: 'POST',
    query: params,
  });
}

/**
 * 导入验证
 * @param {Object} params
 */
export async function importVaild(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/cnf-import/data-validate`, {
    method: 'POST',
    query: params,
  });
}

/**
 * 导入验证
 * @param {Object} params
 */
export async function importPreStep(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/cnf-import/step-back`, {
    method: 'POST',
    query: params,
  });
}

/**
 * 查询导入单据数量
 * @param {Object} params
 */
export async function fetchImportCount(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/cnf-import/class-count`, {
    method: 'GET',
    query: params,
  });
}

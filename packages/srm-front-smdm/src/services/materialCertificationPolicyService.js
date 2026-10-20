import request from 'utils/request';
import { SRM_MDM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const tenantId = getCurrentOrganizationId();

/**
 * 保存认证阶段配置
 * @async
 * @function saveNodeConfig
 * @returns fetch Promise
 */
export async function saveNodeConfig(params) {
  return request(`${SRM_MDM}/v1/${tenantId}/item-auth-nodes`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 保存认证策略配置
 * @async
 * @function saveNodePolicyConfig
 * @returns fetch Promise
 */
export async function saveNodePolicyConfig(params) {
  return request(`${SRM_MDM}/v1/${tenantId}/item-auth-str-headers`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 发布认证策略配置
 * @async
 * @function releaseNodePolicyConfig
 * @returns fetch Promise
 */
export async function releaseNodePolicyConfig(params) {
  return request(`${SRM_MDM}/v1/${tenantId}/item-auth-str-headers/release`, {
    method: 'PUT',
    body: params,
  });
}

/**
 * 获取认证策略配置历史记录
 * @async
 * @function getHistory
 * @returns fetch Promise
 */
export async function getNodePolicyHistory(strategyHeaderId) {
  return request(`${SRM_MDM}/v1/${tenantId}/item-auth-str-header-hiss/list/${strategyHeaderId}`, {
    method: 'GET',
  });
}

/**
 * 物料认证阶段启用/禁用
 * @async
 * @function getHistory
 * @returns fetch Promise
 */
export async function enableOrdisable(params) {
  return request(`${SRM_MDM}/v1/${tenantId}/item-auth-nodes/enable-or-disable`, {
    method: 'PUT',
    body: params,
  });
}

/**
 * 发布认证阶段配置
 * @async
 * @function releaseNodePolicyConfig
 * @returns fetch Promise
 */
export async function releaseNodeConfig(params) {
  return request(`${SRM_MDM}/v1/${tenantId}/item-auth-nodes/release`, {
    method: 'PUT',
    body: params,
  });
}

/**
 * 更新认证策略配置
 * @async
 * @function releaseNodePolicyConfig
 * @returns fetch Promise
 */
export async function changeNodePolicyConfig(params) {
  return request(`${SRM_MDM}/v1/${tenantId}/item-auth-nodes/change`, {
    method: 'PUT',
    body: params,
  });
}

/**
 * 获取认证策略配置历史记录
 * @async
 * @function getHistory
 * @returns fetch Promise
 */
export async function getNodeConfigHistory(nodeHisId) {
  return request(`${SRM_MDM}/v1/${tenantId}/item-auth-node-hiss/list/${nodeHisId}`, {
    method: 'GET',
  });
}

/**
 * 阶段删除
 * @async
 * @function getHistory
 * @returns fetch Promise
 */
export async function deleteStage(params) {
  return request(`${SRM_MDM}/v1/${tenantId}/item-auth-nodes/delete`, {
    method: 'DELETE',
    body: params,
  });
}

/**
 * 策略删除
 * @async
 * @function getHistory
 * @returns fetch Promise
 */
export async function deleteStrategy(params) {
  return request(`${SRM_MDM}/v1/${tenantId}/item-auth-str-headers/delete`, {
    method: 'DELETE',
    body: params,
  });
}

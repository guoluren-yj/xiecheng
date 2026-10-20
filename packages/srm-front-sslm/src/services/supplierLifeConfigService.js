/**
 * service - 供应商生命周期配置
 * @date: 2018-9-11
 * @author: WH <heng.wei@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { SRM_SSLM } from '_utils/config';

const prefix = `${SRM_SSLM}/v1`;
// const prefix = `/sslm-15254/v1`;
/**
 * 获取租户可选用阶段节点
 * @async
 * @function searchStageNodes
 * @param {object} params - 请求参数
 * @param {!number} params.tenantId - 租户Id
 * @returns {object} fetch Promise
 */
export async function searchStageNodes(params) {
  return request(`${prefix}/${params.tenantId}/life-cycle-stages`, {
    method: 'GET',
    query: { ...params },
  });
}
/**
 * 获取租户已维护供应商生命周期阶段节点
 * @async
 * @function searchSupplierStage
 * @param {object} params - 请求参数
 * @param {!number} params.tenantId - 租户Id
 * @returns {object} fetch Promise
 */

export async function searchSupplierStage(params) {
  return request(`${prefix}/${params.tenantId}/life-cycle-configs`, {
    method: 'GET',
  });
}
/**
 * 供应商生命周期配置确认生效
 * @async
 * @function saveLifeStage
 * @param {object} params - 请求参数
 * @param {!number} params.tenantId - 租户Id
 * @returns {object} fetch Promise
 */
export async function saveLifeStage(params) {
  return request(`${prefix}/${params.tenantId}/life-cycle-configs`, {
    method: 'PUT',
    body: { ...params.data },
  });
}

/**
 * 增加供应商生命周期节点
 * @async
 * @function saveNode
 * @param {object} params - 请求参数
 * @param {!number} params.tenantId - 租户Id
 * @param {!string} params.description - 节点描述
 * @returns {object} fetch Promise
 */
export async function saveNode(params) {
  return request(`${prefix}/${params.tenantId}/life-cycle-stages`, {
    method: 'POST',
    query: params,
  });
}

/**
 * 删除供应商生命周期节点
 * @async
 * @function deleteNode
 * @param {object} params - 请求参数
 * @param {!number} params.tenantId - 租户Id
 * @param {!string} params.stageId - 节点Id
 * @returns {object} fetch Promise
 */
export async function deleteNode(params) {
  return request(`${prefix}/${params.tenantId}/life-cycle-stages/${params.stageId}`, {
    method: 'DELETE',
  });
}
/**
 * 移除供应商已配置生命周期节点
 * @async
 * @function deleteStage
 * @param {object} params - 请求参数
 * @param {!number} params.tenantId - 租户Id
 * @param {!string} params.stageId - 节点Id
 * @returns {object} fetch Promise
 */
export async function deleteStage(params) {
  return request(`${prefix}/${params.tenantId}/life-cycle-stages/valid`, {
    method: 'POST',
    query: { stageId: params.stageId },
  });
}
/**
 * 更改阶段节点名称
 * @async
 * @function updateStageName
 * @param {object} params - 请求参数
 * @param {!number} params.tenantId - 租户Id
 * @param {!string} params.stageId - 节点Id
 * @param {!string} params.description - 节点名称
 * @returns {object} fetch Promise
 */
export async function updateStageName(params) {
  return request(`${prefix}/${params.tenantId}/life-cycle-stages`, {
    method: 'PUT',
    body: params.data,
  });
}

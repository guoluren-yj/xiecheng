/**
 * Message API返回消息管理
 * @date: 2019-1-9
 * @version: 0.0.1
 * @author:  guochaochao <chaochao.guo@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { HZERO_PLATFORM } from 'utils/config';
import { getCurrentOrganizationId, isTenantRoleLevel, getCurrentTenant } from 'utils/utils';

const tenantId = getCurrentOrganizationId();
const isTenant = isTenantRoleLevel();
const currentTenant = getCurrentTenant();

function message() {
  return isTenant ? `${tenantId}/response-messages` : 'response-messages';
}
/**
 * 删除消息
 * @param {Object} params - 参数
 */
export async function deleteMessage(params) {
  return request(`${HZERO_PLATFORM}/v1/${message()}`, {
    method: 'DELETE',
    body: params,
  });
}

/**
 * 批量删除消息
 * @param {Object} params - 参数
 */
export async function batchDeleteMessage(params) {
  return request(`${HZERO_PLATFORM}/v1/${message()}/batch/delete?interfaceVersion=2`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 租户级重置消息
 * @param {Object} params - 参数
 */
export async function resetMessage(params) {
  const { messageId } = params;
  return request(`${HZERO_PLATFORM}/v1/${message()}/reset?messageId=${messageId}`, {
    method: 'GET',
  });
}

/**
 * 租户级复制消息
 * @param {Object} params - 参数
 */
export async function copyMessage(params) {
  return request(`${HZERO_PLATFORM}/v1/${message()}/copy`, {
    method: 'POST',
    body: { ...params, ...currentTenant },
  });
}

/**
 * 查询消息列表
 * @param {Object} params - 查询参数
 */
export async function fetchMessageList(params) {
  return request(`${HZERO_PLATFORM}/v1/${message()}`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 创建后端消息
 * @param {Object} params - 参数
 */
export async function createMessage(params) {
  return request(`${HZERO_PLATFORM}/v1/${message()}`, {
    method: 'POST',
    body: isTenant ? { ...params, ...currentTenant } : params,
  });
}

/**
 * 修改消息
 * @param {Object} params - 参数
 */
export async function updateMessage(params) {
  return request(`${HZERO_PLATFORM}/v1/${message()}`, {
    method: 'PUT',
    body: params,
  });
}

/**
 * 查询后端消息明细
 * @param {Object} params - 查询参数
 */
export async function getMessageDetail(params) {
  const { messageId } = params;
  return request(`${HZERO_PLATFORM}/v1/${message()}/details/${messageId}`, {
    method: 'GET',
  });
}

// 查询左侧列表数据
export async function getLeftList(value) {
  return request(`${HZERO_PLATFORM}/v1/${message()}/module-count`, {
    method: 'GET',
    query: { issueModule: value },
  });
}

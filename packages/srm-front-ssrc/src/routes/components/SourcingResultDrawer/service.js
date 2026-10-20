import request from 'utils/request';
import { getEnvConfig } from 'utils/iocUtils';

import { PrefixV2 } from '@/utils/globalVariable';

const { HZERO_IAM } = getEnvConfig();

/**
 * 查询标段列表
 * @function - querySectionList
 * @param {!Object} params - 参数 eg: { organizationId, ... }
 * @returns promise
 */
export async function querySectionList(params) {
  const { organizationId, rfxHeaderId, ...otherParams } = params;
  return request(`${PrefixV2}/${organizationId}/rfx/${rfxHeaderId}/project/section`, {
    method: 'GET',
    query: otherParams,
  });
}

/**
 * 提交标段寻源结果
 * @function - submitSectionSourcingResult
 * @param {!Object} params - 参数 eg: { organizationId, ... }
 * @returns promise
 */
export async function submitSectionSourcingResult(params) {
  const { organizationId, ...otherParams } = params;
  return request(`${PrefixV2}/${organizationId}/rfx/section/batch_operation`, {
    method: 'POST',
    body: otherParams,
  });
}

/**
 * 判断按钮权限
 * @param {!Array} params - 权限编码集合
 */
export async function checkPermission(params) {
  return request(`${HZERO_IAM}/hzero/v1/menus/check-permissions`, {
    method: 'POST',
    body: params,
  });
}

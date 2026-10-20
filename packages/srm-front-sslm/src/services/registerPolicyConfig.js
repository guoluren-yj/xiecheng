/**
 * service - registerPolicyConfig
 * @date: 2022-6-29
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_PLATFORM } from '_utils/config';

const organizationId = getCurrentOrganizationId();

// 查询头信息
export async function queryHeaderInfo(params = {}) {
  const { assignId, isPlatform, ...other } = params;
  const path = `${SRM_PLATFORM}/v1/${organizationId}/strategy-cf-basics`;
  const url = isPlatform ? `${path}/site/${assignId}` : `${path}/${assignId}`;
  return request(url, {
    method: 'GET',
    query: other,
  });
}

/**
 * 保存
 */
export async function saveData(params = {}) {
  const { assignId, data } = params;
  return request(`${SRM_PLATFORM}/v1/${organizationId}/strategy-cf-basics/${assignId}`, {
    method: 'POST',
    body: data,
  });
}

/**
 * 发布
 */
export async function publishData(params = {}) {
  const { assignId, data } = params;
  return request(`${SRM_PLATFORM}/v1/${organizationId}/strategy-cf-basics/publish/${assignId}`, {
    method: 'POST',
    body: data,
  });
}

/**
 * 解锁
 */
export async function unlockData(params = {}) {
  const { assignId, ...other } = params;
  return request(`${SRM_PLATFORM}/v1/${organizationId}/strategy-cf-basics/unlock/${assignId}`, {
    method: 'POST',
    body: other,
  });
}

/**
 * 保存条件配置
 */
export async function handeleSaveRule(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/strategy-investg-assigns/save-config`, {
    method: 'POST',
    body: params,
  });
}

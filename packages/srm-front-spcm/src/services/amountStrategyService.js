/*
 * @Date: 2024-06-11 10:28:35
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import request from 'utils/request';
import { SRM_SPCM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

// 解锁
export async function unlockStrategy({ strategyId }) {
  return request(`${SRM_SPCM}/v1/${organizationId}/pc-amount-occupy-strategy/edit/${strategyId}`, {
    method: 'POST',
  });
}

// 复制
export async function copyStrategy(params) {
  return request(`${SRM_SPCM}/v1/${organizationId}/pc-amount-occupy-strategy/copy`, {
    method: 'POST',
    body: params,
  });
}

// 启、禁用
export async function enableStrategy(params) {
  return request(`${SRM_SPCM}/v1/${organizationId}/pc-amount-occupy-strategy/enable`, {
    method: 'POST',
    body: params,
  });
}

// 历史记录
export async function fetchHistory(params) {
  return request(`${SRM_SPCM}/v1/${organizationId}/pc-amount-occupy-strategy/history`, {
    method: 'GET',
    query: params,
  });
}

// 明细保存
export async function saveStrategy(params) {
  return request(`${SRM_SPCM}/v1/${organizationId}/pc-amount-occupy-strategy/update-strategy`, {
    method: 'POST',
    body: params,
  });
}

// 明细发布
export async function publishStrategy(params) {
  return request(`${SRM_SPCM}/v1/${organizationId}/pc-amount-occupy-strategy/publish`, {
    method: 'POST',
    body: params,
  });
}

/**
 * rateTypeOrgService.js - 租户级汇率类型 service
 * @date: 2018-10-29
 * @author: geekrainy <chao.zheng02@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { parseParameters } from 'utils/utils';
import { SRM_MDM } from '_utils/config';

/**
 * 查询租户汇率类型信息
 * @param {Object} params 查询参数
 */
export async function queryRateTypeTenant(params) {
  return request(`${SRM_MDM}/v1/${params.tenantId}/exchange-rate-types`, {
    method: 'GET',
    query: parseParameters(params),
  });
}

/**
 * 用租户 ID 引用云级汇率，同时新建
 * @param {Number} tenantId 租户 ID
 */
export async function pullPlatformRateType(tenantId) {
  return request(`${SRM_MDM}/v1/${tenantId}/exchange-rate-types`, {
    method: 'POST',
  });
}

/**
 * 更新租户汇率类型是否启用
 * @param {Object} params 更新参数
 */
export async function updateRateTypeTenant(params) {
  return request(`${SRM_MDM}/v1/${params.tenantId}/exchange-rate-types`, {
    method: 'PUT',
    body: params.list,
  });
}

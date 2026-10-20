/**
 * dimConfigService.js - 供应商生命周期管控维度配置 service
 * @date: 2018-10-18
 * @author: geekrainy <chao.zheng02@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { getCurrentOrganizationId, parseParameters } from 'utils/utils';
import { SRM_SSLM } from '_utils/config';

const organizationId = getCurrentOrganizationId();

/**
 * 根据租户 ID 查询供应商生命周期管控维度配置明细
 * @param {Object} params - 查询参数
 */
export async function queryDimConfig() {
  return request(`${SRM_SSLM}/v1/${organizationId}/life-cycle-dim-configs`, {
    method: 'GET',
  });
}

/**
 * 创建供应商生命周期管控维度配置
 * @param {Object} params - 添加请求参数
 */
export async function addDimConfig(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/life-cycle-dim-configs`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 修改供应商生命周期管控维度配置
 * @param {Object} params - 修改请求参数
 */
export async function updateDimConfig(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/life-cycle-dim-configs`, {
    method: 'PUT',
    body: params,
  });
}

/**
 * 维度管控供应商列表
 * @param {Object} params - 查询参数
 */
export async function queryDimConfigSups(params) {
  const { body, ...other } = parseParameters(params);
  return request(`${SRM_SSLM}/v1/${organizationId}/life-cycle-dim-sups`, {
    method: 'GET',
    query: {
      ...body,
      ...other,
    },
  });
}

/**
 * 修改供应商生命周期维度管控供应商
 * @param {Object} params - 修改请求参数
 */
export async function updateDimConfigSups(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/life-cycle-dim-sups`, {
    method: 'PUT',
    body: params,
  });
}

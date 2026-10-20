/**
 * ledgerService.js - 账套定义 service
 * @date: 2018-10-29
 * @author: geekrainy <chao.zheng02@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { parseParameters } from 'utils/utils';
import { SRM_MDM } from '_utils/config';

/**
 * 查询账套列表
 * @param {Object} params - 查询参数
 */
export async function queryLedger(params) {
  return request(`${SRM_MDM}/v1/${params.tenantId}/ledgers`, {
    method: 'GET',
    query: parseParameters(params),
  });
}

/**
 * 新增账套
 * @param {Object} params 新增汇率类型
 */
export async function insertLedger(params) {
  return request(`${SRM_MDM}/v1/${params.tenantId}/ledgers`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 修改账套信息
 * @param {Object} params 修改参数
 */
export async function updateLedger(params) {
  return request(`${SRM_MDM}/v1/${params.tenantId}/ledgers`, {
    method: 'PUT',
    body: params,
  });
}

/**
 * purchaseTransactionService - 采购事务类型定义 - service
 * @date: 2018-12-18
 * @author: DTM <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { SRM_PLATFORM } from '_utils/config';
import { parseParameters } from 'utils/utils';

/**
 * 获取采购事务类型定义列表
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 */
export async function fetchPurchaseTransList(params) {
  const param = parseParameters(params);
  return request(`${SRM_PLATFORM}/v1/receive_trx_type`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 批量更新采购事务类型
 */
export async function updatePurchaseTransList(params) {
  return request(`${SRM_PLATFORM}/v1/receive_trx_type`, {
    method: 'POST',
    body: params,
  });
}

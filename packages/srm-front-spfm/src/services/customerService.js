/**
 * customerService.js - 我的合作伙伴客户查询 service
 * @date: 2018-10-29
 * @author: geekrainy <chao.zheng02@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { SRM_PLATFORM } from '_utils/config';
import { parseParameters } from 'utils/utils';

/**
 * 查询平台客户列表
 * @param {Object} params - 查询参数
 */
export async function queryCustomer(params) {
  const query = parseParameters(params);
  return request(`${SRM_PLATFORM}/v1/${query.tenantId}/partners/customers`, {
    method: 'GET',
    query,
  });
}

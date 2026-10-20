/**
 * productDefineService - 产品定义 - service
 * @date: 2018-12-26
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { parseParameters } from 'utils/utils';
import { SRM_CREDIT } from '_utils/config';

/**
 *产品定义数据查询
 *
 * @export
 * @param {Object} params 查询参数
 */
export async function queryProduct(params) {
  const param = parseParameters(params);
  return request(`${SRM_CREDIT}/v1/products`, {
    method: 'GET',
    query: param,
  });
}

/**
 *保存产品定义数据
 *
 * @export
 * @param {Object} params 保存数据
 * @returns
 */
export async function saveProduct(params) {
  return request(`${SRM_CREDIT}/v1/products`, {
    method: 'POST',
    body: params,
  });
}

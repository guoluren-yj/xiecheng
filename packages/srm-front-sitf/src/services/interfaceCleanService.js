/**
 * interfaceCleanService - 接口清理 - service
 * @date: 2018-9-28
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { SRM_INTERFACE } from '_utils/config';
import { parseParameters } from 'utils/utils';

/**
 *查询接口清理信息
 *
 * @export
 * @param {Object} params 查询参数
 * @returns
 */
export async function fetchCleanedData(params) {
  const param = parseParameters(params.page);
  return request(`${SRM_INTERFACE}/v1/clean-records`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 清理数据
 * @param {Object} params 查询参数
 */
export async function cleanInterface(params) {
  return request(`${SRM_INTERFACE}/v1/clean-interface`, {
    method: 'POST',
    body: params,
  });
}

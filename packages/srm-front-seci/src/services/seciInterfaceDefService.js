/**
 * seciInterfaceDefService - 接口定义 - service
 * @date: 2019-01-02
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { SRM_CREDIT } from '_utils/config';
import { parseParameters } from 'utils/utils';

/**
 * 接口定义数据查询
 * @export
 * @param {object} params 查询参数
 * @returns
 */
export async function fetchSeciInterfaceDef(params) {
  const param = parseParameters(params);
  return request(`${SRM_CREDIT}/v1/interfaces`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 接口定义数据创建、编辑
 * @export
 * @param {object} params 创建、编辑参数
 * @returns
 */
export async function updateInterfaces(params) {
  return request(`${SRM_CREDIT}/v1/interfaces`, {
    method: 'POST',
    body: params,
  });
}

/**
 * interfaceTableDefService - 接口表结构定义 - service 平台
 * @date: 2018-09-20
 * @author: dengtingmin <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { SRM_INTERFACE_CONFIG } from '_utils/config';
import { parseParameters } from 'utils/utils';
/**
 * 接口表结构查询
 *
 * @export
 * @param {object} params
 * @returns
 */
export async function queryInterFaceTable(params) {
  const param = parseParameters(params);
  return request(`${SRM_INTERFACE_CONFIG}/v1/interface-tables/${params.interfaceId}`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 修改接口表结构
 */
export async function updateInterFaceTable(params) {
  return request(`${SRM_INTERFACE_CONFIG}/v1/interface-tables`, {
    method: 'POST',
    body: params.body,
  });
}

/**
 * 删除接口表接口
 */
export async function deleteInterFaceTable(params) {
  return request(`${SRM_INTERFACE_CONFIG}/v1/interface-tables`, {
    method: 'DELETE',
    body: params,
  });
}

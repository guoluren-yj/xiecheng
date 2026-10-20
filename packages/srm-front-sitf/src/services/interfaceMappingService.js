/**
 * interfaceMappingService - IDoc接口映射配置 - service
 * @date: 2018-10-18
 * @author: dengtingmin <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { SRM_INTERFACE_CONFIG } from '_utils/config';
import { parseParameters } from 'utils/utils';

/**
 * IDoc接口映射查询
 * @export
 * @param {object} params 查询条件
 * @returns
 */
export async function queryInterfaceMappingList(params) {
  const param = parseParameters(params);
  return request(`${SRM_INTERFACE_CONFIG}/v1/idoc-type-interfaces`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 创建IDoc接口映射
 * @export
 * @param {object} params
 * @returns
 */
export async function createInterfaceMapping(params) {
  return request(`${SRM_INTERFACE_CONFIG}/v1/idoc-type-interfaces`, {
    method: 'POST',
    body: params.body,
  });
}

/**
 * 编辑IDoc接口映射
 * @export
 * @param {object} params 编辑参数
 * @returns
 */
export async function updateInterfaceMapping(params) {
  return request(`${SRM_INTERFACE_CONFIG}/v1/idoc-type-interfaces`, {
    method: 'PUT',
    body: params.body,
  });
}

/**
 * 删除IDoc接口映射
 * @export
 * @param {object} params 删除参数
 * @returns
 */
export async function deleteInterfaceMapping(params) {
  return request(`${SRM_INTERFACE_CONFIG}/v1/idoc-type-interfaces`, {
    method: 'DELETE',
    body: params,
  });
}

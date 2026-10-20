/**
 * interfaceDefService - 接口定义 - service
 * @date: 2018-09-09
 * @author: dengtingmin <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { SRM_INTERFACE } from '_utils/config';
import { parseParameters, getCurrentOrganizationId } from 'utils/utils';

/**
 * 接口定义数据查询
 * @export
 * @param {object} params 查询参数
 * @returns
 */
export async function fetchInterfaceDef(params) {
  const param = parseParameters(params);
  const organizationId = getCurrentOrganizationId();
  return request(`${SRM_INTERFACE}/v1/${organizationId}/interfaces`, {
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
  const organizationId = getCurrentOrganizationId();
  return request(`${SRM_INTERFACE}/v1/${organizationId}/interfaces`, {
    method: 'POST',
    body: params.body,
  });
}

/**
 * 引用云级接口数据
 * @export
 * @param {object} params 云级数据
 */
export async function quoteInterface(params) {
  const organizationId = getCurrentOrganizationId();
  return request(`${SRM_INTERFACE}/v1/${organizationId}/interfaces/quote`, {
    method: 'POST',
    body: params.body,
  });
}

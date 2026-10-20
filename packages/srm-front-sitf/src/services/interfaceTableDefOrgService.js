/**
 * interfaceTableDefService - 接口表结构定义 - service 租户
 * @date: 2018-09-20
 * @author: dengtingmin <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { SRM_INTERFACE } from '_utils/config';
import { parseParameters, getCurrentOrganizationId } from 'utils/utils';
/**
 * 接口表结构查询
 *
 * @export
 * @param {object} params
 * @returns
 */
export async function queryInterFaceTable(params) {
  const param = parseParameters(params);
  const organization = getCurrentOrganizationId();
  return request(`${SRM_INTERFACE}/v1/${organization}/interface-tables/${params.interfaceId}`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 修改接口表结构
 */
export async function updateInterFaceTable(params) {
  const organization = getCurrentOrganizationId();
  return request(`${SRM_INTERFACE}/v1/${organization}/interface-tables`, {
    method: 'POST',
    body: params.body,
  });
}

/**
 * 删除接口表接口
 */
export async function deleteInterFaceTable(params) {
  const organization = getCurrentOrganizationId();
  return request(`${SRM_INTERFACE}/v1/${organization}/interface-tables`, {
    method: 'DELETE',
    body: params,
  });
}

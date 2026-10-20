/**
 * interfaceCateDefService - 接口类别定义 - service
 * @date: 2018-09-20
 * @author: dengtingmin <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { SRM_INTERFACE } from '_utils/config';
import { parseParameters, getCurrentOrganizationId } from 'utils/utils';

/**
 * 接口表类别查询
 * @export
 * @param {object} params 查询参数
 * @param {string} params.interfaceCategoryCode 接口类别代码
 * @param {string} params.interfaceCategoryDesc 接口类别描述
 * @param {string} params.enable 启用
 * @returns
 */
export async function fetchInterfaceCareDef(params) {
  const param = parseParameters(params);
  const organizationId = getCurrentOrganizationId();
  return request(`${SRM_INTERFACE}/v1/${organizationId}/interface-categorys`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 修改接口表
 * @export
 * @param {object} params 查询参数
 * @param {string} params.interfaceCategoryCode 接口类别代码
 * @param {string} params.interfaceCategoryDesc 接口类别描述
 * @param {string} params.enable 启用
 * @returns
 */
export async function updateInterFaceCareDef(params) {
  const organizationId = getCurrentOrganizationId();
  return request(`${SRM_INTERFACE}/v1/${organizationId}/interface-categorys`, {
    method: 'POST',
    body: params.body,
  });
}

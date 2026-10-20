/**
 * frontComputerDefService - 前置机定义 - service 租户级
 * @date: 2018-09-14
 * @author: dengtingmin <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { SRM_INTERFACE_CONFIG } from '_utils/config';
import { parseParameters } from 'utils/utils';
/**
 * 前置机定义数据查询
 *
 * @export
 * @param {object} params 查询参数
 * @param {string} params.frontEndSystemCode 前置机代码
 * @param {string} params.frontEndSystemName 前置机名称
 * @param {string} params.externalSystemCode 外部系统
 * @param {string} params.IP   ip
 * @param {string} params.port 端口
 * @param {string} params.URL  url
 * @param {string} remark 备注
 * @returns
 */
export async function fetchFrontComputer(params) {
  const param = parseParameters(params);
  return request(`${SRM_INTERFACE_CONFIG}/v1/front-end-systems`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 前置机定义数据创建、编辑
 * @export
 * @param {object} params 编辑更新参数
 * @param {string} params.frontEndSystemCode 前置机代码
 * @param {string} params.frontEndSystemName 前置机名称
 * @param {string} params.externalSystemCode 外部系统
 * @param {string} params.IP   ip
 * @param {string} params.port 端口
 * @param {string} params.URL  url
 * @param {string} remark 备注
 * @returns
 */
export async function updateFrontComputer(params) {
  return request(`${SRM_INTERFACE_CONFIG}/v1/front-end-systems`, {
    method: 'POST',
    body: params.body,
  });
}

export async function updateFrontComputerPwd(params) {
  return request(`${SRM_INTERFACE_CONFIG}/v1/front-end-systems/modify-password`, {
    method: 'PUT',
    body: params.body,
  });
}

export async function deleteFrontComputer(params) {
  return request(`${SRM_INTERFACE_CONFIG}/v1/front-end-systems`, {
    method: 'DELETE',
    body: params.body,
  });
}

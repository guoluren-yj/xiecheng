/**
 * applicationGroupDefService - 应用组定义 - service
 * @date: 2018-09-11
 * @author: dengtingmin <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { SRM_INTERFACE_CONFIG } from '_utils/config';
import { parseParameters } from 'utils/utils';

/**
 * 应用组定义数据查询
 * @export
 * @param {object} params 查询参数
 * @param {String} params.applicationGroupCode 应用组代码
 * @param {String} params.applicationGroupName 应用组名称
 * @param {String} params.productLineCode 产品线
 * @param {String} params.enable 启用
 * @param {String} params.remark 备注
 * @returns
 */
export async function fetchApplicationGroup(params) {
  const param = parseParameters(params);
  return request(`${SRM_INTERFACE_CONFIG}/v1/application-groups`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 编辑应用组定义
 * @export
 * @param {object} params 编辑参数
 * @param {String} params.applicationGroupCode 应用组代码
 * @param {String} params.applicationGroupName 应用组名称
 * @param {String} params.productLineCode 产品线
 * @param {String} params.enable 启用
 * @param {String} params.remark 备注
 * @returns
 */
export async function updateApplicationGroups(params) {
  return request(`${SRM_INTERFACE_CONFIG}/v1/application-groups`, {
    method: 'POST',
    body: params.body,
  });
}

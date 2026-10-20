/**
 * ecAddressManageService - 电商平台地址定义 - service 租户级
 * @date: 2019-1-14
 * @author: dengtingmin <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { SRM_SCEC } from '_utils/config';
import { parseParameters } from 'utils/utils';

/**
 * 地区定义列表
 * @export
 * @param {object} params 查询参数
 * @returns
 */
export async function fetchEcAddressManage(params) {
  const param = parseParameters(params);
  return request(`${SRM_SCEC}/v1/regions`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 电商平台与京东地址关联
 * @export
 * @param {object} params 查询参数
 * @returns
 */
export async function ecReginAssociation(params) {
  return request(`${SRM_SCEC}/v1/ec-region-associations`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 地区定义明细
 * @export
 * @param {object} params 查询参数
 * @returns
 */
export async function fetchEcAddressManageDetail(params) {
  const param = parseParameters(params);
  return request(`${SRM_SCEC}/v1/regions/${params.regionId}`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 修改地区定义
 * @export
 * @param {object} params 编辑更新参数
 * @returns
 */
export async function updateEcAddress(params) {
  return request(`${SRM_SCEC}/v1/regions`, {
    method: 'PUT',
    body: params,
  });
}

/**
 * 从电商地址表中导入平台地址表
 * @export
 * @param {object} params 编辑更新参数
 * @returns
 */
export async function exportAddress(params) {
  return request(`${SRM_SCEC}/v1/regions`, {
    method: 'PUT',
    body: params,
  });
}

/**
 * mixConfigureService - 混合部署 - service
 * @date: 2020-01-10
 * @author: lx <xia.li@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { SRM_SCEC } from '_utils/config';
import { parseParameters } from 'utils/utils';

/**
 * 列表查询
 * @export
 * @param {object} params 查询参数
 * @returns
 */
export async function fetchConfigureList(params) {
  const param = parseParameters(params);
  return request(`${SRM_SCEC}/v1/mix-deployments`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 保存
 */
export async function fetchAddList(params) {
  return request(`${SRM_SCEC}/v1/mix-deployments`, {
    method: 'POST',
    body: params,
  });
}

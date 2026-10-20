/**
 * ecPlatformDefService - 电商平台定义 - service 租户级
 * @date: 2019-1-14
 * @author: dengtingmin <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { SRM_SCEC } from '_utils/config';
import { parseParameters } from 'utils/utils';

/**
 * 电商平台定义数据查询
 * @export
 * @param {object} params 查询参数
 * @returns
 */
export async function fetchEcPlatFormList(params) {
  const param = parseParameters(params);
  return request(`${SRM_SCEC}/v1/ec-platforms`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 从电商地址表中导入平台地址表
 * @export
 * @param {object} params 编辑更新参数
 * @returns
 */
export async function updateEcPlatForm(params) {
  return request(`${SRM_SCEC}/v1/ec-platforms`, {
    method: 'POST',
    body: params,
  });
}

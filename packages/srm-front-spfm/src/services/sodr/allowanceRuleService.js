/**
 * service - 发票允差控制
 * @date: 2018-11-12
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { SRM_FINANCE } from '_utils/config';
// import { parseParameters, filterNullValueObject } from 'utils/utils';

/**
 *
 * 查询发票允差控制
 * @export
 * @param {Number} params.organizationId 租户Id
 * @returns
 */
export async function fetchToleranceRule(params) {
  return request(`${SRM_FINANCE}/v1/${params.organizationId}/tolerance-rules`, {
    method: 'GET',
  });
}

/**
 * 保存数据
 *
 * @export
 * @param {Object} params 保存的数据
 * @returns
 */
export async function saveToleranceRule(params) {
  const { organizationId, payloadData } = params;
  return request(`${SRM_FINANCE}/v1/${organizationId}/tolerance-rules`, {
    method: 'POST',
    body: [...payloadData],
  });
}

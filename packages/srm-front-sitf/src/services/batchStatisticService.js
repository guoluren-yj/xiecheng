/**
 * batchStatisticService - 接口批次统计 - service
 * @date: 2018-9-11
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { parseParameters, getCurrentOrganizationId } from 'utils/utils';
import { SRM_INTERFACE } from '_utils/config';
/**
 *接口批次统计查询
 *
 * @export
 * @param {Object} params 查询参数
 */
export async function fetchBatchStatistic(params) {
  const param = parseParameters(params);
  return request(`${SRM_INTERFACE}/v1/batch-statistics`, {
    method: 'GET',
    query: param,
  });
}

/**
 *接口批次统计查询
 *
 * @export
 * @param {Object} params 查询参数
 */
export async function fetchBatchStatisticOrg(params) {
  const organizationId = getCurrentOrganizationId();
  const param = parseParameters(params);
  return request(`${SRM_INTERFACE}/v1/${organizationId}/batch-statistics`, {
    method: 'GET',
    query: param,
  });
}

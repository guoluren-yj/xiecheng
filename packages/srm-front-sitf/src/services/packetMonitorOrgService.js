/**
 * packetMonitorService - 接口请求报文监控 - service 租户级
 * @date: 2018-11-30
 * @author: DTM <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { SRM_INTERFACE } from '_utils/config';
import { parseParameters, getCurrentOrganizationId } from 'utils/utils';

/**
 * 接口请求报文监控 -- 平台级/租户级
 * @export
 * @param {object} params
 * @returns
 */
export async function fetchPacketMonitor(params) {
  const param = parseParameters(params);
  const organizationId = getCurrentOrganizationId();
  return request(`${SRM_INTERFACE}/v1/${organizationId}/request-records`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 接口请求报文监控 -- 平台级/租户级
 * @export
 * @param {object} params
 * @returns
 */
export async function fetchRequestRecord(params) {
  const { requestRecordId, ...otherParams } = params;
  const param = parseParameters(otherParams);
  const organizationId = getCurrentOrganizationId();
  return request(`${SRM_INTERFACE}/v1/${organizationId}/request-records/${requestRecordId}`, {
    method: 'GET',
    query: param,
  });
}

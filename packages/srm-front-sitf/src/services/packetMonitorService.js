/**
 * packetMonitorService - 接口请求报文监控 - service 平台
 * @date: 2018-11-30
 * @author: DTM <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { SRM_INTERFACE } from '_utils/config';
import { parseParameters } from 'utils/utils';

/**
 * 接口请求报文监控 -- 平台级/租户级
 * @export
 * @param {object} params
 * @returns
 */
export async function fetchPacketMonitor(params) {
  const param = parseParameters(params);
  return request(`${SRM_INTERFACE}/v1/request-records`, {
    method: 'GET',
    query: param,
  });
}

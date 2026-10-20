/**
 * interfaceMonitorService - 接口监控 - service
 * @date: 2018-11-21
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { parseParameters } from 'utils/utils';
import { SRM_INTERFACE_CONFIG } from '_utils/config';

/**
 * 查询监控接口配置
 * @export
 * @param {object} params
 * @returns
 */
export async function fetchMonitorInterfaceSetting(params) {
  const param = parseParameters(params);
  return request(`${SRM_INTERFACE_CONFIG}/v1/monitor-interfaces`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 保存监控接口配置
 * @param {object} params
 * @returns
 */
export async function saveMonitorInterfaceSetting(params) {
  return request(`${SRM_INTERFACE_CONFIG}/v1/monitor-interfaces`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 查询监控接口配置
 * @export
 * @param {object} params
 * @returns
 */
export async function fetchMonitorSystemInfo(params) {
  return request(`${SRM_INTERFACE_CONFIG}/v1/monitor-systems/${params.monitorSystemId}`, {
    method: 'GET',
  });
}

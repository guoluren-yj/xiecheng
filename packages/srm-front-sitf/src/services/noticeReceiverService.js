/**
 * noticeReceiverService - 监控联系人 - service
 * @date: 2018-11-23
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { parseParameters } from 'utils/utils';
import { SRM_INTERFACE_CONFIG } from '_utils/config';

/**
 *应用配置数据查询
 *
 * @export
 * @param {Object} params 查询参数
 */
export async function fetchNoticeReceiver(params) {
  const param = parseParameters(params);
  return request(`${SRM_INTERFACE_CONFIG}/v1/notice-receivers`, {
    method: 'GET',
    query: param,
  });
}

/**
 *保存应用配置数据
 *
 * @export
 * @param {Object} params 保存数据
 * @returns
 */
export async function saveNoticeReceiver(params) {
  return request(`${SRM_INTERFACE_CONFIG}/v1/notice-receivers`, {
    method: 'POST',
    body: params,
  });
}

/**
 *保存应用配置数据
 *
 * @export
 * @param {Object} params 保存数据
 * @returns
 */
export async function deleteNoticeReceiver(params) {
  return request(`${SRM_INTERFACE_CONFIG}/v1/notice-receivers`, {
    method: 'DELETE',
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

/**
 * queueSystemAssignService - 消息队列系统分配定义 - service
 * @date: 2018-9-11
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { SRM_INTERFACE_CONFIG } from '_utils/config';
import { parseParameters } from 'utils/utils';

/**
 *查询消息队列分配数据
 *
 * @export
 * @param {Object} params 查询参数
 * @returns
 */
export async function queryData(params) {
  const param = parseParameters(params);
  return request(`${SRM_INTERFACE_CONFIG}/v1/${params.queueId}/queue-system-assigns`, {
    method: 'GET',
    query: param,
  });
}

/**
 *保存消息队列系统分配
 *
 * @export
 * @param {Object} params 保存消息队列系统相关数据
 * @returns
 */
export async function saveData(params) {
  return request(`${SRM_INTERFACE_CONFIG}/v1/${params.queueId}/queue-system-assigns`, {
    method: 'POST',
    body: params.editRows,
  });
}

/**
 *删除消息队列系统分配
 *
 * @export
 * @param {Object} params 删除消息队列系统相关数据
 * @returns
 */
export async function removeData(params) {
  return request(`${SRM_INTERFACE_CONFIG}/v1/${params.queueId}/queue-system-assigns`, {
    method: 'DELETE',
    body: params.removeRows,
  });
}

/**
 *查询详情
 *
 * @export
 * @param {Object} params 查询条件
 * @returns
 */
export async function queryQueueInfo(params) {
  return request(`${SRM_INTERFACE_CONFIG}/v1/queues/${params.queueId}`, {
    method: 'GET',
    query: params,
  });
}

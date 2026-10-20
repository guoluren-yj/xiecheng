/**
 * queueHandleAssignsService - 消息队列定义 - 消息队列处理分配定义 - service
 * @date: 2018-9-13
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hands
 */

import request from 'utils/request';
import { SRM_INTERFACE_CONFIG } from '_utils/config';

/**
 *数据查询
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function queryData(params) {
  return request(`${SRM_INTERFACE_CONFIG}/v1/queue-handlers/query-assign`, {
    method: 'GET',
    query: params,
  });
}

/**
 *数据查询
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function queryAssignData(params) {
  return request(`${SRM_INTERFACE_CONFIG}/v1/${params.queueId}/queue-handler-assigns`, {
    method: 'GET',
    query: params,
  });
}
/**
 *数据保存/更新
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function addData(params) {
  return request(`${SRM_INTERFACE_CONFIG}/v1/${params.queueId}/queue-handler-assigns`, {
    method: 'POST',
    body: params.addRows,
  });
}

/**
 *数据保存/更新
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function removeData(params) {
  return request(`${SRM_INTERFACE_CONFIG}/v1/${params.queueId}/queue-handler-assigns`, {
    method: 'DELETE',
    body: params.removeRows,
  });
}

/**
 *查询详情
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function queryQueueInfo(params) {
  return request(`${SRM_INTERFACE_CONFIG}/v1/queues/${params.queueId}`, {
    method: 'GET',
    query: params,
  });
}

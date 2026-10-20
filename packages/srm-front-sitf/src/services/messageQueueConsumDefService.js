/**
 * messageQueueConsumDefService - 消息队列消费组定义 - service
 * @date: 2018-09-28
 * @author: dengtingmin <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { SRM_INTERFACE_CONFIG } from '_utils/config';
import { parseParameters } from 'utils/utils';

/**
 *消费组定义列表
 * @export
 * @param {object} params
 * @returns
 */
export async function queryConsumerGroup(params) {
  const param = parseParameters(params);
  return request(`${SRM_INTERFACE_CONFIG}/v1/consumer-group`, {
    method: 'GET',
    query: param,
  });
}

/**
 *消息组定义创建、编辑
 * @export
 * @param {object} params
 * @returns
 */
export async function updateConsumerGroup(params) {
  return request(`${SRM_INTERFACE_CONFIG}/v1/consumer-group`, {
    method: 'POST',
    body: params.body,
  });
}

/**
 *查询已分配的处理
 * @export
 * @param {object} params
 * @returns
 */
export async function queryDataAssginHandler(params) {
  const param = parseParameters(params);
  return request(
    `${SRM_INTERFACE_CONFIG}/v1/consumer-group/${params.consumerGroupId}/assigned-handler`,
    {
      method: 'GET',
      query: param,
    }
  );
}

/**
 *查询已分配的队列
 * @export
 * @param {object} params
 * @returns
 */
export async function queryDateAssginQueue(params) {
  const param = parseParameters(params);
  return request(
    `${SRM_INTERFACE_CONFIG}/v1/consumer-group/${params.consumerGroupId}/assigned-queue`,
    {
      method: 'GET',
      query: param,
    }
  );
}
/**
 *查询未分配的处理
 * @export
 * @param {object} params
 * @returns
 */
export async function queryDateUnassignHandler(params) {
  const param = parseParameters(params);
  return request(
    `${SRM_INTERFACE_CONFIG}/v1/consumer-group/${params.consumerGroupId}/unassign-handler`,
    {
      method: 'GET',
      query: param,
    }
  );
}

/**
 *查询未分配的队列
 * @export
 * @param {object} params
 * @returns
 */
export async function queryDateUnassignQueue(params) {
  const param = parseParameters(params);
  return request(
    `${SRM_INTERFACE_CONFIG}/v1/consumer-group/${params.consumerGroupId}/unassign-queue`,
    {
      method: 'GET',
      query: param,
    }
  );
}

/**
 *删除消费组处理分配
 * @export
 * @param {object} params
 * @returns
 */
export async function delectAssignHandler(params) {
  return request(`${SRM_INTERFACE_CONFIG}/v1/consumer-group/handler-assign`, {
    method: 'DELETE',
    body: params.body,
  });
}

/**
 *保存消费组处理分配
 * @export
 * @param {object} params
 * @returns
 */
export async function saveAssignHandler(params) {
  return request(`${SRM_INTERFACE_CONFIG}/v1/consumer-group/handler-assign`, {
    method: 'POST',
    body: params.body,
  });
}

/**
 *删除消费组队列分配
 * @export
 * @param {object} params
 * @returns
 */
export async function deleteQueueAssign(params) {
  return request(`${SRM_INTERFACE_CONFIG}/v1/consumer-group/queue-assign`, {
    method: 'DELETE',
    body: params.body,
  });
}

/**
 *保存消费组队列分配
 * @export
 * @param {object} params
 * @returns
 */
export async function saveQueueAssign(params) {
  return request(`${SRM_INTERFACE_CONFIG}/v1/consumer-group/queue-assign`, {
    method: 'POST',
    body: params.body,
  });
}

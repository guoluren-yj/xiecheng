/**
 * messageQueueService - 消息队列定义 - service
 * @date: 2018-09-10
 * @author: dengtingmin <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { SRM_INTERFACE_CONFIG } from '_utils/config';
import { parseParameters } from 'utils/utils';

/**
 * 消息队列定义数据查询
 * @export
 * @param {object} params
 * @returns
 */
export async function queryMessageQueue(params) {
  const param = parseParameters(params);
  return request(`${SRM_INTERFACE_CONFIG}/v1/queue-groups`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 消息队列定义数据创建、编辑
 * @export
 * @param {object} params
 * @returns
 */
export async function createOrEditQueue(params) {
  return request(`${SRM_INTERFACE_CONFIG}/v1/queue-groups`, {
    method: 'POST',
    body: params.body,
  });
}

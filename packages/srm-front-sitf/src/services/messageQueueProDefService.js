/**
 * messageQueueProDefService - 消息队列处理定义 - service
 * @date: 2018-09-09
 * @author: dengtingmin <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { SRM_INTERFACE_CONFIG } from '_utils/config';
import { parseParameters } from 'utils/utils';

/**
 *消息队列处理定义
 *
 * @export
 * @param {object} params
 * @returns
 */
export async function queryMessageQueuePro(params) {
  const param = parseParameters(params);
  return request(`${SRM_INTERFACE_CONFIG}/v1/queue-handlers`, {
    method: 'GET',
    query: param,
  });
}

/**
 *消息队列处理定义创建、编辑
 *
 * @export
 * @param {object} params
 * @returns
 */
export async function createOrEditMessageQueuePro(params) {
  return request(`${SRM_INTERFACE_CONFIG}/v1/queue-handlers`, {
    method: 'POST',
    body: params.body,
  });
}

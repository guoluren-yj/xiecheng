/**
 * messageQueueSearchService - 消息队列数据查询 - service
 * @date: 2018-09-17
 * @author: dengtingmin <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { SRM_INTERFACE_CONFIG } from '_utils/config';

/**
 *消息队列数据查询
 * @export
 * @param {object} params
 * @param {string} params.queueCode       消息队列
 * @param {string} params.queueGroupCode  消息队列组
 * @param {string} params.batchNum        批次号
 * @param {string} params.assignType      系统分配类型
 * @param {string} params.assignTargetCode 系统分配代码
 * @param {string} params.queueHandlerCode 消息队列处理
 * @param {string} params.applicationGroupCode 应用组
 * @returns
 */
export async function queryMessageQueueList(params) {
  return request(`${SRM_INTERFACE_CONFIG}/v1/mq-message`, {
    method: 'POST',
    query: params,
  });
}

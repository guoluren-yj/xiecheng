/**
 * service - 消息发送配置
 * @date: 2018-10-29
 * @version: 1.0.0
 * @author: WH <heng.wei@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */
import { parseParameters } from 'utils/utils';
import request from 'utils/request';
import { SRM_PLATFORM } from '_utils/config';

/**
 * 请求API前缀
 * @type {string}
 */
const prefix = `${SRM_PLATFORM}/v1`;

/**
 * 查询消息发送配置列表数据
 * @async
 * @function searchSendConfig
 * @param {object} params - 查询条件
 * @param {?number} param.tenantId - 租户Id
 * @param {?string} params.templateCode - 消息模板编码
 * @param {!object} params.page - 分页参数
 * @returns {object} fetch Promise
 */
export async function searchSendConfig(params) {
  const param = parseParameters(params);
  return request(`${prefix}/srm-message/message_receiver_rels`, {
    method: 'GET',
    query: param,
  });
}

export async function saveSendConfig(params) {
  return request(`${prefix}/srm-message/message_receiver_rels`, {
    method: 'POST',
    body: params,
  });
}

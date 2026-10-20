/**
 * queuesSettingService - 消息队列定义 - service
 * @date: 2018-9-11
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { SRM_INTERFACE_CONFIG } from '_utils/config';
import { HZERO_PLATFORM } from 'utils/config';
import { parseParameters } from 'utils/utils';

/**
 *数据查询
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function queryData(params) {
  const param = parseParameters(params);
  return request(`${SRM_INTERFACE_CONFIG}/v1/queues`, {
    method: 'GET',
    query: param,
  });
}

/**
 *数据保存/更新
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function saveData(params) {
  return request(`${SRM_INTERFACE_CONFIG}/v1/queues`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 查询单个独立值集值
 * @param {String} lovCode
 */
export async function queryIdpValue() {
  return request(`${HZERO_PLATFORM}/v1/lovs/value`, {
    query: {
      lovCode: 'SITF.CONSUMER_MODE',
    },
  });
}

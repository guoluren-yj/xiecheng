/**
 * applicationConfigureService - 应用配置 - service
 * @date: 2018-9-11
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { parseParameters } from 'utils/utils';
import { HZERO_PLATFORM } from 'utils/config';
import { SRM_INTERFACE_CONFIG } from '_utils/config';

/**
 * 查询单个独立值集值
 * @param {String} lovCode
 */
export async function queryIdpValue() {
  return request(`${HZERO_PLATFORM}/v1/lovs/value`, {
    query: {
      lovCode: 'SITF.APPLICATIONS_TYPE',
    },
  });
}

/**
 *应用配置数据查询
 *
 * @export
 * @param {Object} params 查询参数
 */
export async function queryApplication(params) {
  const param = parseParameters(params);
  return request(`${SRM_INTERFACE_CONFIG}/v1/applications`, {
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
export async function saveApplication(params) {
  return request(`${SRM_INTERFACE_CONFIG}/v1/applications`, {
    method: 'POST',
    body: params,
  });
}

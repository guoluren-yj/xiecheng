/**
 * event - 平台事件定义 - service
 * @date: 2019-3-13
 * @author: Wu <qizheng.wu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { SRM_PLATFORM } from '_utils/config';
import { isTenantRoleLevel, getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

function eventApi() {
  return isTenantRoleLevel() ? `${organizationId}/event` : `event`;
}

/**
 * 查询平台事件
 * @export
 * @param {object} params 查询参数
 * @returns
 */
export async function fetchEvent(params) {
  return request(`${SRM_PLATFORM}/v1/${eventApi()}`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 新增平台事件
 * @export
 * @param {object} params 请求参数
 * @returns
 */
export async function createEvent(params) {
  return request(`${SRM_PLATFORM}/v1/${eventApi()}`, {
    method: 'POST',
    body: params,
  });
}

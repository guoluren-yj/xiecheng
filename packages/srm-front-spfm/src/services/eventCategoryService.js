/**
 * eventCategory - 事件类型定义 - service
 * @date: 2019-3-13
 * @author: Wu <qizheng.wu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { SRM_PLATFORM } from '_utils/config';
import { isTenantRoleLevel, getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

function categoryApi() {
  return isTenantRoleLevel() ? `${organizationId}/event-category` : `event-category`;
}

/**
 * 查询事件类型
 * @export
 * @param {object} params 查询参数
 * @returns
 */

export async function fetchEventList(params) {
  return request(`${SRM_PLATFORM}/v1/${categoryApi()}`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 新增事件类型
 * @export
 * @param {object} params 请求参数
 * @returns
 */
export async function createEvent(params) {
  return request(`${SRM_PLATFORM}/v1/${categoryApi()}`, {
    method: 'POST',
    body: params,
  });
}

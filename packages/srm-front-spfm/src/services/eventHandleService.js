/**
 * event - 事件处理 - service
 * @date: 2019-3-13
 * @author: Wu <qizheng.wu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { SRM_PLATFORM } from '_utils/config';
import { isTenantRoleLevel, getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

function handleApi() {
  return isTenantRoleLevel() ? `${organizationId}/` : ``;
}

function fetchHandleApi(params) {
  return isTenantRoleLevel() ? `/event-id/${params.eventId}` : ``;
}

/**
 * 查询事件
 * @export
 * @param {object} params 查询参数
 * @returns
 */
export async function fetchEventData(params) {
  return request(`${SRM_PLATFORM}/v1/${handleApi()}event`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询事件处理
 * @export
 * @param {object} params 查询参数
 * @returns
 */
export async function fetchEventHandle(params) {
  return request(`${SRM_PLATFORM}/v1/${handleApi()}event-handle${fetchHandleApi(params)}`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 保存事件处理
 * @export
 * @param {object} params 请求参数
 * @returns
 */
export async function saveEventHandle(params) {
  return request(`${SRM_PLATFORM}/v1/${handleApi()}event-handle`, {
    method: 'POST',
    body: params,
  });
}

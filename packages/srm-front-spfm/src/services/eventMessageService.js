/**
 * EventMessage - 事件查询 - service
 * @date: 2019-3-25
 * @author: Wu <qizheng.wu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { SRM_PLATFORM } from '_utils/config';
import { isTenantRoleLevel, getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

function messageApi() {
  return isTenantRoleLevel() ? `${organizationId}/` : ``;
}

/**
 * 查询事件消息
 * @export
 * @param {object} params 查询参数
 * @returns
 */
export async function queryMessageList(params) {
  return request(`${SRM_PLATFORM}/v1/${messageApi()}event-messages`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 重试
 * @export
 * @param {object} params 请求参数
 * @returns
 */
export async function resendMessage(params) {
  return request(`${SRM_PLATFORM}/v1/${messageApi()}event-messages`, {
    method: 'PUT',
    body: params,
  });
}

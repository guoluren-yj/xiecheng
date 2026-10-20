/**
 * eventType - 事件数据定义 - service
 * @date: 2019-3-13
 * @author: Wu <qizheng.wu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { SRM_PLATFORM } from '_utils/config';
import { isTenantRoleLevel, getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

function dateTypeApi() {
  return isTenantRoleLevel() ? `${organizationId}/event-data-type` : `event-data-type`;
}

/**
 * 查询事件数据类型
 * @export
 * @param {object} params 查询参数
 * @returns
 */
export async function fetchEventDataList(params) {
  return request(`${SRM_PLATFORM}/v1/${dateTypeApi()}`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 新增事件数据类型
 * @export
 * @param {object} params 请求参数
 * @returns
 */
export async function createEventDataType(params) {
  return request(`${SRM_PLATFORM}/v1/${dateTypeApi()}`, {
    method: 'POST',
    body: params,
  });
}

import request from 'utils/request';
import { SRM_SSRC } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

/**
 * 请求API前缀
 * @type {string}
 */
const organizationId = getCurrentOrganizationId();

// 服务费管理保存
export async function serviceManageSave(params) {
  const { customizeUnitCode, data } = params;
  return request(`${SRM_SSRC}/v1/${organizationId}/expenses-headers/service-expense/save`, {
    method: 'POST',
    body: data,
    query: { customizeUnitCode },
  });
}

// 服务费管理同步
export async function serviceManageSync(params) {
  return request(`${SRM_SSRC}/v1/${organizationId}/expenses-headers/service-expense/sync`, {
    method: 'POST',
    body: params,
  });
}

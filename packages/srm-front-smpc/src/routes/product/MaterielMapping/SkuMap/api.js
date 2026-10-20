import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_MALL } from '_utils/config';

const organizationId = getCurrentOrganizationId(); // 租户ID

// const SRM_SMPC = '/smpc';

/**
 * 物料映射
 * @export
 * @param {object} params 映射参数
 * @returns
 */
export async function setMap(params) {
  return request(`${SRM_MALL}/v1/${organizationId}/product-item-refs`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 删除物料映射
 * @export
 * @param {object} params 映射参数
 * @returns
 */
export async function delMap(params) {
  return request(`${SRM_MALL}/v1/${organizationId}/product-item-refs`, {
    method: 'DELETE',
    body: params,
  });
}

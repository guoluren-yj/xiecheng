import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';

const SRM_PRODUCT = '/smpc';

const organizationId = getCurrentOrganizationId(); // 租户ID

// 对比
export async function fetchLastProduct(params) {
  return request(`${SRM_PRODUCT}/v1/${organizationId}/skus/sku-comparison`, {
    method: 'POST',
    body: params,
  });
}

export async function approveOrReject(params) {
  return request(`${SRM_PRODUCT}/v1/${organizationId}/skus/approve-or-reject`, {
    method: 'POST',
    body: params,
  });
}

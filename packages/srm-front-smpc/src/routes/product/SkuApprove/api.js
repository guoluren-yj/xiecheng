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

export async function approveOrReject(params, suffix) {
  if (suffix) {
    return request(`${SRM_PRODUCT}/v1/${organizationId}/skus/${suffix}`, {
      method: 'POST',
      body: params,
      headers: { 's-request-web': 'srm_web' },
    });
  }
}

// 查询历史版本
export async function fetchLastVersion(params) {
  return request(`${SRM_PRODUCT}/v1/${organizationId}/skus/sku-detail-comparison`, {
    method: 'POST',
    body: params,
  });
}

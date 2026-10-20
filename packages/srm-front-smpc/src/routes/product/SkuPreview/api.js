import { getCurrentOrganizationId } from 'utils/utils';
import request from 'utils/request';
// import { SRM_MALL } from '_utils/config';

const SRM_SMPC = '/smpc';

const organizationId = getCurrentOrganizationId();
// 商品详情信息
export function fetchProduct(data) {
  const { productId, ...other } = data;
  return request(`${SRM_SMPC}/v1/${organizationId}/skus/sku-preview/${productId}`, {
    method: 'GET',
    query: other,
  });
}

export function fetchProductNew(data) {
  const { productId, ...other } = data;
  return request(`${SRM_SMPC}/v1/${organizationId}/skus/sku-preview-new/${productId}`, {
    method: 'GET',
    query: other,
  });
}

// 获取销售规格商品
export function fetchSkus(params) {
  return request(`${SRM_SMPC}/v1/${organizationId}/skus/get-similar-sku`, {
    method: 'GET',
    query: params,
  });
}

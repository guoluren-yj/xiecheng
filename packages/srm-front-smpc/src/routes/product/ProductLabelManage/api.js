import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';

const SRM_SMPC = '/smpc';

const organizationId = getCurrentOrganizationId();

// 给商品分配标签
export async function assignLabel(params) {
  return request(`${SRM_SMPC}/v1/${organizationId}/sku-labels`, {
    method: 'POST',
    body: params,
  });
}

// 删除商品的标签
export async function delProductLabel(params) {
  return request(`${SRM_SMPC}/v1/${organizationId}/sku-labels`, {
    method: 'DELETE',
    body: params,
  });
}

// 查询商品下的标签
export async function fetchProductLabel(params) {
  const { skuId } = params;
  return request(`${SRM_SMPC}/v1/${organizationId}/sku-labels/${skuId}`, {
    method: 'GET',
    query: params,
  });
}

import { getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';
import request from 'utils/request';
// import { SRM_SMKT } from '_utils/config';

const SRM_SMKT = '/smkt';

const organizationId = getCurrentOrganizationId();
// 商品详情信息
export function fetchSku(params) {
  const { skuId, ...other } = params;
  const isTenant = isTenantRoleLevel();
  const suffixUrl = isTenant ? `${organizationId}/skus/${skuId}` : `skus/platform/${skuId}`;
  return request(`${SRM_SMKT}/v1/${suffixUrl}`, {
    method: 'GET',
    query: other,
  });
}
// 保存商品信息
export function saveSku(params) {
  return request(`${SRM_SMKT}/v1/${organizationId}/skus/sale-sku`, {
    method: 'POST',
    body: params,
    headers: {
      's-request-web': 'srm_web',
    },
  });
}

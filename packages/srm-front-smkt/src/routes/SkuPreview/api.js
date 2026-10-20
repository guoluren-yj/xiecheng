import { getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';
import request from 'utils/request';
// import { SRM_MALL } from '_utils/config';

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

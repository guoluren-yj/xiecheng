import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId(); // 租户ID
const SRM_SMKT = '/smkt';

/**
 * 查询子目录
 */
export async function fetchSubCatalog(params) {
  const { catalogId } = params;
  return request(`${SRM_SMKT}/v1/${organizationId}/sku-catalogs/sub-catalog/${catalogId}`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 目录保存
 */
export async function fetchSaveSubCatalog(params) {
  return request(`${SRM_SMKT}/v1/${organizationId}/sku-catalogs`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 禁用目录
 */
export async function fetchEnableCatalog(catalogId, enable) {
  const req = enable === 1 ? 'disable' : 'enable';
  return request(`${SRM_SMKT}/v1/${organizationId}/sku-catalogs/${req}/${catalogId}`, {
    method: 'POST',
    //   body: params,
  });
}

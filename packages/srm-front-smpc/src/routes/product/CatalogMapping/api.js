import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';

const SRM_SMPC = '/smpc';

const organizationId = getCurrentOrganizationId();

// 启用禁用分类映射目录
export async function saveMap(params) {
  const { mappingType, mappingId, enabledFlag } = params;
  const type = enabledFlag === 1 ? 'disable' : 'enable';
  return request(
    `${SRM_SMPC}/v1/${organizationId}/catalog-mappings/${mappingType}/${type}/${mappingId}`,
    {
      method: 'PUT',
      body: params,
    }
  );
}

// 启用禁用分类映射目录
export async function setEnable(params) {
  const { mappingType, mappingId, enabledFlag } = params;
  const type = enabledFlag === 1 ? 'enable' : 'disable';
  return request(
    `${SRM_SMPC}/v1/${organizationId}/catalog-mappings/${mappingType}/${type}/${mappingId}`,
    {
      method: 'PUT',
      body: params,
    }
  );
}

// 商品上架
export async function fetchMappingShelf(params) {
  return request(`${SRM_SMPC}/v1/${organizationId}/catalog-mappings/mapping-shelf`, {
    method: 'POST',
    body: params,
  });
}

// 保存
export async function saveMapping(params, mappingType) {
  return request(`${SRM_SMPC}/v1/${organizationId}/catalog-mappings/${mappingType}`, {
    method: 'POST',
    body: params,
  });
}

// 校验目录下是否有商品
export async function checkProduct(params, mappingType) {
  return request(`${SRM_SMPC}/v1/${organizationId}/catalog-mappings/${mappingType}/check`, {
    method: 'POST',
    body: params,
  });
}

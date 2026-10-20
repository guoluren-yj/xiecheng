import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';

const SRM_SMPC = '/smpc';

const organizationId = getCurrentOrganizationId();

// 删除目录化商品物料关联
export async function delMap(params) {
  const { mappingType, mappingIds } = params;
  return request(`${SRM_SMPC}/v1/${organizationId}/sku-mappings/${mappingType}`, {
    method: 'DELETE',
    body: mappingIds,
  });
}

// 保存商品映射关系
export async function saveMapping(params, mappingType) {
  return request(`${SRM_SMPC}/v1/${organizationId}/sku-mappings/${mappingType}`, {
    method: 'POST',
    body: params,
  });
}

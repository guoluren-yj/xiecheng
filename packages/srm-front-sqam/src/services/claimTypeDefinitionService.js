import { getCurrentOrganizationId, parseParameters } from 'utils/utils';
import request from 'utils/request';
import { SRM_SQAM } from '_utils/config';

const organizationId = getCurrentOrganizationId();

/**
 * 查询索赔单类型
 */
export async function fetchClaimType(params) {
  const query = parseParameters(params);
  return request(`${SRM_SQAM}/v1/${organizationId}/claim-types`, {
    method: 'GET',
    query,
  });
}

/**
 * 保存索赔单类型
 */
export async function saveClaimType(params) {
  return request(`${SRM_SQAM}/v1/${organizationId}/claim-types`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 删除索赔项目定义
 */
export async function deleteClaimType(params) {
  const { deleteList } = params;
  return request(`${SRM_SQAM}/v1/${organizationId}/claim-types`, {
    method: 'DELETE',
    body: deleteList,
  });
}

/**
 * 查询索赔项目定义
 */
export async function fetchClaimItem(params) {
  const query = parseParameters(params);
  return request(`${SRM_SQAM}/v1/${organizationId}/claim-items`, {
    method: 'GET',
    query,
  });
}

/**
 * 保存索赔项目定义
 */
export async function saveClaimItem(params) {
  const { customizeUnitCode, lines } = params;
  return request(`${SRM_SQAM}/v1/${organizationId}/claim-items`, {
    method: 'POST',
    body: lines,
    query: { customizeUnitCode },
  });
}

/**
 * 删除索赔项目定义
 */
export async function deleteClaimItem(params) {
  const { deleteList, customizeUnitCode } = params;
  return request(`${SRM_SQAM}/v1/${organizationId}/claim-items`, {
    method: 'DELETE',
    body: deleteList,
    query: { customizeUnitCode },
  });
}

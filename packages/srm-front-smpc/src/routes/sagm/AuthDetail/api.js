import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_MALL } from '_utils/config';

const organizationId = getCurrentOrganizationId();

/**
 *查询分类
 *
 */
export async function fetchCategoryTree() {
  return request(`/smpc/v1/category/${organizationId}/getTreeWithThreeList`, {
    method: 'GET',
  });
}

// 查询组织
export async function fetchOrgTree() {
  const url = `/sagm/v1/${organizationId}/pur-units/edit-tree`;
  return request(url, {
    method: 'GET',
  });
}

// 查询区域
export async function fetchRegionTree() {
  const url = `${SRM_MALL}/v1/${organizationId}/mall-regions/regional-tree`;
  return request(url, {
    method: 'GET',
  });
}

// 查询信息
export async function fetchInfo(params) {
  const { authorityListId, ...query } = params;
  const url = `/sagm/v1/${organizationId}/authority-lists/${authorityListId}`;
  return request(url, {
    method: 'GET',
    query,
  });
}

// 保存权限
export async function saveAuthority(params) {
  const url = `/sagm/v1/${organizationId}/authority-lists`;
  return request(url, {
    method: 'POST',
    body: params,
  });
}

// 加入商品映射
export function joinAssignSku(params) {
  return request(`/sagm/v1/${organizationId}/auth-sku-details`, {
    method: 'POST',
    body: params,
  });
}

// 删除商品映射
export function deleteAssignSku(params) {
  return request(`/sagm/v1/${organizationId}/auth-sku-details`, {
    method: 'DELETE',
    body: params,
  });
}

// 删除权限维度
export function deleteDimension(params) {
  return request(`/sagm/v1/${organizationId}/authority-lists/batch-delete-auth-range`, {
    method: 'DELETE',
    body: params,
  });
}

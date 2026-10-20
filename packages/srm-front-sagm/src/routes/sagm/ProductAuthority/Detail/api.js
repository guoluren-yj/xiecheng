import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_MALL, SRM_SAGM, SRM_SMPC } from '_utils/config';

const organizationId = getCurrentOrganizationId();

/**
 *查询分类
 *
 */
export async function fetchCategoryTree() {
  return request(`${SRM_SMPC}/v1/category/${organizationId}/getTreeWithThreeList`, {
    method: 'GET',
  });
}

// 查询组织
export async function fetchOrgTree() {
  const url = `${SRM_SAGM}/v1/${organizationId}/pur-units/edit-tree`;
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
  const url = `${SRM_SAGM}/v1/${organizationId}/authority-lists/${authorityListId}`;
  return request(url, {
    method: 'GET',
    query,
  });
}

// 保存权限
export async function saveAuthority(params) {
  const url = `${SRM_SAGM}/v1/${organizationId}/authority-lists`;
  return request(url, {
    method: 'POST',
    body: params,
  });
}

// 加入商品映射
export function joinAssignSku(params) {
  return request(`${SRM_SAGM}/v1/${organizationId}/auth-sku-details`, {
    method: 'POST',
    body: params,
  });
}

// 删除商品映射
export function deleteAssignSku(params) {
  return request(`${SRM_SAGM}/v1/${organizationId}/auth-sku-details`, {
    method: 'DELETE',
    body: params,
  });
}

// 删除权限维度
export function deleteDimension(params) {
  return request(`${SRM_SAGM}/v1/${organizationId}/authority-lists/batch-delete-auth-range`, {
    method: 'DELETE',
    body: params,
  });
}

// 排除商品加入
export function joinExcludeSku(params) {
  return request(`${SRM_SAGM}/v1/${organizationId}/auth-exclude-sku-details`, {
    method: 'POST',
    body: params,
  });
}

// 排除商品移除
export function deleteExcludeSku(params) {
  return request(`${SRM_SAGM}/v1/${organizationId}/auth-exclude-sku-details`, {
    method: 'DELETE',
    body: params,
  });
}

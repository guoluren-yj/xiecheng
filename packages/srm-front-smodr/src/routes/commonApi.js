import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_MALL } from '_utils/config';

const organizationId = getCurrentOrganizationId();
/**
 *查询分类
 *
 */
export async function fetchCategoryTree() {
  return request(`${SRM_MALL}/v1/${organizationId}/category/getTreeWithThreeList`, {
    method: 'GET',
  });
}

// 查询组织
export async function fetchOrgTree() {
  const url = `${SRM_MALL}/v1/${organizationId}/unit-refs/tree`;
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

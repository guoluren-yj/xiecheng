import request from 'utils/request';
import { SRM_MALL } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId(); // 租户ID

// 商品介绍模板
export async function fetchSkuIntroTemplate() {
  return request(`/smpc/v1/${organizationId}/sku-detail-templates`, {
    method: 'GET',
    query: { enabledFlag: 1, size: 0 },
  });
}

// 查询组织
export async function fetchUnits() {
  const url = `/sagm/v1/${organizationId}/pur-units/edit-tree`;
  return request(url, {
    method: 'GET',
  });
}

// 查询区域
export async function fetchRegions() {
  const url = `${SRM_MALL}/v1/${organizationId}/mall-regions/regional-tree`;
  return request(url, {
    method: 'GET',
  });
}

// 查询分类
export async function fetchCategorys() {
  return request(`/smpc/v1/category/${organizationId}/getTreeWithThreeList`, {
    method: 'GET',
  });
}

// 查询目录
export async function fetchCatalogs() {
  return request(`/smpc/v1/${organizationId}/catalogs/all-catalog-tree`, {
    method: 'GET',
  });
}

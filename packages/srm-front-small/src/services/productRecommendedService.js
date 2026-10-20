import request from 'utils/request';
import { SRM_MALL } from '_utils/config';
import { getCurrentOrganizationId, parseParameters } from 'utils/utils';

const organizationId = getCurrentOrganizationId(); // 租户ID
const SRM_PRODUCT = '/smpc';

/**
 * 查询
 * @async
 * @function fetchApproveList
 * @returns {object} fetch Promise
 */
export async function saveProductGroup(params) {
  return request(`${SRM_MALL}/v1/${organizationId}/product-groups`, {
    method: 'POST',
    body: params,
  });
}

export async function disableProductGroup(params) {
  return request(`${SRM_MALL}/v1/${organizationId}/product-groups/update-enabled-flag`, {
    method: 'PUT',
    body: params,
  });
}

export async function deleteProductGroup(params) {
  return request(`${SRM_MALL}/v1/${organizationId}/product-groups`, {
    method: 'DELETE',
    body: params,
  });
}

export function fetchProductRange(params) {
  return request(`${SRM_MALL}/v1/${organizationId}/product-group-assigns`, {
    method: 'GET',
    query: params,
  });
}

/**
 *查询分类
 *
 */
export async function fetchTypeTree() {
  const url = `${SRM_PRODUCT}/v1/category/${organizationId}/getTreeWithThreeList`;
  return request(url, {
    method: 'GET',
  });
}

/**
 * 查询业务通知发布列表
 */
export async function fetchProduct(params) {
  const param = parseParameters(params);
  const { page, size, ...other } = param;
  return request(`${SRM_PRODUCT}/v1/${organizationId}/pur-skus/all-sku-list`, {
    method: 'GET',
    query: { page, size, ...other },
  });
}

/**
 * 按分类添加商品
 */
export async function saveCataProducts(params) {
  return request(`${SRM_MALL}/v1/${organizationId}/product-group-assigns/batch-by-cid`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 置顶商品
 */
export async function setProductTopping(params) {
  return request(`${SRM_MALL}/v1/${organizationId}/product-group-assigns/top-product`, {
    method: 'POST',
    body: params,
  });
}

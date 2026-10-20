/**
 * ecMaterielMapping - 目录映射物料 - service
 * @date: 2019-2-22
 * @author: zjx <jingxi.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { SRM_SCEC, SRM_MDM } from '_utils/config';
import { parseParameters, getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId(); // 租户ID

export async function fetchMaterielCode(params) {
  const param = parseParameters(params);
  return request(`${SRM_MDM}/v1/${organizationId}/items/dim/partner`, {
    method: 'GET',
    query: param,
  });
}

export async function fetchCategoryCode(params) {
  const param = parseParameters(params);
  return request(`${SRM_MDM}/v1/${organizationId}/item-categories`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 集团引用
 */
export async function fetchReference(params) {
  const { type, selectedRows } = params;
  if (type === 'category') {
    return request(`${SRM_SCEC}/v1/${organizationId}/group/category-item-refs`, {
      method: 'POST',
      body: selectedRows,
    });
  } else if (type === 'ecProduct') {
    return request(`${SRM_SCEC}/v1/${organizationId}/group/ec-product-item-refs`, {
      method: 'POST',
      body: selectedRows,
    });
  } else if (type === 'ecCategory') {
    return request(`${SRM_SCEC}/v1/${organizationId}/group/ec-category-item-refs`, {
      method: 'POST',
      body: selectedRows,
    });
  }
}

/**
 * 目录映射物料数据查询
 * @export
 * @param {object} params 查询参数
 * @returns
 */
export async function fetchCatalogRefs(params) {
  const param = parseParameters(params);
  return request(`${SRM_SCEC}/v1/${organizationId}/category-item-refs`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 电商分类映射物料数据查询
 * @export
 * @param {object} params 查询参数
 * @returns
 */
export async function fetchEcCatalogRefs(params) {
  const param = parseParameters(params);
  return request(`${SRM_SCEC}/v1/${organizationId}/ec-category-item-refs`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 电商商品映射物料数据查询
 * @export
 * @param {object} params 查询参数
 * @returns
 */
export async function fetchEcProductCatalogRefs(params) {
  const param = parseParameters(params);
  return request(`${SRM_SCEC}/v1/${organizationId}/ec-product-item-refs`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 商品(目录化)映射物料数据查询
 * @export
 * @param {object} params 查询参数
 * @returns
 */
export async function fetchProductCatalogRefs(params) {
  const param = parseParameters(params);
  return request(`${SRM_SCEC}/v1/${organizationId}/product-item-refs`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 目录映射物料映射
 * @export
 * @param {object} params 映射参数
 * @returns
 */
export async function setCatalogRefsMap(params) {
  return request(`${SRM_SCEC}/v1/${organizationId}/category-item-refs`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 电商分类映射物料映射
 * @export
 * @param {object} params 映射参数
 * @returns
 */
export async function setEcCatalogRefsMap(params) {
  return request(`${SRM_SCEC}/v1/${organizationId}/ec-category-item-refs`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 商品(电商)映射物料映射
 * @export
 * @param {object} params 映射参数
 * @returns
 */
export async function setEcProductCatalogRefsMap(params) {
  return request(`${SRM_SCEC}/v1/${organizationId}/ec-product-item-refs`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 商品(目录化)映射物料映射
 * @export
 * @param {object} params 映射参数
 * @returns
 */
export async function setProductCatalogRefsMap(params) {
  return request(`${SRM_SCEC}/v1/${organizationId}/product-item-refs`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 删除目录映射物料
 * @export
 * @param {object} params 映射参数
 * @returns
 */
export async function deleteCatalogRefsMap(params) {
  return request(`${SRM_SCEC}/v1/${organizationId}/category-item-refs`, {
    method: 'DELETE',
    body: params,
  });
}

/**
 * 删除电商分类映射物料
 * @export
 * @param {object} params 映射参数
 * @returns
 */
export async function deleteEcCatalogRefsMap(params) {
  return request(`${SRM_SCEC}/v1/${organizationId}/ec-category-item-refs`, {
    method: 'DELETE',
    body: params,
  });
}

/**
 * 删除商品(电商)映射物料
 * @export
 * @param {object} params 映射参数
 * @returns
 */
export async function deleteEcProductCatalogRefsMap(params) {
  return request(`${SRM_SCEC}/v1/${organizationId}/ec-product-item-refs`, {
    method: 'DELETE',
    body: params,
  });
}

/**
 * 删除商品(目录化)映射物料
 * @export
 * @param {object} params 映射参数
 * @returns
 */
export async function deleteProductCatalogRefsMap(params) {
  return request(`${SRM_SCEC}/v1/${organizationId}/product-item-refs`, {
    method: 'DELETE',
    body: params,
  });
}

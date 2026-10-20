/**
 * GroupMaterielMapping - 集团物料映射
 * @date: 2020-2-11
 * @author hl <li.huang04@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { SRM_SCEC, SRM_MDM } from '_utils/config';
import { parseParameters, getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId(); // 租户ID

/**
 * 目录映射物料数据查询
 * @export
 * @param {object} params 查询参数
 * @returns
 */
export async function fetchCategoryMappingList(params) {
  const param = parseParameters(params);
  return request(`${SRM_SCEC}/v1/${organizationId}/group-category-item-refs`, {
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
export async function fetchEcCategoryMappingList(params) {
  const param = parseParameters(params);
  return request(`${SRM_SCEC}/v1/${organizationId}/group-ec-category-item-refs`, {
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
export async function fetchEcProductMappingList(params) {
  const param = parseParameters(params);
  return request(`${SRM_SCEC}/v1/${organizationId}/group-ec-product-item-refs`, {
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
export async function fetchProductMappingList(params) {
  const param = parseParameters(params);
  return request(`${SRM_SCEC}/v1/${organizationId}/group-product-item-refs`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 品类列表
 * @export
 * @param {object} params 查询参数
 * @returns
 */
export async function fetchCategoryList(params) {
  const param = parseParameters(params);
  return request(`${SRM_MDM}/v1/${organizationId}/item-categories`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 物料列表
 * @export
 * @param {object} params 查询参数
 * @returns
 */
export async function fetchMaterielList(params) {
  const param = parseParameters(params);
  return request(`${SRM_MDM}/v1/${organizationId}/items/dim/partner`, {
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
export async function setCategoryMap(params) {
  return request(`${SRM_SCEC}/v1/${organizationId}/group-category-item-refs`, {
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
export async function setEcCategoryMap(params) {
  return request(`${SRM_SCEC}/v1/${organizationId}/group-ec-category-item-refs`, {
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
export async function setEcProductMap(params) {
  return request(`${SRM_SCEC}/v1/${organizationId}/group-ec-product-item-refs`, {
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
export async function setProductMap(params) {
  return request(`${SRM_SCEC}/v1/${organizationId}/group-product-item-refs`, {
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
export async function delCategoryMap(params) {
  return request(`${SRM_SCEC}/v1/${organizationId}/group-category-item-refs`, {
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
export async function delEcCategoryMap(params) {
  return request(`${SRM_SCEC}/v1/${organizationId}/group-ec-category-item-refs`, {
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
export async function delEcProductMap(params) {
  return request(`${SRM_SCEC}/v1/${organizationId}/group-ec-product-item-refs`, {
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
export async function delProductMap(params) {
  return request(`${SRM_SCEC}/v1/${organizationId}/group-product-item-refs`, {
    method: 'DELETE',
    body: params,
  });
}

import request from 'utils/request';

const SRM_SMPC = '/smpc';

/**
 * 分类列表查询
 */
export async function fetchCategoryList(params) {
  return request(`${SRM_SMPC}/v1/category/list`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 导出接口查询
 */
export async function exportAll(params) {
  return request(`${SRM_SMPC}/v1/category/export`, {
    method: 'GET',
    query: params,
    responseType: 'text',
  });
}

/**
 * 保存、启用、禁用分类分类
 */
export async function saveCategoryInfo(params) {
  return request(`${SRM_SMPC}/v1/category/save-or-update`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 绑定属性
 */
export async function saveAttrInfo(params) {
  return request(`${SRM_SMPC}/v1/category-attrs/save-or-update`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 绑定属性值、启用、禁用
 */
export async function saveAttrValInfo(params) {
  return request(`${SRM_SMPC}/v1/category-attr-vals/save-or-update`, {
    method: 'POST',
    body: params,
  });
}

import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_DATA_SDAT } from '@/utils/config';

const tenantId = getCurrentOrganizationId();

/**
 * 查询默认模板详情
 * @async
 * @function fetchDefaultConfig
 * @param {Object} params
 */
export async function fetchDefaultConfig(params) {
  return request(`${SRM_DATA_SDAT}/v1/${tenantId}/wb2-risk-plans/query-create-default`, {
    method: 'GET',
    query: {
      ...params,
    },
  });
}

/**
 * 查询模板定义详情
 * @async
 * @function fetchDetailConfig
 * @param {Object} params
 */
export async function fetchDetailConfig(params) {
  return request(`${SRM_DATA_SDAT}/v1/${tenantId}/wb2-risk-plans/risk-plan-detail`, {
    method: 'GET',
    query: {
      ...params,
    },
  });
}

export async function fetchSavePlanConfig(param) {
  return request(`${SRM_DATA_SDAT}/v1/${tenantId}/wb2-risk-plans`, {
    method: 'POST',
    body: param,
  });
}

/**
 * 更新启用状态
 * @param {*} param
 * @returns
 */
export async function fetchUpdateConfig(params = {}) {
  return request(`${SRM_DATA_SDAT}/v1/${tenantId}/wb2-risk-plans`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 删除适用范围
 * @param {*} params
 * @returns
 */
export async function fetchRemoveScopeList(params = {}) {
  return request(`${SRM_DATA_SDAT}/v1/${tenantId}/wb2-risk-plans/remove-plan-scope`, {
    method: 'DELETE',
    body: params,
  });
}

/**
 * 删除扫描对象
 * @param {*} params
 * @returns
 */
export async function fetchRemoveObjectList(params = {}) {
  return request(`${SRM_DATA_SDAT}/v1/${tenantId}/wb2-risk-plans/remove-plan-object`, {
    method: 'DELETE',
    body: params,
  });
}

/**
 * 已选的供应商分类id集合
 * @param {*} params
 * @returns
 */
export async function fetchCategoryList(params) {
  return request(`${SRM_DATA_SDAT}/v1/${tenantId}/wb2-risk-plans/checked-category-list`, {
    method: 'GET',
    query: {
      ...params,
    },
  });
}

/**
 * 添加平台外企业 模糊匹配供应商
 * @param {*} params
 * @returns
 */
export async function fetchMatchBusiness(params = {}, query = {}) {
  return request(`${SRM_DATA_SDAT}/v1/${tenantId}/wb2-risk-plans/fuzzy-supplier`, {
    method: 'POST',
    body: params,
    query,
  });
}

/**
 * 删除公司列表
 * @param {*} params
 * @param {*} query
 * @returns
 */
export async function fetchRemoveCompanyList(params = {}) {
  return request(`${SRM_DATA_SDAT}/v1/${tenantId}/wb2-risk-plans/remove-plan-object`, {
    method: 'DELETE',
    body: params,
  });
}

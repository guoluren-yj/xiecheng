import request from 'utils/request';
import { SRM_DATA_SDAT } from '@/utils/config';

/**
 * 查询默认模板详情
 * @async
 * @function fetchDefaultConfig
 * @param {Object} params
 */
export async function fetchDefaultConfig(params) {
  return request(`${SRM_DATA_SDAT}/v1/wb2-risk-plans/query-create-default`, {
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
  const { riskPlanId = '' } = params;
  return request(`${SRM_DATA_SDAT}/v1/wb2-risk-plans/${riskPlanId}`, {
    method: 'GET',
    query: {
      ...params,
    },
  });
}

export async function fetchSaveDetail(param) {
  return request(`${SRM_DATA_SDAT}/v1/wb2-risk-plans`, {
    method: 'POST',
    body: param,
  });
}

/**
 * 更新启用状态
 * @param {*} param
 * @returns
 */
export async function fetchUpdateConfig(params) {
  return request(`${SRM_DATA_SDAT}/v1/wb2-risk-plans`, {
    method: 'POST',
    body: params,
  });
}

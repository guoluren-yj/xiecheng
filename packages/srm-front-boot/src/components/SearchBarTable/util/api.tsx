import { getCurrentOrganizationId } from "hzero-front/lib/utils/utils";
import { HZERO_PLATFORM } from 'hzero-front/lib/utils/config';
import request from 'hzero-front/lib/utils/request';

/**
 * 获取筛选器
 */
export async function queryFilters(params) {
  return request(`${HZERO_PLATFORM}/v1/${getCurrentOrganizationId()}/ui-filters`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 保存筛选器
 */
export async function saveFilters(params, query) {
  return request(`${HZERO_PLATFORM}/v1/${getCurrentOrganizationId()}/ui-filters`, {
    method: 'POST',
    body: params,
    query,
  });
}
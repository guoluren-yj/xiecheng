import { getCurrentOrganizationId } from 'utils/utils';
import { HZERO_PLATFORM } from 'utils/config';
import request from 'utils/request';

import { SRM_SPC } from '@/utils/constants';

const organizationId = getCurrentOrganizationId();

/**
 * 获取筛选器
 */
export async function queryFilters(params) {
  return request(`${HZERO_PLATFORM}/v1/${organizationId}/ui-filters`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 保存筛选器
 */
export async function saveFilters(params) {
  return request(`${HZERO_PLATFORM}/v1/${organizationId}/ui-filters`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 价格库-请求头配置
 * @async
 * @function fetchPriceLibHeaderConfig
 */
export async function fetchPriceLibHeaderConfig(params) {
  return request(`${SRM_SPC}/v1/${organizationId}/price-lib-tmpl-dims/tableHeaderList`, {
    method: 'POST',
    body: params,
  });
}

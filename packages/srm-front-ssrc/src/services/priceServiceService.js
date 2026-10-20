import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';

import { SRM_SPC } from '_utils/config';
/**
 * 请求API前缀
 * @type {string}
 */
const organizationId = getCurrentOrganizationId();

/**
 * 价格服务定义-保存-平台
 * @async
 * @function savePriceService
 * @returns {object} fetch Promise
 */
export async function savePriceService(params) {
  return request(`${SRM_SPC}/v1/${organizationId}/price-lib-services/platform`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 价格服务定义-保存-租户
 * @async
 * @function savePriceServiceOrg
 * @returns {object} fetch Promise
 */
export async function savePriceServiceOrg(params) {
  return request(`${SRM_SPC}/v1/${organizationId}/price-lib-services`, {
    method: 'POST',
    body: params,
  });
}

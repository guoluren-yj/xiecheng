/**
 * shoppingCart -购物车
 * @date: 2019-7-10
 * @author guozhiqiang <zhiqiang.guo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import { parseParameters, getCurrentOrganizationId } from 'utils/utils';

import request from 'utils/request';
import { SRM_PLATFORM } from '_utils/config.js';

// const SRM_PLATFORM = "http://10.12.0.205:8080/amkt-22304";
const organizationId = getCurrentOrganizationId();

export async function fetchList(params) {
  const { crmTenant, ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(`${SRM_PLATFORM}/v1/${organizationId}/client/shopping-carts`, {
    method: 'GET',
    query: { ...param },
  });
}

export async function fetchServiceList(params) {
  const { ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(`${SRM_PLATFORM}/v1/${organizationId}/partner-service`, {
    method: 'GET',
    query: { ...param },
  });
}

export async function fetchApplicationList(params) {
  const { ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(`${SRM_PLATFORM}/v1/${organizationId}/partner-application`, {
    method: 'GET',
    query: { ...param },
  });
}

export async function fetchDeleteShoppingCart(params) {
  const { selectedRowKeys = [] } = params;
  return request(`${SRM_PLATFORM}/v1/${organizationId}/client/shopping-carts`, {
    method: 'DELETE',
    body: selectedRowKeys,
  });
}

export async function fetchSave(params) {
  const { ...otherParams } = params;
  return request(`${SRM_PLATFORM}/v1/${organizationId}/client/request/requests`, {
    method: 'POST',
    body: otherParams,
  });
}

export async function fetchSubmit(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/client/request/requests/submit`, {
    method: 'POST',
    body: params,
  });
}

export async function deleteApplicationListAsync(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/client/request/fallback`, {
    method: 'POST',
    body: params,
  });
}

export async function fetchServeInfo(params) {
  const { tenantId } = params;
  return request(`${SRM_PLATFORM}/v1/${organizationId}/client/request/contact-user/detail`, {
    method: 'GET',
    query: {
      crmTenant: tenantId,
    },
  });
}

/**
 * 服务申请-申请头
 * @async
 * @function getdate
 * @param {object}  params - 采购申请行ID和租户id
 * @returns {object} fetch Promise
 */
export async function serveDetail(params) {
  const { requestHeaderId } = params;
  return request(`${SRM_PLATFORM}/v1/${organizationId}/client/request/request/detail`, {
    method: 'GET',
    query: { requestHeaderId },
  });
}

/**
 * 服务申请-服务列表
 * @async
 * @function getdate
 * @param {object}  params - 采购申请头ID和租户id
 * @returns {object} fetch Promise
 */
export async function serveQueryList(params) {
  const { requestHeaderId } = params;
  return request(`${SRM_PLATFORM}/v1/${organizationId}/client/request/request/detail/services`, {
    method: 'GET',
    query: { requestHeaderId },
  });
}

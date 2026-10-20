import request from 'utils/request';
import { SRM_PLATFORM } from '_utils/config';

import { getCurrentOrganizationId } from 'utils/utils'; // filterNullValueObject

const organizationId = getCurrentOrganizationId();

/**
 * 获取订单状态
 * @async
 * @function fetchOrderStatus
 */
export async function fetchOrderStatus(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/sign-integration/query-service`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询单家公司认证状态
 * @async
 * @function fetchAuthStatus
 */
export async function fetchAuthStatus(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/sign-integration/node-info`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询公司列表
 * @async
 * @function fetchCompanyList
 */
export async function fetchCompanyList(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/sign-integration/list-supplier-company`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 获取公司认证链接
 * @async
 * @function fetchCompanyAuthUrl
 */
export async function fetchCompanyAuthUrl(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/sign-integration/company-auth`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 获取授权页面
 * @async
 * @function fetchAuthorizedUrl
 */
export async function fetchAuthorizedUrl(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/sign-integration/company-privilege`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 获取印章管理页面
 * @async
 * @function fetchSealManage
 */
export async function fetchSealManage(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/sign-integration/seal-manage`, {
    method: 'POST',
    body: params,
    responseType: 'text',
  });
}

/**
 * 获取静默签授权页面
 * @async
 * @function fetchSealManage
 */
export async function fetchSilentSignManage(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/sign-integration/auth-url`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 保存成员管理
 * @async
 * @function fetchSaveMember
 */
export async function fetchSaveMember(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/sign-integration/add-company-person`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 查询公司详情
 * @async
 * @function fetchCompanyDetail
 */
export async function fetchCompanyDetail(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/sign-integration/company-detail`, {
    method: 'GET',
    query: {
      ...params,
      tenantId: getCurrentOrganizationId(),
    },
  });
}

/**
 * 取消认证
 * @async
 * @function fetchCancelAuth
 */
export async function fetchCancelAuth(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/sign-integration/cancel-company-auth`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 取消授权
 * @async
 * @function fetchCancelAuthorized
 */
export async function fetchCancelAuthorized(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/sign-integration/cancel-company-privilege`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 刷新状态
 * @async
 * @function fetchRefreshAuth
 */
export async function fetchRefreshAuth(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/sign-integration/auth-detail`, {
    method: 'GET',
    query: params,
  });
}

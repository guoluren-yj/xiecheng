import request from 'utils/request';
import { SRM_PLATFORM } from '_utils/config';
import { HZERO_IAM } from 'utils/config';

import { getCurrentOrganizationId } from 'utils/utils'; // filterNullValueObject

const organizationId = getCurrentOrganizationId();

/**
 * 获取订单状态
 * @async
 * @function fetchOrderStatus
 */
export async function fetchOrderStatus(params) {
  // query-service
  return request(`${SRM_PLATFORM}/v1/${organizationId}/sign-integration/query-all-service`, {
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
  return request(`${SRM_PLATFORM}/v1/${organizationId}/sign-integration/list-company`, {
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
 * @function fetchSilentSignManage
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
 * 批量保存成员管理
 * @async
 * @function fetchBatchSaveMember
 */
export async function fetchBatchSaveMember(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/sign-integration/batch/add-company-person`, {
    method: 'POST',
    body: params,
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

/**
 * 获取认证详情
 * @async
 * @function getRealName
 */
export async function getRealName(params) {
  return request(`${HZERO_IAM}/v1/${organizationId}/user-auth-info/auth-detail/${params.userId}`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 获取公司详情
 * @async
 * @function fetchCompanyDetail
 */
export async function fetchCompanyDetail(params) {
  return request(
    `${SRM_PLATFORM}/v1/${getCurrentOrganizationId()}/sign-integration/company-detail`,
    {
      method: 'GET',
      query: params,
    }
  );
}

/**
 * 重置流程
 */
export async function resetProcess(body) {
  const { authInfoId, authType } = body;
  return request(
    `${SRM_PLATFORM}/v1/${organizationId}/company-ca-auth-info/reset_process/${authInfoId}`,
    {
      method: 'PUT',
      query: { authType },
      body,
    }
  );
}

/**
 * 获取docusign认证状态
 * @param {*} params
 * @returns
 */
export async function fetchDocusignStatus(params) {
  return request(`${SRM_PLATFORM}/v1/${getCurrentOrganizationId()}/docusign/query-auth-status`, {
    method: 'GET',
    query: params,
  });
}

/**
 * docusign 获取授权链接
 * @param {*} params
 * @returns
 */
export async function fetchAuth(params) {
  return request(`${SRM_PLATFORM}/v1/${getCurrentOrganizationId()}/docusign/get-auth-url`, {
    method: 'GET',
    query: params,
    // responseType: 'text',
  });
}

/**
 * 取消授权
 * @param {*} params
 * @returns
 */
export async function fetchCancelDocusignAuth(params) {
  return request(
    `${SRM_PLATFORM}/v1/${getCurrentOrganizationId()}/docusign/update-status?authStatus=${
      params.authStatus
    }`,
    {
      method: 'POST',
      body: params,
    }
  );
}

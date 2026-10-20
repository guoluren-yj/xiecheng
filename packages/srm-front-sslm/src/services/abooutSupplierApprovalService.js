/**
 * @Author: 杨一昊 yihao.yang@going-link.com
 * @Date: 2022-07-14 14:00:32
 * @LastEditors: 杨一昊 yihao.yang@going-link.com
 * @LastEditTime: 2022-07-14 17:32:12
 * @FilePath: /srm-front-sslm/src/services/abooutSupplierApprovalService.js
 * @Copyright (c) 2022 by ZhenYun, All Rights Reserved.
 */
import request from 'utils/request';
import { SRM_PLATFORM } from '_utils/config';

export async function tenantAdminApproval(params) {
  return request(`${SRM_PLATFORM}/v1/enterprise-role-applys/batch-approve-success`, {
    method: 'POST',
    body: params,
  });
}

export async function tenantAdminApprovalRefused(params) {
  return request(`${SRM_PLATFORM}/v1/enterprise-role-applys/batch-approve-reject`, {
    method: 'POST',
    body: params,
  });
}

export async function realNameAuthenticationApproval(params) {
  return request(`${SRM_PLATFORM}/v1/user-attestations/batch-approve-success`, {
    method: 'POST',
    body: params,
  });
}

export async function realNameAuthenticationApprovalRefused(params) {
  return request(`${SRM_PLATFORM}/v1/user-attestations/batch-approve-reject`, {
    method: 'POST',
    body: params,
  });
}

export async function associatedEnterprisesDsApproval(params) {
  return request(`${SRM_PLATFORM}/v1/company-attestations/batch-approve-success`, {
    method: 'POST',
    body: params,
  });
}

export async function associatedEnterprisesDsApprovalRefused(params) {
  return request(`${SRM_PLATFORM}/v1/company-attestations/batch-approve-reject`, {
    method: 'POST',
    body: params,
  });
}

export async function queryCount(params) {
  return request(`${SRM_PLATFORM}/v1/enterprise-role-applys/supplierApproving/count`, {
    method: 'GET',
    body: params,
  });
}

/**
 * approvalService - 企业认证审批service
 * @date: 2018-7-24
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { stringify } from 'qs';
import request from 'utils/request';
import { SRM_PLATFORM } from '_utils/config';
import { parseParameters, getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();
export async function queryList(params = {}) {
  const param = parseParameters(params);
  return request(`${SRM_PLATFORM}/v1/company-actions/submited`, {
    method: 'GET',
    query: param,
  });
}
export async function queryTenantList(params = {}) {
  const param = parseParameters(params);
  return request(`${SRM_PLATFORM}/v1/company-actions/${organizationId}/submited-for-tenant`, {
    method: 'GET',
    query: param,
  });
}

export async function queryDetail(params = {}) {
  return request(`${SRM_PLATFORM}/v1/companies/process?${stringify(params)}`);
}

export async function queryCompanyInfo(params = {}) {
  return request(`${SRM_PLATFORM}/v1/companies`, {
    method: 'GET',
    query: params,
  });
}

export async function approve(params = {}) {
  const { data, tenant = false, customizeUnitCode } = params;
  const url = !tenant
    ? `${SRM_PLATFORM}/v1/company-actions/batch-approve`
    : `${SRM_PLATFORM}/v1/company-actions/${organizationId}/batch-approve`;
  return request(url, {
    method: 'POST',
    body: data,
    query: { customizeUnitCode },
  });
}

export async function reject(params = {}) {
  const { tenant = false, ...data } = params;
  const url = !tenant
    ? `${SRM_PLATFORM}/v1/company-actions/reject`
    : `${SRM_PLATFORM}/v1/company-actions/${organizationId}/reject`;
  return request(url, {
    method: 'POST',
    body: data,
  });
}

export async function queryRecord(companyId) {
  return request(`${SRM_PLATFORM}/v1/company-actions/${companyId}/history`);
}

export async function certificationBusiness(params) {
  return request(`${SRM_PLATFORM}/v1/company-actions/batch-approve-auto`, {
    method: 'POST',
    body: params,
  });
}

export async function queryTenantRecord(companyId) {
  return request(`${SRM_PLATFORM}/v1/company-actions/${organizationId}/${companyId}/history`);
}

/**
 * 查询征信配置
 */
export async function fetchSettings(params) {
  return request(`${SRM_PLATFORM}/v1/customize-settings`, {
    method: 'GET',
    body: params,
  });
}

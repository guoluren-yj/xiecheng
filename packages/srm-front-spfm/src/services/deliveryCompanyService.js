/**
 * authorityManagementService - 租户级权限维护 - service
 * @date: 2018-7-31
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { SRM_PLATFORM, SRM_SPUC } from '_utils/config';
import { getCurrentOrganizationId, parseParameters } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

export async function fetchCompanyModalData(params) {
  const param = parseParameters(params);
  return request(`${SRM_PLATFORM}/v1/${organizationId}/user-authority-data/company`, {
    method: 'GET',
    query: param,
  });
}

export async function fetchSupplierModalData(params) {
  const param = parseParameters(params);
  return request(`${SRM_PLATFORM}/v1/lovs/sql/data`, {
    method: 'GET',
    query: param,
  });
}

export async function saveCompanyModalData(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/asn-approve-config-line/save`, {
    method: 'POST',
    body: params,
  });
}

export async function fetchCompaynyData(params) {
  const param = parseParameters(params);
  return request(`${SRM_SPUC}/v1/${organizationId}/asn-approve-config-line`, {
    method: 'GET',
    query: param,
  });
}

export async function deleteCompanyData(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/asn-approve-config-line/delete`, {
    method: 'DELETE',
    body: params,
  });
}

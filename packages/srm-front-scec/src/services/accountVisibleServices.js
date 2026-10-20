/**
 * AccountVisible - 账号目录可见配置 - service层
 * @date: 2019-12-19
 * @author: ZZ <qizheng.wu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import request from 'utils/request';
import { SRM_PLATFORM, SRM_SCEC } from '_utils/config';
import { parseParameters, getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId(); // 租户ID

/**
 * 租户下公司数据查询
 * @export
 * @param {object} params 查询参数
 * @returns
 */
export async function fetchEcCompanyId(params) {
  const param = parseParameters(params);
  return request(`${SRM_PLATFORM}/v1/${organizationId}/user-authority-data/company`, {
    method: 'GET',
    query: param,
  });
}

export async function fetchAccountList(params) {
  const param = parseParameters(params);
  return request(`${SRM_SCEC}/v1/${organizationId}/user-catalog-configs`, {
    method: 'GET',
    query: param,
  });
}

export async function saveAccountList(params) {
  return request(`${SRM_SCEC}/v1/${organizationId}/user-catalog-configs`, {
    method: 'POST',
    body: params,
  });
}

export async function updateAccountList(params) {
  return request(`${SRM_SCEC}/v1/${organizationId}/user-catalog-configs`, {
    method: 'PUT',
    body: params,
  });
}

export async function fetchCatalogList(params) {
  const param = parseParameters(params);
  return request(`${SRM_SCEC}/v1/${organizationId}/catalog-config-details`, {
    method: 'GET',
    query: param,
  });
}

export async function updateCatalogList(params) {
  return request(`${SRM_SCEC}/v1/${organizationId}/catalog-config-details`, {
    method: 'PUT',
    body: params,
  });
}

export async function fetchAssignList(params) {
  const param = parseParameters(params);
  return request(`${SRM_SCEC}/v1/${organizationId}/catalog-config-assigns`, {
    method: 'GET',
    query: param,
  });
}

export async function updateAssignList(params) {
  return request(`${SRM_SCEC}/v1/${organizationId}/catalog-config-assigns`, {
    method: 'PUT',
    body: params,
  });
}

export async function deleteAssignList(params) {
  return request(`${SRM_SCEC}/v1/${organizationId}/catalog-config-assigns`, {
    method: 'DELETE',
    body: params.remoteDel,
  });
}

export async function saveAssignList(params) {
  return request(`${SRM_SCEC}/v1/${organizationId}/catalog-config-assigns`, {
    method: 'POST',
    body: params.param,
  });
}

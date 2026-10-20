import request from 'utils/request';
import { getCurrentOrganizationId, parseParameters } from 'utils/utils';
// import { SRM_SPUC } from '_utils/config';

const organizationId = getCurrentOrganizationId();

export async function addServiceDefine(params) {
  return request(`/smnd/v1/${organizationId}/config/save`, {
    method: 'POST',
    body: params,
  });
}

export async function delServiceDefine(params) {
  const { settingId } = params;
  return request(`/smnd/v1/${organizationId}/config/delete?settingId=${settingId}`, {
    method: 'GET',
  });
}

export async function delDashboardList(params) {
  return request(`/smnd/v1/${organizationId}/data/remove`, {
    method: 'POST',
    body: params,
  });
}

export async function exportDashboardList(params) {
  return request(`/smnd/v1/${organizationId}/data/export`, {
    method: 'POST',
    body: params,
  });
}


export async function getTreeList(params) {
  return request(`/smnd/v1/${organizationId}/data/queryGroup`, {
    method: 'GET',
    query: parseParameters(params),
  });
}

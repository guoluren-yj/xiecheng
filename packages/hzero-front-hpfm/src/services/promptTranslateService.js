import request from 'utils/request';
import { HZERO_PLATFORM } from 'utils/config';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';

const tenantId = getCurrentOrganizationId();
const isTenant = isTenantRoleLevel();
const param = isTenant ? `/${tenantId}` : '';

export async function fetchLanguageInfo(params = {}) {
  return request(`${HZERO_PLATFORM}/v1/languages/list`, {
    method: 'GET',
    query: params,
  });
}

export async function fetchLanguageData(params = {}) {
  return request(`${HZERO_PLATFORM}/v1${param}/prompt-translate/page-list-detail`, {
    method: 'GET',
    query: params,
  });
}

export async function saveLanguageTranslate(params) {
  return request(`${HZERO_PLATFORM}/v1${param}/prompt-translate/update`, {
    method: 'PUT',
    body: params,
  });
}

export async function createLanguageTranslate(params) {
  let realTenantId = tenantId;
  const { isPlatformCreate, ...otherParams } = params || {};
  if (isPlatformCreate) realTenantId = otherParams.tenantId;
  return request(`${HZERO_PLATFORM}/v1/${realTenantId}/prompt-translate/insert`, {
    method: 'POST',
    body: otherParams,
  });
}

export async function deleteLanguageTranslate(params) {
  return request(`${HZERO_PLATFORM}/v1${param}/prompt-translate/delete`, {
    method: 'POST',
    body: params,
  });
}

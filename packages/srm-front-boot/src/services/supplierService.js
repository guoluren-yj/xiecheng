import request from 'utils/request';
import { HZERO_PLATFORM } from 'utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SSLM } from '@/utils/config';

export async function queryCommonSupplier(params) {
  return request(`${HZERO_PLATFORM}/v1/${getCurrentOrganizationId()}/lov-favourite`, {
    method: 'GET',
    query: params,
  });
}

export async function addCommonSupplier(params) {
  return request(`${HZERO_PLATFORM}/v1/${getCurrentOrganizationId()}/lov-favourite/add`, {
    method: 'POST',
    body: params,
  });
}

export async function removeCommonSupplier(params) {
  return request(`${HZERO_PLATFORM}/v1/${getCurrentOrganizationId()}/lov-favourite/remove`, {
    method: 'POST',
    body: params,
  });
}

export async function queryFullSupplier(params) {
  const { pathParams, bodyParams } = params;
  return request(`${SRM_SSLM}/v1/${getCurrentOrganizationId()}/supplier-basics/find`, {
    method: 'POST',
    query: pathParams,
    body: bodyParams,
  });
}

/**
 *查询调查表模板
 *
 * @param {Object} params 查询参数
 */
export async function fetchQuestionnaireTmpl(params) {
  const organizationId = getCurrentOrganizationId();
  return request(`${SRM_SSLM}/v1/${organizationId}/template-modules`, {
    method: 'GET',
    query: params,
  });
}

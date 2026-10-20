import request from 'utils/request';
import { SRM_SQAM } from '_utils/config';
import { parseParameters, getCurrentOrganizationId } from 'utils/utils';

/**
 * 请求API前缀
 * @type {string}
 */
const prefix = `${SRM_SQAM}/v1`;
const organizationId = getCurrentOrganizationId();
export async function fetchData(params) {
  const param = parseParameters(params);
  return request(`${prefix}/${organizationId}/ed-problem-relevant-standards`, {
    method: 'GET',
    query: param,
  });
}
export async function deleteData(params) {
  return request(`${prefix}/${organizationId}/ed-problem-relevant-standards`, {
    method: 'DELETE',
    body: params,
  });
}

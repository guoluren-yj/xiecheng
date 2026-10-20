import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';
// import { SMALL_ORDER } from '_utils/config';

const organizationId = getCurrentOrganizationId(); // 租户ID

export async function fetchEcRecord(params) {
  return request(`/smop/v1/record/${organizationId}/detail`, {
    method: 'GET',
    query: params,
  });
}

export async function retryData(params) {
  return request(`/smep/v1/${organizationId}/ec-history-messages/retry`, {
    method: 'POST',
    query: params,
  });
}

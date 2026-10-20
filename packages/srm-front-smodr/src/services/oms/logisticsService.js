import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';
import { SMALL_ORDER } from '_utils/config';

const organizationId = getCurrentOrganizationId(); // 租户ID

export async function fetchOMSTrackService(params) {
  return request(`${SMALL_ORDER}/v1/${organizationId}/consignment-entrys/track`, {
    method: 'POST',
    body: params,
  });
}

export async function fetchLogis(params) {
  return request(`${SMALL_ORDER}/v1/${organizationId}/aftersales/track`, {
    method: 'GET',
    query: params,
  });
}

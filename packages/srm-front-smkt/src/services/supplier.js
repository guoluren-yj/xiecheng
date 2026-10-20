import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId(); // 租户ID

export async function fetchAddSupplier(params) {
  return request(`/smkt/v1/${organizationId}/pick-suppliers`, {
    method: 'POST',
    body: params,
  });
}

export async function fetchDeleteSupplier(params) {
  return request(`/smkt/v1/${organizationId}/pick-suppliers`, {
    method: 'DELETE',
    body: params,
  });
}

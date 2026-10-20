import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SMBL } from '_utils/config';

const organizationId = getCurrentOrganizationId();

export async function getSubApplicationDetail(subAppId) {
  return request(`${SRM_SMBL}/v1/${organizationId}/sub-application/${subAppId}`, {
    method: 'GET',
  });
}

export async function crateOrUpdate(params) {
  return request(`${SRM_SMBL}/v1/${organizationId}/sub-application`, {
    method: 'PUT',
    body: params,
  });
}

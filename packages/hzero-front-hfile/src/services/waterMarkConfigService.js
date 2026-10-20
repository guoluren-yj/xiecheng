import request from 'utils/request';
import { HZERO_FILE } from 'utils/config';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';

export async function queryWaterConfigDetail(id) {
  return request(
    `${HZERO_FILE}/v1${
      isTenantRoleLevel ? `/${getCurrentOrganizationId()}` : ''
    }/watermark-configs/${id}`,
    {
      method: 'GET',
    }
  );
}

export async function updateWaterConfigDetail(data) {
  return request(
    `${HZERO_FILE}/v1${
      isTenantRoleLevel ? `/${getCurrentOrganizationId()}` : ''
    }/watermark-configs`,
    {
      method: 'PUT',
      body: data,
    }
  );
}

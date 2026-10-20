import request from 'utils/request';
import { SRM_SPCT } from '@/utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

export async function saveData(params) {
  return request(`${SRM_SPCT}/v1/${organizationId}/configs/new-create-update`, {
    method: 'POST',
    body: params,
  });
}

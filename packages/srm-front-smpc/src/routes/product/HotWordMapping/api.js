import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SMPC } from '_utils/config';

const organizationId = getCurrentOrganizationId();

export function saveHotMapping(params, method = 'POST') {
  return request(`${SRM_SMPC}/v1/${organizationId}/hot-word-mappings`, {
    method,
    body: params,
  });
}

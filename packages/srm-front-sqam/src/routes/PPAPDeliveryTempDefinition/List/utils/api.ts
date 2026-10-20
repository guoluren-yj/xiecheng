import request from 'utils/request';
import { SRM_SQAM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();


export async function enableTemplate(body) {
  return request(`${SRM_SQAM}/v1/${organizationId}/access-template-documents/enable`, {
    method: 'PUT',
    body,
  });
}

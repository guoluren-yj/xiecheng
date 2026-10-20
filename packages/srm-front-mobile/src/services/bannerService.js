import request from 'utils/request';
import { SRM_SMBL } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

export async function saveBanner(params) {
  return request(`${SRM_SMBL}/v1/${getCurrentOrganizationId()}/banner`, {
    method: 'POST',
    body: params,
  });
}

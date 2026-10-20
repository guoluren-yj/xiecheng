import { getCurrentOrganizationId } from 'utils/utils';
import request from 'utils/request';

const organizationId = getCurrentOrganizationId();

const apiPrefix = `/smbl/v1/${organizationId}/smbl-sub-application`;

export async function querySubApplication(params) {
  return request(`${apiPrefix}/manage`, {
    method: 'GET',
    query: params,
  });
}

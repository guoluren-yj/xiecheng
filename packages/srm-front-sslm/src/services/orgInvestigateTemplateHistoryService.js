import request from 'utils/request';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

export async function fetchInvestigateList(params) {
  return request(`${SRM_SSLM}/v1/${getCurrentOrganizationId()}/investigate-templates/history`, {
    method: 'GET',
    query: params,
  });
}

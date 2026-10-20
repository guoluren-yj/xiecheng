import request from 'utils/request';
import { SRM_PLATFORM } from '_utils/config';
import { parseParameters } from 'utils/utils';

export async function fetchInvestigateList(params) {
  return request(`${SRM_PLATFORM}/v1/investigate-templates`, {
    method: 'GET',
    query: parseParameters(params),
  });
}
export async function changeInvestigate(params) {
  return request(`${SRM_PLATFORM}/v1/investigate-templates`, {
    method: 'POST',
    body: params,
  });
}

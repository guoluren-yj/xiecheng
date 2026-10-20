import request from 'utils/request';
import { parseParameters, filterNullValueObject } from 'utils/utils';
import { SRM_PLATFORM } from '_utils/config';

export async function fetchEnterprise(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_PLATFORM}/v1/guest-user`, {
    method: 'GET',
    query,
  });
}

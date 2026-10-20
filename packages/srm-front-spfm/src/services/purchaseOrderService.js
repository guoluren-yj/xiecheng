import request from 'utils/request';
import { SRM_SPRM, SRM_PLATFORM } from '_utils/config';
import { parseParameters } from 'utils/utils';

export async function fetchList(params = {}) {
  return request(`${SRM_PLATFORM}/v1/order-types`, {
    method: 'GET',
    query: params,
  });
}

export async function addOrderType(params) {
  return request(`${SRM_PLATFORM}/v1/order-types`, {
    method: 'POST',
    body: params,
  });
}

export async function fetchApplicationType(params) {
  return request(`${SRM_SPRM}/v1/pr-type-site`, {
    method: 'GET',
    query: parseParameters(params),
  });
}

export async function fetchAddApplicationType(params) {
  return request(`${SRM_SPRM}/v1/pr-type-site/save`, {
    method: 'POST',
    body: params,
  });
}

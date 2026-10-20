import request from 'utils/request';
// import { SMALL_ORDER } from '_utils/config';

const SMOP = '/sop';

export async function fetchServiceTitle() {
  return request(`${SMOP}/v1/menu-title/query?code=service`, {
    method: 'GET',
  });
}

export async function updateServiceTitle(param) {
  return request(`${SMOP}/v1/service-deploy/update`, {
    method: 'POST',
    body: param,
  });
}

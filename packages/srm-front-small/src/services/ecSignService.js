import request from 'utils/request';
import { parseParameters, getCurrentOrganizationId } from 'utils/utils';
import { SRM_MALL } from '_utils/config';

const organizationId = getCurrentOrganizationId();

// 激活/终止
export function activeOrStopService(params) {
  return request(`${SRM_MALL}/v1/${organizationId}/ec-signs/active-flag`, {
    method: 'POST',
    body: params,
  });
}

// 发起签约
export function reqSignService(params) {
  return request(`${SRM_MALL}/v1/${organizationId}/ec-signs/sign`, {
    method: 'POST',
    body: params,
  });
}

// 去采购
export function checkInService(params) {
  return request(`${SRM_MALL}/v1/${organizationId}/ec-signs/check-in`, {
    method: 'POST',
    body: params,
  });
}

// 电商账号激活
export function ecClientActiveService(params) {
  return request(`${SRM_MALL}/v1/${organizationId}/ec-signs/offline/active`, {
    method: 'POST',
    body: params,
  });
}

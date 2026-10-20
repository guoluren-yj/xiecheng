import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';
import { SMALL_ORDER } from '_utils/config';

const organizationId = getCurrentOrganizationId(); // 租户ID

export async function fetchDeliveryData(params) {
  // const param = parseParameters(params);
  // console.log(param);
  return request(`${SMALL_ORDER}/v1/${organizationId}/consignment-entrys/header`, {
    method: 'GET',
    query: params,
  });
}

export async function fetchMethod(params) {
  return request(`${SMALL_ORDER}/v1/${organizationId}/freight-entrys/pricing-method`, {
    method: 'GET',
    query: params,
  });
}

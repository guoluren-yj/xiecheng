import request from 'utils/request';
import { getCurrentOrganizationId, parseParameters } from 'utils/utils';
import { SMALL_ORDER } from '_utils/config';

const organizationId = getCurrentOrganizationId(); // 租户ID

// 操作记录查询api
export async function fetchHistory(params) {
  const param = parseParameters(params);
  return request(`${SMALL_ORDER}/v1/${organizationId}/order-entry-records`, {
    method: 'GET',
    query: param,
  });
}

export async function fetchInvoHistory(params) {
  const param = parseParameters(params);
  return request(`${SMALL_ORDER}/v1/${organizationId}/invoice-records`, {
    method: 'GET',
    query: param,
  });
}

export async function fetchPayHistory(params) {
  const param = parseParameters(params);
  return request(`${SMALL_ORDER}/v1/${organizationId}/payment-records`, {
    method: 'GET',
    query: param,
  });
}

export async function fetchSaleHistory(params) {
  const param = parseParameters(params);
  return request(`${SMALL_ORDER}/v1/${organizationId}/after-sale-records`, {
    method: 'GET',
    query: param,
  });
}

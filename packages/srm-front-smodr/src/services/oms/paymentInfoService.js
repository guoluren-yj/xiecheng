import request from 'utils/request';
import { getCurrentOrganizationId, parseParameters } from 'utils/utils';
import { SMALL_ORDER } from '_utils/config';

const organizationId = getCurrentOrganizationId(); // 租户ID

export async function fetchPayList(params) {
  return request(`${SMALL_ORDER}/v1/${organizationId}/payments/payment-detail`, {
    method: 'GET',
    query: params,
  });
}

export async function fetchOrderPayList(params) {
  const param = parseParameters(params);
  return request(`${SMALL_ORDER}/v1/${organizationId}/payment-entrys/product`, {
    method: 'GET',
    query: param,
  });
}

export async function fetchOrderFreList(params) {
  const param = parseParameters(params);
  return request(`${SMALL_ORDER}/v1/${organizationId}/payment-entrys/freight`, {
    method: 'GET',
    query: param,
  });
}

export async function fetchRefundList(params) {
  const param = parseParameters(params);
  return request(`${SMALL_ORDER}/v1/${organizationId}/refunds/refund-detail`, {
    method: 'GET',
    query: param,
  });
}

export async function fetchRefundProList(params) {
  const param = parseParameters(params);
  return request(`${SMALL_ORDER}/v1/${organizationId}/payment-entrys/product`, {
    method: 'GET',
    query: param,
  });
}

export async function fetchRefundFreList(params) {
  const param = parseParameters(params);
  return request(`${SMALL_ORDER}/v1/${organizationId}/payment-entrys/freight`, {
    method: 'GET',
    query: param,
  });
}

export async function fetchOrderPayment(params) {
  const param = parseParameters(params);
  return request(`${SMALL_ORDER}/v1/${organizationId}/payments/payment-order`, {
    method: 'GET',
    query: { ...param },
  });
}

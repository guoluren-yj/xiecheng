import request from 'utils/request';
import { getCurrentOrganizationId, parseParameters } from 'utils/utils';
import { SMALL_ORDER, SRM_PLATFORM } from '_utils/config';

const organizationId = getCurrentOrganizationId(); // 租户ID

// 支付记录查询api
export async function fetchPaymentRecord(params) {
  const param = parseParameters(params);
  return request(`${SMALL_ORDER}/v1/${organizationId}/payments/payment-order`, {
    method: 'GET',
    query: { ...param },
  });
}

// 支付头查询api
export async function fetchPaymentHead(params) {
  const param = parseParameters(params);
  return request(`${SMALL_ORDER}/v1/${organizationId}/payments/detail`, {
    method: 'GET',
    query: param,
  });
}

// 支付行查询api
export async function fetchPaymentPro(params) {
  const param = parseParameters(params);
  return request(`${SMALL_ORDER}/v1/${organizationId}/payments/entry-detail`, {
    method: 'GET',
    query: param,
  });
}

export async function fetchPurchaseCompany() {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/user-authority-data/company`, {
    method: 'GET',
    // query: { tenantId: organizationId },
  });
}

// 立即支付™
export async function quickPay(params) {
  return request(`${SMALL_ORDER}/v1/${organizationId}/payments/payment-create`, {
    method: 'POST',
    body: { ...params },
  });
}

// 立即支付批量
export async function quickBatchPay(params) {
  return request(`${SMALL_ORDER}/v1/${organizationId}/payments/merge-payment-create`, {
    method: 'POST',
    body: { ...params },
  });
}

// 回跳查询
export async function fetchCallbackInfo(params) {
  return request(`${SMALL_ORDER}/v1/${organizationId}/payments/payment-result-handle`, {
    method: 'POST',
    body: params,
  });
}

export async function applyRefund(params) {
  return request(`${SMALL_ORDER}/v1/${organizationId}/refunds/refund-request`, {
    method: 'POST',
    body: params,
  });
}

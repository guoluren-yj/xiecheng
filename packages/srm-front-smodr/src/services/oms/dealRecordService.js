import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';
import { SMALL_ORDER } from '_utils/config';

const organizationId = getCurrentOrganizationId(); // 租户ID

export async function fetchDetail(params) {
  const { operationType, ...other } = params;
  const url =
    operationType === 'PAYMENT'
      ? `${SMALL_ORDER}/v1/${organizationId}/payments/payment-detail`
      : `${SMALL_ORDER}/v1/${organizationId}/refunds/refund-detail`;
  return request(url, {
    method: 'GET',
    query: { ...other },
  });
}

export async function fetchDealDetail(params) {
  const { operationType, ...other } = params;
  const url = `${SMALL_ORDER}/v1/${organizationId}/trading-record/detail`;
  return request(url, {
    method: 'GET',
    query: { ...other },
  });
}

export async function fetchDetailInfo(params) {
  const url = `${SMALL_ORDER}/v1/${organizationId}/payments/merge-payment-review`;
  return request(url, {
    method: 'POST',
    body: params,
  });
}

export async function fetchDetailList(params) {
  const url = `${SMALL_ORDER}/v1/${organizationId}/payments/merge-payment-order-review`;
  return request(url, {
    method: 'POST',
    body: params,
  });
}

export async function handleSubmitPay(params) {
  const url = `${SMALL_ORDER}/v1/${organizationId}/payments/payment-confirm`;
  return request(url, {
    method: 'POST',
    body: params,
  });
}

export async function handleSubmit(params) {
  const url = `${SMALL_ORDER}/v1/${organizationId}/payments/payment-upload`;
  return request(url, {
    method: 'POST',
    body: params,
  });
}

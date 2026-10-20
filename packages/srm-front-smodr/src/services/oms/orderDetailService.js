import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';
import { SMALL_ORDER } from '_utils/config';

const organizationId = getCurrentOrganizationId();

export async function handlePrint(orderId) {
  return request(`${SMALL_ORDER}/v1/${organizationId}/order-entrys/order-entry-print`, {
    method: 'POST',
    body: orderId,
    responseType: 'blob',
  });
}

export async function addBills(param) {
  return request(`${SMALL_ORDER}/v1/${organizationId}/pick-entrys/quote-preview`, {
    method: 'POST',
    body: param,
  });
}

export async function submitBills(param) {
  return request(`${SMALL_ORDER}/v1/${organizationId}/pick-entrys/quote-submit`, {
    method: 'POST',
    body: param,
  });
}

export async function submitReceive(param) {
  return request(`${SMALL_ORDER}/v1/${organizationId}/consignment-entrys/receive-confirm`, {
    method: 'POST',
    body: param,
  });
}

export async function queryReceive(param) {
  return request(`${SMALL_ORDER}/v1/${organizationId}/consignment-entrys/receive-confirm-select`, {
    method: 'POST',
    body: param,
  });
}

// 发起重试
export async function fetchRetryService(data) {
  return request(`${SMALL_ORDER}/v1/${organizationId}/document-synchronization-records/resend`, {
    method: 'GET',
    query: data,
  });
}

export async function orderDetailSaveService(param) {
  return request(`${SMALL_ORDER}/v1/${organizationId}/orders/oms-order-change-save`, {
    method: 'POST',
    body: param,
  });
}

// 订单详情提交
export async function orderDetailSubmitService(param) {
  return request(`${SMALL_ORDER}/v1/${organizationId}/orders/oms-order-change-submit`, {
    method: 'POST',
    body: param,
  });
}

// 订单编辑取消
export async function orderDetailCancelService(param) {
  return request(`${SMALL_ORDER}/v1/${organizationId}/orders/mall-preempt-cancel`, {
    method: 'POST',
    body: param,
  });
}

// 根据业务实体查询采买组织
export async function fetchPurOrganizationService(data) {
  return request(`/smdm/v1/${organizationId}/purchase-organization/query`, {
    method: 'GET',
    query: data,
  });
}

// 预算校验
export async function orderBudgetValidateService(param) {
  return request(`${SMALL_ORDER}/v1/${organizationId}/orders/order-budget-validate`, {
    method: 'POST',
    body: param,
  });
}

export async function fetchAICompareService(param) {
  return request(`${SMALL_ORDER}/v1/${organizationId}/order-entrys/his-order/chart-data`, {
    method: 'POST',
    body: param,
  });
}

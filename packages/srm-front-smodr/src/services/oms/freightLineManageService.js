import request from 'utils/request';
import { HZERO_PLATFORM } from 'utils/config';
import { getCurrentOrganizationId, parseParameters } from 'utils/utils';
import { SMALL_ORDER, SRM_PLATFORM } from '_utils/config';

const organizationId = getCurrentOrganizationId(); // 租户ID

// 批量查询值集
export async function fetchBatchCodes(params) {
  return request(`${HZERO_PLATFORM}/v1/${organizationId}/lovs/value/batch`, {
    method: 'GET',
    query: params,
  });
}

// 公司查询接口
export async function fetchCompany() {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/user-authority-data/supplier`, {
    method: 'GET',
    query: { tenantId: organizationId },
  });
}

// 运费行查询api
export async function fetchFreightLine(params) {
  const param = parseParameters(params);
  return request(`${SMALL_ORDER}/v1/${organizationId}/freight-entrys`, {
    method: 'GET',
    query: param,
  });
}

// 订单头查询api
export async function fetchExtensionHeader(params) {
  return request(`${SMALL_ORDER}/v1/${organizationId}/orders/detail`, {
    method: 'GET',
    query: params,
  });
}

// 运费行拓展信息
export async function fetchExtensionLine(params) {
  return request(`${SMALL_ORDER}/v1/${organizationId}/freight-entrys/detail`, {
    method: 'GET',
    query: params,
  });
}

// 运费行预占信息拓展
export async function fetchPreemptInfo(params) {
  return request(`${SMALL_ORDER}/v1/${organizationId}/freight-entrys/preempt`, {
    method: 'GET',
    query: params,
  });
}

// 运费行配送信息拓展
export async function fetchConsignInfo(params) {
  return request(`${SMALL_ORDER}/v1/${organizationId}/freight-entrys/consignment`, {
    method: 'GET',
    query: params,
  });
}

// 运费行接收信息拓展
export async function fetchReceiptInfo(params) {
  return request(`${SMALL_ORDER}/v1/${organizationId}/freight-entrys/receipt`, {
    method: 'GET',
    query: params,
  });
}

// 运费行对账信息拓展
export async function fetchStatementsInfo(params) {
  return request(`${SMALL_ORDER}/v1/${organizationId}/freight-entrys/statements`, {
    method: 'GET',
    query: params,
  });
}

// 运费行审批信息拓展
export async function fetchApproveInfo(params) {
  return request(`${SMALL_ORDER}/v1/${organizationId}/freight-entrys/approve`, {
    method: 'GET',
    query: params,
  });
}

// 运费行审批信息拓展
export async function fetchCancelInfo(params) {
  return request(`${SMALL_ORDER}/v1/${organizationId}/freight-entrys/cancel`, {
    method: 'GET',
    query: params,
  });
}

export async function fetchProducts(params) {
  const param = parseParameters(params);
  return request(`${SMALL_ORDER}/v1/${organizationId}/freight-entrys/relevance-product`, {
    method: 'GET',
    query: param,
  });
}

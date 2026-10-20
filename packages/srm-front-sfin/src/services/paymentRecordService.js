/**
 * service - 付款记录
 * @date: 2020-3-9
 * @author: gzq <zhiqiang.guo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import request from 'utils/request';
import { SRM_FINANCE } from '_utils/config';
import { parseParameters, filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

/**
 * 付款记录详情
 * @param {Object} params - 请求参数
 */
export async function fetchDetailHeader(params) {
  const { id, ...otherParams } = params;
  const query = filterNullValueObject(parseParameters(otherParams));
  return request(`${SRM_FINANCE}/v1/${organizationId}/payment-records/detail/${id}`, {
    method: 'GET',
    query,
  });
}

/**
 * 付款记录列表
 */
export async function fetchList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_FINANCE}/v1/${organizationId}/payment-records/list`, {
    method: 'GET',
    query,
  });
}

/**
 * 付款记录列表
 */
export async function fetchAssociatedInvoiceList(params) {
  const { id, ...otherParams } = params;
  const query = filterNullValueObject(parseParameters(otherParams));
  return request(`${SRM_FINANCE}/v1/${organizationId}/payment-record-invoices/${id}`, {
    method: 'GET',
    query,
  });
}

/**
 * 付款方式列表
 */
export async function fetchPaymentMethodList(params) {
  const { id, ...otherParams } = params;
  const query = filterNullValueObject(parseParameters(otherParams));
  return request(`${SRM_FINANCE}/v1/${organizationId}/payment-type-records/${id}`, {
    method: 'GET',
    query,
  });
}

/**
 * 预付款信息列表
 */
export async function fetchPrepaymentInformationList(params) {
  const { id, ...otherParams } = params;
  const query = filterNullValueObject(parseParameters(otherParams));
  return request(`${SRM_FINANCE}/v1/${organizationId}/advance-payment-records/${id}`, {
    method: 'GET',
    query,
  });
}

/**
 * 扣款信息列表
 */
export async function fetchDeductionInformationList(params) {
  const { id, ...otherParams } = params;
  const query = filterNullValueObject(parseParameters(otherParams));
  return request(`${SRM_FINANCE}/v1/${organizationId}/payment-record-deductions/${id}`, {
    method: 'GET',
    query,
  });
}

/**
 * 删除
 */
export async function deleteList(params) {
  return request(`${SRM_FINANCE}/v1/${organizationId}/payment-records/batchDelete`, {
    method: 'DELETE',
    body: params,
  });
}

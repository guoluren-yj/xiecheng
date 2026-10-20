/**
 * onlyInvoiceRule.js - 开票即对账规则
 * @date: 2018-11-12
 * @author: geekrainy <chao.zheng02@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { getCurrentOrganizationId, parseParameters } from 'utils/utils';
import { SRM_SPUC, SRM_FINANCE } from '_utils/config';

const organizationId = getCurrentOrganizationId();

/**
 * 查询对账单规则
 * @param {Object} params - 请求参数
 */
export async function fetchBillRule(params) {
  const query = parseParameters(params);
  return request(`${SRM_FINANCE}/v1/${organizationId}/invoice-rules/queryRules`, {
    method: 'GET',
    query,
  });
}

/**
 * 批量保存对账单规则
 * @param {Object} params - 请求参数
 */
export async function saveBillRule(params) {
  return request(`${SRM_FINANCE}/v1/${organizationId}/invoice-rules`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 批量删除对账单规则
 * @param {Object} params - 请求参数
 */
export async function deleteBillRule(params) {
  return request(`${SRM_FINANCE}/v1/${organizationId}/invoice-rules`, {
    method: 'DELETE',
    body: params,
  });
}
/**
 * 批量删除无需对账单规则
 * @param {Object} params - 请求参数
 */
export async function deleteNotBillRule(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/invoice-rules/notBill`, {
    method: 'DELETE',
    body: params,
  });
}

/**
 * 查询对账单规则明细
 * @param {Object} params - 请求参数
 */
export async function fetchRuleDetail(params) {
  const query = parseParameters(params);
  return request(`${SRM_FINANCE}/v1/${organizationId}/invoice-rule-detail`, {
    method: 'GET',
    query,
  });
}

/**
 * 查询对账单规则明细
 * @param {Object} params - 请求参数
 */
export async function fetchRuleType(params) {
  return request(`${SRM_FINANCE}/v1/${organizationId}/invoice-rules/queryType`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 加入全部
 * @param {Object} params - 请求参数
 */
export async function addAll(params) {
  return request(`${SRM_FINANCE}/v1/${organizationId}/invoice-rules/invoiceAll`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 保存
 * @param {Object} params - 请求参数
 */
export async function saveRuleDetail(params) {
  return request(`${SRM_FINANCE}/v1/${organizationId}/invoice-rule-detail`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 保存
 * @param {Object} params - 请求参数
 */
export async function deleteRuleDetail(params) {
  return request(`${SRM_FINANCE}/v1/${organizationId}/invoice-rule-detail`, {
    method: 'DELETE',
    body: params,
  });
}

/**
 * selectSupplierLov - 供应商选择lov
 * @export
 * @param {*} params
 * @returns
 */
export async function fetchSupplierLovData(params) {
  const param = parseParameters(params);
  return request(`${SRM_FINANCE}/v1/${organizationId}/invoice-rule-detail/notAdded`, {
    method: 'GET',
    query: param,
  });
}

export async function saveSecondConfirm(params) {
  return request(
    `${SRM_FINANCE}/v1/${organizationId}/invoice-rule-detail/second-confirmation-flag/save`,
    {
      method: 'PUT',
      body: params,
    }
  );
}

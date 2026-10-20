/**
 * index.js - 公用service
 * @date: 2019-11-13
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */

import request from 'utils/request';
// import { HZERO_PLATFORM } from 'utils/config';
import { SRM_FINANCE } from '_utils/config';
import { parseParameters, filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

/**
 * 操作记录
 * @param {Object} params - 请求参数
 */
export async function fetchOperationRecordList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_FINANCE}/v1/${organizationId}/deduction-action/page`, {
    method: 'GET',
    query: {
      ...query,
      supplierDeductionsId: params.supplierDeductionsId,
    },
  });
}
/**
 * 扣款单可关联订单查询
 * @param {Object} params - 请求参数
 */
export async function fetchOrder(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_FINANCE}/v1/${organizationId}/supplier-deduction/order`, {
    method: 'GET',
    query,
  });
}

/**
 * 扣款单可关联协议查询
 * @param {Object} params - 请求参数
 */
export async function fetchContract(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_FINANCE}/v1/${organizationId}/supplier-deduction/contarct`, {
    method: 'GET',
    query,
  });
}

/**
 * 来源单据
 * @param {Object} params - 请求参数
 */
export async function fetchSourceList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_FINANCE}/v1/${organizationId}/upstream-deduction-relations`, {
    method: 'GET',
    query,
  });
}

/**
 * 来源单据 保存
 * @param {Object} params - 请求参数
 */
export async function saveSource(params) {
  return request(`${SRM_FINANCE}/v1/${organizationId}/upstream-deduction-relations`, {
    method: 'POST',
    body: params.lines,
  });
}

/**
 * 来源单据 删除
 * @param {Object} params - 请求参数
 */
export async function deleteSource(params) {
  return request(`${SRM_FINANCE}/v1/${organizationId}/upstream-deduction-relations`, {
    method: 'DELETE',
    body: params.dataSource,
  });
}

/**
 * 查询供应商列表
 * @param {Object} params - 请求参数
 */
export async function queryList(params) {
  console.log('params', params);
  return request(`${SRM_FINANCE}/v1/${organizationId}/supplier-deduction/page`, {
    method: 'GET',
    query: { ...params },
  });
}

/**
 * payApproveService.js - 付款申请审批
 * @date: 2019-12-10
 * @author: pengna <na.peng@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */

import request from 'utils/request';
// import { HZERO_PLATFORM } from 'utils/config';
import { SRM_FINANCE } from '_utils/config';
import { parseParameters, filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

/**
 * 查询供应商列表
 * @param {Object} params - 请求参数
 */
export async function queryList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_FINANCE}/v1/${organizationId}/payment-headers/approval-list`, {
    method: 'GET',
    query,
  });
}

/**
 * 查询操作记录
 * @param {Object} params - 请求参数
 */
export async function fetchOperationRecordList(params) {
  const { paymentHeaderId, ...query } = filterNullValueObject(parseParameters(params));
  return request(`${SRM_FINANCE}/v1/${organizationId}/payment-actions/${paymentHeaderId}/page`, {
    method: 'GET',
    query,
  });
}

/**
 * 审批通过
 * @param {Object} params - 请求参数
 */
export async function approve(params) {
  const { customizeUnitCode, approvedRemark, paymentHeaderList } = params;
  return request(
    `${SRM_FINANCE}/v1/${organizationId}/payment-headers/approve/approval?customizeUnitCode=${customizeUnitCode}`,
    {
      method: 'POST',
      query: { approvedRemark },
      body: paymentHeaderList,
    }
  );
}

/**
 * 审批拒绝
 * @param {Object} params - 请求参数
 */
export async function reject(params) {
  const { approvedRemark, paymentHeaderList } = params;
  return request(`${SRM_FINANCE}/v1/${organizationId}/payment-headers/approve/reject`, {
    method: 'POST',
    query: { approvedRemark },
    body: paymentHeaderList,
  });
}

/**
 * 查询头信息
 * @param {Object} params - 请求参数
 */
export async function queryHeader(params) {
  const { customizeUnitCode, paymentHeaderId } = params;
  return request(
    `${SRM_FINANCE}/v1/${organizationId}/payment-headers/query-header/${paymentHeaderId}?customizeUnitCode=${customizeUnitCode}`,
    {
      method: 'GET',
    }
  );
}

// 查询发票行信息

export async function fetchInvoiceLine(params) {
  const { paymentHeaderId, ...query } = filterNullValueObject(parseParameters(params));
  return request(`${SRM_FINANCE}/v1/${organizationId}/payment-lines/query-line/${paymentHeaderId}`, {
    method: 'GET',
    query,
  });
}

// 预付款申请明细-查询明细行
export async function fetchAdvanceLine(params) {
  const { customizeUnitCode, paymentHeaderId, ...query } = filterNullValueObject(
    parseParameters(params)
  );
  return request(
    `${SRM_FINANCE}/v1/${organizationId}/payment-advance-lines/${paymentHeaderId}/lines?customizeUnitCode=${customizeUnitCode}`,
    {
      method: 'GET',
      query,
    }
  );
}

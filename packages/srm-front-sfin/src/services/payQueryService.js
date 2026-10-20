/**
 * payApproveService.js - 付款申请审批
 * @date: 2019-12-10
 * @author: pengna <na.peng@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */

import request from 'utils/request';
// import { HZERO_PLATFORM } from 'utils/config';
import { SRM_PLATFORM, SRM_FINANCE } from '_utils/config';
import { parseParameters, filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

/**
 * 查询列表
 * @param {Object} params - 请求参数
 */
export async function queryList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_FINANCE}/v1/${organizationId}/payment-headers/list`, {
    method: 'GET',
    query,
  });
}

/**
 * 查询头信息
 * @param {Object} params - 请求参数
 */
export async function queryHeader(params) {
  const { paymentHeaderId, customizeUnitCode } = params;
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
  return request(
    `${SRM_FINANCE}/v1/${organizationId}/payment-lines/query-line/${paymentHeaderId}`,
    {
      method: 'GET',
      query,
    }
  );
}
// 查询发票行信息
export async function fetchLine(params) {
  const { paymentHeaderId, ...query } = filterNullValueObject(parseParameters(params));
  return request(
    `${SRM_FINANCE}/v1/${organizationId}/payment-lines/query-line-invoice/${paymentHeaderId}`,
    {
      method: 'GET',
      query,
    }
  );
}

// 预付款申请明细-查询明细行
export async function fetchAdvanceLine(params) {
  const { paymentHeaderId, ...query } = filterNullValueObject(parseParameters(params));
  return request(
    `${SRM_FINANCE}/v1/${organizationId}/payment-advance-lines/${paymentHeaderId}/lines`,
    {
      method: 'GET',
      query,
    }
  );
}

// 查询配置项
export async function getConfigByPayment(settingCode) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/settings/${settingCode}`, {
    method: 'GET',
  });
}

export async function returnPaymentHeader(payload) {
  console.log(payload);
  const { payQueryRow } = payload;
  return request(`${SRM_FINANCE}/v1/${organizationId}/payment-headers/return`, {
    method: 'POST',
    body: payQueryRow,
  });
}

/**
 * 查询到票付款明细行
 * @param {Object} params - 请求参数
 */
export async function queryPayDetailLine(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_FINANCE}/v1/${organizationId}/payment-lines`, {
    method: 'GET',
    query,
  });
}

/**
 * 查询预付款申请明细行
 * @param {Object} params - 请求参数
 */
export async function queryPayAdvanceDetailLine(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_FINANCE}/v1/${organizationId}/payment-advance-lines`, {
    method: 'GET',
    query,
  });
}

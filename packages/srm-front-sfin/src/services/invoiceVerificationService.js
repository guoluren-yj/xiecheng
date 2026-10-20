/**
 * index - 发票验真
 * @date: 2019-07-24
 * @author: zuoxaingyu <xaingyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */

import request from 'utils/request';
import { API_HOST } from 'utils/config';
import { SRM_SPUC, SRM_FINANCE } from '_utils/config';

import { getCurrentOrganizationId, parseParameters, filterNullValueObject } from 'utils/utils';

// const SRM_SPUC = '/spuc';

const organizationId = getCurrentOrganizationId();

// 查询 -- 待检验
export async function queryAwaitVerifyList(params) {
  // 过滤掉空的
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_FINANCE}/v1/${organizationId}/tax-invoice-check/page`, {
    method: 'GET',
    query,
  });
}

// 查询 -- 已检验
export async function queryVerfiedList(params) {
  // 过滤掉空的
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_FINANCE}/v1/${organizationId}/tax-invoice-check/page`, {
    method: 'GET',
    query,
  });
}

/**
 * 查询请求
 * @export
 * @param {?string} params.prNum - 申请编号
 * @param {?string} params.prStatusCode - 状态
 * @param {?string} params.prSourcePlatform - 单据来源
 * @param {?string} params.createdDateStart - 创建日期从
 * @param {?string} params.createdDateEnd - 创建日期至
 * @param {?string} params.neededDateStart - 需求日期从
 * @param {?string} params.neededDateEnd - 需求日期至
 */
export async function searchList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${API_HOST}/v1/${organizationId}/purchase-requests/lines/cancel`, {
    method: 'GET',
    query,
  });
}

/**
 *  发票检验 -- 待检验 -- 保存
 * */
export async function update(body) {
  return request(`${SRM_FINANCE}/v1/${organizationId}/tax-invoice-check`, {
    method: 'POST',
    body: body.lines,
  });
}

/**
 *  发票检验 -- 待检验 -- 删除
 * */
export async function deleteList(params) {
  const { body } = params;
  return request(`${SRM_FINANCE}/v1/${organizationId}/tax-invoice-check/batch`, {
    method: 'DELETE',
    body,
  });
}

/**
 *  发票检验 -- 待检验
 * */
export async function examine(body) {
  return request(`${SRM_FINANCE}/v1/${organizationId}/tax-invoice-check/check`, {
    method: 'POST',
    body,
  });
}

/**
 *  发票检验 -- 已检验
 * */
export async function verExamine(body) {
  return request(`${SRM_FINANCE}/v1/${organizationId}/tax-invoice-check/check`, {
    method: 'POST',
    body,
  });
}

/**
 * 打印
 * @async
 * @param {!number} taxInvoiceCheckId - 发票检验明细id
 * @function print
 */
export async function print(taxInvoiceCheckId) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/${taxInvoiceCheckId}/print`, {
    method: 'GET',
    responseType: 'blob',
  });
}

/**
 *  税务发票查验明细查询
 * */
export async function verCheckDetailQuery(body) {
  const { checkInfoId } = body;
  return request(`${SRM_FINANCE}/v1/${organizationId}/tax-invoice-check-info/${checkInfoId}`, {
    method: 'GET',
    // body,
  });
}

/**
 *  ocr识别
 * */
export async function ocrCheck(body) {
  return request(`${SRM_FINANCE}/v1/${organizationId}/tax-invoice-check/ocr-import`, {
    method: 'POST',
    body: body.list,
  });
}

/**
 *  ofd 解析
 * */
export async function ofdCheck(body) {
  return request(`${SRM_FINANCE}/v1/${organizationId}/tax-invoice-check/ofd-import`, {
    method: 'POST',
    body: body.list,
  });
}

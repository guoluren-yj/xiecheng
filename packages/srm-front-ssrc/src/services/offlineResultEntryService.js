/**
 * service - 线下询价结果录入
 * @date: 2019-03-05
 * @author: Nemo <yingbin.jiang@hand-china.com>
 * @version: 1.0.0
 * @copyright: Copyright (c) 2019, Hand
 */

import request from 'utils/request';
import { SRM_SSRC } from '_utils/config';
import { getCurrentOrganizationId, parseParameters } from 'utils/utils';

/**
 * 请求API前缀
 * @type {string}
 */
const prefix = `${SRM_SSRC}/v1`;

/**
 * 询报价查询
 * @async
 * @function fetchQuoteList
 * @param {object} params - 查询条件
 * @param {!number} [params.page = 0] - 数据页码
 * @param {!number} [params.size = 10] - 分页大小
 * @returns {object} fetch Promise
 */
export async function fetchRFxList(params) {
  const organizationId = getCurrentOrganizationId();
  const param = parseParameters(params);
  return request(`${prefix}/${organizationId}/rfx/off-line/list`, {
    method: 'GET',
    query: { ...param },
  });
}

/**
 *  查询询报价头详情
 * @param {*} params
 */
export async function fetchInquiryHeader(params) {
  const organizationId = getCurrentOrganizationId();
  const { rfxHeaderId, customizeUnitCode = null } = params;
  return request(`${prefix}/${organizationId}/rfx/${rfxHeaderId}/off-line`, {
    method: 'GET',
    query: { customizeUnitCode },
  });
}

/**
 *  查询询报价头详情
 * @param {*} params
 */
export async function fetchQuoteLineList(params) {
  const organizationId = getCurrentOrganizationId();
  const param = parseParameters(params);
  return request(`${prefix}/${organizationId}/rfx/off-line/supplier/list-by-condition`, {
    method: 'GET',
    query: { ...param },
  });
}

/**
 *  保存报价明细行
 * @param {*} params
 */
export async function saveQuoteLine(params = {}) {
  const organizationId = getCurrentOrganizationId();
  const { customizeUnitCode = null, ...others } = params || {};
  return request(`${prefix}/${organizationId}/rfx/off-line`, {
    method: 'POST',
    query: { customizeUnitCode },
    body: others,
  });
}

/**
 *  提交报价单
 * @param {*} params
 */
export async function submitQuoteData(params) {
  const organizationId = getCurrentOrganizationId();
  const { customizeUnitCode = null, weakCtrlConfirmFlag, ...others } = params;
  return request(`${prefix}/${organizationId}/rfx/off-line/submit`, {
    method: 'POST',
    query: { customizeUnitCode, weakCtrlConfirmFlag },
    body: others,
  });
}

export async function deleteQuoteLines(params) {
  const organizationId = getCurrentOrganizationId();
  return request(`${prefix}/${organizationId}/rfx/off-line`, {
    method: 'DELETE',
    body: params.remoteDelete,
  });
}

// 查询物品行
export async function fetchItemList(params) {
  const organizationId = getCurrentOrganizationId();
  const { rfxHeaderId, ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(`${prefix}/${organizationId}/rfx/${rfxHeaderId}/items`, {
    method: 'GET',
    query: { ...param },
  });
}

export async function quotationFeedBack(params) {
  const organizationId = getCurrentOrganizationId();
  return request(`${prefix}/${organizationId}/rfx/all/list`, {
    method: 'GET',
    query: { ...params },
  });
}

/**
 * 结束报价
 * @param {Object} params 参数
 */
export async function finishQuotation(params) {
  const organizationId = getCurrentOrganizationId();
  return request(`${prefix}/${organizationId}/rfx/terminate`, {
    method: 'POST',
    body: params.rfxHeaderIds,
  });
}

/**
 *  保存上传附件
 * @param {*} params
 */
export async function saveUploadAttachment(params) {
  const organizationId = getCurrentOrganizationId();
  const { customizeUnitCode = null, newData = [] } = params;
  return request(`${prefix}/${organizationId}/rfx/off-line/quotation-header/update`, {
    method: 'POST',
    query: { customizeUnitCode },
    body: newData,
  });
}

/**
 * 线下结果录入提交校验接口
 * @param {*} params
 */
export async function validateOfflineResultSubmit(params = {}) {
  const organizationId = getCurrentOrganizationId();
  const { customizeUnitCode, ...others } = params;
  return request(`${prefix}/${organizationId}/rfx/off-line/submit-validate`, {
    method: 'POST',
    query: { customizeUnitCode },
    body: others,
  });
}

// 删除供应商列表行数据
export async function deleteSupplierDatas(body) {
  const organizationId = getCurrentOrganizationId();
  return request(`${prefix}/${organizationId}/rfx/off-line/qualification-expired/remove`, {
    method: 'DELETE',
    body: body.map(item => ({ ...item, tenantId: organizationId })),
  });
}

// 线下寻源结果录入-资质到期信息提醒
export async function getQualificationWarnInfo(rfxHeaderId) {
  const organizationId = getCurrentOrganizationId();
  return request(`${prefix}/${organizationId}/rfx/suppliers/qualification-expired-info`, {
    method: 'POST',
    body: { rfxHeaderId, offlineFlag: 1 },
  });
}

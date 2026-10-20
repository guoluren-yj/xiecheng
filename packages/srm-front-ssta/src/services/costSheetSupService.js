/*
 * @Description:
 * @Date: 2020-08-20 11:33:13
 * @author: zhangyongxuan <yongxuan.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */

import request from 'utils/request';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
/**
 * 请求API前缀
 * @type {string}
 */
const organizationId = getCurrentOrganizationId();
const prefix = `/ssta/v1/${organizationId}`;

/**
 * 获取详情
 */
export async function getDetail(chargeHeaderId, customizeUnitCode, templateInfo = {}) {
  return request(
    `${prefix}/charge-headers/${chargeHeaderId}?customizeUnitCode=${customizeUnitCode}`,
    {
      method: 'GET',
      query: templateInfo,
    }
  );
}

/**
 * 获取精度
 */
export async function amount(currencyCode) {
  return request(`${prefix}/amount?currencyCode=${currencyCode}`, {
    method: 'GET',
  });
}

/**
 * 保存
 * @param {勾选数据} list
 */
export async function save(data, customize, templateInfo = {}) {
  const customizeUnitCode = `SSTA.COST_SHEET_SUP_DETAIL.BASIC,SSTA.COST_SHEET_SUP_DETAIL.OTHERS,SSTA.COST_SHEET_SUP_DETAIL.TRADINGPARTY,SSTA.COST_SHEET_SUP_DETAIL.TRANSACTIONAMOUNT,SSTA.COST_SHEET_SUP_DETAIL.TRANSACTIONDETAIL`;
  return request(`${prefix}/charge-headers/save`, {
    method: 'POST',
    body: data,
    query: { customizeUnitCode: customize || customizeUnitCode, ...templateInfo },
  });
}

/**
 * 完成
 * @param {勾选数据} list
 */
export async function completed(data, customizeUnitCode, templateInfo = {}) {
  return request(`${prefix}/charge-headers/completed`, {
    method: 'POST',
    body: data,
    query: { customizeUnitCode, ...templateInfo },
  });
}

/**
 * 取消
 * @param {勾选数据} list
 */
export async function cancel(data) {
  return request(`${prefix}/charge-headers/cancel`, {
    method: 'POST',
    body: data,
  });
}

/**
 * 冲销
 * @param {勾选数据} list
 */
export async function reverse(data) {
  return request(`${prefix}/charge-headers/reverse`, {
    method: 'POST',
    body: data,
  });
}

/**
 * 审批通过
 * @param {勾选数据} list
 */
export async function approveResolve({ customizeUnitCode, templateInfo = {}, ...data }) {
  return request(`${prefix}/charge-headers/confirm`, {
    method: 'POST',
    body: data,
    query: filterNullValueObject({ customizeUnitCode, ...templateInfo }),
  });
}

/**
 * 审批拒绝
 * @param {勾选数据} list
 */
export async function approveReject({ customizeUnitCode, templateInfo = {}, ...data }) {
  return request(`${prefix}/charge-headers/back`, {
    method: 'POST',
    body: data,
    query: filterNullValueObject({ customizeUnitCode, ...templateInfo }),
  });
}

/**
 * 推送
 * @param {勾选数据} list
 */
export async function push(data) {
  return request(`${prefix}/charge-headers/push`, {
    method: 'POST',
    body: data,
  });
}

// 销售方费用单工作台
export async function getExpenseList(query) {
  return request(`${prefix}/charge-headers/supplier`, {
    method: 'GET',
    query: { ...query, page: 0, size: 1, onlyCountFlag: 'Y' },
  });
}

// 销售方费用单工作台-明细行
export async function getExpenseDetailList() {
  return request(`${prefix}/charge-lines/supplier/detail-line-list`, {
    method: 'GET',
    query: { page: 0, size: 1, onlyCountFlag: 'Y' },
  });
}

/**
 * 打印
 * @param {勾选数据} list
 */
export async function print(data) {
  const { responseType, headers, list } = data || {};
  return request(`${prefix}/charge-headers/list-print`, {
    method: 'POST',
    body: list,
    responseType: responseType || 'blob',
    headers: headers || {},
  });
}

/**
 * 提交校验
 * @param {勾选数据} list
 */
export async function submitValidate({ customizeUnitCode, templateInfo = {}, ...data }) {
  return request(`${prefix}/charge-headers/validate/completed`, {
    method: 'PUT',
    body: data,
    query: filterNullValueObject({ customizeUnitCode, ...templateInfo }),
  });
}

/**
 * 复制
 */
export async function copy(data, customize, templateInfo = {}) {
  const customizeUnitCode = `SSTA.COST_SHEET_SUP_DETAIL.BASIC_INFO,SSTA.COST_SHEET_SUP_DETAIL.OTHERS_INFO,SSTA.COST_SHEET_SUP_DETAIL.TRADINGPARTY,SSTA.COST_SHEET_SUP_DETAIL.TRANSACTIONAMOUNT,SSTA.COST_SHEET_SUP_DETAIL.TRANSACTIONDETAIL,SSTA.COST_SHEET_SUP_DETAIL.ENCLOSURE`;
  return request(`${prefix}/charge-headers/supplier-copy`, {
    method: 'POST',
    body: data,
    query: { customizeUnitCode: customize || customizeUnitCode, ...templateInfo },
  });
}

export async function getClaimInfo(data) {
  return request(`/sqam/v1/${organizationId}/claim-form/sitf-claim-query`, {
    method: 'POST',
    body: data,
  });
}

/**
 * 撤回
 */
export async function revoke(chargeHeaderId) {
  return request(`${prefix}/charge-headers/supplier/common-new-revoke/${chargeHeaderId}`, {
    method: 'PUT',
  });
}

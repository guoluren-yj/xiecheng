/*
 * @Description:
 * @Date: 2020-08-20 11:33:13
 * @author: zhangyongxuan <yongxuan.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */

import request from 'utils/request';
import { getCurrentOrganizationId, filterNullValueObject, getCurrentUserId } from 'utils/utils';
// import { HZERO_HWFP } from 'utils/config';
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

export async function getSettleHeaderId(settleNum) {
  return request(`/ssta/v1/${organizationId}/settle-headers?settleHeaderNum=${settleNum}`, {
    method: 'GET',
  });
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
  const customizeUnitCode = `SSTA.COST_SHEET_DETAIL.BASIC,SSTA.COST_SHEET_DETAIL.OTHERS,SSTA.COST_SHEET_DETAIL.TRADINGPARTY,SSTA.COST_SHEET_DETAIL.TRANSACTIONAMOUNT,SSTA.COST_SHEET_DETAIL.TRANSACTIONDETAIL,SSTA.COST_SHEET_DETAIL.OTHERS.WORKFLOW`;
  return request(`${prefix}/charge-headers/save`, {
    method: 'POST',
    body: data,
    query: {
      customizeUnitCode: customize || customizeUnitCode,
      ...templateInfo,
    },
  });
}

/**
 * 完成
 * @param {勾选数据} list
 */
export async function completed({ customizeUnitCode, templateInfo = {}, ...data }) {
  return request(`${prefix}/charge-headers/completed`, {
    method: 'POST',
    body: data,
    query: filterNullValueObject({ customizeUnitCode, ...templateInfo }),
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
export async function reverse({ customizeUnitCode, templateInfo = {}, ...data }) {
  return request(`${prefix}/charge-headers/reverse`, {
    method: 'POST',
    body: data,
    query: filterNullValueObject({ customizeUnitCode, ...templateInfo }),
  });
}
/**
 *
 * @param {*} param0
 * @returns
 */
export async function saveLineDatasApi({ customizeUnitCode, saveData }) {
  return request(`${prefix}/charge-headers/list-save`, {
    method: 'POST',
    body: saveData,
    query: filterNullValueObject({ customizeUnitCode }),
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
/**
 * 工作流接口
 */

export async function fetchApprovalData(params) {
  const { ...query } = params;
  return request(`${prefix}/settle-headers/ssta-historyApproval-batch`, {
    method: 'GET',
    query,
  });
}

// 采购方费用单工作台
export async function getExpenseList(query) {
  return request(`${prefix}/charge-headers`, {
    method: 'GET',
    query: { ...query, page: 0, size: 1, onlyCountFlag: 'Y' },
  });
}

// 采购方费用单工作台-明细行
export async function getExpenseDetailList() {
  return request(`${prefix}/charge-lines/purchase/detail-line-list`, {
    method: 'GET',
    query: { page: 0, size: 1, onlyCountFlag: 'Y' },
  });
}

export async function userDefaults() {
  return request(`/iam/v1/${organizationId}/user-defaults`, {
    method: 'GET',
    query: { userId: getCurrentUserId() },
  });
}

export async function getFeeDetail(query) {
  return request(`${prefix}/settles/query-detail`, {
    method: 'GET',
    query,
  });
}

export async function updateSync() {
  return request(`${prefix}/charge-headers/update-sync`, {
    method: 'PUT',
  });
}

/**
 * 同步
 * @param {勾选数据} list
 */
export async function sync(data) {
  return request(`${prefix}/charge-headers/sync`, {
    method: 'POST',
    body: data,
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
  const customizeUnitCode = `SSTA.COST_SHEET_DETAIL.BASIC_INFO,SSTA.COST_SHEET_DETAIL.OTHERS_INFO,SSTA.COST_SHEET_DETAIL.TRADINGPARTY,SSTA.COST_SHEET_DETAIL.TRANSACTIONAMOUNT,SSTA.COST_SHEET_DETAIL.TRANSACTIONDETAIL,SSTA.COST_SHEET_DETAIL.OTHERS.WORKFLOW,SSTA.COST_SHEET_DETAIL.ENCLOSURE`;
  return request(`${prefix}/charge-headers/purchaser-copy`, {
    method: 'POST',
    body: data,
    query: {
      customizeUnitCode: customize || customizeUnitCode,
      ...templateInfo,
    },
  });
}
// 根据公司获取业务实体默认值，根据公司和业务实体获取采购组织默认值
export async function getDefaultFromCompany(query) {
  return request(`${prefix}/comment/purchase-requests/purchase-company`, {
    method: 'GET',
    query,
  });
}

// 根据采购组织获取业务员默认值
export async function getDefaultFromPurOrg(query) {
  return request(`${prefix}/comment/purchase-requests/agent`, {
    method: 'GET',
    query,
  });
}

export async function getClaimInfo(data) {
  return request(`/sqam/v1/${organizationId}/claim-form/sitf-claim-query`, {
    method: 'POST',
    body: data,
  });
}

export async function submitBatch(data, customizeUnitCode) {
  const chargeHeaderIdList = data.map((item) => item?.chargeHeaderId);
  return request(`${prefix}/charge-headers/bath-completed`, {
    method: 'POST',
    body: {
      chargeHeaderIdList,
    },
    query: { customizeUnitCode },
  });
}

export async function confirmBatch({ customizeUnitCode, ...others }) {
  return request(`${prefix}/charge-headers/bath-confirm`, {
    method: 'POST',
    body: others,
    query: filterNullValueObject({ customizeUnitCode }),
  });
}

export async function returnBatch({ customizeUnitCode, ...others }) {
  return request(`${prefix}/charge-headers/bath-back`, {
    method: 'POST',
    body: others,
    query: filterNullValueObject({ customizeUnitCode }),
  });
}

/**
 * 撤回
 */
export async function revoke(chargeHeaderId) {
  return request(`${prefix}/charge-headers/common-new-revoke/${chargeHeaderId}`, {
    method: 'get',
  });
}

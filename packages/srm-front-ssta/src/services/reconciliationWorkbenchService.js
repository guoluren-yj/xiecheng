/*
 * @Description:
 * @Date: 2020-08-20 11:33:13
 * @author: zhangyongxuan <yongxuan.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */

import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_HPFM, SRM_SSTA } from '_utils/config';
/**
 * 请求API前缀
 * @type {string}
 */
const organizationId = getCurrentOrganizationId();
const prefix = `${SRM_SSTA}/v1/${organizationId}`;

const customizeUnitCodePurchaser = [
  'SSTA.PURCHASER_BILL_DETAIL.BASIC',
  'SSTA.PURCHASER_BILL_DETAIL.TRADING_PARTY',
  'SSTA.PURCHASER_BILL_DETAIL.TRANSACTION_AMOUNT',
  'SSTA.PURCHASER_BILL_DETAIL.TRANSACTION_DETAILS',
  'SSTA.PURCHASER_BILL_DETAIL.SETTLE_CONFIG',
  'SSTA.PURCHASER_BILL_DETAIL.OTHERS',
  'SSTA.PURCHASER_BILL_DETAIL.ENCLOSURE',
  'SSTA.PURCHASER_BILL_DETAIL.HEADER_BTNS',
  'SSTA.PURCHASER_BILL_DETAIL.PRE_CONFIRM',
  'SSTA.PURCHASER_BILL_DETAIL.PRE_RETURN',
  'SSTA.PURCHASER_BILL_DETAIL.PRE_CANCEL',
].join();

const customizeUnitCodeSupplier = [
  'SSTA.SUPPLIER_BILL_DETAIL.BASIC',
  'SSTA.SUPPLIER_BILL_DETAIL.TRADING_PARTY',
  'SSTA.SUPPLIER_BILL_DETAIL.TRANSACTION_AMOUNT',
  'SSTA.SUPPLIER_BILL_DETAIL.TRANSACTION_DETAILS',
  'SSTA.SUPPLIER_BILL_DETAIL.SETTLE_CONFIG',
  'SSTA.SUPPLIER_BILL_DETAIL.OTHERS',
  'SSTA.SUPPLIER_BILL_DETAIL.ENCLOSURE',
  'SSTA.SUPPLIER_BILL_DETAIL.HEADER_BTNS',
  'SSTA.SUPPLIER_BILL_DETAIL.PRE_CONFIRM',
  'SSTA.SUPPLIER_BILL_DETAIL.PRE_RETURN',
  'SSTA.SUPPLIER_BILL_DETAIL.PRE_CANCEL',
].join();

/**
 * 获取对账单详情
 */
export async function getDetail(billHeaderId, camp, action, editFlag, customize) {
  let customizeUnitCode = '';
  if (camp === 'PURCHASER') {
    customizeUnitCode = customize || customizeUnitCodePurchaser;
  } else {
    // SUPPLIER
    customizeUnitCode = customize || customizeUnitCodeSupplier;
  }
  return request(`${prefix}/bill-headers/detail`, {
    method: 'GET',
    query: {
      billHeaderId,
      customizeUnitCode,
      action,
      editFlag,
    },
  });
}

/**
 * 新增对账单行
 * @param {勾选数据} list
 */
export async function addLines({ list, billHeaderId, camp }) {
  let customizeUnitCode = '';
  if (camp === 'PURCHASER') {
    customizeUnitCode = 'SSTA.PURCHASER_BILL_DETAIL.TRANSACTION_DETAILS';
  } else {
    // SUPPLIER
    customizeUnitCode = 'SSTA.SUPPLIER_BILL_DETAIL.TRANSACTION_DETAILS';
  }
  return request(`${prefix}/bill-lines/${billHeaderId}?customizeUnitCode=${customizeUnitCode}`, {
    method: 'POST',
    body: list,
  });
}

/**
 * 获取预算规则详情
 */
export async function getBillLineDetail(settleId, camp, billHeaderId) {
  let customizeUnitCode = '';
  if (camp === 'PURCHASER') {
    customizeUnitCode =
      'SSTA.PURCHASER_BILL_DETAIL_DRAWER.BILL_INFO,SSTA.PURCHASER_BILL_DETAIL_DRAWER.BILL_RULE,SSTA.PURCHASER_BILL_DETAIL_DRAWER.INVOICE_INFO,SSTA.PURCHASER_BILL_DETAIL_DRAWER.PAYMENT_INFO,SSTA.PURCHASER_BILL_DETAIL_DRAWER.SETTLE_DATA_RULE,SSTA.PURCHASER_BILL_DETAIL_DRAWER.TRADING_PARTY,SSTA.PURCHASER_BILL_DETAIL_DRAWER.TRANSACTION_AFFAIR,SSTA.PURCHASER_BILL_DETAIL_DRAWER.TRANSACTION_AMOUNT';
  } else {
    // SUPPLIER
    customizeUnitCode =
      'SSTA.SUPPLIER_BILL_DETAIL_DRAWER.BILL_INFO,SSTA.SUPPLIER_BILL_DETAIL_DRAWER.BILL_RULE,SSTA.SUPPLIER_BILL_DETAIL_DRAWER.INVOICE_INFO,SSTA.SUPPLIER_BILL_DETAIL_DRAWER.PAYMENT_INFO,SSTA.SUPPLIER_BILL_DETAIL_DRAWER.SETTLE_DATA_RULE,SSTA.SUPPLIER_BILL_DETAIL_DRAWER.TRADING_PARTY,SSTA.SUPPLIER_BILL_DETAIL_DRAWER.TRANSACTION_AFFAIR,SSTA.SUPPLIER_BILL_DETAIL_DRAWER.TRANSACTION_AMOUNT';
  }
  return request(
    `${prefix}/bill-lines/detail-for-bill/${billHeaderId}/${settleId}?customizeUnitCode=${customizeUnitCode}`,
    {
      method: 'GET',
    }
  );
}

/**
 * 获取预算规则详情
 */
export async function print(data) {
  const { billHeaderId, responseType, headers } = data || {};
  return request(`${prefix}/bill-headers/bill/detail/${billHeaderId}/print`, {
    method: 'GET',
    responseType: responseType || 'blob',
    headers: headers || {},
  });
}

/**
 * 保存
 * @param {勾选数据} list
 */
export async function save(data, customize) {
  return request(
    `${prefix}/bill-headers/purchaser?customizeUnitCode=${customize || customizeUnitCodePurchaser}`,
    {
      method: 'PUT',
      body: data,
    }
  );
}

/**
 * 保存
 * @param {勾选数据} list
 */
export async function saveSupplier(data, customize) {
  return request(
    `${prefix}/bill-headers/supplier?customizeUnitCode=${customize || customizeUnitCodeSupplier}`,
    {
      method: 'PUT',
      body: data,
    }
  );
}

/**
 * 提交
 * @param {勾选数据} list
 */
export async function submit(data, customizeUnitCode = customizeUnitCodePurchaser) {
  return request(`${prefix}/bill-headers/purchaser/submit`, {
    method: 'PUT',
    body: data,
    query: { customizeUnitCode },
  });
}

/**
 * 提交
 * @param {勾选数据} list
 */
export async function submitSupplier(data, customizeUnitCode = customizeUnitCodeSupplier) {
  return request(`${prefix}/bill-headers/supplier/submit`, {
    method: 'PUT',
    body: data,
    query: { customizeUnitCode },
  });
}

/**
 * 取消
 * @param {勾选数据} list
 */
export async function cancel(data, customizeUnitCode = customizeUnitCodePurchaser) {
  const { billStatus } = data[0] || {};
  const suffix = billStatus === 'CONFIRM' ? 'cancel' : 'batch-delete';
  return request(`${prefix}/bill-headers/purchaser/${suffix}`, {
    method: 'PUT',
    body: data,
    query: { customizeUnitCode },
  });
}

/**
 * 取消
 * @param {勾选数据} list
 */
export async function cancelSupplier(data, customizeUnitCode = customizeUnitCodeSupplier) {
  const { billStatus } = data[0] || {};
  const suffix = billStatus === 'CONFIRM' ? 'cancel' : 'batch-delete';
  return request(`${prefix}/bill-headers/supplier/${suffix}`, {
    method: 'PUT',
    body: data,
    query: { customizeUnitCode },
  });
}

/**
 * 取消
 * @param {勾选数据} list
 */
export async function cancelLines(data, customize) {
  return request(
    `${prefix}/bill-lines/purchaser/cancel?customizeUnitCode=${
      customize || customizeUnitCodePurchaser
    }`,
    {
      method: 'PUT',
      body: data,
    }
  );
}

/**
 * 取消
 * @param {勾选数据} list
 */
export async function cancelSupplierLines(data, customize) {
  return request(
    `${prefix}/bill-lines/supplier/cancel?customizeUnitCode=${
      customize || customizeUnitCodeSupplier
    }`,
    {
      method: 'PUT',
      body: data,
    }
  );
}

/**
 * 退回
 * @param {勾选数据} list
 */
export async function returnData(data, customizeUnitCode = customizeUnitCodePurchaser) {
  return request(`${prefix}/bill-headers/purchaser/return-back`, {
    method: 'PUT',
    body: data,
    query: { customizeUnitCode },
  });
}

/**
 * 退回
 * @param {勾选数据} list
 */
export async function returnSupplierData(data, customizeUnitCode = customizeUnitCodeSupplier) {
  return request(`${prefix}/bill-headers/supplier/return-back`, {
    method: 'PUT',
    body: data,
    query: { customizeUnitCode },
  });
}

/**
 * 新建删除
 * @param {勾选数据} list
 */
export async function deleteData(data, customize) {
  return request(
    `${prefix}/bill-headers/purchaser/delete?customizeUnitCode=${
      customize || customizeUnitCodePurchaser
    }`,
    {
      method: 'PUT',
      body: data,
    }
  );
}

/**
 * 新建删除
 * @param {勾选数据} list
 */
export async function deleteSupplierData(data, customize) {
  return request(
    `${prefix}/bill-headers/supplier/delete?customizeUnitCode=${
      customize || customizeUnitCodeSupplier
    }`,
    {
      method: 'PUT',
      body: data,
    }
  );
}

/**
 * 确认
 * @param {勾选数据} list
 */
export async function comfirm(data, customizeUnitCode = customizeUnitCodePurchaser) {
  return request(`${prefix}/bill-headers/purchaser/confirm`, {
    method: 'PUT',
    body: data,
    query: { customizeUnitCode },
  });
}

/**
 * 冲销
 * @param {勾选数据} list
 */
export async function comfirmSupplier(data, customizeUnitCode = customizeUnitCodeSupplier) {
  return request(`${prefix}/bill-headers/supplier/confirm`, {
    method: 'PUT',
    body: data,
    query: { customizeUnitCode },
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

export async function fetchCurrencyCode(currencyCode) {
  return request(`${prefix}/amount?currencyCode=${currencyCode}`);
}
/**
 * 采购方同步
 */
export async function sync(params) {
  return request(`${prefix}/bill-headers/purchaser/sync`, {
    method: 'PUT',
    body: params,
  });
}

// 采购方/销售方对账单工作台
export async function getStatementWorkbench({ action, type }) {
  return request(`/ssta/v1/${organizationId}/bill-headers/${type}`, {
    method: 'GET',
    query: { action, page: 0, size: 1, onlyCountFlag: 'Y' },
  });
}

export async function getReconciliationLineh(params) {
  return request(`/ssta/v1/${organizationId}/bill-lines/${params.type}`, {
    method: 'GET',
    query: { page: 0, size: 1, onlyCountFlag: 'Y' },
  });
}

/**
 * 采购方对账单-撤回
 */
export async function withdraw(data) {
  return request(`${prefix}/bill-headers/purchaser/recall`, {
    method: 'PUT',
    body: data,
  });
}

/**
 * 销售方对账单-撤回
 */
export async function featchWithdraw(params) {
  return request(`${prefix}/bill-headers/supplier/recall`, {
    method: 'PUT',
    body: params,
  });
}

export async function confirmValidate({ body, role = 'purchaser', customizeUnit }) {
  return request(`${prefix}/bill-headers/${role}/validate/confirm`, {
    method: 'PUT',
    body,
    query: {
      customizeUnitCode:
        role === 'purchaser'
          ? customizeUnit || customizeUnitCodePurchaser
          : customizeUnit || customizeUnitCodeSupplier,
    },
  });
}

export async function submitValidate({ body, role = 'purchaser', customizeUnit }) {
  return request(`${prefix}/bill-headers/${role}/validate/submit`, {
    method: 'PUT',
    body,
    query: {
      customizeUnitCode:
        role === 'purchaser'
          ? customizeUnit || customizeUnitCodePurchaser
          : customizeUnit || customizeUnitCodeSupplier,
    },
  });
}

export async function getBillLinesByIds({ billLineIds, customizeUnitCode }) {
  return request(`/ssta/v1/${organizationId}/bill-lines/query-list`, {
    method: 'POST',
    body: { billLineIds },
    query: { customizeUnitCode },
  });
}

/**
 * 查询印章图片
 * @param {Object} body
 */
export async function querySealPictures(params) {
  return request(`${SRM_HPFM}/v1/lovs/data`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 获取手机验证码
 * @param {Object} body
 */
export async function getVerifyCode(body) {
  return request(`${prefix}/bill-headers/send-verified-code`, {
    method: 'POST',
    body,
  });
}
export async function getSignInfo(params) {
  return request(`${prefix}/bill-headers/sign/get-sign-info`, {
    method: 'GET',
    query: params,
  });
}

export async function verifiedSign(body) {
  const { billHeaderId } = body;
  return request(`${prefix}/bill-headers/${billHeaderId}/purchase-verified-sign`, {
    method: 'POST',
    body,
  });
}

// 存证查询
export async function proofSearch(params) {
  return request(`${prefix}/bill-headers/sign/get-proof-link`, {
    responseType: 'text',
    method: 'GET',
    query: params,
  });
}

// 驳回签章
export async function rejectedSignature(body) {
  const { billHeaderId } = body;
  return request(`${prefix}/bill-headers/${billHeaderId}/sign-rejected`, {
    method: 'POST',
    body,
  });
}

// 生成开票结算单
export async function createInvoiceSettle(body) {
  return request(`${prefix}/settle-headers/purchaser/auto-invoice`, {
    method: 'POST',
    body,
  });
}

export async function getInvoiceConfig(params) {
  return request(`${prefix}/settle-headers/purchaser/query-invoice-flag`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 打印
 * @param {勾选数据} list
 */
export async function printBillList(data) {
  const { billHeaderIdList, responseType, headers } = data || {};
  return request(`${prefix}/bill-headers/list-print`, {
    method: 'PUT',
    body: { billHeaderIdList },
    responseType: responseType || 'blob',
    headers: headers || {},
  });
}

// 获取签章链接
export async function getSignatureLInk(body) {
  const { billHeaderId } = body;
  return request(`${prefix}/bill-headers/${billHeaderId}/fdd-purchase-verified-sign`, {
    method: 'POST',
    body,
  });
}

// 获取签章链接供应商
export async function getSignatureLInkSup(body) {
  const { billHeaderId } = body;
  return request(`${prefix}/bill-headers/${billHeaderId}/fdd-supplier-verified-sign`, {
    method: 'POST',
    body,
  });
}

// 下载技术报告
export async function downloadSignatureTec(body) {
  const { billHeaderId } = body;
  return request(`${prefix}/bill-headers/${billHeaderId}/technology-report`, {
    method: 'POST',
  });
}

// 下载安全报告
export async function downloadSignatureNotary(body) {
  const { billHeaderId } = body;
  return request(`${prefix}/bill-headers/${billHeaderId}/evidence-report`, {
    method: 'POST',
  });
}

// 撤回签章
export async function signatureBack(body) {
  const { billHeaderId } = body;
  return request(`${prefix}/bill-headers/${billHeaderId}/fdd-cancel`, {
    method: 'POST',
  });
}

// 电子签章sass整合
// 采购方签章
export async function commonSignature(body) {
  return request(`${prefix}/common/common-purchase-sign`, {
    method: 'POST',
    body,
  });
}

// 供应方签章
export async function commonSignatureSupplier(body) {
  return request(`${prefix}/common/common-supplier-sign`, {
    method: 'POST',
    body,
  });
}

// 取消签章
export async function commonCancelSignature(body) {
  return request(`${prefix}/common/common-sign-cancel`, {
    method: 'POST',
    body,
  });
}

// 下载签章
export async function commonDownloadSignature(body) {
  return request(`${prefix}/common/common-evidence-report`, {
    method: 'POST',
    body,
  });
}

// 解约
export async function commonTerminateSignature(body) {
  return request(`${prefix}/common/common-rescission-sign`, {
    method: 'POST',
    body,
    responseType: 'text',
  });
}

// 下载解约文件
export async function downloadTerminate(body) {
  return request(`${prefix}/common/common-rescission-downLoad `, {
    method: 'POST',
    body,
  });
}

import request from 'utils/request';
import { SRM_SSTA } from '_utils/config';
import {
  getCurrentOrganizationId,
  isTenantRoleLevel,
  filterNullValueObject,
  getCurrentUserId,
} from 'utils/utils';
import { headUnitCodes } from '@/routes/NewPurchaseSettle/Detail/StoreProvider';
import { headUnitCodes as supHeadUnitCodes } from '@/routes/NewSupplySettle/Detail/StoreProvider';

const organizationId = getCurrentOrganizationId();
const tenantId = getCurrentOrganizationId();
const prefix = `/ssta/v1/${tenantId}`;

// 采购方/销售方结算池
export async function getAll(type) {
  return request(
    isTenantRoleLevel()
      ? `/ssta/v1/${organizationId}/settles/${type}/page-all`
      : `/ssta/v1/settles/${type}/page-all`,
    {
      method: 'GET',
      query: { page: 0, size: 1, onlyCountFlag: 'Y', onlyCountLimit: 100 },
    }
  );
}

export async function getDetailDS({ type, settleId, settleErrorId }) {
  const url =
    type === 'B'
      ? isTenantRoleLevel()
        ? `/ssta/v1/${organizationId}/settles/detail-for-bill/${settleId}`
        : `/ssta/v1/settles/detail-detail-for-bill/${settleId}`
      : type === 'E'
      ? isTenantRoleLevel()
        ? `/ssta/v1/${organizationId}/ssta-settle-errors/detail/${settleErrorId}`
        : `/ssta/v1/ssta-settle-errors/detail/${settleErrorId}`
      : isTenantRoleLevel()
      ? `/ssta/v1/${organizationId}/settles/detail/${settleId}`
      : `/ssta/v1/settles/detail/${settleId}`;
  return request(url, {
    method: 'GET',
  });
}

export async function getBill(type) {
  return request(
    isTenantRoleLevel()
      ? `/ssta/v1/${organizationId}/settles/${type}/page-bill-able`
      : `/ssta/v1/settles/${type}/page-bill-able`,
    {
      method: 'GET',
      query: { page: 0, size: 1, onlyCountFlag: 'Y', onlyCountLimit: 100 },
    }
  );
}
export async function getInvoice(type, query) {
  return request(
    isTenantRoleLevel()
      ? `/ssta/v1/${organizationId}/settles/${type}/page-invoice-able`
      : `/ssta/v1/settles/${type}/page-invoice-able`,
    {
      method: 'GET',
      query: { ...query, page: 0, size: 1, onlyCountFlag: 'Y', onlyCountLimit: 100 },
    }
  );
}
export async function getPayment(type, query) {
  return request(
    isTenantRoleLevel()
      ? `/ssta/v1/${organizationId}/settles/${type}/page-payment-able`
      : `/ssta/v1/settles/${type}/page-payment-able`,
    {
      method: 'GET',
      query: { ...query, page: 0, size: 1, onlyCountFlag: 'Y', onlyCountLimit: 100 },
    }
  );
}
export async function getTrash(type) {
  return request(
    isTenantRoleLevel()
      ? `/ssta/v1/${organizationId}/ssta-settle-errors/${type}/page-all`
      : `/ssta/v1/ssta-settle-errors/${type}/page-all`,
    {
      method: 'GET',
      query: { page: 0, size: 1, onlyCountFlag: 'Y', onlyCountLimit: 100 },
    }
  );
}

// 采购方/销售方结算单工作台
export async function getStatement({ action, type }) {
  return request(`/ssta/v1/${organizationId}/settle-headers/${type}/page`, {
    method: 'GET',
    query: { action, page: 0, size: 1, onlyCountFlag: 'Y', onlyCountLimit: 100 },
  });
}

// 采购方/销售方结算单工作台明细
export async function getLineStatement({ action, type }) {
  const urlObj = {
    INVOICE: `/ssta/v1/${organizationId}/settle-lines/${type}?action=${action}`,
    PAYMENT: `/ssta/v1/${organizationId}/settle-lines/${type}?action=${action}`,
    PREPAYMENT: `/ssta/v1/${organizationId}/pre-payment-lines/${type}`,
    DEMENSION: `/ssta/v1/${organizationId}/settle-lines/mutil-payment/${type}`,
  };
  return request(urlObj[action], {
    method: 'GET',
    query: { page: 0, size: 1, onlyCountFlag: 'Y', onlyCountLimit: 100 },
  });
}

export async function addLines({ list, settleHeaderId }) {
  return request(`${prefix}/pre-payment-lines/${settleHeaderId}/confirm/add-order`, {
    method: 'PUT',
    body: list,
  });
}

export async function addLinesValidate({ list, settleHeaderId }) {
  return request(`${prefix}/pre-payment-lines/${settleHeaderId}/validate/confirm/add-order`, {
    method: 'PUT',
    body: list,
  });
}

export async function pcPending(body) {
  const { pendingFlag, paymentAdvanceLines, prepaymentType, customizeUnitCode } = body;
  const flag = pendingFlag === '0' ? 1 : 0;
  return request(
    `${prefix}/pre-pay-headers/pending/contract?pendingFlag=${flag}&prepaymentType=${prepaymentType}&customizeUnitCode=${customizeUnitCode}`,
    {
      method: 'POST',
      body: paymentAdvanceLines,
    }
  );
}

export async function poPending(data) {
  const { pendingFlag, prepaymentType, customizeUnitCode, paymentAdvanceLines: body } = data;
  return request(`${prefix}/pre-pay-headers/pending/order`, {
    method: 'POST',
    body,
    query: {
      pendingFlag: pendingFlag === '0' ? 1 : 0,
      prepaymentType,
      customizeUnitCode,
    },
  });
}

export async function cancelPrepaymentLines(list) {
  return request(`${prefix}/pre-payment-lines/batch/cancel`, {
    method: 'PUT',
    body: list,
  });
}

/**
 * 移除结算事务
 * @param {*} params
 */
export async function remove(params) {
  return request(`/ssta/v1/${tenantId}/settles/remove`, {
    method: 'PUT',
    body: params,
  });
}

/**
 * 移除结算事务
 * @param {*} params
 */
export async function savePre(params) {
  const { customizeUnitCode } = params;
  return request(
    `/ssta/v1/${tenantId}/pre-pay-headers/purchaser/save?customizeUnitCode=${customizeUnitCode}`,
    {
      method: 'PUT',
      body: params,
    }
  );
}

/**
 * 撤销移除结算事务
 * @param {*} params
 */
export async function undoRemove(params) {
  return request(`/ssta/v1/${tenantId}/settles/undo-remove`, {
    method: 'PUT',
    body: params,
  });
}

/**
 * 对账 -- 移除结算事务
 * @param {*} params
 */
export async function billRemove(params) {
  return request(`/ssta/v1/${tenantId}/settles/bill-remove`, {
    method: 'PUT',
    body: params,
  });
}

/**
 * 对账 -- 撤消移除结算事务
 * @param {*} params
 */
export async function billUndoRemove(params) {
  return request(`/ssta/v1/${tenantId}/settles/bill-undo-remove`, {
    method: 'PUT',
    body: params,
  });
}

/**
 * 开票 -- 移除结算事务
 * @param {*} params
 */
export async function invoiceRemove(params) {
  return request(`/ssta/v1/${tenantId}/settles/invoice-remove`, {
    method: 'PUT',
    body: params,
  });
}

/**
 * 开票 -- 撤消移除结算事务
 * @param {*} params
 */
export async function invoiceUndoRemove(params) {
  return request(`/ssta/v1/${tenantId}/settles/invoice-undo-remove`, {
    method: 'PUT',
    body: params,
  });
}

/**
 * 付款 -- 移除结算事务
 * @param {*} params
 */
export async function paymentRemove(params) {
  return request(`/ssta/v1/${tenantId}/settles/payment-remove`, {
    method: 'PUT',
    body: params,
  });
}

/**
 * 付款 -- 撤消移除结算事务
 * @param {*} params
 */
export async function paymentUndoRemove(params) {
  return request(`/ssta/v1/${tenantId}/settles/payment-undo-remove`, {
    method: 'PUT',
    body: params,
  });
}

export async function createPurchaseInvoice(params) {
  return request(`/ssta/v1/${tenantId}/settle-headers/purchaser/invoice`, {
    method: 'POST',
    body: params,
  });
}

export async function createPurchaseBill(params) {
  return request(`/ssta/v1/${tenantId}/bill-headers/purchaser`, {
    method: 'POST',
    body: params,
  });
}
export async function getPriceAndcreatePurchaseBill(body, queryData) {
  queryData.camp = 'PURCHASER';
  return request(`/ssta/v1/${tenantId}/bill-headers/get-price-and-create-bill`, {
    method: 'POST',
    body,
    query: queryData,
  });
}
export async function getPriceAndcreateSupplierBill(body, query) {
  query.camp = 'SUPPLIER';
  return request(`/ssta/v1/${tenantId}/bill-headers/get-price-and-create-bill`, {
    method: 'POST',
    body,
    query,
  });
}

export async function createSupplyBill(params) {
  return request(`/ssta/v1/${tenantId}/bill-headers/supplier`, {
    method: 'POST',
    body: params,
  });
}

export async function createPurchasePayment(params) {
  return request(`/ssta/v1/${tenantId}/settle-headers/purchaser/payment`, {
    method: 'POST',
    body: params,
  });
}

export async function createSupplyInvoice(params) {
  return request(`/ssta/v1/${tenantId}/settle-headers/supplier/invoice`, {
    method: 'POST',
    body: params,
  });
}

export async function createSupplyPayment(params) {
  return request(`/ssta/v1/${tenantId}/settle-headers/supplier/payment`, {
    method: 'POST',
    body: params,
  });
}

export async function updatePurchaseSettle({ customizeUnitCode, ...body }) {
  return request(`/ssta/v1/${tenantId}/settle-headers/purchaser/update`, {
    method: 'PUT',
    body,
    query: filterNullValueObject({ customizeUnitCode }),
  });
}
export async function updateWorkFlow({ customizeUnitCode, ...body }) {
  return request(`/ssta/v1/${tenantId}/settle-headers/workflow/save-sync`, {
    method: 'POST',
    body,
    query: filterNullValueObject({ customizeUnitCode }),
  });
}

export async function updateSupplySettle({ customizeUnitCode, ...body }) {
  return request(`/ssta/v1/${tenantId}/settle-headers/supplier/update`, {
    method: 'PUT',
    body,
    query: filterNullValueObject({ customizeUnitCode }),
  });
}

export async function submitPurchaseSettle({ customizeUnitCode, ...body }) {
  return request(`/ssta/v1/${tenantId}/settle-headers/purchaser/submit`, {
    method: 'PUT',
    body,
    query: filterNullValueObject({ customizeUnitCode }),
  });
}

export async function submitSupplySettle({ customizeUnitCode, ...body }) {
  return request(`/ssta/v1/${tenantId}/settle-headers/supplier/submit`, {
    method: 'PUT',
    body,
    query: filterNullValueObject({ customizeUnitCode }),
  });
}

export async function syncPurchaseSettle(body, customizeUnitCode) {
  return request(`/ssta/v1/${tenantId}/settle-headers/purchaser/sync`, {
    method: 'PUT',
    body,
    query: filterNullValueObject({ customizeUnitCode }),
  });
}

export async function syncSupplySettle(body) {
  return request(`/ssta/v1/${tenantId}/settle-headers/supplier/sync`, {
    method: 'PUT',
    body,
  });
}

export async function cancelPurchaseSettle({ body, customizeUnitCode }) {
  const suffix =
    body && ['NEW', 'RETURN', 'INVOICE_FAILED', 'INVOICE_EXCEPTION'].includes(body[0].settleStatus)
      ? 'batch-delete'
      : 'cancel';
  return request(`/ssta/v1/${tenantId}/settle-headers/purchaser/${suffix}`, {
    method: 'PUT',
    body,
    query: filterNullValueObject({ customizeUnitCode }),
  });
}

export async function cancelSupplySettle({ body, customizeUnitCode }) {
  const suffix =
    body && ['NEW', 'RETURN', 'INVOICE_FAILED', 'INVOICE_EXCEPTION'].includes(body[0].settleStatus)
      ? 'batch-delete'
      : 'cancel';
  return request(`/ssta/v1/${tenantId}/settle-headers/supplier/${suffix}`, {
    method: 'PUT',
    body,
    query: filterNullValueObject({ customizeUnitCode }),
  });
}

export async function confirmPurchaseSettle({ body, isOnlyPre, customizeUnitCode }) {
  const url = isOnlyPre
    ? `/ssta/v1/${tenantId}/pre-pay-headers/confirm`
    : `/ssta/v1/${tenantId}/settle-headers/purchaser/confirm`;
  return request(url, {
    method: 'PUT',
    body,
    query: filterNullValueObject({ customizeUnitCode }),
  });
}

export async function confirmSupplySettle({ body, isOnlyPre, customizeUnitCode }) {
  const url = isOnlyPre
    ? `/ssta/v1/${tenantId}/pre-pay-headers/supplier/confirm`
    : `/ssta/v1/${tenantId}/settle-headers/supplier/confirm`;
  return request(url, {
    method: 'PUT',
    body,
    query: filterNullValueObject({ customizeUnitCode }),
  });
}

export async function returnSettlePool(params) {
  return request(`/ssta/v1/${tenantId}/settles/return-back`, {
    method: 'PUT',
    body: params,
  });
}

export async function cancelPrepayment({ body, ...query }) {
  return request(`/ssta/v1/${tenantId}/pre-pay-headers/cancel`, {
    method: 'PUT',
    body,
    query,
  });
}

export async function deletePrepayment(params) {
  return request(`/ssta/v1/${tenantId}/settle-apply-lines`, {
    method: 'DELETE',
    body: params,
  });
}

export async function cancelPrepaymentSup({ body, ...query }) {
  return request(`/ssta/v1/${tenantId}/pre-pay-headers/supplier/cancel`, {
    method: 'PUT',
    body,
    query,
  });
}

export async function confirmPrepayment({ body, ...query }) {
  return request(`/ssta/v1/${tenantId}/pre-pay-headers/confirm`, {
    method: 'PUT',
    body,
    query,
  });
}

export async function returnPrepayment({ body, ...query }) {
  return request(`/ssta/v1/${tenantId}/pre-pay-headers/return-back`, {
    method: 'PUT',
    body,
    query,
  });
}

export async function confirmPrepaymentSup({ body, ...query }) {
  return request(`/ssta/v1/${tenantId}/pre-pay-headers/supplier/confirm`, {
    method: 'PUT',
    body,
    query,
  });
}

export async function returnPrepaymentSup({ body, ...query }) {
  return request(`/ssta/v1/${tenantId}/pre-pay-headers/supplier/return-back`, {
    method: 'PUT',
    body,
    query,
  });
}

// 校验预付款提交校验行
export async function validatePrepaymentLine(params) {
  const { customizeUnitCode, ...body } = params;
  return request(`/ssta/v1/${tenantId}/pre-payment-lines/validate`, {
    method: 'POST',
    query: { customizeUnitCode },
    body,
  });
}

// 校验预付款提交操作
export async function validateSubmitPrepayment(params) {
  const { customizeUnitCode, ...body } = params;
  return request(`/ssta/v1/${tenantId}/pre-pay-headers/validate/submit`, {
    method: 'PUT',
    query: { customizeUnitCode },
    body,
  });
}

// 校验阶段明细行是否更新
export async function validateStageLineUpdatePrepayment(params) {
  const { customizeUnitCode, ...body } = params;
  const { settleHeader } = body;
  return request(`/ssta/v1/${tenantId}/payment-stage-headers/prepayment/update-validate`, {
    method: 'PUT',
    query: { customizeUnitCode },
    body: settleHeader,
  });
}

// 更新并重新匹配阶段
export async function reMatchStageLinePrepayment(params) {
  const { customizeUnitCode, ...body } = params;
  const { settleHeader, prePaymentLineList } = body;
  return request(`/ssta/v1/${tenantId}/payment-stage-headers/prepayment/re-match`, {
    method: 'PUT',
    query: { customizeUnitCode },
    body: {
      ...settleHeader,
      prePaymentLineList,
    },
  });
}

// 更新并重新匹配阶段
export async function reMatchStageLinePrepaymentSupplier(params) {
  const { customizeUnitCode, ...body } = params;
  const { settleHeader, prePaymentLineList } = body;
  return request(`/ssta/v1/${tenantId}/payment-stage-headers/prepayment/supplier/re-match`, {
    method: 'PUT',
    query: { customizeUnitCode },
    body: {
      ...settleHeader,
      prePaymentLineList,
    },
  });
}

// 校验预付款/付款提交警告弹窗取消操作
export async function validateSubmitWarnCancel(params) {
  const { customizeUnitCode, ...body } = params;
  return request(`/ssta/v1/${tenantId}/settle-headers/validate/submit-cancel`, {
    method: 'PUT',
    query: { customizeUnitCode },
    body,
  });
}

export async function submitPrepayment(params) {
  const { customizeUnitCode } = params;
  return request(
    `/ssta/v1/${tenantId}/pre-pay-headers/submit?customizeUnitCode=${customizeUnitCode}`,
    {
      method: 'PUT',
      body: params,
    }
  );
}

export async function syncPrepayment(body, query) {
  return request(`/ssta/v1/${tenantId}/pre-pay-headers/syn/erp`, {
    method: 'PUT',
    body,
    query,
  });
}

export async function savePreSup(params) {
  const { customizeUnitCode } = params;
  return request(
    `/ssta/v1/${tenantId}/pre-pay-headers/supplier/save?customizeUnitCode=${customizeUnitCode}`,
    {
      method: 'PUT',
      body: params,
    }
  );
}

export async function batchSavePrepaymentLine(params) {
  return request(`/ssta/v1/${tenantId}/pre-pay-lines/batch/save`, {
    method: 'PUT',
    body: params,
  });
}

export async function taxHeaderSave(settleHeaderId, data) {
  return request(`/ssta/v1/${tenantId}/tax-invoice-headers/${settleHeaderId}`, {
    method: 'POST',
    body: data,
  });
}

export async function taxHeaderDelete(params) {
  return request(`/ssta/v1/${tenantId}/tax-invoice-headers`, {
    method: 'DELETE',
    body: params,
  });
}

export async function returnPurchaseSettle({ customizeUnitCode, body }) {
  return request(`/ssta/v1/${tenantId}/settle-headers/purchaser/return`, {
    method: 'PUT',
    body,
    query: filterNullValueObject({ customizeUnitCode }),
  });
}

export async function returnSupplySettle({ customizeUnitCode, body }) {
  return request(`/ssta/v1/${tenantId}/settle-headers/supplier/return`, {
    method: 'PUT',
    body,
    query: filterNullValueObject({ customizeUnitCode }),
  });
}

export async function addPrepayment({ body, settleHeaderId, isLine, settleLineId }) {
  const url = isLine
    ? `/ssta/v1/${tenantId}/settle-apply-lines/${settleHeaderId}/${settleLineId}`
    : `/ssta/v1/${tenantId}/settle-apply-lines/${settleHeaderId}`;
  return request(url, {
    method: 'PUT',
    body,
  });
}

export async function addMultiPrepayment(params) {
  return request(`/ssta/v1/${tenantId}/multi-payment-pre-verifications`, {
    method: 'POST',
    body: params,
  });
}

export async function invoiceAuto(params) {
  return request(`/ssta/v1/${tenantId}/settle-headers/invoice-match`, {
    method: 'PUT',
    body: params,
  });
}

export async function paymentAuto(params) {
  const { isMulti, ...body } = params;
  const url = isMulti
    ? `/ssta/v1/${tenantId}/settle-headers/muti-dimension-payment-match`
    : `/ssta/v1/${tenantId}/settle-headers/payment-match`;
  return request(url, {
    method: 'PUT',
    body,
  });
}

export async function toleranceAdjust(params) {
  return request(`/ssta/v1/${tenantId}/settle-headers/amount-adjust`, {
    method: 'PUT',
    body: params,
  });
}

export async function cancelPurchaseSettleLine(params) {
  return request(`/ssta/v1/${tenantId}/settle-lines/cancel`, {
    method: 'PUT',
    body: params,
  });
}

export async function cancelSupplySettleLine(params) {
  return request(`/ssta/v1/${tenantId}/settle-lines/cancel`, {
    method: 'PUT',
    body: params,
  });
}

export async function addPurchaseSettleLine(params) {
  const { settleHeaderId, data, documentType = 'INVOICE' } = params;
  const type = documentType === 'INVOICE' ? 'invoice' : 'payment';
  return request(`/ssta/v1/${tenantId}/settle-lines/${type}/${settleHeaderId}`, {
    method: 'POST',
    body: data,
  });
}

export async function addSupplySettleLine(params) {
  const { settleHeaderId, data, documentType } = params;
  const type = documentType === 'INVOICE' ? 'invoice' : 'payment';
  return request(`/ssta/v1/${tenantId}/settle-lines/${type}/${settleHeaderId}`, {
    method: 'POST',
    body: data,
  });
}

export async function print(params) {
  const { settleHeaderId, responseType, headers, menuCamp } = params;
  return request(`/ssta/v1/${tenantId}/settle-headers/${settleHeaderId}/print`, {
    method: 'GET',
    responseType: responseType || 'blob', // 兼容老结算单
    headers: headers || {},
    query: filterNullValueObject({ menuCamp }),
  });
}
/**
 * 预付款打印
 * @param {*}
 */
export async function prepaymentPrint(params) {
  const { settleHeaderId, responseType, headers, menuCamp } = params;
  return request(`/ssta/v1/${tenantId}/settle-headers/${settleHeaderId}/prepayment/print`, {
    method: 'GET',
    responseType: responseType || 'blob', // 兼容老结算单
    headers: headers || {},
    query: filterNullValueObject({ menuCamp }),
  });
}
export async function paymentInvoiceCreate(body) {
  return request(`/ssta/v1/${tenantId}/settle-headers/purchaser/create-payment-by-invoice`, {
    method: 'POST',
    body,
  });
}

export async function printList(params) {
  const { responseType, headers, list, menuCamp } = params || {};
  return request(`/ssta/v1/${tenantId}/settle-headers/printList`, {
    method: 'GET',
    responseType: responseType || 'blob', // 兼容老结算单
    headers: headers || {},
    query: filterNullValueObject({ settleHeaderIds: list, menuCamp }),
  });
}

export async function paymentInvoiceSupplyCreate(body) {
  return request(`/ssta/v1/${tenantId}/settle-headers/supplier/create-payment-by-invoice`, {
    method: 'POST',
    body,
  });
}

export async function saveMultiPre({ body, settleHeaderId }) {
  return request(`/ssta/v1/${tenantId}/settle-headers/dimension-payment-match/${settleHeaderId}`, {
    method: 'PUT',
    body,
  });
}

export async function allCreate({ type, role = 'purchaser', query }) {
  const urlObj = {
    B: `/ssta/v1/${tenantId}/bill-headers/${role}/invoice/batch`,
    C: `/ssta/v1/${tenantId}/settle-headers/${role}/invoice/batch`,
  };
  return request(urlObj[type], {
    method: 'GET',
    query,
  });
}
// 付款 引用事务创建 异步创建
export async function paymentCreateSync({ role = 'purchaser', body }) {
  return request(`/ssta/v1/${tenantId}/settle-headers/${role}/payment/batch`, {
    method: 'POST',
    body,
  });
}

export async function submitValidate({ body, role = 'purchaser' }) {
  return request(`/ssta/v1/${tenantId}/settle-headers/${role}/validate/submit`, {
    method: 'PUT',
    body,
  });
}

export async function debounceSubmitValidate(body) {
  return request(`/ssta/v1/${organizationId}/settle-lines/validate`, {
    method: 'PUT',
    body,
  });
}

export async function confirmValidate({ body, role = 'purchaser' }) {
  return request(`/ssta/v1/${tenantId}/settle-headers/${role}/validate/confirm`, {
    method: 'PUT',
    body,
  });
}

export async function returnWorkflowValidate(body) {
  return request(`/ssta/v1/${tenantId}/settle-headers/validate/return-workflow`, {
    method: 'PUT',
    body,
  });
}

export async function workflowValidate(body) {
  return request(`/ssta/v1/${tenantId}/settle-headers/validate/workflow`, {
    method: 'PUT',
    body,
  });
}

export async function getPreHeader(settleHeaderId, customizeUnitCode) {
  return request(
    `/ssta/v1/${tenantId}/pre-pay-headers/${settleHeaderId}?customizeUnitCode=${customizeUnitCode}`,
    {
      method: 'GET',
    }
  );
}

export async function savePaymentInfo(body, customizeUnitCode) {
  return request(
    `/ssta/v1/${tenantId}/settle-headers/bank-info?customizeUnitCode=${customizeUnitCode}`,
    {
      method: 'PUT',
      body,
    }
  );
}

export async function searchHeaderInfo(params) {
  const { settleHeaderNum } = params;
  return request(`/ssta/v1/${tenantId}/settle-headers?settleHeaderNum=${settleHeaderNum}`, {
    method: 'GET',
  });
}

/**
 * 获取电商随货发票信息
 *
 */

export async function invoiceInformation(settleHeaderId) {
  return request(`/ssta/v1/${organizationId}/tax-invoice-headers/ec-tax-inoice/${settleHeaderId}`, {
    method: 'POST',
  });
}

/**
 * 发票作废/红冲
 *
 */

export async function onlyCancelDirectInvoice(settleHeaderId) {
  return request(
    `/ssta/v1/${organizationId}/tax-invoice-headers/purchaser/only-cancel-direct-invoice/${settleHeaderId}`,
    {
      method: 'POST',
    }
  );
}

/**
 * 基于价格库取价
 *
 */

export async function getPriceFromLib(body) {
  return request(`/ssta/v1/${organizationId}/settles/get-price-from-lib`, {
    method: 'PUT',
    body,
  });
}

/**
 * 全选价格库取价
 *
 */
export async function getAllPriceFromLib(data) {
  const { role = 'purchaser', ...query } = data;
  return request(`${prefix}/settles/${role}/batch/get-price-from-lib`, {
    method: 'GET',
    query,
  });
}

export async function invoiceCheck(settleHeaderId, action) {
  return request(
    `/ssta/v1/${organizationId}/tax-invoice-headers/check-settle-header/${settleHeaderId}/${action}`,
    {
      method: 'POST',
    }
  );
}
export async function taxInvoiceCheck(data) {
  return request(`/ssta/v1/${organizationId}/tax-invoice-headers/batch-check`, {
    method: 'POST',
    body: data,
  });
}
export async function taxSureValidate(settleHeaderId) {
  return request(
    `/ssta/v1/${organizationId}/tax-invoice-headers/workflow-validate/${settleHeaderId}`,
    {
      method: 'GET',
    }
  );
}
export async function taxValidate(settleHeaderId) {
  return request(`/ssta/v1/${organizationId}/tax-invoice-headers/validate/${settleHeaderId}`, {
    method: 'GET',
  });
}

export async function syncPrintData(params) {
  return request(`/ssta/v1/${tenantId}/settle-headers/syncPrintData`, {
    method: 'PUT',
    body: params,
  });
}

export async function getBankInfo(params) {
  const { supBankFlag, ...query } = params;
  const url = supBankFlag
    ? `/ssta/v1/${tenantId}/settle-headers/supplier-bank-info`
    : `/ssta/v1/${tenantId}/settle-headers/bank-info`;
  return request(url, { method: 'GET', query });
}

export async function getPayBankInfo(params) {
  const { companyId } = params;
  return request(`${SRM_SSTA}/v1/${tenantId}/comment/purchaser/bank-account/${companyId}`, {
    method: 'GET',
  });
}

// 查新供应商主数据默认值
export async function querySupMasterPaymentInfo(params) {
  return request(`/ssta/v1/${tenantId}/pre-pay-headers/query-supplier-payment-term-and-type`, {
    method: 'GET',
    query: filterNullValueObject(params),
  });
}

/**
 * 采购方结算单-撤回
 */
export async function withdraw(data) {
  return request(`${prefix}/settle-headers/purchaser/recall`, {
    method: 'PUT',
    body: data,
  });
}
/**
 * 销售方结算单-撤回
 */
export async function featchWithdraw(params) {
  return request(`${prefix}/settle-headers/supplier/recall`, {
    method: 'PUT',
    body: params,
  });
}

/**
 * 预付款创建付款信息默认值
 */

export async function getDefaultPaymentInfo(params) {
  return request(`/ssta/v1/${tenantId}/pre-pay-headers/create/init-payment`, {
    method: 'GET',
    query: params,
  });
}

// 采购方可维护-取消验证
export async function confirmPurchaserDelete({ body }) {
  return request(`/ssta/v1/${tenantId}/settle-headers/purchaser/validate/delete`, {
    method: 'PUT',
    body,
  });
}

// 采购方可取消-取消验证
export async function confirmPurchaserCancel({ body }) {
  return request(`/ssta/v1/${tenantId}/settle-headers/purchaser/validate/cancel`, {
    method: 'PUT',
    body,
  });
}

// 销售方可维护-取消验证
export async function confirmSupplierDelete({ body }) {
  return request(`/ssta/v1/${tenantId}/settle-headers/supplier/validate/delete`, {
    method: 'PUT',
    body,
  });
}

// 销售方可取消-取消验证
export async function confirmSupplierCancel({ body }) {
  return request(`/ssta/v1/${tenantId}/settle-headers/supplier/validate/cancel`, {
    method: 'PUT',
    body,
  });
}

/**
 * 查询预付款核销--采购方
 */
export async function getMutilPayApplyPurchaser(params) {
  return request(`/ssta/v1/${tenantId}/settle-lines/mutil-payment-apply/purchaser`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询预付款核销--销售方
 */

export async function getMutilPayApplySupplier(params) {
  return request(`/ssta/v1/${tenantId}/settle-lines/mutil-payment-apply/supplier`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询结算单详情信息
 */

export async function getSettleHeaderDetail(params) {
  const { documentType } = params;
  const customizeUnitCode =
    documentType === 'PAYMENT'
      ? 'SSTA.PURCHASE_SETTLE_DETAIL.PAYMENT_BASIC,SSTA.PURCHASE_SETTLE_DETAIL.PAY_TRADINGPARTY,SSTA.PURCHASE_SETTLE_DETAIL.SUMMARY_INFORMATION,SSTA.PURCHASE_SETTLE_DETAIL.BILL_INFO,SSTA.PURCHASE_SETTLE_DETAIL.PAY_INVOICE_MATCHING,SSTA.PURCHASE_SETTLE_DETAIL.PRE_PAYMENT_REMOVE,SSTA.PURCHASE_SETTLE_DETAIL.PAYMENT_INFORMATION,SSTA.PURCHASE_SETTLE_DETAIL.PAY_DIR_BILL_INFO,SSTA.PURCHASE_SETTLE_DETAIL.PAY_OTHER_INFO,SSTA.PURCHASE_SETTLE_DETAIL.PAYMENT_INFO_BOX'
      : 'SSTA.PURCHASE_SETTLE_DETAIL.PAYMENT_BASIC,SSTA.PURCHASE_SETTLE_DETAIL.BASIC,SSTA.PURCHASE_SETTLE_DETAIL.TRADINGPARTY,SSTA.PURCHASE_SETTLE_DETAIL.INVOICE_SUMMARY_INFORMATION,SSTA.PURCHASE_SETTLE_DETAIL.INVOICE_BILL_INFO,SSTA.PURCHASE_SETTLE_DETAIL.INVOICE_MATCHING,SSTA.PURCHASE_SETTLE_DETAIL.INVOICE_PRE_PAYMENT_REMOVE,SSTA.PURCHASE_SETTLE_DETAIL.INVOICE_PAYMENT_INFORMATION,SSTA.PURCHASE_SETTLE_DETAIL.INVOICE_OTHER_INFO';
  return request(
    `/ssta/v1/${organizationId}/settle-headers?customizeUnitCode=${customizeUnitCode}`,
    {
      method: 'GET',
      query: params,
    }
  );
}

//
export async function getSettleHeaderData(params) {
  const { documentType, settleHeaderId, settleNum: settleHeaderNum } = params;
  return request(`/ssta/v1/${organizationId}/settle-headers`, {
    method: 'GET',
    query: filterNullValueObject({
      settleHeaderId,
      settleHeaderNum,
      customizeUnitCode: documentType && headUnitCodes[documentType].join(),
    }),
  });
}

export async function getSettleHeaderDataSup(params) {
  const { documentType, settleHeaderId, settleNum: settleHeaderNum } = params;
  return request(`/ssta/v1/${organizationId}/settle-headers`, {
    method: 'GET',
    query: {
      settleHeaderId,
      settleHeaderNum,
      customizeUnitCode: documentType && supHeadUnitCodes[documentType].join(),
    },
  });
}

/**
 * 查询结算单详情信息
 */

export async function getPrePaymentDetail(settleHeaderId, unitCodes) {
  const customizeUnitCode =
    'SSTA.PURCHASE_SETTLE_DETAIL.PRE_BASIC,SSTA.PURCHASE_SETTLE_DETAIL.PRE_PAYMENT_INFO,SSTA.PURCHASE_SETTLE_DETAIL.PRE_TRADINGPARTY,SSTA.PURCHASE_SETTLE_DETAIL.OTHER_INFO';
  return request(
    `/ssta/v1/${organizationId}/pre-pay-headers/${settleHeaderId}?customizeUnitCode=${
      unitCodes || customizeUnitCode
    }`,
    {
      method: 'GET',
    }
  );
}

/**
 * 个人中心默认配置
 */

export async function userDefaults() {
  return request(`/iam/v1/${organizationId}/user-defaults`, {
    method: 'GET',
    query: { userId: getCurrentUserId() },
  });
}

/**
 * 个人中心偏好配置
 */

export async function userDefaultsConfig() {
  return request(`/iam/hzero/v1/users/self/detail`, {
    method: 'GET',
    query: { organizationId },
  });
}

// 根据结算单编码查询开票申请单头id
export async function getDirectInvoiceApplysettleNum({ settleHeaderId = '', apiType = 'normal' }) {
  const url =
    apiType === 'transform'
      ? `${prefix}/direct-invoice-apply-headers/transform/list/${settleHeaderId}`
      : `${prefix}/direct-invoice-apply-headers/list/${settleHeaderId}`;
  return request(url, { method: 'GET', query: { dataSource: 'SRM_SETTLE_HEADER' } });
}

export async function getSettlelinesByIds({ settleLineIdList, customizeUnitCode }) {
  return request(`/ssta/v1/${organizationId}/settle-lines/query-list`, {
    method: 'POST',
    body: { settleLineIdList },
    query: { customizeUnitCode },
  });
}

export async function saveCreateSettleStep(body) {
  return request(`${prefix}/settle-headers/update-step`, {
    method: 'POST',
    body: { ...body, stepFlag: 1 },
  });
}

export async function prompt() {
  return request(`${prefix}/settle-headers/bank-prompt-default`, {
    method: 'GET',
  });
}

export async function getOcrConfig() {
  return request(`${prefix}/common/ocr-channel-mapping`, {
    method: 'GET',
  });
}

// 税务发票上传/删除附件请求新增接口
export async function updateAttachmentTaxAction(body) {
  return request(`${prefix}/tax-invoice-action/attachment`, {
    method: 'POST',
    body,
  });
}

// 税务发票-全部下载
export async function taxAttachmentAllLoad(body) {
  return request(`/hfle/v1/${organizationId}/files/download/compress/urls-and-uuids`, {
    method: 'POST',
    body,
    responseType: 'text',
  });
}

export const getLovData = (query) => {
  return request(`${prefix}/lovs/sql/data`, {
    method: 'GET',
    query,
  });
};

/**
 *获取结算单-税务发票行-新增/编辑 【发票号码】【发票代码】配置信息
 * @param {*} body
 * @returns
 */
export async function getTaxConfig() {
  return request(`${prefix}/rel-table/query/ssta_tax_invoice_code_length_limit`, {
    method: 'POST',
    body: { tenantId: organizationId },
  });
}

// 预付款退款
export async function prePaymentRefund(settleHeaderList) {
  return request(`/ssta/v1/${organizationId}/pre-pay-headers/purchaser/refund/create`, {
    method: 'PUT',
    body: settleHeaderList,
  });
}

// 引用发票创建付款 获取发票行数据
export async function getInvoiceLineCount(body) {
  return request(`${prefix}/settle-headers/get-line-count`, {
    method: 'POST',
    body,
  });
}

// 删除预付款
export async function purchasePhysicsDelete(body) {
  return request(`${prefix}/settle-headers/purchaser/physics-delete`, {
    method: 'POST',
    body,
  });
}

// 删除预付款 供应商
export async function supplierPhysicsDelete(body) {
  return request(`${prefix}/settle-headers/supplier/physics-delete`, {
    method: 'POST',
    body,
  });
}
// 获取批次下的结算单
export async function getBatchSettleList(batchApproveId) {
  return request(`${prefix}/batch-approve/${batchApproveId}/settle/group`, {
    method: 'GET',
  });
}

// 获取审批方式
export async function getSettleApproveWay(data) {
  return request(`${prefix}/batch-approve/approve-method`, {
    method: 'POST',
    body: data,
    responseType: 'text',
  });
}

// 获取红字表
export async function fetchInvoicePlatformRed({ settleHeaderIdList }) {
  return request(`${prefix}/tax-invoice-headers/invoice-platform/fetch/invoice`, {
    method: 'PUT',
    body: settleHeaderIdList,
  });
}

export async function getSettleAiApproveResult(settleHeaderId) {
  return request(`${prefix}/ai-approve-result/detail`, {
    method: 'POST',
    body: { settleHeaderId },
  });
}

export async function smartPreReviewPrepayment(data) {
  return request(`${prefix}/pre-pay-headers/purchaser/smartPreReview`, {
    method: 'PUT',
    body: data,
  });
}

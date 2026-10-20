import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_PLATFORM } from '_utils/config';

/**
 * 请求API前缀
 * @type {string}
 */
const organizationId = getCurrentOrganizationId();
const prefix = `/ssta/v1/${organizationId}`;

/**
 * 列表页新建
 */

export async function newList(data, customizeUnitCode = '') {
  return request(`${prefix}/invoice-header/purchaser?customizeUnitCode=${customizeUnitCode}`, {
    method: 'POST',
    body: [data],
  });
}
// export async function newList (data) {
//   return request(`${prefix}/invoice-header/supplier`, {
//     method: 'POST',
//     body: [data],
//   });
// }
/**
 * 列表页修改信息
 */

export async function editList(data, customizeUnitCode = '') {
  return request(`${prefix}/invoice-header/purchaser?customizeUnitCode=${customizeUnitCode}`, {
    method: 'PUT',
    body: data,
  });
}
/**
 * 取消发票
 */

export async function cancelList(data) {
  return request(`${prefix}/invoice-header/purchaser/cancel`, {
    method: 'POST',
    body: data,
  });
}
/**
 * 查验补全
 */

export async function checkList(data) {
  return request(`${prefix}/invoice-header/check`, {
    method: 'POST',
    body: data,
  });
}
export async function OCRCheck(data, query) {
  return request(`${prefix}/invoice-header/ocr-import`, {
    method: 'POST',
    body: data,
    query,
  });
}
// ofd解析
export async function OFDCheck(data, query) {
  return request(`${prefix}/invoice-header/ofd-import`, {
    method: 'POST',
    body: data,
    query,
  });
}
// 采购方选择发票池
export async function purChosePool(settleHeaderId, b) {
  //  const { settleHeaderId, poolSelect } = data
  // const requestbody = { ...otherparams }
  return request(`${prefix}/invoice-header/tax-invoice-header/${settleHeaderId}`, {
    method: 'POST',
    body: b,
  });
}
// 结算单税务新建
export async function newTax(settleHeaderId, data, k) {
  const { source } = k;
  const customizeUnitCode =
    source === 'sup'
      ? 'SSTA.SUPPLY_SETTLE_DETAIL.TAXINVOICE,SSTA.SUPPLY_SETTLE_DETAIL.TAX_INVOICE_ADD_OLD,SSTA.SUPPLY_SETTLE_DETAIL.TAX_INVOICE_EDIT_OLD'
      : 'SSTA.PURCHASE_SETTLE_DETAIL.TAX_INVOICE_ADD_OLD,SSTA.PURCHASE_SETTLE_DETAIL.TAXINVOICE,SSTA.PURCHASE_SETTLE_DETAIL.TAX_INVOICE_EDIT_OLD';
  return request(
    `${prefix}/tax-invoice-headers/${settleHeaderId}?customizeUnitCode=${customizeUnitCode}`,
    {
      method: 'POST',
      body: [data],
    }
  );
}
// 结算单发票查验
export async function checkInvoice(data) {
  return request(`${prefix}/tax-invoice-headers/batch-check`, {
    method: 'POST',
    body: data,
  });
}
// 结算单ocr上传
export async function OCRCheckSettle(settleHeaderId, data) {
  return request(`${prefix}/tax-invoice-headers/ocr-import/${settleHeaderId}`, {
    method: 'POST',
    body: data,
  });
}
// 结算单ofd上传
export async function OFDCheckSettle(settleHeaderId, data) {
  return request(`${prefix}/tax-invoice-headers/ofd-import/${settleHeaderId}`, {
    method: 'POST',
    body: data,
  });
}
export async function editUploadList(data) {
  return request(`${prefix}/invoice-header/upload-attachment`, {
    method: 'PUT',
    body: data,
  });
}
export async function getJpgAddress(invoiceHeaderId) {
  return request(`${prefix}/invoice-header/preview/${invoiceHeaderId}`, {
    method: 'GET',
  });
}
export async function checkAll(data) {
  return request(`${prefix}/invoice-header/batch-check`, {
    method: 'POST',
    body: data,
  });
}
export async function deleteLine(data) {
  return request(`${prefix}/tax-invoice-headers`, {
    method: 'DELETE',
    body: data,
  });
}

export async function getNumber(parmas) {
  const { type, ...others } = parmas;
  return request(`/ssta/v1/${organizationId}/invoice-header/${type}/page`, {
    method: 'GET',
    query: { ...others, page: 0, size: 1, onlyCountFlag: 'Y' },
  });
}

// 税务发票打印
export async function printTax(body) {
  return request(`/ssta/v1/${organizationId}/invoice-header/print`, {
    method: 'PUT',
    responseType: 'blob',
    body,
  });
}
// 税务发票下载
export async function downloadTax(body) {
  return request(`/ssta/v1/${organizationId}/invoice-header/download`, {
    method: 'PUT',
    responseType: 'blob',
    body,
  });
}
// 税务发票批量打印或下载
export async function batchPrintDownload(body) {
  return request(`/ssta/v1/${organizationId}/invoice-header/batch/print-download`, {
    method: 'PUT',
    body,
  });
}

// 获取业务规则定义
export async function getBusinessRules({ cnfCode, ...query }) {
  return request(
    `${SRM_PLATFORM}/v1/${organizationId}/cnf-actions/${cnfCode}/invoke_with_parameter`,
    {
      method: 'GET',
      query,
    }
  );
}

// 税务发票更新附件
export async function updateAttachmentTax(body) {
  return request(`/ssta/v1/${organizationId}/tax-invoice-headers/upload-attachment`, {
    method: 'PUT',
    body,
  });
}

// 税务发票上传/删除附件请求新增接口
export async function updateAttachmentTaxAction(body) {
  return request(`/ssta/v1/${organizationId}/invoice-action/attachment`, {
    method: 'POST',
    body,
  });
}

/**
 * 获取业务规则
 */
export async function getConfig() {
  return request(`${prefix}/common/tax-invoice-line-config`, {
    method: 'GET',
  });
}

/**
 *获取发票池新增/编辑 【发票号码】【发票代码】配置信息
 * @param {*} body
 * @returns
 */
export async function getInvoiceConfig() {
  return request(`${prefix}/rel-table/query/ssta_invoice_pool_code_length_limit`, {
    method: 'POST',
    body: { tenantId: organizationId },
  });
}

export async function voidInvoice(body) {
  return request(`${prefix}/invoice-header/red-cancel `, {
    method: 'POST',
    body,
  });
}

export async function getRedInkInfoSheet(body) {
  return request(`${prefix}/invoice-header/red-info `, {
    method: 'POST',
    body,
  });
}

export async function getDirInvApplyDataByNum(applyNum) {
  const api = `${prefix}/direct-invoice-apply-headers/detail/apply-num/${applyNum}`;
  return request(api, { method: 'GET' });
}

export async function getPullCnfConfig() {
  return request(`${prefix}/invoice-header/pull-cnf-config`, {
    method: 'POST',
    body: {},
  });
}

export async function invoiceAckValidate(body) {
  return request(`${prefix}/invoice-header/ack/validate`, {
    method: 'PUT',
    body,
  });
}

export async function invoiceAck(body) {
  return request(`${prefix}/invoice-header/ack`, {
    method: 'POST',
    body,
  });
}

export async function tripartDetailPull(body) {
  return request(`${prefix}/invoice-header/pull-detail`, {
    method: 'POST',
    body,
  });
}

export async function getSelfRole() {
  return request(`/iam/hzero/v1/users/self`, {
    method: 'GET',
  });
}

export async function syncInvoicePool(body) {
  return request(`${prefix}/invoice-header/sync`, {
    method: 'POST',
    body,
  });
}

/**
 * 供应商开票工作台 - services
 * @Author: qingxiang.luo@going-link.com
 * @Date: 2021-01-06
 * @Copyright: Copyright (c) 2021, Hand
 */
import { getCurrentOrganizationId } from 'utils/utils'; // parseParameters
import request from 'utils/request';
import { SRM_PLATFORM } from '_utils/config.js';
import { HZERO_FILE } from 'utils/config';

const organizationId = getCurrentOrganizationId();

export async function cancelInvoice(params) {
  return request(`${SRM_PLATFORM}/v1/acrm-supplier-invoices/cancel/${params.supplierPaymentId}`, {
    method: 'GET',
    query: { ...params },
  });
}

export async function queryPaymentList(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/supplier-payment/payment-list`, {
    method: 'GET',
    query: { ...params },
  });
}

export async function approveInvoice(params) {
  return request(`${SRM_PLATFORM}/v1/acrm-supplier-payments`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 获取开票信息
 * @param {*} params
 * @returns
 */
export async function queryBillingInfo(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/supplier-payment/ticket-detail`, {
    method: 'GET',
    query: { ...params },
  });
}

/**
 * 保存开票信息
 * @param {*} params
 * @returns
 */
export async function saveBillingInfo(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/supplier-payment/ticket/save`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 获取发票信息
 * @param {*} params
 * @returns
 */
export async function queryInvoiceInfo(params) {
  return request(
    `${SRM_PLATFORM}/v1/${organizationId}/supplier-payment/invoice/${params.supplierInvoiceId}`,
    {
      method: 'GET',
      query: { ...params },
    }
  );
}

/**
 * 保存发票信息
 * @param {*} params
 * @returns
 */
export async function saveInvoiceInfo(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/supplier-payment/invoice/save`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 去支付
 * @param {*} params
 * @returns
 */
export async function beforeGenerate(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/supplier-payment/pre-pay`, {
    body: params,
    method: 'POST',
    responseType: 'text',
  });
}

/**
 * 获取续费账单信息
 * @param {*} params
 * @returns
 */
export async function queryPaymentInfo(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/supplier-payment/payment/renew-payment`, {
    method: 'POST',
    body: { ...params },
  });
}

/**
 * 取消缴费
 * @param {*} params
 * @returns
 */
export async function cancelPay(params) {
  return request(
    `${SRM_PLATFORM}/v1/${organizationId}/supplier-payment/payment/cancel-payment/${params.supplierPaymentId}`,
    {
      method: 'GET',
      query: { ...params },
    }
  );
}

/**
 * 查询是否正在缴费
 * @param {*} params
 * @returns
 */
export async function checkAlreadyPay(params) {
  return request(
    `${SRM_PLATFORM}/v1/${organizationId}/supplier-payment/check-already-pay/${params.supplierPaymentId}`,
    {
      method: 'GET',
      // query: { ...params },
    }
  );
}

/**
 * 查询是否正在缴费
 * @param {*} params
 * @returns
 */
export async function queryCodeList(params) {
  return request(
    `${SRM_PLATFORM}/v1/${organizationId}/supplier-payment/queryAmktLov?lovCode=${params.code}`,
    {
      method: 'GET',
    }
  );
}

/**
 * 上传附件
 * @param {*} params
 * @returns
 */
export async function fetchUploadFile(params) {
  return request(`${HZERO_FILE}/v1/files/attachment/multipart`, {
    method: 'POST',
    body: params,
    responseType: 'text',
  });
}

/**
 * 删除附件
 * @param {*} params
 * @returns
 */
export async function fetchRemoveFile(params) {
  return request(`${HZERO_FILE}/v1/files/delete-by-uuid?bucketName=${params.bucketName}`, {
    method: 'POST',
    body: [params.attachmentUuid],
  });
}

/**
 * 获取文件列表
 * @param {*} params
 * @returns
 */
export async function fetchFileList(params) {
  return request(`${HZERO_FILE}/v1/files/${params.attachmentUuid}/file`, {
    method: 'GET',
  });
}

/**
 * 撤回操作
 * @param {*} params
 * @returns
 */
export async function fetchWithdraw(params) {
  return request(
    `${SRM_PLATFORM}/v1/${organizationId}/supplier-payment/payment/operate-ticket-state`,
    {
      method: 'POST',
      body: params,
    }
  );
}

/**
 * 查看操作记录
 * @param {*} params
 * @returns
 */
export async function fetchOperationRecord(params) {
  return request(
    `${SRM_PLATFORM}/v1/${organizationId}/supplier-payment/ticket-record/${params.supplierPaymentId}`,
    {
      method: 'GET',
    }
  );
}

/**
 * 获取缴费信息
 * @param {*} params
 * @returns
 */
export async function fetchPayData(params) {
  const { tenantId, ...other } = params;
  return request(`/spfm/v1/${tenantId}/supplier-payment/payment/check-supplier-payment`, {
    method: 'POST',
    body: other,
  });
}

import request from 'utils/request';
import { SRM_SSTA } from '_utils/config';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';

const sitePrefix = `${SRM_SSTA}/v1/site`;
const tenantPrefix = `${SRM_SSTA}/v1/${getCurrentOrganizationId()}`;

export const invoicePromptPrefix = isTenantRoleLevel() ? tenantPrefix : sitePrefix;
export const invoicePromptImportTemplateCode = 'SRM_C_SSTA_INVOICE_PROMPT_IMPORT';
export const invoicePromptExportTemplateCode = 'SRM_C_SSTA_INVOICE_PROMPT_EXPORT';

export async function fetchInvoicePromptPage(query) {
  return request(`${invoicePromptPrefix}/invoice-prompt/page`, {
    method: 'GET',
    query,
  });
}

export async function saveInvoicePromptHeader(data) {
  return request(`${invoicePromptPrefix}/invoice-prompt/save`, {
    method: 'POST',
    body: [data],
  });
}

export async function fetchInvoicePromptDetail(lang) {
  return request(`${invoicePromptPrefix}/invoice-prompt/${lang}/detail`, {
    method: 'GET',
  });
}

export async function fetchInvoicePromptParams(lang) {
  return request(`${invoicePromptPrefix}/invoice-prompt/${lang}/params`, {
    method: 'GET',
  });
}

export async function saveInvoicePromptAll(body) {
  return request(`${invoicePromptPrefix}/invoice-prompt/save/all`, {
    method: 'POST',
    body,
  });
}

export async function saveInvoicePromptParams(body) {
  return request(`${invoicePromptPrefix}/invoice-prompt/params/save`, {
    method: 'POST',
    body,
  });
}

export async function fetchOptionalParams(query?: Record<string, any>) {
  return request(`${invoicePromptPrefix}/invoice-prompt/params/optional/page`, {
    method: 'GET',
    query,
  });
}

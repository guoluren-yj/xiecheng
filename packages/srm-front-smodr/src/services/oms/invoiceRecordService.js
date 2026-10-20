import request from 'utils/request';
import { getCurrentOrganizationId, parseParameters } from 'utils/utils';
import { SMALL_ORDER } from '_utils/config';

const organizationId = getCurrentOrganizationId(); // 租户ID

// 发票记录查询api
export async function fetchInvoiceRecord(params) {
  const param = parseParameters(params);
  return request(`${SMALL_ORDER}/v1/${organizationId}/invoices/header`, {
    method: 'GET',
    query: param,
  });
}

// 发票头拓展查询api
export async function fetchInvoiceHeader(params) {
  const param = parseParameters(params);
  return request(`${SMALL_ORDER}/v1/${organizationId}/invoices/header-expand`, {
    method: 'GET',
    query: param,
  });
}

// 发票行查询api
export async function fetchInvoicePro(params) {
  const param = parseParameters(params);
  return request(`${SMALL_ORDER}/v1/${organizationId}/invoices/detail`, {
    method: 'GET',
    query: param,
  });
}

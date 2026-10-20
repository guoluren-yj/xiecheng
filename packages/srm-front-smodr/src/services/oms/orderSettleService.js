import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';
import { SMALL_ORDER } from '_utils/config';

const organizationId = getCurrentOrganizationId();

export async function fetchSettleDetail(param) {
  return request(`${SMALL_ORDER}/v1/${organizationId}/settlements/detail`, {
    method: 'GET',
    query: param,
  });
}

export async function fetchStateDetail(param) {
  return request(`${SMALL_ORDER}/v1/${organizationId}/statementss/detail`, {
    method: 'GET',
    query: param,
  });
}
export async function fetchInvoiceAppDetail(param) {
  return request(`${SMALL_ORDER}/v1/${organizationId}/invoice-requests/detail`, {
    method: 'GET',
    query: param,
  });
}
export async function fetchInvoiceDetail(param) {
  return request(`${SMALL_ORDER}/v1/${organizationId}/invoices/detail`, {
    method: 'GET',
    query: param,
  });
}
export async function invoiceDownLoad(param) {
  return request(`${SMALL_ORDER}/v1/${organizationId}/invoice-requests/detail`, {
    method: 'GET',
    query: param,
  });
}

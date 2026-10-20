import request from 'utils/request';
import { SRM_SSTA } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const tenantId = getCurrentOrganizationId();
const prefix = `${SRM_SSTA}/v1/${tenantId}`;

export async function batchSaveInvApply(body: Record<string, any>) {
  return request(`${prefix}/direct-invoice-apply-headers/batch/save`, {
    method: 'PUT',
    body,
  });
}

export async function confirmSettleInvApply(body: Record<string, any>) {
  return request(`${prefix}/settle-headers/supplier/invoice/submit`, {
    method: 'PUT',
    body,
  });
}

export async function confirmTenderInvApply(body: Record<string, any>) {
  return request(`${prefix}/tender-feess/invoice-application/confirm`, {
    method: 'POST',
    body,
  });
}

export async function queryInvoicingApplyList(sourceDocId, dataSource, billingType) {
  return request(`${prefix}/direct-invoice-apply-headers/list/${sourceDocId}`, {
    method: 'GET',
    query: { dataSource, billingType },
  });
}

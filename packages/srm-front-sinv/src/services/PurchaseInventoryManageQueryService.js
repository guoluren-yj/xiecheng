import request from 'utils/request';
import {
  getCurrentOrganizationId,
  parseParameters,
  filterNullValueObject,
  getUserOrganizationId,
} from 'utils/utils';
import { SRM_SPUC } from '_utils/config';

const userId = getUserOrganizationId();
const organizationId = getCurrentOrganizationId();

export async function queryInventoryList(params) {
  const { isSupplier } = params;
  const url = isSupplier
    ? `${SRM_SPUC}/v1/${organizationId}/stockout/report/supplier/page`
    : `${SRM_SPUC}/v1/${organizationId}/stockout/report/page`;
  return request(`${url}`, {
    method: 'GET',
    query: parseParameters(params),
  });
}

export async function exportInventoryList() {
  return request(`${SRM_SPUC}/v1/${organizationId}/stockout/report/export`, {
    method: 'POST',
  });
}

export async function queryLovData() {
  const params = {
    tenantId: organizationId,
    partnerTenantId: userId,
    lovCode: 'SPUC.SINV_STOCK_OUT_REPORT_SUPPLIER',
  };
  return request(`/spfm/v1/lovs/sql/data`, {
    method: 'GET',
    query: filterNullValueObject(params),
  });
}

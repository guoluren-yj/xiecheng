import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';
import { SMALL_ORDER } from '_utils/config';

const organizationId = getCurrentOrganizationId(); // 租户ID

export async function fetchAfterSaleCount(params) {
  return request(`${SMALL_ORDER}/v1/${organizationId}/aftersales/purchase-count`, {
    method: 'GET',
    query: params,
  });
}
export async function fetchApproveRecord(params) {
  return request(`${SMALL_ORDER}/v1/${organizationId}/aftersales/after-sale-internal-approve-history`, {
    method: 'POST',
    body: params,
  });
}

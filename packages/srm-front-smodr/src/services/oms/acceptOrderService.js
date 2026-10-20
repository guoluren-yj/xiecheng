import request from 'utils/request';
import { getCurrentOrganizationId, parseParameters } from 'utils/utils';
import { SMALL_ORDER } from '_utils/config';

const organizationId = getCurrentOrganizationId(); // 租户ID

export async function fetchAcceptData(params) {
  const param = parseParameters(params);
  return request(`${SMALL_ORDER}/v1/${organizationId}/receipt-entrys/header`, {
    method: 'GET',
    query: param,
  });
}

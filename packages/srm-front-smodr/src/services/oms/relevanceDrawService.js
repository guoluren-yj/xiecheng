import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';
import { SMALL_ORDER } from '_utils/config';

const organizationId = getCurrentOrganizationId(); // 租户ID

export async function fetchData(params) {
  return request(`${SMALL_ORDER}/v1/${organizationId}/order-entrys/associated-documents`, {
    method: 'GET',
    query: { orderEntryId: params },
  });
}

import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';

const SRM_SMPC = '/smpc';
const organizationId = getCurrentOrganizationId(); // 租户ID

export async function saveData(params, method) {
  return request(`${SRM_SMPC}/v1/${organizationId}/sku-stocks`, {
    method,
    body: params,
  });
}

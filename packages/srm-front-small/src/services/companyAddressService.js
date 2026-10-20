import { getCurrentOrganizationId } from 'utils/utils';
import request from 'utils/request';
import { SRM_MALL } from '_utils/config';

const organizationId = getCurrentOrganizationId();

// 地址 批量启用禁用
export async function batchEnableOrDsiable(params) {
  return request(`${SRM_MALL}/v1/${organizationId}/addresss/batch-enable`, {
    method: 'POST',
    body: params,
  });
}

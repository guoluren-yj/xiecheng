import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId(); // 租户ID

// 创建意向单
export async function createIntent(params) {
  return request(`/smkt/v1/${organizationId}/intent-letters`, {
    method: 'POST',
    body: params,
  });
}

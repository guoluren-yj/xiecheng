import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();
const SRM_STCK = '/stck';

// 库存策略保存
export function fetchSetWaring(params) {
  return request(`${SRM_STCK}/v1/${organizationId}/stocks/set-warning-stock`, {
    method: 'POST',
    body: params,
  });
}
import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId(); // 租户ID

// 判断是否有撤销按钮
export async function fetchOperationFlagService(params) {
  return request(`/hwfp/v1/${organizationId}/runtime/prc/operation-flag?revokeFlag=1`, {
    method: 'POST',
    body: params,
  });
}

// 撤销工作流审批
export function revokeApproveService(params) {
  return request(`/hwfp/v1/${organizationId}/runtime/prc/revoke-by-key/${params}`, {
    method: 'GET',
    responseType: 'text',
  });
}

import request from 'utils/request';
import { SRM_SSTA } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const tenantId = getCurrentOrganizationId();
const apiPrefix = `${SRM_SSTA}/v1/${tenantId}`;

// 查询审批记录数据
export async function fetchApprovalData(query: Record<'primaryId' | 'documentType', any>) {
  return request(`${apiPrefix}/settle-headers/ssta-historyApproval-batch`, {
    method: 'GET',
    query,
  });
}
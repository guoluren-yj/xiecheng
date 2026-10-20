import request from 'utils/request';
import { getCurrentOrganizationId, getCurrentTenant } from 'utils/utils';
import { SRM_PLATFORM, SRM_SPUC } from '_utils/config';

// 查询配置表逻辑
export async function fetchConfigSheet(params) {
  const { configCode } = params;
  const organizationId = getCurrentOrganizationId();
  const data = {
    tenantNum: getCurrentTenant().tenantNum,
  };
  return request(
    `${SRM_PLATFORM}/v1/${organizationId}/rel-table-records/${configCode}/list-from-site`,
    {
      method: 'POST',
      body: data,
    }
  );
}

// 智能审核提交
export async function aiPreReview(params) {
  const organizationId = getCurrentOrganizationId();
  return request(`${SRM_SPUC}/v1/${organizationId}/po/ai-approve-result/submit-task`, {
    method: 'POST',
    body: params,
  });
}

// 智能审核状态查询
export async function aiPreReviewStatus(params) {
  const organizationId = getCurrentOrganizationId();
  return request(`${SRM_SPUC}/v1/${organizationId}/po/ai-approve-result/detail`, {
    method: 'POST',
    body: params,
  });
}

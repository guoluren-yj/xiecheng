import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

// 显示0/隐藏1/删除2
export async function updateEvaluate(params) {
  const { flag, data = [] } = params;
  return request(`/smpc/v1/${organizationId}/assessments/status/${flag}`, {
    method: 'POST',
    body: data,
  });
}

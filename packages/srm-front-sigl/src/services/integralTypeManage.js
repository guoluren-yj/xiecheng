import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';
import { MEMBER_MANAGE } from '@/utils/config';

const organizationId = getCurrentOrganizationId();

// 校验积分类型是否被销售协议引用
export async function validateUseBySaleProtocol(params) {
  return request(`${MEMBER_MANAGE}/v1/${organizationId}/points-types/used-by-agreement`, {
    method: 'POST',
    body: params,
  });
}

// 提交
export async function fetchSubmit(params) {
  return request(`${MEMBER_MANAGE}/v1/${organizationId}/points-types`, {
    method: 'POST',
    body: params,
  });
}

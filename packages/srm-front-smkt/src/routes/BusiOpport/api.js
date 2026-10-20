import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId(); // 租户ID

const SRM_SMKT = '/smkt';

// 查询意向单列表
export async function fetchIntentLetters(params) {
  return request(`${SRM_SMKT}/v1/${organizationId}/intent-letters`, {
    method: 'GET',
    query: params,
  });
}

// 查询意向单详情
export async function fetchIntentDetail(params) {
  return request(`${SRM_SMKT}/v1/${organizationId}/intent-letters/${params.letterId}`, {
    method: 'GET',
  });
}

// 确认意向单
export async function confirmIntentLetter(params) {
  return request(`${SRM_SMKT}/v1/${organizationId}/intent-letters/approve`, {
    method: 'POST',
    body: params,
  });
}

// 拒绝意向单
export async function rejectIntentLetter(params) {
  return request(`${SRM_SMKT}/v1/${organizationId}/intent-letters/reject`, {
    method: 'POST',
    body: params,
  });
}

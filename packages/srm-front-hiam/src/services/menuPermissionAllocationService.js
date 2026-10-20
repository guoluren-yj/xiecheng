import { HZERO_IAM } from 'utils/config';
import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';

// 检查是否有权限
export async function getPermission() {
  return request(`${HZERO_IAM}/v1/${getCurrentOrganizationId()}/inner-menu-assign/check-access`, {
    method: 'GET',
  });
}

// 保存目录权限
export async function saveMenuAssign(body) {
  return request(`${HZERO_IAM}/v1/${getCurrentOrganizationId()}/inner-menu-assign`, {
    method: 'POST',
    body,
  });
}

// 提交目录权限
export async function submitMenuAssign(body) {
  return request(`${HZERO_IAM}/v1/${getCurrentOrganizationId()}/inner-menu-assign/submit`, {
    method: 'POST',
    body,
  });
}

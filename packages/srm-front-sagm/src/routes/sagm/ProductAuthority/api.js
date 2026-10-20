import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

// 启用/禁用
export function enableAuthority(params) {
  return request(`/sagm/v1/${organizationId}/authority-lists`, {
    method: 'POST',
    body: params,
  });
}

// 变更
export function upgradeAuthority(params) {
  return request(`/sagm/v1/${organizationId}/authority-lists/upgrade-version`, {
    method: 'POST',
    body: params,
  });
}

// 发布
export function publishAuthority(params) {
  return request(`/sagm/v1/${organizationId}/authority-lists/publish`, {
    method: 'POST',
    body: params,
  });
}

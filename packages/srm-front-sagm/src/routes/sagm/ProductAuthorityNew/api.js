import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

// 查询子权限
export function fetchSubAuthority(authorityListId) {
  return request(`/sagm/v1/${organizationId}/authority-lists/get-child/${authorityListId}`, {
    method: 'GET',
  });
}

// 查询已分配商品
export function fetchAuthorityBindSku(params) {
  return request(`/sagm/v1/${organizationId}/auth-exclude-sku-details`, {
    method: 'GET',
    query: params,
  });
}

// 查询权限历史版本
export function fetchAuthorityHisVersion(params) {
  return request(`/sagm/v1/${organizationId}/authority-lists/history-version`, {
    method: 'GET',
    query: params,
  });
}

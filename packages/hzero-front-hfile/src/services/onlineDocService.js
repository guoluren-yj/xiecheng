import request from 'utils/request';
import { HZERO_FILE } from 'utils/config';
import { isTenantRoleLevel, getCurrentOrganizationId } from 'utils/utils';

function apiSource() {
  return isTenantRoleLevel()
    ? `${HZERO_FILE}/v1/${getCurrentOrganizationId()}/online-editor/by-request-id`
    : `${HZERO_FILE}/v1/online-editor/by-request-id`;
}

// 获取WPS在线编辑地址
export async function fetchOnlineEditorUrl(params) {
  return request(`${apiSource()}`, {
    method: 'GET',
    query: params,
  });
}

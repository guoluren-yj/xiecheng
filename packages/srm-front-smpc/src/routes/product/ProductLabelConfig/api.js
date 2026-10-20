import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';

const SRM_SMPC = '/smpc';

const organizationId = getCurrentOrganizationId();
const isPlatform = organizationId === 0; // 是否为平台级

// 创建标签
export async function addLabel(params) {
  const url = isPlatform ? `${SRM_SMPC}/v1/labels` : `${SRM_SMPC}/v1/${organizationId}/labels`;
  return request(url, {
    method: 'POST',
    body: params,
  });
}

// 启用、禁用标签
export async function setEnable(param) {
  const url = isPlatform
    ? `${SRM_SMPC}/v1/labels/enabled-flag`
    : `${SRM_SMPC}/v1/${organizationId}/labels/enabled-flag`;
  return request(url, {
    method: 'POST',
    body: param,
  });
}

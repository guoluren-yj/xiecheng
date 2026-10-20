import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SMPC } from '_utils/config';

const organizationId = getCurrentOrganizationId();

// 用户白名单状态变更
export async function updateWhiteList(params) {
  return request(`${SRM_SMPC}/v1/${organizationId}/same-sku-manages/whitelist-config`, {
    method: 'POST',
    body: params,
  });
}

// 移出同款装套变更
export async function updateSameSku(params) {
  return request(`${SRM_SMPC}/v1/${organizationId}/same-sku-manages/blacklist-config`, {
    method: 'POST',
    body: params,
  });
}

export async function deleteBlackList(params) {
  return request(`${SRM_SMPC}/v1/${organizationId}/same-sku-blacklists`, {
    method: 'DELETE',
    body: params,
  });
}

export async function deleteWhiteList(params) {
  return request(`${SRM_SMPC}/v1/${organizationId}/same-sku-whitelists`, {
    method: 'DELETE',
    body: params,
  });
}

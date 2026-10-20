import request from 'utils/request';
import { SRM_SMPC } from '_utils/config';

/**
 * 保存
 */
export async function saveBrand(params) {
  const { edit = false, ...others } = params;
  return request(`${SRM_SMPC}/v1/brand`, {
    method: edit ? 'PUT' : 'POST',
    body: others,
  });
}

/**
 * 启用
 */
export async function setEnable(params) {
  return request(`${SRM_SMPC}/v1/brand/restart`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 禁用
 */
export async function setDisabled(params) {
  return request(`${SRM_SMPC}/v1/brand/stop`, {
    method: 'POST',
    body: params,
  });
}

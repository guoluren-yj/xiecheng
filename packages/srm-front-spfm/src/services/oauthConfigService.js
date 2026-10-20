import request from 'utils/request';
import { SRM_PLATFORM } from '_utils/config';
import { parseParameters } from 'utils/utils';

/**
 * 查询配置
 */
export async function fetchOauthList(params) {
  return request(`${SRM_PLATFORM}/v1/token-fetch-confs`, {
    method: 'GET',
    query: parseParameters(params),
  });
}

// 明细页查询
export async function fetchDetail(params) {
  const { configId } = params;
  return request(`${SRM_PLATFORM}/v1/token-fetch-confs/${configId}`);
}

// 删除
export async function deleteItem(params) {
  return request(`${SRM_PLATFORM}/v1/token-fetch-confs`, {
    method: 'DELETE',
    body: params,
  });
}

// 添加
export async function addConfig(params) {
  return request(`${SRM_PLATFORM}/v1/token-fetch-confs`, {
    method: 'POST',
    body: params,
  });
}

// 编辑
export async function saveConfig(params) {
  return request(`${SRM_PLATFORM}/v1/token-fetch-confs`, {
    method: 'PUT',
    body: params,
  });
}

// 获取密钥
export async function getPublicKey(params) {
  return request(`${SRM_PLATFORM}/v1/token-fetch-confs/generateKeyPair/${params.keySize}`);
}

import request from 'utils/request';

/**
 * fetchSetDefault: 设为默认导航
 * @param {Object} params 查询参数对象
 * @returns 请求Promise对象
 */
export async function fetchSetDefault(params) {
  return request(`/smbl/v1/tenant-ai-service-configs/set-navigate-flag`, {
    method: 'POST',
    body: params,
  });
}

/**
 * fetchUpdateData: 更新数据
 * @param {Object} params 查询参数对象
 * @returns 请求Promise对象
 */
export async function fetchUpdateData(params) {
  return request(`/smbl/v1/ai-service-configs/update`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 启用
 * @param {*} params
 * @returns
 */
export async function fetchEnabledData(params) {
  return request(`/smbl/v1/ai-service-configs/enable`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 禁用
 * @param {*} params
 * @returns
 */
export async function fetchDisabledData(params) {
  return request(`/smbl/v1/ai-service-configs/disable`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 查询多语言
 * @param {*} params
 * @returns
 */
export async function fetchMultiLanguage(params) {
  return request(`/hpfm/v1/multi-language`, {
    method: 'GET',
    query: params,
  });
}

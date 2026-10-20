import request from 'utils/request';

/**
 * fetchAddData: 创建数据
 * @param {Object} params 查询参数对象
 * @returns 请求Promise对象
 */
export async function fetchAddData(params) {
  return request(`/smbl/v1/ai-skill-configs/add`, {
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
  return request(`/smbl/v1/ai-skill-configs/update`, {
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
  return request(`/smbl/v1/ai-skill-configs/enable`, {
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
  return request(`/smbl/v1/ai-skill-configs/disable`, {
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

/**
 * 设置为导航
 * @param {*} params
 * @returns
 */
export async function fetchSetNavigation(params) {
  return request(`/smbl/v1/ai-skill-configs/set-navigate`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 禁用
 * @param {*} params
 * @returns
 */
export async function fetchCancelNavigation(params) {
  return request(`/smbl/v1/ai-skill-configs/cancel-navigate`, {
    method: 'POST',
    body: params,
  });
}

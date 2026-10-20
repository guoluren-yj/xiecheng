import request from 'utils/request';

/**
 * 管道配置-启用或禁用标签数据
 * @export
 * @param {*} params
 * @returns
 */
export async function enabledConfigTag(params) {
  return request(`/sdap/v1/data-pipeline`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 输入源-启用或禁用标签数据
 * @export
 * @param {*} params
 * @returns
 */
export async function enabledInputTag(params) {
  return request(`/sdap/v1/input-source`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 输出源-启用或禁用标签数据
 * @export
 * @param {*} params
 * @returns
 */
export async function enabledOutputTag(params) {
  return request(`/sdap/v1/output-source`, {
    method: 'POST',
    body: params,
  });
}

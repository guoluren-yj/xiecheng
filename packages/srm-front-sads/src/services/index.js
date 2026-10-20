import request from 'utils/request';
/**
 * 输入源-启用或禁用标签数据
 * @export
 * @param {*} params
 * @returns
 */
export async function updateEnabled(params) {
  return request(`/sdap/v1/es-indexs`, {
    method: 'POST',
    body: params,
  });
}

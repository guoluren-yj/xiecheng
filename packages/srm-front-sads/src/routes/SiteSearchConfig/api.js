import request from 'utils/request';

export async function saveConfig(params) {
  return request(`/sads/v1/mall-search-configs`, {
    method: 'POST',
    body: params,
  });
}

import request from 'utils/request';

export function saveSearchConfig(params) {
  return request('/sads/v1/search-configs', {
    method: 'PUT',
    body: params,
  });
}

export function deleteCondition(params) {
  return request('/sads/v1/search-configs', {
    method: 'DELETE',
    body: params,
  });
}

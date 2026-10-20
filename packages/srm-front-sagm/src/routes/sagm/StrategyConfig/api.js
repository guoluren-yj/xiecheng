import request from 'utils/request';

export function saveStrategy(params) {
  return request('/sagm/v1/strategy-dimensions', {
    method: 'POST',
    body: params,
  });
}

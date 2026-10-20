import request from 'utils/request';

// 保存
export function saveDimension(params) {
  return request(`/sagm/v1/auth-dimensions`, {
    method: 'POST',
    body: params,
  });
}

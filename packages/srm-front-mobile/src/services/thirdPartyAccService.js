import request from 'utils/request';

export async function clearQuota(params) {
  return request(`/smbl/v1/third-party-accs/wechat-service/clear-quota`, {
    method: 'POST',
    query: params,
  });
}

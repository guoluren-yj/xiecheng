import request from 'utils/request';

export async function redirectLink(encryptData, queryString) {
  return request(`/smbl/v1/link/after-login/redirect/${encryptData}?${queryString}`, {
    method: 'GET',
  });
}

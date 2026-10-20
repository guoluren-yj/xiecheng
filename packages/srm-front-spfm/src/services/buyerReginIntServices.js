import request from 'utils/request';

/**
 * 查询分配采购组织
 */
// export async function handleVerificationCode(phone = '', internationalTelCode = '') {
//   return request(`/iam/hzero/v1/users/register-phone/send-captcha`, {
//     method: 'GET',
//     query: { phone, internationalTelCode, businessScope: 'register' },
//   });
// }

export async function handleSubmit(params) {
  return request(`/iam/v1/cux/gjsc/user/register`, {
    method: 'POST',
    body: params,
  });
}

// 修改密码
export async function handleChangePassword(pass, organizationId, iamUserId) {
  return request(`/iam/hzero/v1/${organizationId}/users/${iamUserId}/admin-password`, {
    method: 'PUT',
    body: { password: pass, organizationId },
  });
}

// 冻结
export async function fetchLocked(isLocked, organizationId, iamUserId) {
  return request(`/iam/v1/${organizationId}/cux/gjsc/user/locked`, {
    method: 'POST',
    body: { isLocked: isLocked === 1 ? 0 : 1, tenantId: organizationId, iamUserId },
  });
}

// 获取公钥
export async function getPublicKey() {
  return request(`/iam/v1/cux/gjsc/public-key`, {
    method: 'GET',
  });
}

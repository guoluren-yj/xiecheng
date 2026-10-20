/**
 * @Author: 杨一昊 yihao.yang@going-link.com
 * @Date: 2022-07-02 16:25:30
 * @LastEditors: 杨一昊 yihao.yang@going-link.com
 * @LastEditTime: 2022-08-01 15:40:28
 * @FilePath: /srm-front-spfm/src/services/supplierRegistrationService.js
 * @Copyright (c) 2022 by ZhenYun, All Rights Reserved.
 */
import request from 'utils/request';
import { HZERO_IAM } from 'utils/config';
import { SRM_PLATFORM } from '_utils/config';
// import { API_HOST } from 'hzero-front/lib/utils/config';

/**
 * @description: 获取手机验证码
 * @param {object} params
 * @return {*}
 */
export async function getPhoneVerificationCode(params) {
  return request(`${HZERO_IAM}/hzero/v1/users/register-phone/send-captcha`, {
    method: 'GET',
    query: {
      ...params,
    },
  });
}

/**
 * @description: 获取邮箱验证码
 * @param {object} params
 * @return {*}
 */
export async function getEmailVerificationCode(params) {
  return request(`${HZERO_IAM}/hzero/v1/users/register-email/send-captcha`, {
    method: 'GET',
    query: {
      ...params,
    },
  });
}

/**
 * @description: 注册
 * @param {object} params
 * @return {*}
 */
export async function handleSupplierRegistration(params) {
  const { authCode, captchaKey, registerWebUrl, language } = params;
  return request(`${HZERO_IAM}/hzero/v1/users/details/register`, {
    method: 'POST',
    body: { ...params },
    query: {
      captcha: authCode,
      captchaKey,
      registerWebUrl,
      language,
    },
  });
}

/**
 * @description: 直接认证
 * @param {object} params
 * @return {*}
 */
export async function Certification(params) {
  const { oneStepKeyUser } = params;
  return request(`${HZERO_IAM}/hzero/v1/users/no-relieve?oneStepKeyUser=${oneStepKeyUser}`, {
    method: 'POST',
    body: { ...params },
  });
}

/**
 * @description: 更换公司
 * @param {object} params
 * @return {*}
 */
export async function ChangeCompany(params) {
  const { oneStepKeyUser } = params;
  return request(`${HZERO_IAM}/hzero/v1/users/relieve?oneStepKeyUser=${oneStepKeyUser}`, {
    method: 'POST',
    body: { ...params },
  });
}

/**
 * @description: 获取国别码公共方法
 * @param {object} params
 * @return {*}
 */
export async function getInternationalTelCode(params) {
  return request(`${SRM_PLATFORM}/v1/register/select-international-code`, {
    method: 'GET',
    query: { ...params },
  });
}

/**
 * @description: 获取密码策略公共方法
 * @param {object} params
 * @return {*}
 */
export async function getPasswordPolicies(params) {
  return request(`${SRM_PLATFORM}/v1/companies/password-policies`, {
    method: 'GET',
    query: {
      ...params,
    },
  });
}

/**
 * @description: 通过邀请码获取采购方当时的语言环境
 * @param {object} params
 * @return {*}
 */
export async function getCurrentLanguageByCode(params) {
  return request(`${SRM_PLATFORM}/v1/register/get-lang`, {
    method: 'GET',
    query: { ...params },
  });
}

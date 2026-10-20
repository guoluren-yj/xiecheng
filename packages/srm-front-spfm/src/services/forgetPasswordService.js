import request from 'utils/request';
import { HZERO_PLATFORM } from 'utils/config';
import { SRM_PLATFORM } from '_utils/config';
import { API_HOST } from 'hzero-front/lib/utils/config';

const origin = window.location.origin.includes('localhost') ? API_HOST : window.location.origin;

export async function handleRetrieve(params) {
  const { captcha, account } = params;
  return request(`${origin}/oauth/v2/password/send-captcha?captcha=${captcha}&account=${account}`, {
    headers: {
      Accept: 'application/json, text/javascript, */*; q=0.01',
    },
    method: 'GET',
  });
}

export async function handleConfirm(params) {
  return request(`${origin}/oauth/v2/password/check-captcha`, {
    method: 'POST',
    body: params,
  });
}

export async function handleReset(params) {
  return request(`${origin}/oauth/v2/password/modify`, {
    method: 'POST',
    body: params,
  });
}

export async function handleResetPassword(params) {
  return request(`${origin}/oauth/v2/password/force-modify?supportType=${params.supportType}`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 获取模板配置项
 * @async
 * @function getLayoutConfig
 */
export async function getLayoutConfig() {
  return request(`${SRM_PLATFORM}/v1/portal-layouts/layout-pub`, {
    method: 'GET',
  });
}

/**
 * 查询系统支持的语言数据
 * @async
 * @function queryLanguageData
 * @returns fetch Promise
 */
export async function queryLanguageData() {
  return request(`${HZERO_PLATFORM}/v1/languages/list`, {
    method: 'GET',
  });
}

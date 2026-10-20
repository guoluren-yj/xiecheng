/**
 * editorOnlineService - 在线编辑 - service
 * @date: 2019年5月20日 10:42:06
 * @author: Jehu <zhihao.zeng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import fetch from 'dva/fetch';
import { notification } from 'hzero-ui';
import { API_HOST, LOGIN_URL, AUTH_SELF_URL } from 'utils/config';
import { SRM_SSRC } from '_utils/config';
import {
  generateUrlWithGetParam,
  getAccessToken,
  removeAccessToken,
  removeAllCookie,
  filterNullValueObject,
  parseParameters,
  getCurrentOrganizationId,
  isTenantRoleLevel,
} from 'utils/utils';

notification.config({
  placement: 'bottomRight',
});

function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }

  const errortext = response.statusText;
  const error = new Error(errortext);
  error.name = response.status;
  error.response = response;
  throw error;
}

const headers = {
  Pragma: 'no-cache',
  'Cache-Control': 'no-cache',
};

const organizationId = getCurrentOrganizationId(); // 租户ID
const TenantRoleLevel = isTenantRoleLevel();

function request(url, options) {
  const defaultOptions = {
    credentials: 'include',
    headers,
  };

  // TODO: API MOCK 代理
  let newUrl = !url.startsWith('/api') && !url.startsWith('http') ? `${API_HOST}${url}` : url;

  const newOptions = { ...defaultOptions, ...options };
  if (
    newOptions.method === 'POST' ||
    newOptions.method === 'PUT' ||
    newOptions.method === 'DELETE' ||
    newOptions.method === 'PATCH'
  ) {
    // newOptions.body is FormData
    newOptions.headers = {
      Accept: 'text/html',
      'Content-Type': 'text/html; charset=utf-8',
      ...newOptions.headers,
    };
  }

  // 头查询参数
  if (newOptions.query) {
    let filterNullQuery = newOptions.query;
    if (newOptions.method === 'GET') {
      filterNullQuery = filterNullValueObject(newOptions.query);
    }
    newUrl = generateUrlWithGetParam(newUrl, filterNullQuery);
  }

  const accessToken = getAccessToken();
  if (accessToken) {
    newOptions.headers = {
      ...newOptions.headers,
      Authorization: `bearer ${accessToken}`,
    };
  }

  return fetch(newUrl, newOptions)
    .then(checkStatus)
    .then(response => {
      // if (response.status === 204) {
      //   return {};
      // }
      // if (newOptions.responseType === 'blob') {
      //   return response.blob();
      // }
      // return newOptions.responseType === 'text' ? response.text() : response.json();
      return response.text();
    })
    .catch(e => {
      const status = e.name;

      if (status === 401) {
        removeAccessToken();
        removeAllCookie();
        const cacheLocation = encodeURIComponent(window.location.toString());
        // window.location.href = `${AUTH_URL}&redirect_uri=${cacheLocation}`; // 401 需要在登录后返回401的页面
        if (LOGIN_URL.includes('?')) {
          window.location.href = `${LOGIN_URL}&redirect_uri=${cacheLocation}`; // 401 需要在登录后返回401的页面
        } else {
          window.location.href = `${LOGIN_URL}?redirect_uri=${cacheLocation}`; // 401 需要在登录后返回401的页面
        }
        return; // 正常流程 这里结束
      }

      if (newUrl.indexOf(AUTH_SELF_URL) !== -1) {
        // self 接口报错后需要 跳转到错误页面
        return e;
      }

      notification.error({
        message: `${status}`,
        description: e.message,
      });
    });
}

/**
 * 请求在线编辑页面代码-协议模板在线编辑界面
 * @export {function} fetchEditorOnlineTemplateHTML
 * @param {object} params 查询参数
 * @returns {String} 返回在线编辑页面代码
 */
export async function fetchEditorOnlineTemplateHTML(params) {
  const param = parseParameters(params);
  if (TenantRoleLevel) {
    const url = `${SRM_SSRC}/v1/${organizationId}/score-rpt-templates/template-document`;
    return request(url, {
      method: 'POST',
      query: param,
    });
  } else {
    return request(`${SRM_SSRC}/v1/score-rpt-templates/template-document`, {
      method: 'POST',
      query: param,
    });
  }
}

export async function fetchEditorOnlineHTML(params) {
  const param = parseParameters(params);
  if (TenantRoleLevel) {
    const url = `${SRM_SSRC}/v1/${organizationId}/score-rpt/document`;
    return request(url, {
      method: 'POST',
      query: param,
    });
  } else {
    return request(`${SRM_SSRC}/v1/score-rpt/document`, {
      method: 'POST',
      query: param,
    });
  }
}

import fetch from 'dva/fetch';
import { routerRedux } from 'dva/router';
import React from 'react';
import { notification } from 'hzero-ui';
import { getConfig } from 'hzero-boot';
import Cookies from 'universal-cookie';

import { getDvaApp, getEnvConfig } from './iocUtils';

import intl from './intl';
// import { API_HOST, AUTH_SELF_URL, LOGIN_URL, HZERO_OAUTH } from './config';
import {
  filterNullValueObject,
  generateUrlWithGetParam,
  getAccessToken,
  getRequestId,
  getSession,
  removeAccessToken,
  removeAllCookie,
  setSession,
  encryptRequestBody,
} from './utils';
import { getMenuId } from './menuTab';

const cookies = new Cookies();

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

/**
 * 如果 后端返回的 501 需要判断是不是逻辑正常的 501
 * @param {Error} e - 原始的错误
 */
async function catchNormalError(e) {
  if (e.name === 501) {
    try {
      const errorData = await e.response.json();
      const dvaApp = getDvaApp();
      // TODO: 这里使用了 全局变量 dvaApp
      // eslint-disable-next-line
      dvaApp._store.dispatch({
        type: 'error/updateState',
        payload: {
          normal501: errorData,
        },
      });
      // eslint-disable-next-line
      dvaApp._store.dispatch(
        routerRedux.push({
          pathname: '/exception/501',
        })
      );
    } catch (_) {
      // 如果在获取 501 数据过程中 出错了, 则 认为是 非正常的出错, 抛出原先的错误
      throw e;
    }
  } else {
    throw e;
  }
}

/**
 * Requests a URL, returning a promise.
 *
 * @param  {string} url       The URL we want to request
 * @param  {object} [options] The options we want to pass to "fetch"
 * @return {object}           An object containing either "data" or "err"
 */
export default function request(url = '', options, customOptions = {}) {
  const { API_HOST, AUTH_SELF_URL, LOGIN_URL, HZERO_OAUTH } = getEnvConfig();
  let headers = {};
  if (!/\/hpfm\/v1(\/\d+)?\/prompt\/[^/]+/.test(url)) {
    headers = {
      Pragma: 'no-cache',
      'Cache-Control': 'no-cache',
    };
  }
  const defaultOptions = {
    credentials: 'include',
    headers,
  };
  const {
    // FIXME: 汪洋 @yang.wang06@hand-china.com, 询问牛哥需要添加哪些自定义fetch流程的内容
    // beforeFetch,
    // customFetch,
    // afterFetch,
    // beforeCheckStatus,
    // customCheckStatus,
    // afterCheckStatus,
    // beforeTranspile,
    // customTranspile,
    // afterTranspile,
    beforeCatch,
    beforeCheckResponse,
    encryptBody,
    // customCatch,
    // afterCatch,
  } = customOptions;
  // TODO: API MOCK 代理
  let newUrl = !url.startsWith('/api') && !url.startsWith('http') ? `${API_HOST}${url}` : url;

  const newOptions = { ...defaultOptions, ...options };
  const patchRequestHeaderConfig = getConfig('patchRequestHeader');
  let patchRequestHeader;
  if (patchRequestHeaderConfig) {
    if (typeof patchRequestHeaderConfig === 'function') {
      patchRequestHeader = patchRequestHeaderConfig();
    } else {
      patchRequestHeader = patchRequestHeaderConfig;
    }
  }
  if (
    newOptions.method === 'POST' ||
    newOptions.method === 'PUT' ||
    newOptions.method === 'DELETE' ||
    newOptions.method === 'PATCH'
  ) {
    if (!(newOptions.body instanceof FormData)) {
      newOptions.headers = {
        Accept: 'application/json',
        'Content-Type': 'application/json; charset=utf-8',
        ...newOptions.headers,
        ...patchRequestHeader,
      };
      newOptions.body = JSON.stringify(newOptions.body);
    } else {
      // newOptions.body is FormData
      newOptions.headers = {
        Accept: 'application/json',
        ...newOptions.headers,
        ...patchRequestHeader,
      };
    }
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
      'H-Request-Id': `${getRequestId()}`,
    };
  }
  const MenuId = getMenuId();
  if (MenuId) {
    newOptions.headers = {
      ...newOptions.headers,
      'H-Menu-Id': `${MenuId}`,
    };
  }

  if (patchRequestHeader) {
    newOptions.headers = {
     ...newOptions.headers,
      ...patchRequestHeader,
    }
  }
  let beforeFetch = Promise.resolve();
  if (encryptBody) {
    beforeFetch = encryptRequestBody(newOptions.body).then(res => {
      newOptions.body = res;
    });
  }
  const dvaApp = getDvaApp();
  let fetchChain = beforeFetch
    .then(() => fetch(newUrl, newOptions))
    .then(checkStatus)
    .then((response) => {
      if (beforeCheckResponse) {
        return beforeCheckResponse(response).then(data => data);
      }
      if (response.status === 204) {
        return {};
      }
      if (newOptions.responseType === 'blob') {
        return response.blob();
      }
      const data = newOptions.responseType === 'text' ? response.text() : response.json();
      // 响应拦截
      const responseIntercept = getConfig('responseIntercept');
      if (responseIntercept) {
        if (typeof responseIntercept === 'function') {
          data.then((json) => {
            responseIntercept({
              url: newUrl,
              method: newOptions.method,
              status: response.status,
              responseBody: json,
              responseHeaders: response.headers,
              requestBody: newOptions.body,
              requestQuery: newOptions.query,
              requestHeaders: newOptions.headers,
            });
          });
        }
      }

      return data;
    });
  if (beforeCatch) {
    // beforeCatch 必须为方法
    fetchChain = fetchChain.catch(beforeCatch);
  }
  fetchChain = fetchChain.catch(catchNormalError).catch((e) => {
    const status = e.name;
    const language = cookies.get('language') || 'zh_CN';
    // 监听到 401 错误 重新登陆
    // isErrorFlag 用来处理，只对第一个401做处理，后续不再处理，防止多次跳回token失效界面
    const isError = getSession('isErrorFlag'); // 获取当前的session isErrorFlag
    if (!isError) {
      // 如果没有isErrorFlag的session，设置为false
      setSession('isErrorFlag', false);
    }
    // setSession('isErrorFlag', false);
    if (status === 401) {
      // FIXME:已处理过一次401后就不再处理
      let cacheLocation = window.location.toString();
      if (cacheLocation && cacheLocation.includes('/public/unauthorized')) {
        cacheLocation = cacheLocation.replace('/public/unauthorized', '/');
      }
      cacheLocation = encodeURIComponent(cacheLocation);
      if (accessToken) {
        request(`${HZERO_OAUTH}/public/token/kickoff`, {
          method: 'POST',
          query: {
            access_token: accessToken,
          },
        }).then((res) => {
          if (res && res.kickoff === 1) {
            // 跳转到踢下线界面
            // eslint-disable-next-line
            dvaApp._store.dispatch(
              routerRedux.push({
                pathname: '/public/kickoff',
                search: `?language=${language}`,
              })
            );
            setSession('redirectUrl', cacheLocation);
            setSession('isErrorFlag', false);
          } else {
            // token 失效, 跳转到 token失效页面
            dvaApp._store.dispatch(
              routerRedux.push({
                pathname: '/public/unauthorized',
                search: `?language=${language}`,
              })
            );
            setSession('isErrorFlag', true);
            // 登陆后需要跳回的界面， 放到session中
            setSession('redirectUrl', cacheLocation);
          }
        });
        return;
      }
      removeAccessToken();
      removeAllCookie();
      // self 接口报错
      if (newUrl.indexOf(AUTH_SELF_URL) !== -1) {
        // 如果是self接口401，跳转到登录界面
        // 由于 LOGIN_URL 可以 配置, 所以 做一次判断
        if (LOGIN_URL.includes('?')) {
          window.location.href = `${LOGIN_URL}&redirect_uri=${cacheLocation}`; // 401 需要在登录后返回401的页面
          setSession('isErrorFlag', false); // 跳回登录界面后，isErrorFlag 设置为false， 表示下一次401会进行处理
          setSession('redirectUrl', cacheLocation);
        } else {
          window.location.href = `${LOGIN_URL}?redirect_uri=${cacheLocation}`; // 401 需要在登录后返回401的页面
          setSession('isErrorFlag', false); // 跳回登录界面后，isErrorFlag 设置为false， 表示下一次401会进行处理
          setSession('redirectUrl', cacheLocation);
        }
        return; // 正常流程 这里结束
      }
      if (!isError) {
        // 其他接口401，跳转到重新登录页面
        dvaApp._store.dispatch(
          routerRedux.push({
            pathname: '/public/unauthorized',
            search: `?language=${language}`,
          })
        );
        setSession('isErrorFlag', true);
        // 登陆后需要跳回的界面， 放到session中
        setSession('redirectUrl', cacheLocation);
      }
      return; // return后不执行notification.error, 不再弹出401的提示框
    }

    // self 接口报错
    if (newUrl.indexOf(AUTH_SELF_URL) !== -1) {
      // self 接口报错后需要 跳转到错误页面
      return e;
    }

    // 监听到 网络请求错误
    // https://github.com/github/fetch/issues/201
    if (status === 'TypeError') {
      notification.error({
        message: intl.get('hzero.common.notification.network.typeError').d('网络请求异常'),
        description: intl.get('hzero.common.notification.typeError.description').d('请稍后重试'),
      });
      return;
    }

    if (status === 501) {
      // 后端正常的报错/服务器报错
    }

    notification.error({
      message: intl.get('hzero.common.status.mistake').d('错误'),
      description: intl.get(`hzero.common.requestNotification.${status}`) || e.message,
    });
  });
  return fetchChain;
}

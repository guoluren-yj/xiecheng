/**
 * 文件相关
 * @email WY <yang.wang06@hand-china.com>
 * @creationDate 2019/12/25
 * @copyright HAND ® 2019
 */

import axios from 'axios';
import qs from 'querystring';

import request from 'utils/request';
import { getIeVersion } from 'utils/browser';
import { getEnvConfig } from 'utils/iocUtils';
import notification from 'utils/notification';

import {
  getAccessToken,
  getCurrentOrganizationId,
  getResponse,
  getRequestId,
} from 'utils/utils';
import { getMenuId } from 'utils/menuTab';

const { API_HOST, HZERO_FILE } = getEnvConfig();

const withTokenAxios = axios.create();
const jsonMimeType = 'application/json; charset=utf-8';
const notificationType = (type, msg) => {
  switch (type) {
    case 'info':
      notification.info({
        message: msg,
      });
      break;
    case 'warn':
      notification.warning({
        message: msg,
      });
      break;
    case 'error':
    default:
      notification.error({
        message: msg,
      });
      break;
  }
};

withTokenAxios.defaults = {
  ...withTokenAxios.defaults,
  headers: {
    ...(withTokenAxios.defaults || {}).headers,
    'Content-Type': jsonMimeType,
    Accept: 'application/json;',
    // 'X-Requested-With': 'XMLHttpRequest',
  },
  withCredentials: true,
};

// Add a request interceptor
withTokenAxios.interceptors.request.use(
  (config) => {
    let { url = '' } = config;
    if (url.indexOf('://') === -1 && !url.startsWith('/_api')) {
      url = `${API_HOST}${url}`;
    }
    // Do something before request is sent
    return {
      ...config,
      url,
      headers: {
        ...config.headers,
        Authorization: `bearer ${getAccessToken()}`,
        'H-Request-Id': `${getRequestId()}`,
        'H-Menu-Id': `${getMenuId()}`,
      },
    };
  },
  (err) => {
    return Promise.reject(err);
  }
);

withTokenAxios.interceptors.response.use(
  (res) => {
    const { status, data } = res;
    if (status === 204 || status === 200) {
      return res;
    }
    if (data && data.failed) {
      // notification.error({
      //   message: data.message,
      // });
      throw res;
    } else {
      return res;
    }
  },
  (err) => {
    throw err;
  }
);

export interface DownloadFileParams {
  requestUrl: string;
  queryParams?:
    | Array<{
        name: string;
        value: any;
      }>
    | [];
  extraData?:
    | Array<{
        name: string;
        value: any;
      }>
    | [];
  method: 'GET' | 'POST' | 'get' | 'post';
  queryData?: object;
}

export interface QueryParams {
  name: string;
  value: any;
}

/**
 * 下载
 * @export
 * @param {object} params 传递参数
 * @param {string} params.requestUrl 下载文件请求的url
 * @param {array} params.queryParams 下载文件请求的查询参数，参数格式为：[{ name: '', value: '' }]]
 */
export async function downloadFile(params: DownloadFileParams, flag?: boolean) {
  const { requestUrl: url, queryParams, method = 'GET' } = params || {};
  let newUrl = !url.startsWith('/api') && !url.startsWith('http') ? `${API_HOST}${url}` : url;
  const iframeName = `${url}${Math.random()}`;

  // 构建iframe
  const iframe = document.createElement('iframe');
  iframe.setAttribute('name', iframeName);
  iframe.setAttribute('id', iframeName);
  iframe.style.width = '0px';
  iframe.style.height = '0px';
  iframe.style.display = 'none';

  // 构建form
  const downloadForm = document.createElement('form');
  if (getIeVersion() === -1) {
    // 如果当前浏览器不为ie
    // form 指向 iframe
    downloadForm.setAttribute('target', iframeName);
  }

  // 设置token
  const tokenInput = document.createElement('input');
  tokenInput.setAttribute('type', 'hidden');
  tokenInput.setAttribute('name', 'access_token');
  tokenInput.setAttribute('value', `${getAccessToken()}`);

  // 设置requestId
  const idInput = document.createElement('input');
  idInput.setAttribute('type', 'hidden');
  idInput.setAttribute('name', 'H-Request-Id');
  idInput.setAttribute('value', `${getRequestId()}`);

  // 处理post请求时token效验
  if (method === 'POST') {
    newUrl = `${newUrl}?access_token=${getAccessToken()}&H-Request-Id=${getRequestId()}`;
  }

  // 表单添加请求配置
  downloadForm.setAttribute('method', method);
  downloadForm.setAttribute('action', newUrl);
  if (!flag) {
    downloadForm.appendChild(tokenInput);
    downloadForm.appendChild(idInput);
  }

  // 表单添加查询参数
  if (queryParams && Array.isArray(queryParams)) {
    queryParams.forEach((item) => {
      const input = document.createElement('input');
      input.setAttribute('type', 'hidden');
      input.setAttribute('name', item.name);
      input.setAttribute('value', item.value);
      downloadForm.appendChild(input);
    });
  }

  document.body.appendChild(iframe);
  document.body.appendChild(downloadForm);
  downloadForm.submit();

  // setTimeout(() => {
  //   document.body.removeChild(downloadForm);
  //   document.body.removeChild(iframe);
  // }, 2500);
  return true;
}

/**
 * 下载
 * @export
 * @param {object} params 传递参数
 * @param {string} params.requestUrl 下载文件请求的url
 * @param {array} params.queryParams 下载文件请求的查询参数，参数格式为：[{ name: '', value: '' }]]
 */
export function downloadFileByAxios(params: DownloadFileParams, filename?: string) {
  const { requestUrl: url, queryParams, method = 'GET', queryData } = params || {};
  let newUrl = !url.startsWith('/api') && !url.startsWith('http') ? `${API_HOST}${url}` : `${url}`;

  const reg1 = new RegExp(`^${HZERO_FILE}/v1(/[0-9]*)?/files/redirect-url`);
  const reg2 = new RegExp(`^${HZERO_FILE}/v1(/[0-9]*)?/files/download`);

  let fileUrl = '';
  if (reg1.test(newUrl) || reg2.test(newUrl)) {
    if (queryParams && Array.isArray(queryParams)) {
      queryParams.forEach((item) => {
        if (item.name === 'url') {
          // 修复url中带%时decodeURIComponent报错问题
          fileUrl = item.value;
        }
      });
    }

    if (fileUrl) {
      const signedParams = {};
      if (queryParams && Array.isArray(queryParams)) {
        queryParams.forEach((item) => {
          signedParams[item.name] = item.value;
        });
      }
      return querySignedUrl(signedParams)
        .then(async (res) => {
          if (getResponse(res)) {
            const signedUrl = res.substring(0, res.indexOf('?'));
            const signedQueryParams = qs.parse(res.substring(res.indexOf('?') + 1));
            const arr = [] as QueryParams[];
            Object.keys(signedQueryParams).forEach((item) => {
              if (signedQueryParams[item] && item !== url) {
                arr.push({ name: item, value: signedQueryParams[item] });
              }
            });
            await downloadFile(
              {
                requestUrl: signedUrl,
                queryParams: arr,
                method: 'GET',
              },
              true
            );
          }
          return true;
        })
        .catch((err) => {
          console.error(err);
        });
      // const index = fileUrl.lastIndexOf('/');
      // if (index > -1) {
      //  const uuidFileName = fileUrl.substring(index + 1);
      //   if(!uuidFileName.includes('@')||uuidFileName.length<33){
      //     FILE_NAME = uuidFileName;
      //   }
      //   if(uuidFileName.charAt(32) === '@'){
      //     FILE_NAME = uuidFileName.substring(33);
      //   } else {
      //     FILE_NAME = uuidFileName;
      //   }
      // } else {
      //   FILE_NAME = fileUrl;
      // }

      // const index = fileUrl.indexOf('@');
      // if (index > -1) {
      //   FILE_NAME = fileUrl.substring(index + 1);
      // } else {
      //   const s = fileUrl.split('/');
      //   if (s.length > 1) {
      //     FILE_NAME = s[s.length - 1];
      //   } else {
      //     return downloadFile(params);
      //   }
      // }
    }
  }

  const newParams = {};
  // 表单添加查询参数
  if (queryParams && Array.isArray(queryParams)) {
    if (queryParams.length > 0) {
      if (newUrl.indexOf('?') === -1) {
        newUrl += `?`;
      } else {
        newUrl += `&`;
      }
    }
    queryParams.forEach((item, index) => {
      newParams[item.name] = item.value;
      if (index === 0) {
        newUrl += `${item.name}=${encodeURIComponent(item.value)}`;
      } else {
        newUrl += `&${item.name}=${encodeURIComponent(item.value)}`;
      }
    });
  }

  return withTokenAxios(
    method !== 'GET' && method !== 'get'
      ? {
          url: newUrl,
          method,
          data: queryData,
          baseURL: `${API_HOST}`,
          responseType: 'arraybuffer',
        }
      : {
          url: newUrl,
          method,
          baseURL: `${API_HOST}`,
          responseType: 'arraybuffer',
        }
  ).then((resp) => {
    try {
      const { data, headers } = resp;
      let fileName = '';
      // console.log(data.byteLength, 'bb', headers);
      // 当大小小于500时 进行判断是否错误提示
      if(data.byteLength < 500){
        const enc = new TextDecoder('utf-8');
        let err = {};
        try {
          err = JSON.parse(enc.decode(new Uint8Array(resp.data)));
          notificationType((err as any)?.type, (err as any)?.message);
          return false;
        } catch (error) {
          console.error(error);
        }
      }

      const disposition =headers['content-disposition']? decodeURIComponent(headers['content-disposition']).match(
        /[fF][iI][Ll][Ee][Nn][Aa][Mm][Ee]=(.*)/
      ): '';
      const temp = disposition && disposition[1] || "";

      fileName = temp;
      if (fileName && (fileName[0] === "'" || fileName[0] === '"')) {
        fileName = fileName.substring(1, fileName.length - 1);
      }

      if (!fileName && filename) {
        fileName = filename;
      }

      if (!fileName) {
        notificationType('error', 'cannot get fileName!');
        throw Error('cannot get fileName!');
      }

      // 将二进制流转为blob
      const blob = new Blob([data], { type: 'application/octet-stream' });
      if (typeof (window.navigator as any)?.msSaveBlob !== 'undefined') {
        // 兼容IE，window.navigator.msSaveBlob：以本地方式保存文件
        // eslint-disable-next-line no-unused-expressions
        (window.navigator as any)?.msSaveBlob(blob, decodeURI(fileName));
      } else {
        // 创建新的URL并指向File对象或者Blob对象的地址
        const blobURL = window.URL.createObjectURL(blob);
        // 创建a标签，用于跳转至下载链接
        const tempLink = document.createElement('a');
        tempLink.style.display = 'none';
        tempLink.href = blobURL;
        tempLink.setAttribute('download', decodeURI(fileName));
        // 兼容：某些浏览器不支持HTML5的download属性
        if (typeof tempLink.download === 'undefined') {
          tempLink.setAttribute('target', '_blank');
        }
        // 挂载a标签
        document.body.appendChild(tempLink);
        tempLink.click();
        document.body.removeChild(tempLink);
        // 释放blob URL地址
        window.URL.revokeObjectURL(blobURL);
      }
      return true;
    } catch (e) {
      const enc = new TextDecoder('utf-8');
      let err = {};
      try {
        err = JSON.parse(enc.decode(new Uint8Array(resp.data)));
        notificationType((err as any)?.type, (err as any)?.message);
      } catch (error) {
        console.error(e);
      }
      throw err;
    }
  });
}

export async function querySignedUrl(params) {
  const tenantId = getCurrentOrganizationId();
  const { url, bucketName, storageCode } = params;
  const reqUrl = `${HZERO_FILE}/v1/${tenantId}/files/signedUrl`;
  const res = await request(reqUrl, {
    method: 'GET',
    query: {
      url,
      bucketName,
      storageCode,
    },
    responseType: 'text',
  });
  return getResponse(res);
}

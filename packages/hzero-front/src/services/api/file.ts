/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
/**
 * 文件相关
 * @email WY <yang.wang06@hand-china.com>
 * @creationDate 2019/12/25
 * @copyright HAND ® 2019
 */

import axios, { AxiosRequestConfig } from 'axios';
import qs from 'querystring';

import request from 'utils/request';
import { getIeVersion } from 'utils/browser';
import { getEnvConfig } from 'utils/iocUtils';
import notification from 'utils/notification';
import intl from 'utils/intl';

import {
  filterNullValueObject,
  getAccessToken,
  getCurrentOrganizationId,
  getCurrentLanguage,
  getResponse,
  getRequestId,
  isTenantRoleLevel,
} from 'utils/utils';
import { getMenuId } from 'utils/menuTab';

const { API_HOST, HZERO_FILE, BASE_PATH } = getEnvConfig();

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
      headers: filterNullValueObject({
        Authorization: `bearer ${getAccessToken()}`,
        'H-Request-Id': `${getRequestId()}`,
        'H-Menu-Id': `${getMenuId()}`,
        ...config.headers,
      }),
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

/**
 * 获取fileList
 * {HZERO_FILE}/v1/files/{attachmentUUID}/file
 * todo {HZERO_FILE}/v1/{organizationId}/files/{attachmentUUID}/file
 * @export
 * @param {object} params 传递参数
 * @param {string} params.attachmentUUID - 文件uuid
 */
export async function queryFileList(params, options?) {
  const { version = "/v1", method = "GET", body } = options || {};
  const tenantId = getCurrentOrganizationId();
  return request(
    `${HZERO_FILE}${version}${isTenantRoleLevel() ? `/${tenantId}/` : '/'}files/${
      params.attachmentUUID
    }/file`,
    {
      method,
      query: params,
      body,
    }
  );
}

/**
 * 获取fileList(租户级)
 * {HZERO_FILE}/v1/{organizationId}/files/{attachmentUUID}/file
 * @export
 * @param {object} params 传递参数
 * @param {string} params.attachmentUUID - 文件uuid
 */
export async function queryFileListOrg(params) {
  const organizationId = getCurrentOrganizationId();
  return request(`${HZERO_FILE}/v1/${organizationId}/files/${params.attachmentUUID}/file`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 删除文件
 * {HZERO_FILE}/v1/files/delete-by-uuidurl/not-null
 * @export
 * @param {object} params 传递参数
 * @param {string} params.bucketName - 桶
 * @param {string} params.attachmentUUID - 文件uuid
 * @param {string} params.storageCode - 存储配置编码
 * @param {string[]} params.urls - 删除文件
 */
export async function removeFileList(params) {
  const { urls, ...otherParams } = params;
  const reqUrl = `${HZERO_FILE}/v1/files/delete-by-uuidurl/not-null`;
  return request(reqUrl, {
    method: 'POST',
    body: params.urls,
    query: filterNullValueObject(otherParams),
  });
}

/**
 * 删除上传的文件
 * {HZERO_FILE}/v1/files/delete-by-url
 * {HZERO_FILE}/v1/{organizationId}/files/delete-by-url
 * @param {object} params
 * @param {string} params.bucketName
 * @param {string} params.storageCode - 存储配置编码
 */
export async function removeUploadFile(params) {
  const { urls, ...otherParams } = params;
  const tenantId = getCurrentOrganizationId();
  const reqUrl = isTenantRoleLevel()
    ? `${HZERO_FILE}/v1/${tenantId}/files/delete-by-url`
    : `${HZERO_FILE}/v1/files/delete-by-url`;
  return request(reqUrl, {
    method: 'POST',
    body: urls,
    query: filterNullValueObject(otherParams),
  });
}

/**
 * 删除attachmentUUID对应的某一个文件
 * {HZERO_FILE}/v1/files/delete-by-uuidurl
 * todo {HZERO_FILE}/v1/{organizationId}/files/delete-by-uuidurl
 * @export
 * @param {object} params 传递参数
 * @param {string} params.bucketName - 桶
 * @param {string} params.attachmentUUID - 文件uuid
 * @param {string[]} params.urls - 要删除的文件
 */
export async function removeFile(params) {
  const { urls, ...otherParams } = params;
  const tenantId = getCurrentOrganizationId();
  const reqUrl = isTenantRoleLevel()
    ? `${HZERO_FILE}/v1/${tenantId}/files/delete-by-uuidurl`
    : `${HZERO_FILE}/v1/files/delete-by-uuidurl`;
  return request(reqUrl, {
    method: 'POST',
    body: urls,
    query: filterNullValueObject(otherParams),
  });
}

/**
 * 删除attachmentUUID对应的某一个文件(租户级)
 * {HZERO_FILE}/v1/{organizationId}/files/delete-by-uuidurl
 * @export
 * @param {object} params 传递参数
 * @param {string[]} params.urls - 删除的文件
 * @param {string} params.bucketName - 桶
 * @param {string} params.attachmentUUID - 文件uuid
 */
export async function removeFileOrg(params) {
  const organizationId = getCurrentOrganizationId();
  const { bucketName, attachmentUUID, urls, ...otherParams } = params;
  return request(`${HZERO_FILE}/v1/${organizationId}/files/delete-by-uuidurl`, {
    method: 'POST',
    query: {
      bucketName,
      attachmentUUID,
      ...filterNullValueObject(otherParams),
    },
    body: urls,
  });
}

/**
 * 获取fileList
 * {HZERO_FILE}/v1/files/uuid
 * {HZERO_FILE}/v1/{organizationId}/files/uuid
 * @export
 * @param {object} params 传递参数
 */
export async function queryUUID(params) {
  const tenantId = getCurrentOrganizationId();
  return request(`${HZERO_FILE}/v1${isTenantRoleLevel() ? `/${tenantId}/` : '/'}files/uuid`, {
    method: 'POST',
    query: params,
  });
}

/**
 * 获取导出Excel的列数据
 * @export
 * @param {object} params 传递参数
 */
export async function queryColumn(params) {
  const { requestUrl, method } = params;
  return request(`${requestUrl}`, {
    method,
    query: { exportType: 'COLUMN' },
  });
}

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
  beforeRequest?: (url: string, option: any) => boolean;
  version?: "v1" | "v2",
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
  const { requestUrl: url, queryParams, method = 'GET', queryData } = params || {};
  let newUrl = !url.startsWith('/api') && !url.startsWith('http') ? `${API_HOST}${url}` : url;
  // 目前仅飞书内置浏览器有兼容性问题
  if (window.navigator && window.navigator.userAgent && /Lark\/(\S+)/i.test(window.navigator.userAgent)) {
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
        if (index === 0) {
          newUrl += `${item.name}=${encodeURIComponent(item.value)}`;
        } else {
          newUrl += `&${item.name}=${encodeURIComponent(item.value)}`;
        }
      });
    }
    // 飞书会拦截不同源url,此处跳转到中转页面下载
    window.open(`${BASE_PATH || '/'}public/download-file?language=${getCurrentLanguage()}&target=${encodeURIComponent(newUrl)}&method=${method}&accessToken=${getAccessToken()}&requestId=${getRequestId()}`)

  } else {
    // form表单提交方式
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
      newUrl = `${newUrl}${newUrl.includes('?') ? '&' : '?'}access_token=${getAccessToken()}&H-Request-Id=${getRequestId()}`;
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
  }
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
  const { requestUrl: url, queryParams, method = 'GET', queryData, beforeRequest, version = "v1" } = params || {};
  let newUrl = !url.startsWith('/api') && !url.startsWith('http') ? `${API_HOST}${url}` : `${url}`;

  const reg1 = new RegExp(`^${HZERO_FILE}/v[0-9](/[0-9]*)?/files/redirect-url`);
  const reg2 = new RegExp(`^${HZERO_FILE}/v[0-9](/[0-9]*)?/files/download`);

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
      return querySignedUrl(signedParams, beforeRequest, version)
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
  const option: AxiosRequestConfig = 
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
        };
  if (beforeRequest) {
    const flag = beforeRequest(newUrl, option);
    if (!flag) {
      return Promise.resolve(false);
    }
  }
  return withTokenAxios(option).then((resp) => {
    try {
      const { data, headers } = resp;
      let fileName = '';

      // 提取文件名
      const temp = headers['content-disposition']?.match(
        (/[fF][iI][Ll][Ee][Nn][Aa][Mm][Ee](\*=|=)(.*)/)
      )[2];
      fileName = temp;
      if (fileName && (fileName[0] === "'" || fileName[0] === '"')) {
        fileName = fileName.substring(1, fileName.length - 1);
      }

      if (!fileName && filename) {
        fileName = filename;
      }

      if (!fileName) {
        throw Error('cannot get fileName!');
      }

      // 将二进制流转为blob
      const blob = new Blob([data], { type: 'application/octet-stream' });
      if (typeof (window.navigator as any)?.msSaveBlob !== 'undefined') {
        // 兼容IE，window.navigator.msSaveBlob：以本地方式保存文件
        // eslint-disable-next-line no-unused-expressions
        (window.navigator as any)?.msSaveBlob(blob, decodeURIComponent(fileName));
      } else {
        // 创建新的URL并指向File对象或者Blob对象的地址
        const blobURL = window.URL.createObjectURL(blob);
        // 创建a标签，用于跳转至下载链接
        const tempLink = document.createElement('a');
        tempLink.style.display = 'none';
        tempLink.href = blobURL;
        tempLink.setAttribute('download', decodeURIComponent(fileName));
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

/**
 * initiateAsyncExport 发起异步导出请求
 * @param {string} params - 参数
 */
export async function initiateAsyncExport(params) {
  const { requestUrl: url, queryParams, method, queryData, beforeRequest } = params;
  let newUrl = !url.startsWith('/api') && !url.startsWith('http') ? `${API_HOST}${url}` : url;
  if (queryParams && Object.keys(queryParams).length >= 1) {
    queryParams.forEach((item) => {
      newUrl += `${newUrl.indexOf('?') >= 0 ? '&' : '?'}${item.name}=${encodeURIComponent(
        item.value
      )}`;
    });
  }
  const option = method !== 'GET' && method !== 'get' ? { method, body: queryData } : { method };
  if (beforeRequest ) {
    const res = beforeRequest(newUrl, option);
    if (!res) {
      return Promise.resolve(false);
    }
  }
  const res = await request(newUrl, option);
  if (res && res.failed === true && res.code === 'new_export.error.export_data_lock') {
    // ‘您已提交完全相同的导出任务，可在消息中心查看导出进度，请等待任务执行完成。’
    // 特定报错不显示成报错
    notification.warning({
      message: intl.get('hzero.common.message.confirm.title').d('提示'),
      description: res.message,
    });
  } else {
    return getResponse(res);
  }
  // FIXME: @WJC utils need fix
  // @ts-ignore
}

export async function querySignedUrl(params, beforeRequest, version = "v1") {
  const tenantId = getCurrentOrganizationId();
  const reqUrl = `${HZERO_FILE}/${version}/${tenantId}/files/signedUrl`;
  const option = {
    method: 'GET',
    query: params,
    responseType: 'text',
  };
  if (beforeRequest) {
    const flag = beforeRequest(reqUrl, option);
    if (!flag) {
      return Promise.resolve(false);
    }
  }
  const res = await request(reqUrl, option);
  return getResponse(res);
}

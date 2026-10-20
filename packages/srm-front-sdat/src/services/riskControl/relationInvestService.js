/* eslint-disable camelcase */
/**
 * monitorService
 * @author qingxiang.luo@going-link.com
 * @date 2022-09-16
 * @copyright 2022 © ZhenYun
 */
import request from 'utils/request';
import axios from 'axios';
import { getEnvConfig } from 'utils/iocUtils';
import { getResponse, getRequestId, getAccessToken } from 'utils/utils';
import { getMenuId } from 'utils/menuTab';
import { SRM_DATA_SDAT } from '@/utils/config';
import { getUrlParam } from '@/utils/utils';

const { API_HOST } = getEnvConfig();

const { signature = '' } = getUrlParam() || {};

const header = signature
  ? {
      Authorization: `bearer ${getAccessToken()}`,
    }
  : {};

const withTokenAxios = axios.create();
const jsonMimeType = 'application/json; charset=utf-8';

withTokenAxios.defaults = {
  ...withTokenAxios.defaults,
  headers: {
    ...(withTokenAxios.defaults || {}).headers,
    'Content-Type': jsonMimeType,
    Accept: 'application/json;',
  },
  withCredentials: true,
};

// Add a request interceptor
withTokenAxios.interceptors.request.use(
  config => {
    let { url = '' } = config;
    if (url.indexOf('://') === -1 && !url.startsWith('/_api')) {
      url = `${API_HOST}${url}`;
    }

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
  err => {
    return Promise.reject(err);
  }
);

withTokenAxios.interceptors.response.use(
  res => {
    const { status, data } = res;
    if (status === 204 || status === 200) {
      return res;
    }
    if (data && data.failed) {
      throw res;
    } else {
      return res;
    }
  },
  err => {
    throw err;
  }
);

/**
 * 查询值集
 * @param {*} params
 * @returns
 */
export async function fetchValueMap(params) {
  const { code, tenantId } = params;
  if (!tenantId && tenantId !== 0) return;
  return request(`/hpfm/v1/${tenantId}/lovs/value?lovCode=${code}`, {
    headers: {
      ...header,
    },
    method: 'GET',
  });
}

/**
 * 查询公司列表
 * @param {*} params
 * @returns
 */
export async function fetchCompanyList(params) {
  const { tenantId } = params;
  if (!tenantId && tenantId !== 0) return;
  return request(`${SRM_DATA_SDAT}/v1/${tenantId}/blacklist-relation-info/relation-list`, {
    headers: {
      ...header,
    },
    method: 'GET',
    query: params,
  });
}

/**
 * 关系排查
 * @param {*} params
 * @returns
 */
export async function fetchMining(params) {
  const { tenantId, type } = params;
  if (!tenantId && tenantId !== 0) return;

  const url =
    type === 'BLACKLIST'
      ? `${SRM_DATA_SDAT}/v1/${tenantId}/blacklist-relation-info/relation-check`
      : `${SRM_DATA_SDAT}/v1/${tenantId}/blacklist-relation-info/partner-relation-check`;

  const param =
    type === 'BLACKLIST'
      ? { businessIdentity: 'BLACKLIST', businessType: 'PAGE' }
      : {
          businessType: 'PAGE',
          businessIdentity: 'PARTNER',
        };

  return request(url, {
    headers: {
      ...header,
    },
    method: 'POST',
    body: {
      ...params,
      ...param,
    },
  });
}

/**
 * 排查数据统计
 * @param {*} params
 * @returns
 */
export async function fetchMiningCount(params) {
  const { tenantId } = params;
  return request(`${SRM_DATA_SDAT}/v1/${tenantId}/blacklist-relation-info/relation-refresh`, {
    headers: {
      ...header,
    },
    method: 'GET',
    query: params,
  });
}

/**
 * 模糊匹配企业列表
 * @async
 * @function fetchAutoCompany
 * @param {Object} params - 查询参数
 */
export async function fetchAutoCompany(params) {
  const { tenantId } = params;
  if (!tenantId && tenantId !== 0) return;

  return request(`${SRM_DATA_SDAT}/v1/${tenantId}/credit-qcc/search`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 获取图表数据
 * @param {*} params
 * @returns
 */
export async function fetchChartData(params) {
  const { tenantId } = params;
  if (!tenantId && tenantId !== 0) return;

  return request(`${SRM_DATA_SDAT}/v1/${tenantId}/blacklist-relation-info/graph-pic-data`, {
    headers: {
      ...header,
    },
    method: 'GET',
    query: params,
  });
}

/**
 * 获取订单额度
 * @param {*} params
 * @returns
 */
export async function fetchOrderDetail(params) {
  const { tenantId } = params;
  if (!tenantId && tenantId !== 0) return;

  return request(`${SRM_DATA_SDAT}/v1/${tenantId}/supplier-blacklist/query-relation-quota`, {
    headers: {
      ...header,
    },
    method: 'GET',
    query: params,
  });
}

/**
 * 排查及失败重试操作
 * @param {*} params
 * @returns
 */
export async function fetchRetry(params) {
  const { tenantId } = params;
  if (!tenantId && tenantId !== 0) return;

  return request(`${SRM_DATA_SDAT}/v1/${tenantId}/blacklist-relation-info/partner-relation-check`, {
    headers: {
      ...header,
    },
    method: 'POST',
    body: params,
  });
}

/**
 * 导出数据
 * @param {*} params
 * @returns
 */
export async function fetchExportPath(params) {
  const { tenantId } = params;
  if (!tenantId && tenantId !== 0) return;

  const url = `${SRM_DATA_SDAT}/v1/${tenantId}/blacklist-relation-info/relation-export?fillerType=single-sheet&async=false&singleSheetMaxRow=1048575&singleExcelMaxSheetNum=5&exportType=DATA&ids=1&ids=2&ids=3&ids=4&ids=5&ids=6`;
  downLoadFile(url, params);
}

function downLoadFile(url, params) {
  withTokenAxios({
    url,
    method: 'POST',
    baseURL: `/`,
    data: params,
    responseType: 'arraybuffer',
  }).then(resp => {
    if (getResponse(resp)) {
      try {
        const { data, headers } = resp;
        let fileName = '';

        // 提取文件名
        const temp = headers['content-disposition']?.match(
          /[fF][iI][Ll][Ee][Nn][Aa][Mm][Ee]=(.*)/
        )[1];
        fileName = temp;
        if (fileName && (fileName[0] === "'" || fileName[0] === '"')) {
          fileName = fileName.substring(1, fileName.length - 1);
        }

        if (!fileName) {
          throw Error('cannot get fileName!');
        }

        // 将二进制流转为blob
        const blob = new Blob([data], { type: 'application/octet-stream' });
        if (typeof window.navigator.msSaveBlob !== 'undefined') {
          // 兼容IE，window.navigator.msSaveBlob：以本地方式保存文件
          window.navigator.msSaveBlob(blob, decodeURI(fileName));
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
        } catch (error) {
          console.error(e);
        }
        throw err;
      }
    }
  });
}

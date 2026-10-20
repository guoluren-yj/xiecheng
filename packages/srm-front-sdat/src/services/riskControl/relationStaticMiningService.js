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
import { getResponse, getRequestId, getAccessToken, getCurrentOrganizationId } from 'utils/utils';
import { getMenuId } from 'utils/menuTab';
import { SRM_DATA_SDAT } from '@/utils/config';
import { getUrlParam } from '@/utils/utils';

const { API_HOST } = getEnvConfig();

const { signature = '' } = getUrlParam() || {};

const header = signature
  ? {
      'ambn-client-signature': `${signature}`,
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
  (config) => {
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
 * 查询企业列表
 * @async
 * @function getCompanyList
 * @param {Object} params - 查询参数
 */
export async function getCompanyList(params) {
  return request(
    `${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId() || 0}/credit-qcc/relation-mining-overview`,
    {
      headers: {
        ...header,
      },
      method: 'GET',
      query: params,
    }
  );
}

/**
 * 股权关系揭示
 * @async
 * @function fetchCompanyRevealed
 * @param {Object} params - 查询参数
 */
export async function fetchCompanyRevealed(params) {
  return request(
    `${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId() || 0}/credit-qcc/relation-mining-data`,
    {
      headers: {
        ...header,
      },
      method: 'GET',
      query: params,
    }
  );
}

/**
 * 股权关系挖掘
 * @async
 * @function fetchRelationMining
 * @param {Object} params - 查询参数
 */
export async function fetchRelationMining(params) {
  return request(
    `${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId() || 0}/credit-qcc/relation-mining-data`,
    {
      headers: {
        ...header,
      },
      method: 'GET',
      query: params,
    }
  );
}

/**
 * 导出企业关系路径
 * @async
 * @function fetchExportPath
 * @param {Object} params - 查询参数
 */
export async function fetchExportPath(params) {
  const url = `${SRM_DATA_SDAT}/v1/${
    getCurrentOrganizationId() || 0
  }/credit-qcc/enterprise-relation-mining-export??fillerType=single-sheet&async=false&singleSheetMaxRow=1048575&singleExcelMaxSheetNum=5&exportType=DATA&ids=2&ids=3`;
  downLoadFile(url, params);
}

/**
 * 导出联系方式
 * @async
 * @function fetchExportContract
 * @param {Object} params - 查询参数
 */
export async function fetchExportContract(params) {
  const url = `${SRM_DATA_SDAT}/v1/${
    getCurrentOrganizationId() || 0
  }/credit-qcc/enterprise-contact-export?fillerType=single-sheet&async=false&singleSheetMaxRow=1048575&singleExcelMaxSheetNum=5&exportType=DATA&ids=1&ids=2&ids=3&ids=4&ids=5&ids=6`;
  downLoadFile(url, params);
}

function downLoadFile(url, params) {
  withTokenAxios({
    url,
    method: 'POST',
    baseURL: `/`,
    data: params,
    responseType: 'arraybuffer',
  }).then((resp) => {
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

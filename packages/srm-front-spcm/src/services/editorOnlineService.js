/**
 * editorOnlineService - 在线编辑 - service
 * @date: 2019年5月20日 10:42:06
 * @author: Jehu <zhihao.zeng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { notification } from 'hzero-ui';
import request from 'utils/request';
import { SRM_SPCM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

notification.config({
  placement: 'bottomRight',
});

const headers = {
  Accept: 'text/html',
  'Content-Type': 'text/html; charset=utf-8',
};

const organizationId = getCurrentOrganizationId(); // 租户ID

/**
 * 请求在线编辑页面代码
 * @export {function} fetchEditorOnlineHTML
 * @param {object} params 查询参数
 * @returns {String} 返回在线编辑页面代码
 */
export async function fetchEditorOnlineHTML(params) {
  // const param = parseParameters(params);
  const url = `${SRM_SPCM}/v1/${organizationId}/purchase-contract-file/document`;
  return request(url, {
    headers: {
      ...headers,
      accept: '*/*', // 修复后端返回非url值报500错误
    },
    method: 'POST',
    query: params,
    responseType: 'text',
  });
}

/**
 * 请求在线编辑页面代码-协议模板在线编辑界面
 * @export {function} fetchEditorOnlineTemplateHTML
 * @param {object} params 查询参数
 * @returns {String} 返回在线编辑页面代码
 */
export async function fetchEditorOnlineTemplateHTML(params) {
  // const param = parseParameters(params);
  const url = `${SRM_SPCM}/v1/${organizationId}/purchase-contract-file/template-document`;
  return request(url, {
    headers: {
      ...headers,
      accept: '*/*', // 修复后端返回非url值报500错误
    },
    method: 'POST',
    query: params,
    responseType: 'text',
  });
}

export function fetchTextPreView(data) {
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract-file/preview-document`, {
    method: 'POST',
    body: data,
    responseType: 'text',
  });
}

/**
 * 获取new_wps/new_wps_V7的预览文件
 * @param {*} data
 * @returns
 */
export function fetchWpsV5TextPreView(data) {
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract-file/preview-new-document`, {
    method: 'POST',
    body: data,
    responseType: 'text',
  });
}

/**
 * 请求协议拟制在线编辑页面代码
 * @export {function} fetchContractMaintainEditorOnlineHTML
 * @param {object} params 查询参数
 * @returns {String} 返回在线编辑页面代码
 */
export async function fetchContractMaintainEditorOnlineHTML(params) {
  // const param = parseParameters(params);
  const url = `${SRM_SPCM}/v1/${organizationId}/purchase-contract-file/temporary-document`;
  return request(url, {
    headers: {
      ...headers,
      accept: '*/*', // 修复后端返回非url值报500错误
    },
    method: 'POST',
    query: params,
    responseType: 'text',
  });
}

/**
 * 生成拟制页面在线编辑页面链接接口
 * @export {function} fetchContractMaintainEditorOnlineHTML
 * @param {object} params 查询参数
 * @returns {String} 生成拟制页面在线编辑页面链接接口
 */
export async function fetchContractMaintainTemporaryWPSURL(params) {
  // const param = parseParameters(params);
  const url = `${SRM_SPCM}/v1/${organizationId}/purchase-contract-file/wps-temporary-document`;
  return request(url, {
    headers,
    method: 'GET',
    query: params,
    responseType: 'text',
  });
}
/**
 * 获取“模板功能”在线编辑链接
 * @export {function} fetchContractMaintainEditorOnlineHTML
 */
export async function fetchContractTemplateWPSURL(params) {
  // const param = parseParameters(params);
  const url = `${SRM_SPCM}/v1/${organizationId}/purchase-contract-file/wps-template-document`;
  return request(url, {
    headers,
    method: 'GET',
    query: params,
    responseType: 'text',
  });
}

/**
 * 获取模板在线编辑链接
 * @export {function} fetchContractMaintainEditorOnlineHTML
 */
export async function fetchContractFileURL(params) {
  // const param = parseParameters(params);
  const url = `${SRM_SPCM}/v1/${organizationId}/purchase-contract-file/wps-document`;
  return request(url, {
    headers,
    method: 'GET',
    query: params,
    responseType: 'text',
  });
}

/**
 * 请求文档编辑显示类型
 * @export {function} fetchContractOnlineHTMLType
 * @param {object} params 查询参数
 * @returns {String} 返回用什么文档类型
 */
export async function fetchContractOnlineHTMLType(params) {
  // const param = parseParameters(params);
  const url = `${SRM_SPCM}/v1/${organizationId}/purchase-contract-file/component`;
  return request(url, {
    headers,
    method: 'GET',
    query: params,
    responseType: 'text',
  });
}

/**
 * 获取模板在线编辑链接
 * @export {function} fetchContractFileNewURL
 */
export async function fetchContractFileNewURL(params) {
  const { isNewAPIUrlFlag } = params;
  const url = isNewAPIUrlFlag
    ? `${SRM_SPCM}/v1/${organizationId}/purchase-contract-file/new-reject-file-url`
    : `${SRM_SPCM}/v1/${organizationId}/purchase-contract-file/new-document`;
  return request(url, {
    headers,
    method: 'GET',
    query: params,
    responseType: 'text',
  });
}

/**
 * 获取“模板功能”在线编辑链接
 * @export {function} fetchContractTemplateNewURL
 */
export async function fetchContractTemplateNewURL(params) {
  const url = `${SRM_SPCM}/v1/${organizationId}/purchase-contract-file/new-template-document`;
  return request(url, {
    headers,
    method: 'GET',
    query: params,
    responseType: 'text',
  });
}

/**
 * 生成拟制页面在线编辑页面链接接口
 * @export {function} fetchContractMaintainTemporaryNewURL
 * @param {object} params 查询参数
 * @returns {String} 生成拟制页面在线编辑页面链接接口
 */
export async function fetchContractMaintainTemporaryNewURL(params) {
  const url = `${SRM_SPCM}/v1/${organizationId}/purchase-contract-file/new-temporary-document`;
  return request(url, {
    headers,
    method: 'GET',
    query: params,
    responseType: 'text',
  });
}

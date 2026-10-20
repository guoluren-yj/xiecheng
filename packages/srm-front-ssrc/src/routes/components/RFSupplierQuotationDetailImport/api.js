import request from 'utils/request';
import { SRM_SSRC } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
/**
 * 请求API前缀
 * @type {string}
 */
const prefix = `${SRM_SSRC}/v1`;
const preOtherfix = `${SRM_SSRC}/v2`;
const organizationId = getCurrentOrganizationId();

/**
 * 获取tabList
 * @export
 * @param {object} params 传递参数
 */
export async function fetchTabList(params) {
  return request(`${preOtherfix}/${organizationId}/rfx/sup-dtl/import-structure`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 状态查询
 * @async
 * @function queryStatus
 * @param {Object} query - 查询参数
 */
export async function queryStatus(query = {}) {
  const reqUrl = `${prefix}/${organizationId}/import/data/status`;
  return request(reqUrl, {
    query,
  });
}

/**
 * 导入数据验证
 * @async
 * @function validateData
 * @param {Object} params - 查询参数
 */
export async function validateData(params) {
  const reqUrl = `${preOtherfix}/${organizationId}/rfx/sup-dtl/import-validate`;
  return request(reqUrl, {
    method: 'POST',
    query: params,
  });
}

/**
 * 导入数据到正式库
 * @async
 * @function importData
 * @param {Object} params - 查询参数
 */
export async function importData(params) {
  const reqUrl = `${preOtherfix}/${organizationId}/rfx/sup-dtl/import-data`;
  return request(reqUrl, {
    method: 'POST',
    query: params,
  });
}

/**
 * 获取数据
 * @export
 * @param {object} params 传递参数
 */
export async function fetchData(params) {
  return request(`${prefix}/${organizationId}/share/import/data`, {
    method: 'GET',
    query: params,
  });
}

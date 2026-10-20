import request from 'utils/request';
import { SRM_SSRC, SRM_SPC } from '_utils/config';
import { getCurrentOrganizationId, parseParameters } from 'utils/utils';

const prefix = `${SRM_SSRC}/v1`;
const organizationId = getCurrentOrganizationId();

/**
 * 价格库-请求头配置
 * @async
 * @function fetchPriceLibHeaderConfig
 */
export async function fetchPriceLibHeaderConfig(params) {
  return request(`${SRM_SPC}/v1/${organizationId}/price-lib-tmpl-dims/tableHeaderList`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 状态查询
 * @async
 * @function queryStatus
 * @param {Object} params - 查询参数
 * @param {String} params.prefixPatch - 客户端路径前缀
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
 * @param {String} params.templateCode - 模板编码
 * @param {String} params.batch - 批次编码
 */
export async function validateData(params) {
  const reqUrl = `${SRM_SPC}/v1/${organizationId}/lib-mains-import/data-validate`;
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
 * @param {String} params.templateCode - 模板编码
 * @param {String} params.prefixPatch - 客户端路径前缀
 * @param {String} params.batch - 批次编码
 * @param {String} params.sync - 是否同步
 */
export async function importData(params) {
  const reqUrl = `${SRM_SPC}/v1/${organizationId}/lib-mains-import/data-import`;
  return request(reqUrl, {
    method: 'POST',
    query: params,
  });
}

/**
 * 查询当前模板 导入历史
 * @param {object} params
 * @param {string} params.prefixPatch
 * @param {string} params.templateCode
 * @param query
 * @return {Promise<void>}
 */
export async function queryImportHistory(params, query = {}) {
  const { templateCode } = params;
  const reqUrl = `${prefix}/${organizationId}/import/manager`;
  return request(reqUrl, {
    query: {
      ...parseParameters(query),
      templateCode,
    },
    method: 'GET',
  });
}

/**
 * 删除 导入记录
 * @param {object} params
 * @param {object[]} records - 要删除的记录
 * @return {Promise<void>}
 */
export async function deleteImportHistory(records) {
  const reqUrl = `${prefix}/${organizationId}/import/manager`;
  return request(reqUrl, {
    method: 'DELETE',
    body: records,
  });
}

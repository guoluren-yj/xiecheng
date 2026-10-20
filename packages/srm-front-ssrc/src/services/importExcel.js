import request from 'utils/request';
import { HZERO_IMP, API_HOST } from 'utils/config';

export async function queryPrefixPatch(params = {}) {
  const { organizationId, templateCode } = params;
  return request(`${HZERO_IMP}/v1/${organizationId}/template/${templateCode}/info`, {
    method: 'GET',
  });
}
export async function queryStatus(params = {}) {
  const { organizationId, templateCode, prefixPatch, batch } = params;
  return request(`${prefixPatch}/v1/${organizationId}/import/data/status`, {
    method: 'GET',
    query: {
      batch,
      templateCode,
    },
  });
}
/**
 * 导入数据验证
 * @async
 * @function validateData
 * @param {Object} params - 查询参数
 * @param {String} params.templateCode - 模板编码
 */
export async function validateData(params = {}) {
  const { organizationId, templateCode, prefixPatch, batch, ...others } = params;
  return request(
    `${prefixPatch}/v1/${organizationId}/import/data/data-validate?templateCode=${templateCode}&batch=${batch}`,
    {
      method: 'POST',
      body: others,
    }
  );
}
/**
 * 导入数据查询
 * @async
 * @function loadDataSource
 * @param {Object} params - 查询参数
 * @param {String} templateCode - 模板编码
 */
export async function loadDataSource(params = {}) {
  const { organizationId, templateCode, prefixPatch, batch } = params;
  return request(`${prefixPatch}/v1/${organizationId}/import/data`, {
    method: 'GET',
    query: {
      templateCode,
      batch,
      ...params,
    },
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
 */
export async function importData(params = {}) {
  const { organizationId, templateCode, prefixPatch, batch, ...others } = params;
  return request(
    `${prefixPatch}/v1/${organizationId}/import/data/data-import?templateCode=${templateCode}&batch=${batch}`,
    {
      method: 'POST',
      body: others,
    }
  );
}
export async function uploadExcel(params = {}) {
  const { organizationId, templateCode, prefixPatch, formData } = params;
  const url = `${API_HOST}${prefixPatch}/v1/${organizationId}/import/data/data-upload?templateCode=${templateCode}`;
  return request(url, {
    method: 'POST',
    body: formData,
    responseType: 'text',
  });
}

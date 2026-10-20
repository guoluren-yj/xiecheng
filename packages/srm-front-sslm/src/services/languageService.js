import request from 'utils/request';
import { HZERO_PLATFORM } from 'utils/config';

/**
 * 查询TL多语言
 * {HZERO_PLATFORM}/v1/multi-language
 * @export
 * @param {object} params - 查询参数
 * @param {string} params.fieldName - 查询的表单域名称
 * @param {string} params._token - token
 */
export async function queryTL(params) {
  return request(`${HZERO_PLATFORM}/v1/multi-language`, {
    method: 'GET',
    query: params,
  });
}

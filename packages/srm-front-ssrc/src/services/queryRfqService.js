/**
 * service - 询报价查询
 * @date: 2019-1-25
 * @version: 0.0.1
 * @author: LC <chao.li03@hand-china.com>
 * @copyright Copyright (c) 2019, Hand
 */

import request from 'utils/request';
import { SRM_SSRC } from '_utils/config';
import { parseParameters } from 'utils/utils';

/**
 * 请求API前缀
 * @type {string}
 */
const prefix = `${SRM_SSRC}/v1`;

/**
 * 询报价查询
 * @async
 * @function fetchRfqDataList
 * @param {object} params - 查询条件
 * @param {!number} [params.page = 0] - 数据页码
 * @param {!number} [params.size = 10] - 分页大小
 * @returns {object} fetch Promise
 */
export async function fetchRfqDataList(params) {
  const { organizationId, ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(`${prefix}/${organizationId}/rfx/all/list`, {
    method: 'GET',
    query: { ...param },
  });
}

/**
 * 询价结果全部报价明细-数据查询
 * @async
 * @function fetchQuoteLine
 * @param {object} params - 查询条件
 * @param {!number} [params.page = 0] - 数据页码
 * @param {!number} [params.size = 10] - 分页大小
 * @returns {object} fetch Promise
 */
export async function fetchQuoteLine(params) {
  const { organizationId, ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(`${prefix}/${organizationId}/rfx/inquiry/detail`, {
    method: 'GET',
    query: { ...param },
  });
}

/**
 * 询报价查询-单独查询物料行
 * @async
 * @function fetchAllLine
 * @param {object} params - 查询条件
 * @param {!number} [params.page = 0] - 数据页码
 * @param {!number} [params.size = 10] - 分页大小
 * @returns {object} fetch Promise
 */
export async function fetchAloneItemLine(params) {
  // const { organizationId, ...otherParams } = params;
  const { organizationId, ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(`${prefix}/${organizationId}/rfx/inquiry/detail`, {
    method: 'GET',
    query: { ...param },
  });
}
/**
 * 询报价查询--单独查询供应商
 * @async
 * @function fetchAllLine
 * @param {object} params - 查询条件
 * @param {!number} [params.page = 0] - 数据页码
 * @param {!number} [params.size = 10] - 分页大小
 * @returns {object} fetch Promise
 */
export async function fetchAloneSupplierItemLine(params) {
  // const { organizationId, ...otherParams } = params;
  const { organizationId, ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(`${prefix}/${organizationId}/rfx/inquiry/detail`, {
    method: 'GET',
    query: { ...param },
  });
}

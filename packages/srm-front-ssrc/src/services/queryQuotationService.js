/**
 * model 报价查询
 * @date: 2019-1-25
 * @author: NJQ <jiangqi.nan@hand-china.com>
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
 * 报价查询入口数据查询
 * @async
 * @function fetchEntranceList
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function fetchEntranceList(params) {
  const { organizationId, ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(`${prefix}/${params.organizationId}/rfx/supplier/all/list`, {
    method: 'GET',
    query: { ...param },
  });
}
/**
 * 供应商询价单头数据查询
 * @async
 * @function fetchHeadDataList
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function fetchHeadDataList(params) {
  return request(`${prefix}/${params.organizationId}/rfx/supplier/${params.rfxHeaderId}/header`, {
    method: 'GET',
  });
}

/**
 * 供应商询价物料行数据查询
 * @async
 * @function fetchItemsDataList
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function fetchItemsDataList(params) {
  return request(`${prefix}/${params.organizationId}/rfx/supplier/${params.rfxHeaderId}/items`, {
    method: 'GET',
  });
}

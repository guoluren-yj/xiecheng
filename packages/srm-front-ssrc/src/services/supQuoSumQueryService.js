/**
 * service - 寻源结果管理/供应商报价汇总查询
 * @date: 2019-12-17
 * @version: 1.0.0
 * @author: jing.chen05@hand-china.com
 * @copyright Copyright (c) 2019, Hand
 */

import request from 'utils/request';
import { SRM_SSRC } from '_utils/config';
import { parseParameters, getCurrentOrganizationId } from 'utils/utils';
/**
 * 请求API前缀
 * @type {string}
 */
const prefix = `${SRM_SSRC}/v1`;

/**
 * 供应商报价汇总列表查询
 * @async
 * @function fetchSumQueryList
 * @param {object} params - 查询条件
 * @param {!number} [params.page = 0] - 数据页码
 * @param {!number} [params.size = 10] - 分页大小
 * @returns {object} fetch Promise
 */
export async function fetchSumQueryList(params) {
  const { organizationId, ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(`${prefix}/${organizationId}/rfx/quotation/summary`, {
    method: 'GET',
    query: { ...param },
  });
}

/**
 * 供应商报价汇总查询-导出
 * @async
 * @function sumQueryExport
 */
export async function sumQueryExport(params) {
  const { organizationId, querys, ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(`${prefix}/${organizationId}/rfx/quotation/summary/export`, {
    method: 'POST',
    query: querys,
    body: { ...param },
    responseType: 'text',
  });
}

/**
 * fetchLadderList
 * 供应商报价汇总查询-阶梯报价
 */
export async function fetchLadderList(params) {
  const organizationId = getCurrentOrganizationId();
  const { quotationLineId, ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(
    `${SRM_SSRC}/v1/${organizationId}/rfx/supplier/${quotationLineId}/ladder-quotation`,
    {
      method: 'GET',
      query: { ...param },
    }
  );
}

/**
 * 供应商报价汇总查询-报价明细查询
 * @async
 * @function fetchQuotationDetailData
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function fetchQuotationDetailData(params) {
  const organizationId = getCurrentOrganizationId();
  const { rfxHeaderId, ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(`${SRM_SSRC}/v1/${organizationId}/rfx/${rfxHeaderId}/quotationTemplate/view`, {
    method: 'GET',
    query: { ...param },
  });
}

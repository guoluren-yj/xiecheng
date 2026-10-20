/**
 * paymentTerms - 付款条款定义 -service
 * @date: 2018-7-11
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { SRM_MDM } from '_utils/config';
import { getCurrentOrganizationId, parseParameters, filterNullValueObject } from 'utils/utils';

/**
 * 付款条款查询
 * @async
 * @function queryTerms
 * @param {object} params - 查询条件
 * @param {?string} params.termCode - 条款编码
 * @param {?string} params.termName - 条款名称
 * @param {!number} [params.page = 0] - 数据页码
 * @param {!number} [params.size = 10] - 分页大小
 * @returns {object} fetch Promise
 */
export async function queryTerms(params) {
  const organizationId = getCurrentOrganizationId();
  const param = parseParameters(params);
  return request(`${SRM_MDM}/v1/${organizationId}/payment-terms`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 付款条款和明细查询
 * @async
 * @function queryAll
 * @param {object} params - 查询条件
 * @param {?string} params.termId - 条款id
 * @returns {object} fetch Promise
 */
export async function queryAll(params) {
  const organizationId = getCurrentOrganizationId();
  const param = filterNullValueObject(parseParameters(params));
  return request(`${SRM_MDM}/v1/${organizationId}/payment-terms/${params.termId}`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 新增付款条款和明细
 * @async
 * @function addTerms
 * @param {object} params - 待保存数据
 * @param {!string} params.data.termId - 条款id
 * @param {!string} params.data.termCode - 条款编码
 * @param {!string} params.data.termName - 条款名称
 * @param {!string} params.data.enabledFlag - 启用标记
 * @param {object[]} params.data.paymentTermDtlList - 条款明细数据
 * @param {!string} params.data.paymentTermDtlList[].termDtlCode - 明细编码
 * @param {!string} params.data.paymentTermDtlList[].termDtlDesc - 明细名称
 * @param {!string} params.data.paymentTermDtlList[].invoiceFlag - 是否需要发票
 * @param {!string} params.data.paymentTermDtlList[].acceptFlag - 是否需要验收
 * @param {!string} params.data.paymentTermDtlList[].enabledFlag - 明细启用标记
 * @returns {object} fetch Promise
 */
export async function addTerms(params) {
  const { customizeUnitCode } = params;
  const organizationId = getCurrentOrganizationId();
  return request(`${SRM_MDM}/v1/${organizationId}/payment-terms`, {
    method: 'POST',
    body: params,
    query: { customizeUnitCode },
  });
}

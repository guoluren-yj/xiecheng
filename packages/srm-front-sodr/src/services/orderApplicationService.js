/**
 * 引用采购申请 - service
 * @date: 2019-2-20
 * @author: lixiaolong <xiaolong.li02@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */
import request from 'utils/request';
import { SRM_SPUC, SRM_SPRM } from '_utils/config';
import { getCurrentOrganizationId, parseParameters } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

/**
 * 按行引用查询请求
 * @param {object} params - 请求字段对象
 * @returns {object} fetch Promise
 */
export async function queryLineQuotation(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/line-quotation`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询整单引用列表
 * @export
 * @param {Object} params 查询条件
 */
export async function fetchWholeQuoteList(params) {
  return request(`${SRM_SPRM}/v1/${organizationId}/po-refer-pr/pr-header`, {
    method: 'GET',
    query: parseParameters(params),
  });
}

/**
 * 整单引用创建
 * @export
 * @param {Object} params
 */
export async function wholeQuoteCreate(params) {
  console.log(params);
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/from-pr/header`, {
    method: 'POST',
    query: params,
  });
}

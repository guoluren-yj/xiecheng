/**
 * service - 企业审批方式
 * @date: 2018-7-30
 * @version: 0.0.1
 * @author: WH <heng.wei@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */
import { parseParameters } from 'utils/utils';
import request from 'utils/request';
import { SRM_PLATFORM } from '_utils/config';

/**
 * 请求API前缀
 * @type {string}
 */
const prefix = `${SRM_PLATFORM}/v1`;

/**
 * 企业审批方式查询
 * @async
 * @function search
 * @param {object} params - 查询条件
 * @param {!number} params.tenantId - 租户Id
 * @param {?string} params.bizCategoryName - 单据类别名称
 * @param {!object} params.page - 分页参数
 * @returns {object} fetch Promise
 */
export async function search(params) {
  const param = parseParameters(params);
  return request(`${prefix}/${param.tenantId}/business-apv-methods`, {
    method: 'GET',
    query: { ...param },
  });
}
/**
 * 企业审批方式修改
 * @async
 * @function update
 * @param {object} params - 请求参数
 * @param {!number} params.tenantId - 租户Id
 * @param {?string} params.bizCategoryName - 单据类别名称
 * @returns {object} fetch Promise
 */
export async function update(params) {
  return request(`${prefix}/${params.tenantId}/business-apv-methods`, {
    method: 'POST',
    body: [...params.data],
  });
}

/**
 * paymentUsages - 付款用途定义 - service
 * @date: 2018-7-11
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { SRM_MDM } from '_utils/config';
import { getCurrentOrganizationId, parseParameters } from 'utils/utils';

/**
 * 付款用途查询
 * @async
 * @function queryUsages
 * @param {object} params - 查询条件
 * @param {?string} params.usageCode - 付款用途编码
 * @param {?string} params.usageName - 付款用途名称
 * @param {!number} [params.page = 0] - 数据页码
 * @param {!number} [params.size = 10] - 分页大小
 * @returns {object} fetch Promise
 */
export async function queryUsages(params) {
  const organizationId = getCurrentOrganizationId();
  const param = parseParameters(params);
  return request(`${SRM_MDM}/v1/${organizationId}/payment-usages`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 新增/更新付款用途
 * @async
 * @function addUsages
 * @param {object} params.data - 待保存数据
 * @param {?string} params.data.usageId - 付款用途id
 * @param {!string} params.data.usageCode - 付款用途编码
 * @param {!string} params.data.usageName - 付款用途名称
 * @param {?string} params.data.description - 备注
 * @param {!string} params.data.enabledFlag - 启用标记
 * @returns {object} fetch Promise
 */
export async function addUsages(params) {
  const organizationId = getCurrentOrganizationId();
  return request(`${SRM_MDM}/v1/${organizationId}/payment-usages`, {
    method: 'POST',
    body: params,
  });
}

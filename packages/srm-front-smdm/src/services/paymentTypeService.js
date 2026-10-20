/**
 * service - 付款方式定义
 * @date: 2018-8-10
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { SRM_MDM } from '_utils/config';
import { getCurrentOrganizationId, parseParameters, filterNullValueObject } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

/**
 *
 *查询付款方式
 * @export
 * @param {String} params.paymentCode 付款方式代码
 * @param {String} params.paymentName 付款方式名称
 * @param {Number} [params.page = 0] - 数据页码
 * @param {Number} [params.size = 10] - 分页大小
 * @returns
 */
export async function queryPayment(params) {
  const param = filterNullValueObject(parseParameters(params));
  return request(`${SRM_MDM}/v1/${organizationId}/payment-types`, {
    method: 'GET',
    query: param,
  });
}

/**
 *
 *查询蛋汤付款方式
 * @export
 * @param {String} params.paymentCode 付款方式代码
 * @param {String} params.paymentName 付款方式名称
 * @param {Number} [params.page = 0] - 数据页码
 * @param {Number} [params.size = 10] - 分页大小
 * @returns
 */
export async function querySingleType(params) {
  const { typeId, ...param } = filterNullValueObject(params);
  return request(`${SRM_MDM}/v1/${organizationId}/payment-types/detail/${typeId}`, {
    method: 'GET',
    query: param,
  });
}

/**
 *新建或者修改付款方式
 *
 * @export
 * @param {Number} params.paymentId 付款方式Id
 * @param {String} params.paymentCode 付款方式代码
 * @param {String} params.paymentName 付款方式名称
 * @param {Number} params.ebankAccountFlag 银行标志
 * @param {Number} params.enabledFlag 启用标志
 * @returns
 */
export async function addOrUpdate(params) {
  const { customizeUnitCode } = params;
  return request(`${SRM_MDM}/v1/${organizationId}/payment-types`, {
    method: 'POST',
    body: [params],
    query: { customizeUnitCode },
  });
}

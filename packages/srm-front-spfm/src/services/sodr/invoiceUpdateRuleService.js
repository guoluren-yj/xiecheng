/**
 * service - 发票规则定义
 * @date: 2018-11-14
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { SRM_FINANCE } from '_utils/config';
// import { parseParameters, filterNullValueObject } from 'utils/utils';

/**
 *
 * 查询发票规则定义
 * @export
 * @param {Number} params.organizationId 租户Id
 * @returns
 */
export async function fetchInvoiceUpdRule(params) {
  return request(`${SRM_FINANCE}/v1/${params.organizationId}/invoice-update-rules`, {
    method: 'GET',
  });
}

/**
 * 保存数据
 *
 * @export
 * @param {Object} params 保存的数据
 * @returns
 */
export async function saveInvoiceUpdRule(params) {
  const { organizationId, payloadData } = params;
  return request(`${SRM_FINANCE}/v1/${organizationId}/invoice-update-rules`, {
    method: 'POST',
    body: [...payloadData],
  });
}

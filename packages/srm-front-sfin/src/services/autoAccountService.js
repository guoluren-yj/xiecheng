/**
 * service - 开票申请
 * @date: 2018-11-29
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { SRM_MALL, SRM_FINANCE } from '_utils/config';
import { parseParameters, filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

/**
 * 查询未对账数据
 * @param {Object} params - 请求参数
 */
export async function fetchNoAccount(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_FINANCE}/v1/${organizationId}/auto-bill/non-bill`, {
    method: 'GET',
    query,
  });
}

/**
 * 查询已对账数据
 * @param {Object} params - 请求参数
 */
export async function fetchAlreadyAccount(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_FINANCE}/v1/${organizationId}/auto-bill`, {
    method: 'GET',
    query,
  });
}

/**
 * 查询发票下载接口
 */
export async function fetchInvoiceDownloadList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_MALL}/v1/${organizationId}/ec-ecinvoice-headerss`, {
    method: 'GET',
    query,
  });
}

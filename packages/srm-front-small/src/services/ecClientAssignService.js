/**
 * ecClientAssign - 电商账号管理-分配设置 - service
 * @date: 2019-2-26
 * @author: Wu <qizheng.wu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { SRM_SCEI, SRM_MALL } from '_utils/config';
// import { HZERO_PLATFORM } from 'utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId(); // 租户ID

/**
 * 查询分配设置数据
 * @export
 * @param {object} params 查询参数
 * @returns
 */
export async function fetchECClientAssign(params) {
  return request(`${SRM_MALL}/v1/${organizationId}/ec-company-assigns/list`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 保存分配设置数据
 * @export
 * @param {object} params 请求参数
 * @returns
 */
export async function save(params) {
  return request(`${SRM_MALL}/v1/${organizationId}/ec-company-assigns`, {
    method: 'POST',
    body: params,
  });
}
/**
 * 查询电商账户数据
 * @export
 * @param {object} params 查询参数
 * @returns
 */
export async function fetchClientData(params) {
  return request(`${SRM_MALL}/v1/${organizationId}/ec-clients/${params.ecClientId}`, {
    method: 'GET',
  });
}
/**
 * 新增电商增票资质
 * @export
 * @param {object} params 请求参数
 * @returns
 */
export async function addEcQualification(params) {
  return request(`${SRM_SCEI}/v1/${organizationId}/ec-qualifications/${params}`, {
    method: 'POST',
    body: params,
  });
}
/**
 * 查询支付方式
 * @export
 * @param {object} params 查询参数
 * @returns
 */
export async function fetchPaymentType(params) {
  return request(`${SRM_SCEI}/v1/${organizationId}/ec-payments`, {
    method: 'GET',
    query: params,
  });
}

export async function fetchCommonData(params) {
  return request(`${SRM_MALL}/v1/${organizationId}/ec-client-values/by-condition`, {
    method: 'GET',
    query: params,
  });
}

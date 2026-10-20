/**
 * ecClientService - 电商账号管理 - service
 * @date: 2019-2-23
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { SRM_SCEC, SRM_SCEI } from '_utils/config';
import { HZERO_PLATFORM } from 'utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId(); // 租户ID

/**
 * 查询账号数据
 * @export
 * @param {object} params 查询参数
 * @returns
 */
export async function fetchECClient(params) {
  return request(`${SRM_SCEC}/v1/${organizationId}/ec-clients`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 账号激活
 * @export
 * @param {object} params 查询参数
 * @returns
 */
export async function activateAccount(params) {
  return request(`${SRM_SCEC}/v1/${organizationId}/ec-clients/check`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 保存账号信息
 * @export
 * @param {object} params 查询参数
 * @returns
 */
export async function saveECClient(params) {
  return request(`${SRM_SCEC}/v1/${organizationId}/ec-clients`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 编辑账号信息
 * @export
 * @param {object} params 查询参数
 * @returns
 */
export async function editECClient(params) {
  return request(`${SRM_SCEC}/v1/${organizationId}/ec-clients`, {
    method: 'PUT',
    body: params,
  });
}

/**
 * 保存账号信息
 * @export
 * @param {object} params 查询参数
 * @returns
 */
export async function fetchDetailData(params) {
  return request(`${SRM_SCEC}/v1/${organizationId}/ec-clients/${params.ecClientId}`, {
    method: 'GET',
  });
}

/**
 * 同步数据
 * @export
 * @param {object} params 查询参数
 * @returns
 */
export async function initSyncData(params) {
  const url = `${SRM_SCEI}/v1/${organizationId}/ec-product-pools/import-${params.ecPlatform.toLowerCase()}-product/${
    params.ecClientId
  }`;
  return request(url, {
    method: 'POST',
    body: params,
  });
}

/**
 * 修改密码
 * @export
 * @param {object} params 查询参数
 * @returns
 */
export async function changePwd(params) {
  return request(`${SRM_SCEC}/v1/${organizationId}/ec-clients/modify-password`, {
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

/**
 * 查询数据同步状态
 * @export
 * @param {object} params 查询参数
 * @returns
 */
export async function fetchInitDataStatus(params) {
  return request(`${SRM_SCEI}/v1/${organizationId}/ec-interfaces`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 单个同步接口
 * @export
 * @param {object} params 查询参数
 * @returns
 */
export async function singleInit(params) {
  let paramUrl = '';
  if (params.step === 'PRODUCT_POOL') {
    paramUrl = `ec-product-pools/import-${params.ecPlatform.toLowerCase()}-product-pool`;
  } else if (params.step === 'PAYMENT_MODE') {
    paramUrl = 'ec-payments/synchronize-payment';
  } else {
    paramUrl = `ec-product-pools/import-${params.ecPlatform.toLowerCase()}-product-price`;
  }
  return request(`${SRM_SCEI}/v1/${organizationId}/${paramUrl}/${params.ecClientId}`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 公共模态框数据查询
 * @export
 * @param {object} params 查询参数
 * @returns
 */
export async function fetchCommonData(params) {
  return request(`${SRM_SCEI}/v1/${organizationId}/ec-client-values/by-condition`, {
    method: 'GET',
    query: params,
  });
}

export async function queryParIdpValue(params) {
  return request(`${HZERO_PLATFORM}/v1/lovs/value/parent-value`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 公共模态框保存
 * @export
 * @param {object} params 参数
 * @returns
 */
export async function saveModalData(params) {
  return request(`${SRM_SCEI}/v1/${organizationId}/ec-client-values`, {
    method: 'POST',
    body: params,
  });
}
/**
 * 公共模态框删除
 * @export
 * @param {object} params 参数
 * @returns
 */
export async function deleteModalData(params) {
  return request(`${SRM_SCEI}/v1/${organizationId}/ec-client-values`, {
    method: 'DELETE',
    body: params.remoteDelete,
  });
}

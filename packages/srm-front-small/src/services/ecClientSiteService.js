/**
 * ecClientSiteService - 平台电商账号管理 - service
 * @date: 2019-3-7
 * @author: Wu <qizheng.wu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { SRM_SCEI, SRM_MALL } from '_utils/config';

/**
 * 查询账号数据
 * @export
 * @param {object} params 查询参数
 * @returns
 */
export async function fetchECClientSite(params) {
  return request(`${SRM_MALL}/v1/ec-clients/list`, {
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
  return request(`${SRM_MALL}/v1/ec-clients/check`, {
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
export async function saveECClientSite(params) {
  return request(`${SRM_MALL}/v1/ec-clients`, {
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
export async function editECClientSite(params) {
  return request(`${SRM_MALL}/v1/ec-clients`, {
    method: 'PUT',
    body: params,
  });
}

/**
 * 同步数据
 * @export
 * @param {object} params 查询参数
 * @returns
 */
export async function initSyncData(params) {
  return request(`${SRM_SCEI}/v1/ec-product-pools/import-jd-product/${params.ecClientId}`, {
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
  return request(`${SRM_MALL}/v1/ec-clients/modify-password`, {
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
  return request(`${SRM_SCEI}/v1/ec-payments`, {
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
  return request(`${SRM_SCEI}/v1/ec-interfaces`, {
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
    paramUrl = 'ec-product-pools/import-jd-product-pool';
  } else if (params.step === 'PAYMENT_MODE') {
    paramUrl = 'ec-payments/synchronize-payment';
  } else if (params.step === 'PRICE') {
    paramUrl = 'ec-product-pools/import-jd-product-price';
  } else {
    return false;
  }
  return request(`${SRM_SCEI}/v1/${paramUrl}/${params.ecClientId}`, {
    method: 'POST',
    body: params,
  });
}

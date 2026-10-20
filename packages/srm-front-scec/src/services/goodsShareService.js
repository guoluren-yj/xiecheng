/**
 * goodsShareService -商品分享 - service
 * @date: 2019-10-28
 * @author ZZ <qizheng.wu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import request from 'utils/request';
import { SRM_SCEC, SRM_SSRC } from '_utils/config';
import {
  parseParameters,
  getCurrentOrganizationId,
  filterNullValueObject,
  generateUrlWithGetParam,
} from 'utils/utils';

const tenantId = getCurrentOrganizationId();

/**
 * 分享的商品列表查询
 * @export
 * @param {object} params 查询参数
 * @returns
 */
export async function fetchShareGoodsList(params) {
  const param = parseParameters(params);
  return request(`${SRM_SCEC}/v1/${tenantId}/share-products-list`, {
    method: 'GET',
    query: param,
  });
}

export async function batchStatus(params) {
  return request(`${SRM_SCEC}/v1/${tenantId}/organization-share-status`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 被分享的商品列表查询
 * @export
 * @param {object} params 查询参数
 * @returns
 */
export async function fetchSharedGoodsList(params) {
  const param = parseParameters(params);
  return request(`${SRM_SCEC}/v1/${tenantId}/shardedProducts`, {
    method: 'GET',
    query: { ...param },
  });
}

/**
 * 分享模态框确定
 * @export
 * @param {object} params 查询参数
 * @returns
 */
export async function handleModalOk(params) {
  const param = parseParameters(params);
  const { page, size, companyDTOS } = param;
  return request(`${SRM_SCEC}/v1/${tenantId}/share-products?page=${page}&size=${size}`, {
    method: 'POST',
    body: companyDTOS,
  });
}

/**
 * 电商平台商品-商品详情
 * @exports
 * @param {object} params
 * @returns
 */
export async function fetchGoodsDetail(params) {
  return request(`${SRM_SCEC}/v1/${tenantId}/product/${params.productId}`, {
    method: 'GET',
    query: params,
  });
}

// /**
//  * 电商平台商品-商品提交
//  * @exports
//  * @param {object} params
//  * @returns
//  */
// export async function fetchGoodsSubmit(params) {
//   return request(`${SRM_SCEC}/v1/${tenantId}/product/submit`, {
//     method: 'POST',
//     body: params,
//   });
// }

/**
 * 电商平台商品-商品作废
 * @exports
 * @param {object} params
 * @returns
 */
// export async function fetchGoodsScrapped(params) {
//   return request(`${SRM_SCEC}/v1/${tenantId}/product/scrapped`, {
//     method: 'POST',
//     body: params,
//   });
// }

/**
 * 查询寻源列表
 */
export async function fetchSourcingList(params) {
  const param = parseParameters(params);
  return request(`${SRM_SSRC}/v1/${tenantId}/source/result/directory/list`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 集团共享
 */
export async function groupShare(params) {
  return request(`${SRM_SCEC}/v1/${tenantId}/organization-share?companyId=${params.companyId}`, {
    method: 'POST',
  });
}

/**
 * 分享/批量分享
 */
export async function handleGoodsShare(params) {
  const param = parseParameters(params);
  const { productIds, ...queryParams } = param;
  const url = generateUrlWithGetParam(
    `${SRM_SCEC}/v1/${tenantId}/company/list`,
    filterNullValueObject(queryParams)
  );
  return request(url, {
    method: 'POST',
    body: productIds,
  });
}

/**
 * 启用/禁用
 */
export async function changeState(params) {
  return request(`${SRM_SCEC}/v1/${tenantId}/banProduct`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 阶梯价格 - 批量删除
 * @async
 * @function deleteLadderPriceLines
 * @param {object} params - 请求参数
 * @returns {object} fetch Promise
 */
export async function deleteLadderPriceLines(params) {
  return request(`${SRM_SCEC}/v1/${tenantId}/catalogue/${params.productId}/product-ladder-price`, {
    method: 'DELETE',
    body: params.remoteDelete,
  });
}

/**
 * 阶梯报价数据查询
 * @async
 * @function fetchLadderPriceTable
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function fetchLadderPriceTable(params) {
  return request(`${SRM_SCEC}/v1/${tenantId}/catalogue/${params.productId}/product-ladder-price`, {
    method: 'GET',
  });
}

/**
 * 阶梯报价-新增保存
 * @async
 * @function saveLadderPrice
 * @param {object} params - 参数
 * @returns {object} fetch Promise
 */
export async function saveLadderPrice(params) {
  const { productId, newParameters } = params;
  return request(`${SRM_SCEC}/v1/${tenantId}/catalogue/${productId}/product-ladder-price`, {
    method: 'POST',
    body: newParameters,
  });
}

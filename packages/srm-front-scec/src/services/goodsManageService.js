/**
 * goodsManageService - 电商平台-商品上下架管理 - service
 * @date: 2019-2-9
 * @author: dengtingmin <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { SRM_SCEC, SRM_PLATFORM } from '_utils/config';
import { parseParameters, getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

/**
 * 商品上架/下架列表查询
 * @export
 * @param {object} params 查询参数
 * @returns
 */
export async function fetchGoodsList(params) {
  const param = parseParameters(params);
  return request(`${SRM_SCEC}/v1/${organizationId}/product/listShelve`, {
    method: 'GET',
    query: param,
  });
}

export async function getSettings() {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/settings`, {
    method: 'GET',
  });
}

/**
 * 商品批量上架
 * @export
 * @param {object} params 查询参数
 * @returns
 */
export async function batchPutaway(params) {
  return request(`${SRM_SCEC}/v1/${organizationId}/product/shelve`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 商品批量下架
 * @export
 * @param {object} params 查询参数
 * @returns
 */
export async function batchUnShelve(params) {
  return request(`${SRM_SCEC}/v1/${organizationId}/product/unshelve`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 商品详情查询
 * @export
 * @param {object} params 查询参数
 * @returns
 */
export async function fetchProductDetail(params) {
  return request(`${SRM_SCEC}/v1/${organizationId}/product/${params.productId}`, {
    method: 'GET',
    query: params,
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
  return request(
    `${SRM_SCEC}/v1/${organizationId}/catalogue/${params.productId}/product-ladder-price`,
    {
      method: 'GET',
      query: params,
    }
  );
}

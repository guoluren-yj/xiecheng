/**
 * shoppingBasket - 购物篮管理 - service
 * @date: 2019年11月05日
 * @author: ZZ <qizheng.wu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import request from 'utils/request';
import { parseParameters, getCurrentOrganizationId } from 'utils/utils';
import { SRM_MALL } from '_utils/config';

const tenantId = getCurrentOrganizationId(); // 租户ID
/**
 * 查询购物篮列表
 * @export
 * @param {object} params 查询参数
 * @returns
 */
export async function fetchBasketList(params) {
  const param = parseParameters(params);
  const url = `${SRM_MALL}/v1/${tenantId}/market-baskets`;
  return request(url, {
    method: 'GET',
    query: param,
  });
}

/**
 * 保存公司授权列表
 */
export async function saveCompanyData(list) {
  const url = `${SRM_MALL}/v1/${tenantId}/market-basket-auths`;
  return request(url, {
    method: 'PUT',
    body: list,
  });
}

/**
 * 租户下公司数据查询
 * @export
 * @param {object} params 查询参数
 * @returns
 */
export async function fetCompanyList(params) {
  const param = parseParameters(params);
  return request(`${SRM_MALL}/v1/${tenantId}/market-basket-auths/${param.marketBasketId}`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 启用/禁用购物篮
 * @export
 * @param {object} params 查询参数
 * @returns
 */
export async function shelfAction(params) {
  const url = `${SRM_MALL}/v1/${tenantId}/market-baskets/change-enableFlag`;
  return request(url, {
    method: 'PUT',
    body: params,
  });
}
/**
 * 新建购物篮
 * @param {Object} 购物篮对象
 */
export async function createBasket(params) {
  const url = `${SRM_MALL}/v1/${tenantId}/market-baskets`;
  return request(url, {
    method: 'POST',
    body: params,
  });
}

/**
 * 获取购物篮信息
 * @param {Object} 查询参数
 */
export async function fetchBasketBar(params) {
  const param = parseParameters(params);
  const url = `${SRM_MALL}/v1/${tenantId}/market-baskets`;
  return request(url, {
    method: 'GET',
    query: param,
  });
}

/**
 * 获取购物篮商品信息
 * @param {Obeject} 查询参数
 */
export async function fetchProductList(params) {
  const param = parseParameters(params);
  const url = `${SRM_MALL}/v1/${tenantId}/basket-assigns`;
  return request(url, {
    method: 'GET',
    query: param,
  });
}

/**
 * 购物篮商品删除
 * @param {Array} 删除的id列表
 */
export async function deleteProduct(params) {
  const url = `${SRM_MALL}/v1/${tenantId}/basket-assigns`;
  return request(url, {
    method: 'DELETE',
    body: params,
  });
}

/**
 * 查询操作记录
 */
export async function fetchHistory(params) {
  const param = parseParameters(params);
  const url = `${SRM_MALL}/v1/${tenantId}/basket-historys`;
  return request(url, {
    method: 'GET',
    query: param,
  });
}

export async function delBasket(params) {
  return request(`/v1/${tenantId}/basket/batch-remove`, {
    method: 'POST',
    body: params,
  });
}

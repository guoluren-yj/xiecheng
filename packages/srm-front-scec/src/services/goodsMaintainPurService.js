/**
 * goodsMaitainService - 电商平台-商品维护 --采购方- service
 * @date: 2019-1-14
 * @author: dengtingmin <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { SRM_SCEC, SRM_SSRC, SRM_MDM } from '_utils/config';
import { parseParameters, getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();
/**
 * 电商平台商品维护查询列表
 * @export
 * @param {object} params 查询参数
 * @returns
 */
export async function fetchGoodsList(params) {
  const param = parseParameters(params);
  return request(`${SRM_SCEC}/v1/${organizationId}/maintain-products`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 电商平台商品-基础信息部分保存
 * @exports
 * @param {object} params 商品基础信息部分参数
 * @returns
 */
export async function saveGoodsInfo(params) {
  return request(`${SRM_SCEC}/v1/${organizationId}/product`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 电商平台商品-目录名称查询
 * @exports
 * @param {object} params 一共有三层，每一层的获取传递的参数是不一样的
 * @returns
 */
export async function fetchCatalogue(params) {
  return request(`${SRM_SCEC}/v1/${organizationId}/catalogs/linkage`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 电商平台商品-商品详情
 * @exports
 * @param {object} params
 * @returns
 */
export async function fetchGoodsDetail(params) {
  return request(`${SRM_SCEC}/v1/${organizationId}/product/${params.productId}`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 电商平台商品-商品提交
 * @exports
 * @param {object} params
 * @returns
 */
export async function fetchGoodsSubmit(params) {
  return request(`${SRM_SCEC}/v1/${organizationId}/product/submit`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 电商平台商品-商品作废
 * @exports
 * @param {object} params
 * @returns
 */
export async function fetchGoodsScrapped(params) {
  return request(`${SRM_SCEC}/v1/${organizationId}/product/scrapped`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 电商平台商品-首页查询目录
 * @exports
 * @param {object} params
 * @returns
 */
export async function fetchGoodsCateLogs(params) {
  const param = parseParameters(params);
  return request(`${SRM_SCEC}/v1/${organizationId}/catalogs/${params.companyId}/level-3`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 修改目录化目录
 */
export async function updateCateLog(params) {
  return request(`${SRM_SCEC}/v1/${organizationId}/product/update-catalog/${params.catalogId}`, {
    method: 'PUT',
    body: params.productIds,
  });
}

/**
 * 查询寻源列表
 */
export async function fetchSourcingList(params) {
  const param = parseParameters(params);
  return request(`${SRM_SSRC}/v1/${organizationId}/source/result/directory/list`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 商品维护列表引用寻源列表
 */
export async function importSourcingList(params) {
  return request(`${SRM_SCEC}/v1/${organizationId}/product/${params.createdParty}/import-source`, {
    method: 'POST',
    body: params.resultIds,
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
  return request(
    `${SRM_SCEC}/v1/${organizationId}/catalogue/${params.productId}/product-ladder-price`,
    {
      method: 'DELETE',
      body: params.remoteDelete,
    }
  );
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
    }
  );
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
  return request(`${SRM_SCEC}/v1/${organizationId}/catalogue/${productId}/product-ladder-price`, {
    method: 'POST',
    body: newParameters,
  });
}

export async function fetchComapnyCurrency(params) {
  return request(`${SRM_MDM}/v1/${organizationId}/currency/company-currency`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 规格参数 - 批量删除
 * @async
 * @function deleteAttribute
 * @param {object} params - 请求参数
 * @returns {object} fetch Promise
 */
export async function deleteAttribute(params) {
  return request(`${SRM_SCEC}/v1/${organizationId}/product-attribute`, {
    method: 'DELETE',
    body: params,
  });
}

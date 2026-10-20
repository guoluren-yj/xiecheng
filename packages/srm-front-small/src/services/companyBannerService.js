/**
 * CompanyBanner - 公司Banner管理
 * @date: 2019-2-26
 * @author: CJ <juan.chen01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { HZERO_PLATFORM } from 'utils/config';
import { parseParameters } from 'utils/utils';
import { SRM_MALL } from '_utils/config';
// banner平台-公司判断
function organizationIdApi(organizationId) {
  return organizationId || organizationId === 0 ? `${organizationId}/banner` : `platform-banner`;
}

// 商品平台-公司判断
function organizationIdGoodsApi(organizationId) {
  return organizationId || organizationId === 0
    ? `${organizationId}/banner-assigns`
    : `banner-assigns`;
}

/**
 * 数据查询
 * @async
 * @function fetchCompanyBannerList
 * @param {object} params - 查询条件
 * @param {!number} [params.page = 0] - 数据页码
 * @param {!number} [params.size = 10] - 分页大小
 * @returns {object} fetch Promise
 */
export async function fetchCompanyBannerList(params) {
  const { organizationId, ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(`${SRM_MALL}/v1/${organizationIdApi(organizationId)}`, {
    method: 'GET',
    query: { ...param },
  });
}

/**
 * 历史纪录数据查询
 * @async
 * @function fetchHistoryRecord
 * @param {object} params - 查询条件
 * @param {!number} [params.page = 0] - 数据页码
 * @param {!number} [params.size = 10] - 分页大小
 * @returns {object} fetch Promise
 */
export async function fetchHistoryRecord(params) {
  const { bannerId, organizationId, ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(`${SRM_MALL}/v1/${organizationIdApi(organizationId)}/${bannerId}/history`, {
    method: 'GET',
    query: { ...param },
  });
}

/**
 * 当前公司值集查询
 * @async
 * @function fetchCurrentCompanyValue
 * @returns {object} fetch Promise
 */
export async function fetchCurrentCompanyValue(params) {
  return request(`${HZERO_PLATFORM}/v1/lovs/data`, {
    method: 'GET',
    query: { ...params },
  });
}

/**
 * 商品列表数据查询
 * @async
 * @function fetchModalList
 * @param {object} params - 查询条件
 * @param {!number} [params.page = 0] - 数据页码
 * @param {!number} [params.size = 10] - 分页大小
 * @returns {object} fetch Promise
 */
export async function fetchModalList(params) {
  const { organizationId, ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(`${SRM_MALL}/v1/${organizationIdGoodsApi(organizationId)}`, {
    method: 'GET',
    query: { ...param },
  });
}

/**
 * 上架/下架Banner
 * @async
 * @function operatingBanner
 * @returns {object} fetch Promise
 */
export async function operatingBanner(params) {
  const { organizationId, ...otherParams } = params;
  return request(`${SRM_MALL}/v1/${organizationIdApi(organizationId)}/shelf`, {
    method: 'POST',
    body: { ...otherParams },
  });
}

/**
 * 启用/禁用Banner
 * @async
 * @function enableAction
 * @returns {object} fetch Promise
 */
export async function enableAction(params) {
  const { organizationId, data } = params;
  return request(`${SRM_MALL}/v1/${organizationId}/banner-distributes`, {
    method: 'POST',
    body: data,
  });
}

/**
 * 新增公司Banner
 * @async
 * @function saveCompanyBanner
 * @param {object} params - 请求参数
 * @returns {object} fetch Promise
 */
export async function saveCompanyBanner(params) {
  return request(`${SRM_MALL}/v1/${organizationIdApi(params.organizationId)}`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 获取公司Banner头信息
 * @async
 * @function fetchCompanyBannerHeader
 * @param {object} params - 请求参数
 * @returns {object} fetch Promise
 */
export async function fetchCompanyBannerHeader(params) {
  return request(`${SRM_MALL}/v1/${organizationIdApi(params.organizationId)}/${params.bannerId}`, {
    method: 'GET',
  });
}

/**
 * 获取商品行信息
 * @async
 * @function fetchCompanyBannerLine
 * @param {object} params - 查询条件
 * @param {!number} [params.page = 0] - 数据页码
 * @param {!number} [params.size = 10] - 分页大小
 * @returns {object} fetch Promise
 */
export async function fetchCompanyBannerLine(params) {
  const { organizationId, ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(`${SRM_MALL}/v1/${organizationIdGoodsApi(organizationId)}`, {
    method: 'GET',
    query: { ...param },
  });
}

/**
 * 商品行-新增
 * @async
 * @function saveGoodsLine
 * @param {object} params - 参数
 * @returns {object} fetch Promise
 */
export async function saveGoodsLine(params) {
  const { organizationId, ...otherParams } = params;
  return request(`${SRM_MALL}/v1/${organizationIdGoodsApi(organizationId)}`, {
    method: 'POST',
    body: otherParams.newParams,
  });
}

/**
 * 商品行 - 批量删除
 * @async
 * @function deleteGoodsLines
 * @param {object} params - 请求参数
 * @returns {object} fetch Promise
 */
export async function deleteGoodsLines(params) {
  const { organizationId, ...otherParams } = params;
  return request(`${SRM_MALL}/v1/${organizationIdGoodsApi(organizationId)}/remove`, {
    method: 'DELETE',
    body: otherParams.remoteDelete,
  });
}

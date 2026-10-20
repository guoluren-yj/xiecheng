import request from 'utils/request';
import { SRM_SCEC } from '_utils/config';
import { parseParameters } from 'utils/utils';

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

export async function fetchCompany(params) {
  const { organizationId } = params;
  return request(`${SRM_SCEC}/v1/${organizationId}/banner/companyid`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 数据查询
 * @async
 * @function fetchGroupBannerList
 * @param {object} params - 查询条件
 * @param {!number} [params.page = 0] - 数据页码
 * @param {!number} [params.size = 10] - 分页大小
 * @returns {object} fetch Promise
 */
export async function fetchGroupBannerList(params) {
  const { organizationId, ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(`${SRM_SCEC}/v1/${organizationIdApi(organizationId)}`, {
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
  return request(`${SRM_SCEC}/v1/${organizationIdApi(organizationId)}/${bannerId}/history`, {
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
export async function fetchCompanyId(params) {
  const { organizationId } = params;
  return request(`${SRM_SCEC}/v1/${organizationId}/banner/companyId`, {
    method: 'GET',
    query: { ecClientId: params.ecClientId },
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
  return request(`${SRM_SCEC}/v1/${organizationIdApi(organizationId)}/shelf`, {
    method: 'POST',
    body: { ...otherParams },
  });
}

/**
 * 新增公司Banner
 * @async
 * @function saveGroupBanner
 * @param {object} params - 请求参数
 * @returns {object} fetch Promise
 */
export async function saveGroupBanner(params) {
  return request(`${SRM_SCEC}/v1/${organizationIdApi(params.organizationId)}`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 获取公司Banner头信息
 * @async
 * @function fetchGroupBannerHeader
 * @param {object} params - 请求参数
 * @returns {object} fetch Promise
 */
export async function fetchGroupBannerHeader(params) {
  return request(`${SRM_SCEC}/v1/${organizationIdApi(params.organizationId)}/${params.bannerId}`, {
    method: 'GET',
  });
}

/**
 * 获取商品行信息
 * @async
 * @function fetchGroupBannerLine
 * @param {object} params - 查询条件
 * @param {!number} [params.page = 0] - 数据页码
 * @param {!number} [params.size = 10] - 分页大小
 * @returns {object} fetch Promise
 */
export async function fetchGroupBannerLine(params) {
  const { organizationId, ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(`${SRM_SCEC}/v1/${organizationIdGoodsApi(organizationId)}`, {
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
  return request(`${SRM_SCEC}/v1/${organizationIdGoodsApi(organizationId)}`, {
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
  return request(`${SRM_SCEC}/v1/${organizationIdGoodsApi(organizationId)}/remove`, {
    method: 'DELETE',
    body: otherParams.remoteDelete,
  });
}

export async function fetchBannerSupplier(params) {
  return request(`${SRM_SCEC}/v1/lovs/sql/data`, {
    method: 'GET',
    query: { ...params },
  });
}

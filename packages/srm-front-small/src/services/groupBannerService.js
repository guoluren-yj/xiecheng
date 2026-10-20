/**
 * CompanyBanner - 集团Banner管理
 * @date: 2019-2-26
 * @author: CJ <juan.chen01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { HZERO_PLATFORM } from 'utils/config';
import { parseParameters, getCurrentOrganizationId } from 'utils/utils';
import { SRM_MALL } from '_utils/config';

const SRM_PRODUCT = '/smpc';

// const organizationId = getCurrentOrganizationId(); // 租户ID

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
 * @function fetchGroupBannerList
 * @param {object} params - 查询条件
 * @param {!number} [params.page = 0] - 数据页码
 * @param {!number} [params.size = 10] - 分页大小
 * @returns {object} fetch Promise
 */
export async function fetchGroupBannerList(params) {
  const { organizationId, ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(`${SRM_MALL}/v1/${organizationId}/banner/group-banner`, {
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
 * 新增集团Banner
 * @async
 * @function saveGroupBanner
 * @param {object} params - 请求参数
 * @returns {object} fetch Promise
 */
export async function saveGroupBanner(params) {
  return request(`${SRM_MALL}/v1/${organizationIdApi(params.organizationId)}`, {
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
  return request(`${SRM_MALL}/v1/${organizationIdApi(params.organizationId)}/${params.bannerId}`, {
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

/**
 * 查询分配公司列表
 * @export
 * @param params
 * @returns {Promise<void>}
 */
export async function fetchAssignCompany(params) {
  const { organizationId, bannerId, ...otherParams } = params;
  const param = parseParameters(otherParams);
  const url = `${SRM_MALL}/v1/${organizationId}/banner-distributes/${bannerId}/company-list`;
  return request(url, {
    method: 'GET',
    query: param,
  });
}

/**
 * 分配公司保存
 * @export
 * @param {object} params 更新参数
 * @returns
 */
export async function saveAssignCompany(params) {
  const { organizationId, saveData } = params;
  const url = `${SRM_MALL}/v1/${organizationId}/banner-distributes`;
  return request(url, {
    method: 'POST',
    body: saveData,
  });
}

/**
 * 查询业务通知发布列表
 */
export async function fetchProduct(params) {
  const param = parseParameters(params);
  const { page, size, ...other } = param;
  return request(`${SRM_PRODUCT}/v1/${getCurrentOrganizationId()}/pur-skus/all-sku-list`, {
    method: 'GET',
    query: { page, size, ...other },
  });
}

export async function sortBanner(params) {
  const organizationId = getCurrentOrganizationId();
  return request(`${SRM_MALL}/v1/${organizationId}/banner/sort`, {
    method: 'POST',
    body: params,
  });
}

export async function delBanner(params) {
  const organizationId = getCurrentOrganizationId();
  return request(`${SRM_MALL}/v1/${organizationId}/banner/batch-remove`, {
    method: 'POST',
    body: params,
  });
}

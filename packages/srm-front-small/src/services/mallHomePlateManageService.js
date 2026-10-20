import request from 'utils/request';
import { SRM_MALL } from '_utils/config';
import { HZERO_PLATFORM } from 'utils/config';
import { parseParameters, getCurrentOrganizationId } from 'utils/utils';

const SRM_PRODUCT = '/smpc';
const organizationId = getCurrentOrganizationId(); // 租户ID

/**
 * 获取当前公司
 */
export async function getCurrentCompany() {
  return request(`${HZERO_PLATFORM}/v1/lovs/data`, {
    method: 'GET',
    query: { lovCode: 'SPFM.USER_AUTH.COMPANY', tenantId: organizationId },
  });
}

/**
 *查询分类
 *
 */
export async function fetchTypeTree() {
  return request(`${SRM_PRODUCT}/v1/category/${organizationId}/getTreeWithThreeList`, {
    method: 'GET',
  });
}

/**
 * 获取banner明细
 */
export async function fetchBannerHeader(params) {
  return request(`${SRM_MALL}/v1/${organizationId}/banner/${params.bannerId}`, {
    method: 'GET',
  });
}

/**
 * 上下架banner
 */
export async function operatingBanner(params) {
  return request(`${SRM_MALL}/v1/${organizationId}/banner/shelf`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 批量删除banner
 */
export async function delBanner(params) {
  return request(`${SRM_MALL}/v1/${organizationId}/banner/batch-remove`, {
    method: 'POST',
    body: params,
  });
}

/**
 * banner下的商品列表
 */
export async function getBannerProduct(params) {
  const param = parseParameters(params);
  return request(`${SRM_MALL}/v1/${organizationId}/banner-assigns`, {
    method: 'GET',
    query: { ...param },
  });
}

/**
 * 新建/修改Banner
 */
export async function saveBanner(params) {
  return request(`${SRM_MALL}/v1/${organizationId}/banner`, {
    method: 'POST',
    body: params,
  });
}

/**
 * banner批量删除商品行
 */
export async function delBannerGoodsLines(params) {
  return request(`${SRM_MALL}/v1/${organizationId}/banner-assigns/remove`, {
    method: 'DELETE',
    body: params.remoteDelete,
  });
}

/**
 * 查询banner分配公司列表
 */
export async function getBannerAssignCompany(params) {
  const { bannerId, ...otherParams } = params;
  const param = parseParameters(otherParams);
  const url = `${SRM_MALL}/v1/${organizationId}/banner-distributes/${bannerId}/company-list`;
  return request(url, {
    method: 'GET',
    query: param,
  });
}

/**
 * 保存banner分配公司
 */
export async function saveBannerAssignCompany(params) {
  const url = `${SRM_MALL}/v1/${organizationId}/banner-distributes`;
  return request(url, {
    method: 'POST',
    body: params,
  });
}

/**
 * 启用/禁用Banner
 * @async
 * @function enableAction
 * @returns {object} fetch Promise
 */
export async function enableBannerAction(params) {
  return request(`${SRM_MALL}/v1/${organizationId}/banner-distributes`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 获取自定义栏头明细
 */
export async function fetchBarHeader(params) {
  return request(`${SRM_MALL}/v1/${organizationId}/custom-bars/${params.barId}`, {
    method: 'GET',
  });
}

/**
 * 上下架自定义栏
 */
export async function operatingBar(params) {
  return request(`${SRM_MALL}/v1/${organizationId}/custom-bars/shelf`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 批量删除自定义栏
 */
export async function delBar(params) {
  return request(`${SRM_MALL}/v1/${organizationId}/custom-bars/batch-remove`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 自定义栏下的商品列表
 */
export async function getBarProduct(params) {
  const param = parseParameters(params);
  return request(`${SRM_MALL}/v1/${organizationId}/custom-bar-assigns`, {
    method: 'GET',
    query: { ...param },
  });
}

/**
 * 新建/修改自定义栏
 */
export async function saveBar(params) {
  return request(`${SRM_MALL}/v1/${organizationId}/custom-bars`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 自定义栏批量删除商品行
 */
export async function delBarGoodsLines(params) {
  return request(`${SRM_MALL}/v1/${organizationId}/custom-bar-assigns/remove`, {
    method: 'DELETE',
    body: params,
  });
}

/**
 * 查询自定义栏分配公司列表
 */
export async function getBarAssignCompany(params) {
  const { barId, ...otherParams } = params;
  const param = parseParameters(otherParams);
  const url = `${SRM_MALL}/v1/${organizationId}/custom-distributes/${barId}/company-list`;
  return request(url, {
    method: 'GET',
    query: param,
  });
}

/**
 * 保存自定义栏分配公司
 */
export async function saveBarAssignCompany(params) {
  const url = `${SRM_MALL}/v1/${organizationId}/custom-distributes`;
  return request(url, {
    method: 'POST',
    body: params,
  });
}

/**
 * 启用/禁用
 * @export
 * @param {object} params 更新参数
 * @returns
 */
export async function enableBarAction(params) {
  const url = `${SRM_MALL}/v1/${organizationId}/custom-distributes`;
  return request(url, {
    method: 'POST',
    body: params,
  });
}

/**
 * 快速添加商品
 */
export async function quickAddProduct(params) {
  const url = `${SRM_MALL}/v1/${organizationId}/custom-bar-assigns/batch-by-cid`;
  return request(url, {
    method: 'POST',
    body: params,
  });
}

// 采购套餐

/**
 * 获取采购套餐明细
 */
export async function fetchPackageHeader(params) {
  const param = parseParameters(params);
  const url = `${SRM_MALL}/v1/${organizationId}/market-baskets`;
  return request(url, {
    method: 'GET',
    query: param,
  });
}

/**
 * 保存采购套餐授权公司列表
 */
export async function grantPackageCompany(params) {
  const url = `${SRM_MALL}/v1/${organizationId}/market-basket-auths`;
  return request(url, {
    method: 'PUT',
    body: params,
  });
}

/**
 * 启用/禁用采购套餐
 */
export async function enablePackage(params) {
  const url = `${SRM_MALL}/v1/${organizationId}/shopping-bars/publish`;
  return request(url, {
    method: 'POST',
    body: params,
  });
}

/**
 * 采购套餐保存明细
 */
export async function savePackage(params) {
  const url = `${SRM_MALL}/v1/${organizationId}/shopping-bars`;
  return request(url, {
    method: 'POST',
    body: params,
  });
}

/**
 * 获取采购套餐商品列表
 */
export async function getPackageProduct(params) {
  const param = parseParameters(params);
  const url = `${SRM_MALL}/v1/${organizationId}/basket-assigns`;
  return request(url, {
    method: 'GET',
    query: param,
  });
}

/**
 * 采购套餐删除商品行
 */
export async function delPackageGoodsLines(params) {
  const url = `${SRM_MALL}/v1/${organizationId}/basket-assigns`;
  return request(url, {
    method: 'DELETE',
    body: params,
  });
}

// 新建商品行原始数据查询
export async function fetchProduct(params) {
  const param = parseParameters(params);
  const { page, size, ...other } = param;
  return request(`${SRM_PRODUCT}/v1/${organizationId}/pur-skus/all-sku-list`, {
    method: 'GET',
    query: { page, size, ...other },
  });
}

export async function sortBanner(params) {
  return request(`${SRM_MALL}/v1/${organizationId}/banner/sort`, {
    method: 'POST',
    body: params,
  });
}

// 公司自定义栏拖拽排序
export async function sortCustomBar(params) {
  return request(`${SRM_MALL}/v1/${organizationId}/custom-bars/sort`, {
    method: 'POST',
    body: params,
  });
}

// 保存频道列表
export async function saveChannel(params) {
  return request(`${SRM_MALL}/v1/${organizationId}/custom-channels`, {
    method: 'POST',
    body: params,
  });
}

// 频道栏目拖拽排序
export async function sortChannel(params) {
  return request(`${SRM_MALL}/v1/${organizationId}/custom-channels/sort`, {
    method: 'POST',
    body: params,
  });
}

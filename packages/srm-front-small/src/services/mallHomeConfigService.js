import request from 'utils/request';
import { HZERO_FILE } from 'utils/config';
import { SRM_MALL, PUBLIC_BUCKET, SRM_PLATFORM } from '_utils/config';
import { getCurrentOrganizationId, getCurrentUserId } from 'utils/utils';

const organizationId = getCurrentOrganizationId(); // 租户ID

/**
 * 删除图片
 * @export
 * @param {object} params 查询参数
 * @returns
 */
export async function deleteImgUrl(params) {
  const { urls, bucketName = PUBLIC_BUCKET } = params;
  const url = `${HZERO_FILE}/v1/${organizationId}/files/delete-by-url?bucketName=${bucketName}`;
  return request(url, {
    method: 'POST',
    body: urls,
  });
}

export async function fetchDetail(params) {
  const url = `${SRM_MALL}/v1/${organizationId}/page-config-new-details`;
  return request(url, {
    method: 'GET',
    query: params,
  });
}

export async function saveConfig(params) {
  const url = `${SRM_MALL}/v1/${organizationId}/page-config-new-details `;
  return request(url, {
    method: 'POST',
    body: params,
  });
}

// 查询组织
export async function fetchUnits() {
  const url = `/smct/v1/${organizationId}/template-units/unit`;
  return request(url, {
    method: 'GET',
  });
}

// 保存并预览
export async function saveCustomService(params) {
  const url = `${SRM_MALL}/v1/${organizationId}/custom-tags/save`;
  return request(url, {
    method: 'POST',
    body: params,
  });
}

// 应用
export async function applyCustomService(params) {
  const url = `${SRM_MALL}/v1/${organizationId}/custom-tags/apply`;
  return request(url, {
    method: 'POST',
    body: params,
  });
}

// custom列表
export async function initCustomService(params) {
  const url = `${SRM_MALL}/v1/${organizationId}/custom-tags/list`;
  return request(url, {
    method: 'GET',
    query: params,
  });
}

// fetchBanerList
export async function fetchBanerListService(params) {
  const url = `${SRM_MALL}/v1/${organizationId}/page-banners/list`;
  return request(url, {
    method: 'GET',
    query: params,
  });
}

export async function saveBannerListService(params) {
  const url = `${SRM_MALL}/v1/${organizationId}/page-banners/save`;
  return request(url, {
    method: 'POST',
    body: params,
  });
}

// applyBannerService
export async function applyBannerService(params) {
  const url = `${SRM_MALL}/v1/${organizationId}/page-banners/apply`;
  return request(url, {
    method: 'POST',
    body: params,
  });
}

// 查询权限
export async function fetchPermission() {
  const userId = getCurrentUserId();
  const url = `${SRM_MALL}/v1/${organizationId}/member/config`;
  return request(url, {
    method: 'GET',
    query: {
      userId,
    },
  });
}

// 保存公告
export async function saveGonggao(body) {
  const url = `${SRM_MALL}/v1/${organizationId}/bulletin-boards/save`;
  return request(url, {
    method: 'POST',
    body,
  });
}

// 排序公告
export async function sortGonggao(body) {
  const url = `${SRM_MALL}/v1/${organizationId}/bulletin-boards/sort`;
  return request(url, {
    method: 'POST',
    body,
  });
}

// 应用公告
export async function saveAndApplyGonggao(body) {
  const url = `${SRM_MALL}/v1/${organizationId}/bulletin-boards/apply`;
  return request(url, {
    method: 'POST',
    body,
  });
}

// 应用专区
export async function saveAndApplyAZhuanqu(body) {
  const url = `${SRM_MALL}/v1/${organizationId}/special-blocks/apply`;
  return request(url, {
    method: 'POST',
    body,
  });
}

// 查询二级域名主题配置
export async function fetchCustConfig() {
  const url = `${SRM_MALL}/v1/${organizationId}/personal-configs`;
  return request(url, {
    method: 'GET',
  });
}

// 保存二级域名主题配置
export async function saveCustConfig(body) {
  const url = `${SRM_MALL}/v1/${organizationId}/personal-configs`;
  return request(url, {
    method: 'POST',
    body,
  });
}

// 专区list查询
export async function fetchZhuanqu(query) {
  const url = `${SRM_MALL}/v1/${organizationId}/special-blocks/list`;
  return request(url, {
    method: 'GET',
    query,
  });
}

// 保存公告
export async function saveZhuanqu(body) {
  const url = `${SRM_MALL}/v1/${organizationId}/special-blocks/save`;
  return request(url, {
    method: 'POST',
    body,
  });
}

// 专区排序
export async function sortZhuanqu(body) {
  const url = `${SRM_MALL}/v1/${organizationId}/special-blocks/sort`;
  return request(url, {
    method: 'POST',
    body,
  });
}

// 查询banner滚动速度
export async function fetchBannerSpeed(body) {
  const url = `${SRM_PLATFORM}/v1/${organizationId}/rel-table-records/smal_banner_speed/list`;
  return request(url, {
    method: 'POST',
    body,
  });
}

// 保存banner滚动速度
export async function saveBannerSpeed(body) {
  const { id } = body;
  const url = `${SRM_PLATFORM}/v1/${organizationId}/rel-table-records/smal_banner_speed`;
  return request(url, {
    method: id ? 'PUT' : 'POST',
    body,
  });
}

// 商品卡片配置
export async function fetchProductCardConfig(params) {
  const url = `${SRM_MALL}/v1/${organizationId}/product-card-configs`;
  return request(url, {
    method: 'GET',
    query: params,
  });
}

// 保存卡片配置
export async function saveProductCartConfig(params) {
  const url = `${SRM_MALL}/v1/${organizationId}/product-card-configs`;
  return request(url, {
    method: 'POST',
    body: params,
  });
}

// 商品卡片配置
export async function fetchSortList(params) {
  const url = `${SRM_MALL}/v1/${organizationId}/product-search-type-configs`;
  return request(url, {
    method: 'GET',
    query: params,
  });
}

// 保存搜索条件排序
export async function saveSortSearch(params) {
  const url = `${SRM_MALL}/v1/${organizationId}/product-search-type-configs`;
  return request(url, {
    method: 'POST',
    body: params,
  });
}

// 查询是否只展示有货商品目录
export async function fetchIsOnlyInProduct(body) {
  const url = `${SRM_PLATFORM}/v1/${organizationId}/rel-table-records/smal_catalog_config/list`;
  return request(url, {
    method: 'POST',
    body,
  });
}

// 插入有货商品目录flag
export async function saveIsOnlyInProduct(body) {
  const { id } = body;
  const url = `${SRM_PLATFORM}/v1/${organizationId}/rel-table-records/smal_catalog_config`;
  return request(url, {
    method: id ? 'PUT' : 'POST',
    body,
  });
}

// 查询角色权限
export async function fetchItemPermission(codeList) {
  const url = `/iam/hzero/v1/menus/check-permissions`;
  return request(url, {
    method: 'POST',
    body: codeList,
  });
}
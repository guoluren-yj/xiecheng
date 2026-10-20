/**
 * ecAddressManageService - 电商平台地址定义 - service 租户级
 * @date: 2019-11-21
 * @author: fujie <jie.fu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { SRM_MALL } from '_utils/config';
import { generateUrlWithGetParam } from 'utils/utils';

// 国家查询
export async function fetchCountryList() {
  return request(`${SRM_MALL}/v1/mall-regions/country-list-by-config`, {
    method: 'GET',
  });
}

// 地址查询
export async function fetchAddressList(params) {
  const { key, record, versionId, ...rest } = params;
  const regionCode = record?.record?.get('countryFlag') ? undefined : key;
  const countryId = record?.record?.get('countryId');
  // const param = params.page === -1 ? params : parseParameters(params);
  return request(`${SRM_MALL}/v1/mall-regions/Subordinate`, {
    method: 'GET',
    query: { regionCode, versionId, ...rest, page: -1, countryId },
  });
}

// 查询父级地址
export async function fetchParent(params) {
  return request(`${SRM_MALL}/v1/mall-regions/select`, {
    method: 'GET',
    query: params,
  });
}

// 地址启用/禁用
export async function setPermissionSetEnable(params) {
  const url = `${SRM_MALL}/v1/mall-regions/updateStatus`;
  return request(generateUrlWithGetParam(url, params), {
    method: 'PUT',
  });
}

// 保存
export async function saveAddress(params) {
  return request(`${SRM_MALL}/v1/mall-regions`, {
    method: 'POST',
    body: params,
  });
}

// 修改
export async function updateAddress(params) {
  return request(`${SRM_MALL}/v1/mall-regions`, {
    method: 'PUT',
    body: params,
  });
}
// 版本新建
export async function saveVersion(params) {
  return request(`${SRM_MALL}/v1/region-version/save`, {
    method: 'POST',
    body: params,
  });
}

// 版本
export async function enableVersion(params) {
  return request(`${SRM_MALL}/v1/region-version/enable`, {
    method: 'POST',
    body: params,
  });
}

// 版本删除
export async function deleteVersion(params) {
  return request(`${SRM_MALL}/v1/region-version/delete`, {
    method: 'POST',
    body: params,
  });
}

// 查询版本
export async function fetchVersion(params) {
  return request(`${SRM_MALL}/v1/region-version`, {
    method: 'GET',
    query: { ...params, page: -1 },
  });
}

export function exportAddress(params) {
  return request(`${SRM_MALL}/v1/region-version/export`, {
    method: 'GET',
    query: params,
    responseType: 'blob',
  });
}

// 获取code
export async function getCode() {
  return request(`${SRM_MALL}/v1/region-version/get-version-code`, {
    method: 'GET',
    responseType: 'text',
  });
}

// 继承地址
export async function fetchInheritAddress(params) {
  return request(`${SRM_MALL}/v1/region-version/region-extend`, {
    method: 'POST',
    body: params,
  });
}

// 版本升级
export async function fetchUpgradeVersion(params) {
  return request(`${SRM_MALL}/v1/region-version-tenant-mapping/upgrade `, {
    method: 'POST',
    body: params,
  });
}

// 重试
export function fetchRetry(params){
  return request(`${SRM_MALL}/v1/region-version-tenant-mapping/retry`, {
    method: 'POST',
    body: params,
  });
}

export function fetchVersionSetDefaultApi(params){
  return request(`${SRM_MALL}/v1/region-version/default-enable`, {
    method: 'POST',
    body: params,
  });
}
import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SAGM } from '_utils/config';
// const SRM_MALL = '/smal-21419';

const organizationId = getCurrentOrganizationId(); // 租户ID

// 租户企业组织配置信息
export function fetchConfig() {
  return request(`${SRM_SAGM}/v1/${organizationId}/unit-configs`, {
    method: 'GET',
    // query: params,
  });
}

// 保存配置信息
export function saveConfig(params) {
  return request(`${SRM_SAGM}/v1/${organizationId}/unit-configs`, {
    method: 'POST',
    body: params,
  });
}

// 生产采买组织
export function generatePurchaseUnit(params) {
  return request(`${SRM_SAGM}/v1/${organizationId}/pur-units/generate-pur-unit`, {
    method: 'POST',
    body: params,
  });
}

// 数据同步
export function fetchSyncProcess() {
  return request(`${SRM_SAGM}/v1/${organizationId}/pur-units/sync-status`, {
    method: 'GET',
    responseType: 'text',
  });
}

// 采买组织一级数据
export function fetchTreeData() {
  return request(`${SRM_SAGM}/v1/${organizationId}/pur-units/first-unit`, {
    method: 'GET',
  });
}

// 分页查询采买组织子节点数据 params: { parentPurUnitId }
export function fetchTreeChildData(params) {
  return request(`${SRM_SAGM}/v1/${organizationId}/pur-units/child-unit`, {
    method: 'GET',
    query: params,
  });
}

// 自动带出需要配置的维度和元素
export function fetchDimension() {
  return request(`${SRM_SAGM}/v1/${organizationId}/unit-configs/get-config-dimension-element`, {
    method: 'GET',
    // query: params,
  });
}

// 已保存的维度和元素
export function fetchHasDimension() {
  return request(`${SRM_SAGM}/v1/${organizationId}/unit-configs/dimension-element`, {
    method: 'GET',
  });
}

// 保存维度和元素
export function fetchSaveDimension(params) {
  return request(`${SRM_SAGM}/v1/${organizationId}/unit-configs/dimension-element`, {
    method: 'POST',
    body: params,
  });
}

// 批量保存组织
export function fetchSave(params) {
  return request(`${SRM_SAGM}/v1/${organizationId}/pur-units`, {
    method: 'POST',
    body: params,
  });
}

// 批量保存组织
export function fetchEnable(params) {
  return request(`${SRM_SAGM}/v1/${organizationId}/pur-units/enable-or-disable`, {
    method: 'POST',
    body: params,
  });
}

// 自动带出需要配置的维度和元素
export function queryConfig() {
  return request(`${SRM_SAGM}/v1/${organizationId}/unit-configs/exist-rel-table`, {
    method: 'GET',
  });
}

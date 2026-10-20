import request from 'utils/request';
import { getCurrentOrganizationId, getUserOrganizationId } from 'utils/utils';

import { SRM_SPC } from '_utils/config';
/**
 * 请求API前缀
 * @type {string}
 */
const organizationId = getCurrentOrganizationId();
const tenantId = getUserOrganizationId();

/**
 * 价格拓展策略 - 解锁
 * @async
 * @function handleUnlock
 */
export async function handleUnlock(params) {
  return request(`${SRM_SPC}/v1/${organizationId}/price-lib-expands/unLock`, {
    method: 'PUT',
    body: params,
  });
}

/**
 * 价格拓展策略 - 查询详情
 * @async
 * @function fetchDetail
 */
export async function fetchDetail(params) {
  return request(`${SRM_SPC}/v1/${organizationId}/price-lib-expands/detail`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 价格拓展策略 - 保存详情
 * @async
 * @function saveDetail
 */
export async function saveDetail(params) {
  return request(`${SRM_SPC}/v1/${organizationId}/price-lib-expands`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 价格拓展策略 - 发布
 * @async
 * @function releaseDetail
 */
export async function releaseDetail(params) {
  return request(`${SRM_SPC}/v1/${organizationId}/price-lib-expands`, {
    method: 'PUT',
    body: params,
  });
}

/**
 * 价格拓展策略 - 启用/禁用
 * @async
 * @function releaseDetail
 */
export async function enableDetail(params) {
  return request(`${SRM_SPC}/v1/${organizationId}/price-lib-expands/list/enabled`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 价格拓展策略 - 查询侧边tab
 * @async
 * @function fetchScopeTabs
 */
export async function fetchScopeTabs(params) {
  return request(`${SRM_SPC}/v1/${organizationId}/price-lib-rule-datas`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 价格拓展策略 - 保存引用数据
 * @async
 * @function saveIntroduce
 */
export async function saveIntroduce(params) {
  const url = `${SRM_SPC}/v1/${organizationId}/price-lib-rule-data-lns/introduce`;
  return request(url, {
    method: 'POST',
    body: params,
  });
}

/**
 * 价格拓展策略 - 保存新增维度tab
 * @async
 * @function saveAddTab
 */
export async function saveAddTab(params) {
  const url = `${SRM_SPC}/v1/${organizationId}/price-lib-rule-datas`;
  return request(url, {
    method: 'POST',
    body: params,
  });
}

/**
 * 价格拓展策略 - 删除tab
 * @async
 * @function deleteTab
 */
export async function deleteTab(params) {
  const url = `${SRM_SPC}/v1/${organizationId}/price-lib-rule-datas`;
  return request(url, {
    method: 'DELETE',
    body: params,
  });
}

/**
 * 价格拓展策略 - 加入全部
 * @async
 * @function saveJoinAll
 */
export async function saveJoinAll(params) {
  const url = `${SRM_SPC}/v1/${organizationId}/price-lib-rule-datas`;
  return request(url, {
    method: 'POST',
    body: params,
  });
}

/**
 * 价格拓展策略 - 获取lov头配置
 * @async
 * @function fetchLovConfig
 */
export async function fetchLovConfig(params) {
  const url = `/hpfm/v1/${organizationId}/lov-view/info`;
  return request(url, {
    method: 'GET',
    query: { ...params, tenantId },
  });
}

/**
 * 价格库 - 查询所有目标字段值，做跨页勾选
 * @async
 * @function fetchAppointAllData
 */
export async function fetchAppointCheckedData(params) {
  const url = `${SRM_SPC}/v1/${organizationId}/price-lib-rule-ln-datas/list`;
  return request(url, {
    method: 'GET',
    query: params,
  });
}

/**
 * 价格库 - 保存目标字段值
 * @async
 * @function saveAppoint
 */
export async function saveAppoint(params) {
  const { data = [], ruleLineId } = params;
  const url = `${SRM_SPC}/v1/${organizationId}/price-lib-rule-ln-datas/introduce/${ruleLineId}`;
  return request(url, {
    method: 'POST',
    body: data,
  });
}

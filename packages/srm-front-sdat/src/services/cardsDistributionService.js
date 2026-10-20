/**
 * 报表卡片配置管理
 * @date: 2022-08-10
 * @author: qingxiang.luo@going-link.com
 * @version: 0.0.1
 * @copyright Copyright (c) 2022, Zhenyun
 */
import request from 'utils/request';
import { SRM_DATA_SDAT } from '@/utils/config';

/**
 * fetchUnBind: 订阅租户 解绑操作
 * @param {Object} params 查询参数对象
 * @returns 请求Promise对象
 */
export async function fetchUnBind(params) {
  return request(`${SRM_DATA_SDAT}/v1/report-card-distributions`, {
    method: 'DELETE',
    body: params,
  });
}

/**
 * fetchBatchRemove: 订阅租户 批量移除卡片操作
 * @param {Object} params 查询参数对象
 * @returns 请求Promise对象
 */
export async function fetchBatchRemove(params) {
  return request(`${SRM_DATA_SDAT}/v1/report-card-distributions`, {
    method: 'DELETE',
    body: params,
  });
}

/**
 * fetchAllocateTenants: 给卡片分发租户
 * @param {Object} params 查询参数对象
 * @returns 请求Promise对象
 */
export async function fetchAllocateTenants(params) {
  return request(`${SRM_DATA_SDAT}/v1/report-card-distributions`, {
    method: 'POST',
    body: params,
  });
}

/**
 * fetchAllocateTables: 给租户批量分发卡片
 * @param {Object} params 查询参数对象
 * @returns 请求Promise对象
 */
export async function fetchAllocateTables(params) {
  return request(`${SRM_DATA_SDAT}/v1/report-card-distributions`, {
    method: 'POST',
    body: params,
  });
}

/**
 * fetchAllCards: 查询卡片列表
 * @param {Object} params 查询参数对象
 * @returns 请求Promise对象
 */
export async function fetchAllCards(params) {
  return request(`${SRM_DATA_SDAT}/v1/report-card-distributions/absent-card-list?page=-1`, {
    method: 'GET',
    query: params,
  });
}
